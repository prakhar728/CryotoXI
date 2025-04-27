// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin-contracts/access/Ownable.sol";
import "@openzeppelin-contracts/utils/Strings.sol";
import "flare-periphery/src/coston2/IJsonApi.sol";
import "./ContestData.sol";
import "./ScoringEngine.sol";

import "flare-periphery/src/coston2/ContractRegistry.sol";
import "flare-periphery/src/coston2/IFdcRequestFeeConfigurations.sol";
import "flare-periphery/src/coston2/IFdcHub.sol";
import "flare-periphery/src/coston2/IFlareSystemsManager.sol";

/**
 * @title ContestFactory
 * @dev Main contract for CryptoXI Fantasy Cricket platform
 */
contract ContestFactory is Ownable {

    using ContractRegistry for *;
    
    // Libraries
    using Strings for uint256;

    // Contracts

    // Constants
    uint256 private constant ADMIN_FEE_PERCENTAGE = 10; // 10% of entry fee
    uint256 private constant MIN_PLAYERS = 11; // Players per team
    uint256 private constant MAX_CONTESTS_PER_MATCH = 5;

    // Platform API key for Cricket API
    string private cricketApiKey;

    bytes32[] private allContestIds;

    // Storage
    mapping(bytes32 => ContestData.Contest) public contests;
    mapping(bytes32 => ContestData.UserTeam[]) public contestTeams;
    mapping(bytes32 => ContestData.PlayerPerformance[])
        public contestPlayerPerformances;
    mapping(bytes32 => mapping(address => uint256)) public userContestEntries; // contestId => userAddress => teamIndex+1 (0 = no entry)
    mapping(string => bytes32[]) public matchContests; // matchId => contestIds
    mapping(string => uint256) public matchContestCount; // matchId => number of contests
    mapping(string => uint256[]) private matchToContestIndices;

    // Custom Prize Structures
    mapping(bytes32 => ContestData.PrizeBreakdown[])
        public contestPrizeBreakdowns;
    ContestData.PrizeBreakdown[] public defaultPrizeBreakdown;

    // Events
    event ContestCreated(
        bytes32 indexed contestId,
        string matchId,
        uint256 entryFee
    );
    event TeamSubmitted(
        bytes32 indexed contestId,
        address indexed user,
        uint256 teamIndex
    );
    event ScoresFinalized(bytes32 indexed contestId, string matchId);
    event PrizesDistributed(
        bytes32 indexed contestId,
        address[] winners,
        uint256[] amounts
    );

    /**
     * @dev Constructor
     * @param _cricketApiKey API key for cricket data provider
     */
    constructor(string memory _cricketApiKey) Ownable(msg.sender) {
        cricketApiKey = _cricketApiKey;

        // Initialize contracts

        // Set default prize breakdown (50% to 1st, 30% to 2nd, 20% to 3rd)
        defaultPrizeBreakdown.push(ContestData.PrizeBreakdown(1, 5000)); // 50%
        defaultPrizeBreakdown.push(ContestData.PrizeBreakdown(2, 3000)); // 30%
        defaultPrizeBreakdown.push(ContestData.PrizeBreakdown(3, 2000)); // 20%
    }

    /**
     * @dev Create a new contest
     * @param matchId Cricket API match ID
     * @param ipfsHash IPFS hash for match metadata
     * @param entryFee Entry fee in FLR
     * @param startTime Contest start time
     * @param endTime Contest end time
     * @return contestId The created contest ID
     */
    function createContest(
        string memory matchId,
        string memory ipfsHash,
        uint256 entryFee,
        uint256 startTime,
        uint256 endTime
    ) external onlyOwner returns (bytes32) {
        require(
            matchContestCount[matchId] < MAX_CONTESTS_PER_MATCH,
            "Max contests per match reached"
        );
        require(
            startTime > block.timestamp,
            "Start time must be in the future"
        );
        require(endTime > startTime, "End time must be after start time");

        // Generate a unique contest ID
        bytes32 contestId = keccak256(
            abi.encodePacked(
                matchId,
                ipfsHash,
                entryFee,
                startTime,
                endTime,
                block.timestamp
            )
        );

        // Ensure contest ID is unique
        require(
            contests[contestId].startTime == 0,
            "Contest ID already exists"
        );

        // Create the contest
        contests[contestId] = ContestData.Contest({
            contestId: contestId,
            matchId: matchId,
            ipfsHash: ipfsHash,
            entryFee: entryFee,
            startTime: startTime,
            endTime: endTime,
            prizePool: 0,
            participantCount: 0,
            status: ContestData.MatchStatus.UPCOMING,
            scoresFinalized: false
        });

        // Add to match contests
        matchContests[matchId].push(contestId);
        matchContestCount[matchId]++;

        // Add to global contests array
        allContestIds.push(contestId);
        uint256 contestIndex = allContestIds.length;
        matchToContestIndices[matchId].push(contestIndex);

        // Use default prize breakdown
        for (uint256 i = 0; i < defaultPrizeBreakdown.length; i++) {
            contestPrizeBreakdowns[contestId].push(defaultPrizeBreakdown[i]);
        }

        emit ContestCreated(contestId, matchId, entryFee);

        return contestId;
    }

    /**
     * @dev Submit a team for a contest
     * @param contestId Contest ID
     * @param playerIds Array of player IDs (must be 11 players)
     * @param captainId Captain player ID
     * @param viceCaptainId Vice-captain player ID
     */
    function submitTeam(
        bytes32 contestId,
        string[] memory playerIds,
        string memory captainId,
        string memory viceCaptainId
    ) external payable {
        ContestData.Contest storage contest = contests[contestId];

        require(contest.startTime > 0, "Contest does not exist");
        require(
            block.timestamp < contest.startTime,
            "Contest has already started"
        );
        require(msg.value >= contest.entryFee, "Insufficient entry fee");
        require(
            userContestEntries[contestId][msg.sender] == 0,
            "Already submitted a team"
        );
        require(
            playerIds.length == MIN_PLAYERS,
            "Team must have exactly 11 players"
        );

        // Validate captain and vice-captain are in the team
        bool captainFound = false;
        bool viceCaptainFound = false;

        for (uint256 i = 0; i < playerIds.length; i++) {
            if (
                keccak256(abi.encodePacked(playerIds[i])) ==
                keccak256(abi.encodePacked(captainId))
            ) {
                captainFound = true;
            }
            if (
                keccak256(abi.encodePacked(playerIds[i])) ==
                keccak256(abi.encodePacked(viceCaptainId))
            ) {
                viceCaptainFound = true;
            }
        }

        require(captainFound, "Captain not in team");
        require(viceCaptainFound, "Vice-captain not in team");
        require(
            keccak256(abi.encodePacked(captainId)) !=
                keccak256(abi.encodePacked(viceCaptainId)),
            "Captain and vice-captain must be different"
        );

        // Create user team
        ContestData.UserTeam memory userTeam = ContestData.UserTeam({
            userAddress: msg.sender,
            contestId: contestId,
            playerIds: playerIds,
            captainId: captainId,
            viceCaptainId: viceCaptainId,
            totalPoints: 0,
            rank: 0
        });

        // Add team to contest
        contestTeams[contestId].push(userTeam);
        userContestEntries[contestId][msg.sender] = contestTeams[contestId]
            .length;

        // Update contest details
        contest.participantCount++;

        // Calculate admin fee
        uint256 adminFee = (contest.entryFee * ADMIN_FEE_PERCENTAGE) / 100;
        uint256 prizeContribution = contest.entryFee - adminFee;

        // Add to prize pool
        contest.prizePool += prizeContribution;

        // Send admin fee to owner
        (bool success, ) = owner().call{value: adminFee}("");
        require(success, "Admin fee transfer failed");

        emit TeamSubmitted(
            contestId,
            msg.sender,
            contestTeams[contestId].length - 1
        );
    }

    /**
     * @dev Update contest status
     * @param contestId Contest ID
     * @param status New status
     */
    function updateContestStatus(
        bytes32 contestId,
        ContestData.MatchStatus status
    ) external onlyOwner {
        require(contests[contestId].startTime > 0, "Contest does not exist");
        contests[contestId].status = status;
    }

    /**
     * @dev Request match data from FDC
     * @param contestId Contest ID
     * @param abiEncodedRequest Pre-verified request bytes from the script
     */
    function requestMatchData(
        bytes32 contestId,
        bytes memory abiEncodedRequest
    ) external payable onlyOwner {
        ContestData.Contest storage contest = contests[contestId];
        require(contest.startTime > 0, "Contest does not exist");
        require(
            contest.status == ContestData.MatchStatus.COMPLETED ||
                block.timestamp > contest.endTime,
            "Match not ended yet"
        );
        require(!contest.scoresFinalized, "Scores already finalized");

        // Get request fee
        IFdcRequestFeeConfigurations fdcRequestFeeConfigurations = ContractRegistry
                .getFdcRequestFeeConfigurations();
        uint256 requestFee = fdcRequestFeeConfigurations.getRequestFee(
            abiEncodedRequest
        );

        require(
            msg.value >= requestFee,
            "Insufficient fee for attestation request"
        );

        // Submit attestation request to FDC Hub
        IFdcHub fdcHub = ContractRegistry.getFdcHub();
        fdcHub.requestAttestation{value: requestFee}(abiEncodedRequest);
    }

    /**
     * @dev Process match data and finalize scores
     * @param contestId Contest ID
     * @param proof The JsonApi proof from FDC
     */
    function finalizeScores(
        bytes32 contestId,
        IJsonApi.Proof calldata proof
    ) external onlyOwner {
        ContestData.Contest storage contest = contests[contestId];
        require(contest.startTime > 0, "Contest does not exist");
        require(!contest.scoresFinalized, "Scores already finalized");

        // Verify the proof using FDC Verification
        bool isValid = ContractRegistry
            .auxiliaryGetIJsonApiVerification()
            .verifyJsonApi(proof);
        require(isValid, "Invalid FDC proof");

        // Decode the attestation response
        bytes memory responseData = proof.data.responseBody.abi_encoded_data;
        ContestData.MatchScorecard memory scorecard = abi.decode(
            responseData,
            (ContestData.MatchScorecard)
        );

        // Verify match ID matches
        require(
            keccak256(abi.encodePacked(scorecard.matchId)) ==
                keccak256(abi.encodePacked(contest.matchId)),
            "Match ID mismatch"
        );

        // Process player performances and calculate fantasy points
        scorecard = ScoringEngine.processMatchScorecard(scorecard);

        // Save player performances
        for (uint256 i = 0; i < scorecard.playerPerformances.length; i++) {
            contestPlayerPerformances[contestId].push(
                scorecard.playerPerformances[i]
            );
        }

        // Calculate points for each user's team
        ContestData.UserTeam[] storage teams = contestTeams[contestId];

        for (uint256 i = 0; i < teams.length; i++) {
            teams[i].totalPoints = ScoringEngine.calculateTeamPoints(
                scorecard.playerPerformances,
                teams[i]
            );
        }

        // Sort teams by points to determine ranks
        sortTeamsByPoints(contestId);

        // Mark scores as finalized
        contest.scoresFinalized = true;
        contest.status = ContestData.MatchStatus.COMPLETED;

        emit ScoresFinalized(contestId, contest.matchId);
    }

    /**
     * @dev Distribute prizes for a contest
     * @param contestId Contest ID
     */
    function distributePrizes(bytes32 contestId) external onlyOwner {
        ContestData.Contest storage contest = contests[contestId];
        require(contest.startTime > 0, "Contest does not exist");
        require(contest.scoresFinalized, "Scores not finalized");

        ContestData.UserTeam[] storage teams = contestTeams[contestId];
        ContestData.PrizeBreakdown[]
            storage prizeBreakdown = contestPrizeBreakdowns[contestId];

        // Prepare arrays for emitting event
        address[] memory winners = new address[](prizeBreakdown.length);
        uint256[] memory amounts = new uint256[](prizeBreakdown.length);

        // Distribute prizes according to prize breakdown
        for (uint256 i = 0; i < prizeBreakdown.length; i++) {
            // Skip if not enough participants
            if (teams.length < prizeBreakdown[i].rank) {
                continue;
            }

            // Get the team at the current rank
            ContestData.UserTeam storage team = teams[i];

            // Calculate prize amount
            uint256 prizeAmount = (contest.prizePool *
                prizeBreakdown[i].percentage) / 10000;

            // Transfer prize to user
            (bool success, ) = team.userAddress.call{value: prizeAmount}("");
            require(success, "Prize transfer failed");

            // Record for event
            winners[i] = team.userAddress;
            amounts[i] = prizeAmount;
        }

        emit PrizesDistributed(contestId, winners, amounts);
    }

    /**
     * @dev Set custom prize breakdown for a contest
     * @param contestId Contest ID
     * @param prizeBreakdown Array of prize breakdowns
     */
    function setContestPrizeBreakdown(
        bytes32 contestId,
        ContestData.PrizeBreakdown[] calldata prizeBreakdown
    ) external onlyOwner {
        require(contests[contestId].startTime > 0, "Contest does not exist");
        require(
            contests[contestId].participantCount == 0,
            "Cannot change after participants joined"
        );

        // Validate total percentage equals 100%
        uint256 totalPercentage = 0;
        for (uint256 i = 0; i < prizeBreakdown.length; i++) {
            totalPercentage += prizeBreakdown[i].percentage;
        }
        require(totalPercentage == 10000, "Total percentage must be 100%");

        // Clear existing prize breakdown
        delete contestPrizeBreakdowns[contestId];

        // Set new prize breakdown
        for (uint256 i = 0; i < prizeBreakdown.length; i++) {
            contestPrizeBreakdowns[contestId].push(prizeBreakdown[i]);
        }
    }

    /**
     * @dev Set default prize breakdown
     * @param prizeBreakdown Array of prize breakdowns
     */
    function setDefaultPrizeBreakdown(
        ContestData.PrizeBreakdown[] calldata prizeBreakdown
    ) external onlyOwner {
        // Validate total percentage equals 100%
        uint256 totalPercentage = 0;
        for (uint256 i = 0; i < prizeBreakdown.length; i++) {
            totalPercentage += prizeBreakdown[i].percentage;
        }
        require(totalPercentage == 10000, "Total percentage must be 100%");

        // Clear existing prize breakdown
        delete defaultPrizeBreakdown;

        // Set new prize breakdown
        for (uint256 i = 0; i < prizeBreakdown.length; i++) {
            defaultPrizeBreakdown.push(prizeBreakdown[i]);
        }
    }

    /**
     * @dev Update cricket API key
     * @param _cricketApiKey New API key
     */
    function updateCricketApiKey(
        string memory _cricketApiKey
    ) external onlyOwner {
        cricketApiKey = _cricketApiKey;
    }

    /**
     * @dev Get contest details
     * @param contestId Contest ID
     * @return Contest details
     */
    function getContest(
        bytes32 contestId
    ) external view returns (ContestData.Contest memory) {
        return contests[contestId];
    }

    /**
     * @dev Get contests
     * @return Contests
     */
    function getAllContests() external view returns (bytes32[] memory) {
        return allContestIds;
    }

    /**
     * @dev Get contest count
     * @return Contests
     */
    function getContestCount() external view returns (uint256) {
        return allContestIds.length;
    }

    /**
     * @dev Get contest count
     * @param matchId match ID
     * @return Contests
     */

    function getAllContestsForMatch(
        string memory matchId
    ) external view returns (bytes32[] memory) {
        uint256[] memory indices = matchToContestIndices[matchId];
        bytes32[] memory result = new bytes32[](indices.length);

        for (uint256 i = 0; i < indices.length; i++) {
            result[i] = allContestIds[indices[i] - 1];
        }

        return result;
    }

    /**
     * @dev Get user's team for a contest
     * @param contestId Contest ID
     * @param userAddress User address
     * @return User's team
     */
    function getUserTeam(
        bytes32 contestId,
        address userAddress
    ) external view returns (ContestData.UserTeam memory) {
        uint256 teamIndex = userContestEntries[contestId][userAddress];
        require(teamIndex > 0, "User has not entered this contest");

        return contestTeams[contestId][teamIndex - 1];
    }

    /**
     * @dev Get all user teams for a contest
     * @param contestId Contest ID
     * @return Array of user teams
     */
    function getAllContestTeams(
        bytes32 contestId
    ) external view returns (ContestData.UserTeam[] memory) {
        return contestTeams[contestId];
    }

    /**
     * @dev Get player performances for a contest
     * @param contestId Contest ID
     * @return Array of player performances
     */
    function getPlayerPerformances(
        bytes32 contestId
    ) external view returns (ContestData.PlayerPerformance[] memory) {
        return contestPlayerPerformances[contestId];
    }

    /**
     * @dev Get contests for a match
     * @param matchId Match ID
     * @return Array of contest IDs
     */
    function getMatchContests(
        string memory matchId
    ) external view returns (bytes32[] memory) {
        return matchContests[matchId];
    }

    /**
     * @dev Sort teams by points (descending order)
     * @param contestId Contest ID
     */
    function sortTeamsByPoints(bytes32 contestId) internal {
        ContestData.UserTeam[] storage teams = contestTeams[contestId];
        uint256 n = teams.length;

        // Simple bubble sort (optimized later with a more efficient sorting algorithm)
        for (uint256 i = 0; i < n - 1; i++) {
            for (uint256 j = 0; j < n - i - 1; j++) {
                if (teams[j].totalPoints < teams[j + 1].totalPoints) {
                    // Swap teams
                    ContestData.UserTeam memory temp = teams[j];
                    teams[j] = teams[j + 1];
                    teams[j + 1] = temp;
                }
            }
        }

        // Assign ranks
        for (uint256 i = 0; i < n; i++) {
            teams[i].rank = i + 1;
        }
    }
}
