// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "./ICryptoXIStructs.sol";
import "./ContestRegistry.sol";

/**
 * @title TeamManager
 * @dev Manages user team submissions and validation
 */
contract TeamManager is ICryptoXIStructs {
    // Reference to ContestRegistry contract
    ContestRegistry private contestRegistry;
    
    // Mapping from contestId => userAddress => Team
    mapping(uint256 => mapping(address => Team)) private teams;
    
    // Mapping from contestId => array of participating addresses
    mapping(uint256 => address[]) private contestParticipants;
    
    // Events
    event TeamSubmitted(uint256 indexed contestId, address indexed user);
    
    /**
     * @dev Constructor
     * @param _contestRegistryAddress Address of the ContestRegistry contract
     */
    constructor(address _contestRegistryAddress) {
        contestRegistry = ContestRegistry(_contestRegistryAddress);
    }
    
    /**
     * @dev Submit a team for a contest
     * @param contestId ID of the contest
     * @param playerIds Array of player IDs (must be exactly 11)
     * @param captainId Player ID of the captain
     * @param viceCaptainId Player ID of the vice-captain
     */
    function submitTeam(
        uint256 contestId,
        string[] memory playerIds,
        string memory captainId,
        string memory viceCaptainId
    ) external payable nonReentrant {
        // Get contest details
        IDecentraPlayStructs.Contest memory contest = contestRegistry.getContest(contestId);
        
        // Validate contest status
        require(block.timestamp < contest.startTime, "Contest has already started");
        
        // Validate team composition
        require(playerIds.length == 11, "Team must have exactly 11 players");
        
        // Validate entry fee
        require(msg.value >= contest.entryFee, "Insufficient entry fee");
        
        // Check if captain and vice-captain are in the team
        bool captainFound = false;
        bool viceCaptainFound = false;
        
        for (uint256 i = 0; i < playerIds.length; i++) {
            if (keccak256(bytes(playerIds[i])) == keccak256(bytes(captainId))) {
                captainFound = true;
            }
            if (keccak256(bytes(playerIds[i])) == keccak256(bytes(viceCaptainId))) {
                viceCaptainFound = true;
            }
        }
        
        require(captainFound, "Captain must be in the team");
        require(viceCaptainFound, "Vice-captain must be in the team");
        require(keccak256(bytes(captainId)) != keccak256(bytes(viceCaptainId)), "Captain and vice-captain must be different");
        
        // Store the team
        Team storage team = teams[contestId][msg.sender];
        team.owner = msg.sender;
        
        // Clear any existing player IDs
        if (team.playerIds.length > 0) {
            delete team.playerIds;
        }
        
        // Add new player IDs
        for (uint256 i = 0; i < playerIds.length; i++) {
            team.playerIds.push(playerIds[i]);
        }
        
        team.captainId = captainId;
        team.viceCaptainId = viceCaptainId;
        team.totalPoints = 0;
        
        // Add user to contest participants if they're not already there
        bool found = false;
        for (uint256 i = 0; i < contestParticipants[contestId].length; i++) {
            if (contestParticipants[contestId][i] == msg.sender) {
                found = true;
                break;
            }
        }
        
        if (!found) {
            contestParticipants[contestId].push(msg.sender);
            // Update the contest pool and entry count
            contestRegistry.incrementContestPool(contestId, contest.entryFee);
        }
        
        // If user sent more than the entry fee, refund the excess
        if (msg.value > contest.entryFee) {
            payable(msg.sender).transfer(msg.value - contest.entryFee);
        }
        
        emit TeamSubmitted(contestId, msg.sender);
    }
    
    /**
     * @dev Get a user's team for a contest
     * @param contestId ID of the contest
     * @param userAddress Address of the user
     * @return Team struct
     */
    function getTeam(uint256 contestId, address userAddress) external view returns (Team memory) {
        return teams[contestId][userAddress];
    }
    
    /**
     * @dev Get all participants for a contest
     * @param contestId ID of the contest
     * @return Array of participant addresses
     */
    function getContestParticipants(uint256 contestId) external view returns (address[] memory) {
        return contestParticipants[contestId];
    }
    
    /**
     * @dev Check if a user has submitted a team for a contest
     * @param contestId ID of the contest
     * @param userAddress Address of the user
     * @return bool True if the user has submitted a team
     */
    function hasSubmittedTeam(uint256 contestId, address userAddress) external view returns (bool) {
        return teams[contestId][userAddress].owner == userAddress;
    }
    
    /**
     * @dev Update a team's total points (called by ScoreProcessor after scoring)
     * @param contestId ID of the contest
     * @param userAddress Address of the user
     * @param totalPoints Total points scored by the team
     */
    function updateTeamPoints(uint256 contestId, address userAddress, uint256 totalPoints) external {
        // Only ScoreProcessor can call this
        // Implementation will need proper access control
        teams[contestId][userAddress].totalPoints = totalPoints;
    }
}