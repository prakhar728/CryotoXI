// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "forge-std/Script.sol";
import "../src/ContestFactory.sol";

contract CreateContestScript is Script {
    using Strings for uint256;
    
    function run() external {
        // Get private key from environment variable
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        // Get arguments
        string memory matchId = vm.envString("MATCH_ID");
        string memory ipfsHash = vm.envString("IPFS_HASH");
        uint256 entryFee = vm.envUint("ENTRY_FEE");
        uint256 startTime = vm.envUint("START_TIME");
        uint256 endTime = vm.envUint("END_TIME");
        
        // Convert entry fee from whole FLR to wei
        entryFee = entryFee * 1e18;
        
        // If startTime is 0, use current time + 1 hour
        if (startTime == 0) {
            startTime = block.timestamp + 1 hours;
        }
        
        // If endTime is 0, use startTime + 4 hours
        if (endTime == 0) {
            endTime = startTime + 4 hours;
        }
        
        console.log("Creating contest for match ID:", matchId);
        console.log("IPFS Hash:", ipfsHash);
        console.log("Entry Fee:", entryFee);
        console.log("Start Time:", startTime);
        console.log("End Time:", endTime);
        
        // Get ContestFactory address from file
        string memory deployedAddressesFile = vm.readFile("data/deployed-addresses.txt");
        string memory contestFactoryAddressStr = vm.parseJsonString(
            string(abi.encodePacked('{"address":"', deployedAddressesFile, '"}')),
            ".address"
        );
        address contestFactoryAddress = vm.parseAddress(contestFactoryAddressStr);
        
        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);
        
        // Connect to ContestFactory
        ContestFactory contestFactory = ContestFactory(contestFactoryAddress);
        
        // Create contest
        bytes32 contestId = contestFactory.createContest(
            matchId,
            ipfsHash,
            entryFee,
            startTime,
            endTime
        );
        
        // Stop broadcasting
        vm.stopBroadcast();
        
        // Log the created contest ID
        console.log("Contest created with ID:", vm.toString(contestId));
        
        // Save the contest ID to a file
        string memory contestIdFile = string(abi.encodePacked(
            "Contest ID: ", vm.toString(contestId), "\n",
            "Match ID: ", matchId
        ));
        
        // Write contest ID to file
        vm.writeFile(string(abi.encodePacked("data/contest_", matchId, ".txt")), contestIdFile);
        console.log(string(abi.encodePacked("Contest ID saved to data/contest_", matchId, ".txt")));
    }
}