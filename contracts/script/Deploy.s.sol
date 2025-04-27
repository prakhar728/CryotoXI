// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "forge-std/Script.sol";
import "../src/ContestFactory.sol";

contract DeployScript is Script {
    function run() external {
        // Get private key from environment variable
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        // Get API key from environment variable
        string memory cricketApiKey = vm.envString("CRICKET_API_KEY");
        
        console.log("Deploying CryptoXI Fantasy Cricket Platform...");
        console.log("Using cricket API key:", cricketApiKey);
        
        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy ContestFactory
        ContestFactory contestFactory = new ContestFactory(cricketApiKey);
        
        // Stop broadcasting
        vm.stopBroadcast();
        
        // Log the deployed contract addresses
        console.log("ContestFactory deployed to:", address(contestFactory));
        console.log("FDCDataConsumer deployed to:", address(contestFactory.fdcDataConsumer()));
        
        // Save the contract addresses to a file
        string memory contractAddresses = vm.toString(address(contestFactory));
        
        // Create data directory if it doesn't exist
        string[] memory mkdirCmd = new string[](3);
        mkdirCmd[0] = "mkdir";
        mkdirCmd[1] = "-p";
        mkdirCmd[2] = "data";
        vm.ffi(mkdirCmd);
        
        // Write addresses to file
        vm.writeFile("data/deployed-addresses.txt", contractAddresses);
        console.log("Contract addresses saved to data/deployed-addresses.txt");
    }
}