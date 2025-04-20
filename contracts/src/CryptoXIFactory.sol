// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./ContestRegistry.sol";
import "./TeamManager.sol";
import "./FDCConnector.sol";
import "./ScoreProcessor.sol";
import "./RewardDistributor.sol";

/**
 * @title DecentraPlayFactory
 * @dev Factory contract to deploy and link the DecentraPlay ecosystem contracts
 */
contract DecentraPlayFactory is Ownable {
    // Deployed contract addresses
    ContestRegistry public contestRegistry;
    TeamManager public teamManager;
    FDCConnector public fdcConnector;
    ScoreProcessor public scoreProcessor;
    RewardDistributor public rewardDistributor;
    
    // Events
    event DecentraPlayDeployed(
        address contestRegistry,
        address teamManager,
        address fdcConnector,
        address scoreProcessor,
        address rewardDistributor
    );

    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev Deploy all DecentraPlay contracts
     * @param cricketApiKey API key for cricket data provider
     */
    function deployDecentraPlay(string memory cricketApiKey) external onlyOwner {
        // Deploy ContestRegistry
        contestRegistry = new ContestRegistry();
        
        // Deploy TeamManager
        teamManager = new TeamManager(address(contestRegistry));
        
        // Deploy FDCConnector
        fdcConnector = new FDCConnector(cricketApiKey);
        
        // Deploy ScoreProcessor
        scoreProcessor = new ScoreProcessor(
            address(contestRegistry),
            address(teamManager),
            address(fdcConnector)
        );
        
        // Deploy RewardDistributor
        rewardDistributor = new RewardDistributor(
            address(contestRegistry),
            address(scoreProcessor)
        );
        
        // Transfer ownership of all contracts to the caller
        contestRegistry.transferOwnership(msg.sender);
        fdcConnector.transferOwnership(msg.sender);
        scoreProcessor.transferOwnership(msg.sender);
        rewardDistributor.transferOwnership(msg.sender);
        
        emit DecentraPlayDeployed(
            address(contestRegistry),
            address(teamManager),
            address(fdcConnector),
            address(scoreProcessor),
            address(rewardDistributor)
        );
    }
}