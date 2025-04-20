// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import "../src/ContestFactory.sol";

contract SubmitTeamScript is Script {
    function run() external {
        // Get private key from environment variable
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        // Get contest ID
        string memory contestIdStr = vm.envString("CONTEST_ID");
        bytes32 contestId = bytes32(vm.parseBytes32(contestIdStr));
        
        // Get team details
        string memory playerIdsFile = vm.envString("PLAYER_IDS_FILE");
        string memory captainId = vm.envString("CAPTAIN_ID");
        string memory viceCaptainId = vm.envString("VICE_CAPTAIN_ID");
        
        console.log("Submitting team for contest ID:", contestIdStr);
        console.log("Captain ID:", captainId);
        console.log("Vice-Captain ID:", viceCaptainId);
        
        // Read player IDs from file
        string memory playerIdsContent = vm.readFile(playerIdsFile);
        string[] memory playerIdsLines = vm.parseJsonStringArray(
            string(abi.encodePacked('{"players":[', playerIdsContent, ']}')),
            ".players"
        );
        
        // Remove any quotes or whitespace from player IDs
        string[] memory playerIds = new string[](playerIdsLines.length);
        for (uint256 i = 0; i < playerIdsLines.length; i++) {
            playerIds[i] = vm.parseJsonString(
                string(abi.encodePacked('{"id":"', playerIdsLines[i], '"}')),
                ".id"
            );
        }
        
        console.log("Player IDs loaded, count:", playerIds.length);
        
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
        
        // Get entry fee
        ContestData.Contest memory contest = contestFactory.getContest(contestId);
        uint256 entryFee = contest.entryFee;
        
        console.log("Contest entry fee:", entryFee);
        
        // Submit team
        contestFactory.submitTeam{value: entryFee}(
            contestId,
            playerIds,
            captainId,
            viceCaptainId
        );
        
        // Stop broadcasting
        vm.stopBroadcast();
        
        console.log("Team submitted successfully!");
    }
}