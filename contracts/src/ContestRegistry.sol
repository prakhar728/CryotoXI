// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "./ICryptoXIStructs.sol";

/**
 * @title ContestRegistry
 * @dev Manages the creation and storage of fantasy cricket contests
 */
contract ContestRegistry is Ownable, ICryptoXIStructs {
    using EnumerableSet for EnumerableSet.UintSet;
    
    // Counter for contest IDs
    uint256 private nextContestId = 1;
    
    // Mapping from contest ID to Contest struct
    mapping(uint256 => Contest) public contests;
    
    // Set of active (not yet started) contest IDs
    EnumerableSet.UintSet private activeContests;
    
    // Set of in-progress (started but not ended) contest IDs
    EnumerableSet.UintSet private inProgressContests;
    
    // Set of completed (ended but not scored) contest IDs
    EnumerableSet.UintSet private completedContests;
    
    // Set of finalized (scored and rewards distributed) contest IDs
    EnumerableSet.UintSet private finalizedContests;

    // Events
    event ContestCreated(uint256 indexed contestId, string matchId, uint256 entryFee, uint256 startTime, uint256 endTime);
    event ContestStarted(uint256 indexed contestId);
    event ContestEnded(uint256 indexed contestId);
    event ContestScored(uint256 indexed contestId);
    event ContestFinalized(uint256 indexed contestId);

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Creates a new contest
     * @param matchId Match ID from cricket API
     * @param ipfsHash IPFS hash of match/player data
     * @param entryFee Entry fee in FLR (e.g. 0.5 * 10^18)
     * @param startTime Unix timestamp when match starts
     * @param endTime Unix timestamp when match ends
     * @return contestId ID of the newly created contest
     */
    function createContest(
        string memory matchId,
        string memory ipfsHash,
        uint256 entryFee,
        uint256 startTime,
        uint256 endTime
    ) external onlyOwner returns (uint256) {
        require(startTime > block.timestamp, "Start time must be in the future");
        require(endTime > startTime, "End time must be after start time");
        
        uint256 contestId = nextContestId++;
        
        Contest storage newContest = contests[contestId];
        newContest.id = contestId;
        newContest.matchId = matchId;
        newContest.ipfsHash = ipfsHash;
        newContest.entryFee = entryFee;
        newContest.startTime = startTime;
        newContest.endTime = endTime;
        newContest.totalPool = 0;
        newContest.totalEntries = 0;
        newContest.isScored = false;
        newContest.isFinalized = false;
        
        activeContests.add(contestId);
        
        emit ContestCreated(contestId, matchId, entryFee, startTime, endTime);
        
        return contestId;
    }
    
    /**
     * @dev Updates the status of contests based on current time
     * Moves contests between active, in-progress, and completed sets
     */
    function updateContestStatuses() external {
        // Move contests from active to in-progress if they've started
        uint256[] memory activeContestIds = new uint256[](activeContests.length());
        for (uint256 i = 0; i < activeContests.length(); i++) {
            activeContestIds[i] = activeContests.at(i);
        }
        
        for (uint256 i = 0; i < activeContestIds.length; i++) {
            uint256 contestId = activeContestIds[i];
            if (block.timestamp >= contests[contestId].startTime) {
                activeContests.remove(contestId);
                inProgressContests.add(contestId);
                emit ContestStarted(contestId);
            }
        }
        
        // Move contests from in-progress to completed if they've ended
        uint256[] memory inProgressContestIds = new uint256[](inProgressContests.length());
        for (uint256 i = 0; i < inProgressContests.length(); i++) {
            inProgressContestIds[i] = inProgressContests.at(i);
        }
        
        for (uint256 i = 0; i < inProgressContestIds.length; i++) {
            uint256 contestId = inProgressContestIds[i];
            if (block.timestamp >= contests[contestId].endTime) {
                inProgressContests.remove(contestId);
                completedContests.add(contestId);
                emit ContestEnded(contestId);
            }
        }
    }
    
    /**
     * @dev Marks a contest as scored
     * @param contestId ID of the contest to mark as scored
     */
    function markContestAsScored(uint256 contestId) external onlyOwner {
        require(completedContests.contains(contestId), "Contest must be completed first");
        require(!contests[contestId].isScored, "Contest already scored");
        
        contests[contestId].isScored = true;
        emit ContestScored(contestId);
    }
    
    /**
     * @dev Marks a contest as finalized (rewards distributed)
     * @param contestId ID of the contest to mark as finalized
     */
    function markContestAsFinalized(uint256 contestId) external onlyOwner {
        require(contests[contestId].isScored, "Contest must be scored first");
        require(!contests[contestId].isFinalized, "Contest already finalized");
        
        contests[contestId].isFinalized = true;
        completedContests.remove(contestId);
        finalizedContests.add(contestId);
        emit ContestFinalized(contestId);
    }
    
    /**
     * @dev Increments the total pool and entries for a contest
     * @param contestId ID of the contest
     * @param entryFee Entry fee paid
     */
    function incrementContestPool(uint256 contestId, uint256 entryFee) external {
        // Only TeamManager can call this
        // Implementation will need proper access control
        contests[contestId].totalPool += entryFee;
        contests[contestId].totalEntries += 1;
    }
    
    /**
     * @dev Returns all active contests
     * @return array of Contest structs
     */
    function getActiveContests() external view returns (Contest[] memory) {
        Contest[] memory result = new Contest[](activeContests.length());
        for (uint256 i = 0; i < activeContests.length(); i++) {
            result[i] = contests[activeContests.at(i)];
        }
        return result;
    }
    
    /**
     * @dev Returns all in-progress contests
     * @return array of Contest structs
     */
    function getInProgressContests() external view returns (Contest[] memory) {
        Contest[] memory result = new Contest[](inProgressContests.length());
        for (uint256 i = 0; i < inProgressContests.length(); i++) {
            result[i] = contests[inProgressContests.at(i)];
        }
        return result;
    }
    
    /**
     * @dev Returns all completed contests
     * @return array of Contest structs
     */
    function getCompletedContests() external view returns (Contest[] memory) {
        Contest[] memory result = new Contest[](completedContests.length());
        for (uint256 i = 0; i < completedContests.length(); i++) {
            result[i] = contests[completedContests.at(i)];
        }
        return result;
    }
    
    /**
     * @dev Returns a specific contest by ID
     * @param contestId ID of the contest to get
     * @return Contest struct
     */
    function getContest(uint256 contestId) external view returns (Contest memory) {
        return contests[contestId];
    }
}