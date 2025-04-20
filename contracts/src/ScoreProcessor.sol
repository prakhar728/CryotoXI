// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./ICryptoXIStructs.sol";
import "./ContestRegistry.sol";
import "./TeamManager.sol";
import "./FDCConnector.sol";

/**
 * @title ScoreProcessor
 * @dev Calculates team scores based on player performance and generates leaderboards
 */
contract ScoreProcessor is Ownable, ICryptoXIStructs {
    // Reference to other contracts
    ContestRegistry private contestRegistry;
    TeamManager private teamManager;
    FDCConnector private fdcConnector;
    
    // Mapping from contestId => array of userAddresses sorted by score (highest first)
    mapping(uint256 => address[]) private contestLeaderboards;
    
    // Events
    event ContestScored(uint256 indexed contestId);
    event LeaderboardUpdated(uint256 indexed contestId);
    
    /**
     * @dev Constructor
     * @param _contestRegistryAddress Address of the ContestRegistry contract
     * @param _teamManagerAddress Address of the TeamManager contract
     * @param _fdcConnectorAddress Address of the FDCConnector contract
     */
    constructor(
        address _contestRegistryAddress,
        address _teamManagerAddress,
        address _fdcConnectorAddress
    ) Ownable(msg.sender) {
        contestRegistry = ContestRegistry(_contestRegistryAddress);
        teamManager = TeamManager(_teamManagerAddress);
        fdcConnector = FDCConnector(_fdcConnectorAddress);
    }
    
    /**
     * @dev Calculate scores for all teams in a contest
     * @param contestId ID of the contest to score
     */
    function calculateContestScores(uint256 contestId) external onlyOwner {
        // Get contest details
        IDecentraPlayStructs.Contest memory contest = contestRegistry.getContest(contestId);
        require(!contest.isScored, "Contest already scored");
        
        // Get all participants
        address[] memory participants = teamManager.getContestParticipants(contestId);
        
        // Calculate score for each team
        for (uint256 i = 0; i < participants.length; i++) {
            address participant = participants[i];
            Team memory team = teamManager.getTeam(contestId, participant);
            
            // Calculate total points for this team
            uint256 totalPoints = 0;
            
            for (uint256 j = 0; j < team.playerIds.length; j++) {
                string memory playerId = team.playerIds[j];
                PlayerScore memory playerScore = fdcConnector.getPlayerScore(contest.matchId, playerId);
                
                // Calculate points based on captain/vice-captain multipliers
                uint256 playerPoints = playerScore.totalPoints;
                
                if (keccak256(bytes(playerId)) == keccak256(bytes(team.captainId))) {
                    // Captain gets 2x points
                    playerPoints = playerPoints * fdcConnector.POINTS_CAPTAIN_MULTIPLIER();
                } else if (keccak256(bytes(playerId)) == keccak256(bytes(team.viceCaptainId))) {
                    // Vice-captain gets 1.5x points (stored as 15/10)
                    playerPoints = (playerPoints * fdcConnector.POINTS_VICE_CAPTAIN_MULTIPLIER()) / 10;
                }
                
                totalPoints += playerPoints;
            }
            
            // Update team points
            teamManager.updateTeamPoints(contestId, participant, totalPoints);
        }
        
        // Mark contest as scored
        contestRegistry.markContestAsScored(contestId);
        
        // Generate leaderboard
        generateLeaderboard(contestId);
        
        emit ContestScored(contestId);
    }
    
    /**
     * @dev Generate leaderboard for a contest
     * @param contestId ID of the contest
     */
    function generateLeaderboard(uint256 contestId) internal {
        // Get all participants
        address[] memory participants = teamManager.getContestParticipants(contestId);
        
        // Create arrays for sorting
        address[] memory userAddresses = new address[](participants.length);
        uint256[] memory scores = new uint256[](participants.length);
        
        // Get scores for all participants
        for (uint256 i = 0; i < participants.length; i++) {
            address participant = participants[i];
            Team memory team = teamManager.getTeam(contestId, participant);
            
            userAddresses[i] = participant;
            scores[i] = team.totalPoints;
        }
        
        // Sort by score (highest first)
        for (uint256 i = 0; i < scores.length; i++) {
            for (uint256 j = i + 1; j < scores.length; j++) {
                if (scores[i] < scores[j]) {
                    // Swap scores
                    uint256 tempScore = scores[i];
                    scores[i] = scores[j];
                    scores[j] = tempScore;
                    
                    // Swap addresses
                    address tempAddress = userAddresses[i];
                    userAddresses[i] = userAddresses[j];
                    userAddresses[j] = tempAddress;
                }
            }
        }
        
        // Store sorted leaderboard
        delete contestLeaderboards[contestId];
        for (uint256 i = 0; i < userAddresses.length; i++) {
            contestLeaderboards[contestId].push(userAddresses[i]);
        }
        
        emit LeaderboardUpdated(contestId);
    }
    
    /**
     * @dev Get leaderboard for a contest
     * @param contestId ID of the contest
     * @param limit Maximum number of entries to return (0 for all)
     * @return userAddresses Array of user addresses in rank order
     * @return scores Array of scores corresponding to the user addresses
     */
    function getLeaderboard(uint256 contestId, uint256 limit) external view returns (address[] memory userAddresses, uint256[] memory scores) {
        address[] memory leaderboard = contestLeaderboards[contestId];
        
        // If limit is 0 or greater than leaderboard length, return the full leaderboard
        uint256 resultSize = limit == 0 || limit > leaderboard.length ? leaderboard.length : limit;
        
        userAddresses = new address[](resultSize);
        scores = new uint256[](resultSize);
        
        for (uint256 i = 0; i < resultSize; i++) {
            userAddresses[i] = leaderboard[i];
            scores[i] = teamManager.getTeam(contestId, leaderboard[i]).totalPoints;
        }
        
        return (userAddresses, scores);
    }
}