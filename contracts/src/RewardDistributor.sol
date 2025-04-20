// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./ICryptoXIStructs.sol";
import "./ContestRegistry.sol";
import "./ScoreProcessor.sol";

/**
 * @title RewardDistributor
 * @dev Distributes rewards to winners based on contest leaderboard
 */
contract RewardDistributor is Ownable {
    // Reference to other contracts
    ContestRegistry private contestRegistry;
    ScoreProcessor private scoreProcessor;
    
    // Default reward percentages by rank
    // These percentages are in basis points (10000 = 100%)
    uint256[] public defaultRewardPercentages = [
        5000,   // 1st place: 50%
        2500,   // 2nd place: 25%
        1500,   // 3rd place: 15%
        700,    // 4th place: 7%
        300     // 5th place: 3%
    ];
    
    // Events
    event RewardsDistributed(uint256 indexed contestId);
    event RewardClaimed(uint256 indexed contestId, address indexed user, uint256 amount);
    
    // Mapping of contest ID to user address to pending reward amount
    mapping(uint256 => mapping(address => uint256)) private pendingRewards;
    
    /**
     * @dev Constructor
     * @param _contestRegistryAddress Address of the ContestRegistry contract
     * @param _scoreProcessorAddress Address of the ScoreProcessor contract
     */
    constructor(
        address _contestRegistryAddress,
        address _scoreProcessorAddress
    )  Ownable(msg.sender) {
        contestRegistry = ContestRegistry(_contestRegistryAddress);
        scoreProcessor = ScoreProcessor(_scoreProcessorAddress);
    }
    
    /**
     * @dev Set custom reward percentages
     * @param _rewardPercentages Array of percentages in basis points
     */
    function setRewardPercentages(uint256[] memory _rewardPercentages) external onlyOwner {
        // Ensure the total is less than or equal to 10000 (100%)
        uint256 total = 0;
        for (uint256 i = 0; i < _rewardPercentages.length; i++) {
            total += _rewardPercentages[i];
        }
        require(total <= 10000, "Total percentage cannot exceed 100%");
        
        // Update reward percentages
        delete defaultRewardPercentages;
        for (uint256 i = 0; i < _rewardPercentages.length; i++) {
            defaultRewardPercentages.push(_rewardPercentages[i]);
        }
    }
    
    /**
     * @dev Distribute rewards for a contest
     * @param contestId ID of the contest
     */
    function distributeRewards(uint256 contestId) external onlyOwner nonReentrant {
        // Get contest details
        ICryptoXIStructs.Contest memory contest = contestRegistry.getContest(contestId);
        require(contest.isScored, "Contest must be scored first");
        require(!contest.isFinalized, "Contest rewards already distributed");
        
        // Get leaderboard (top participants by score)
        (address[] memory winners, ) = scoreProcessor.getLeaderboard(contestId, defaultRewardPercentages.length);
        
        // Calculate total prize pool
        uint256 prizePool = contest.totalPool;
        
        // Distribute rewards
        for (uint256 i = 0; i < winners.length && i < defaultRewardPercentages.length; i++) {
            address winner = winners[i];
            uint256 rewardAmount = (prizePool * defaultRewardPercentages[i]) / 10000;
            
            // Store pending reward for this user
            pendingRewards[contestId][winner] += rewardAmount;
        }
        
        // Mark contest as finalized
        contestRegistry.markContestAsFinalized(contestId);
        
        emit RewardsDistributed(contestId);
    }
    
    /**
     * @dev Claim pending rewards for a user
     * @param contestIds Array of contest IDs to claim rewards from
     */
    function claimRewards(uint256[] memory contestIds) external nonReentrant {
        uint256 totalReward = 0;
        
        for (uint256 i = 0; i < contestIds.length; i++) {
            uint256 contestId = contestIds[i];
            uint256 pendingAmount = pendingRewards[contestId][msg.sender];
            
            if (pendingAmount > 0) {
                // Reset pending reward
                pendingRewards[contestId][msg.sender] = 0;
                
                // Add to total reward
                totalReward += pendingAmount;
                
                emit RewardClaimed(contestId, msg.sender, pendingAmount);
            }
        }
        
        require(totalReward > 0, "No rewards to claim");
        
        // Transfer reward to user
        payable(msg.sender).transfer(totalReward);
    }
    
    /**
     * @dev Get pending rewards for a user
     * @param user Address of the user
     * @param contestId Contest ID
     * @return Pending reward amount
     */
    function getPendingReward(address user, uint256 contestId) external view returns (uint256) {
        return pendingRewards[contestId][user];
    }
    
    /**
     * @dev Get total pending rewards for a user across all contests
     * @param user Address of the user
     * @param contestIds Array of contest IDs to check
     * @return Total pending reward amount
     */
    function getTotalPendingRewards(address user, uint256[] memory contestIds) external view returns (uint256) {
        uint256 totalReward = 0;
        
        for (uint256 i = 0; i < contestIds.length; i++) {
            totalReward += pendingRewards[contestIds[i]][user];
        }
        
        return totalReward;
    }
    
    /**
     * @dev Allows the contract to receive funds
     */
    receive() external payable {}
}