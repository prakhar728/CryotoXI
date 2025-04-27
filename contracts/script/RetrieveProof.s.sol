// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import "../src/ContestFactory.sol";
import "flare-periphery/src/coston2/IJsonApi.sol";
import "surl/Surl.sol";

contract RetrieveProofScript is Script {
    using Surl for *;

    struct ParsableProof {
        bytes32 attestationType;
        bytes32[] proofs;
        bytes responseHex;
    }

    function run() external {
        // Get private key from environment variable
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        // Get match ID and contest ID
        string memory matchId = vm.envString("MATCH_ID");
        string memory contestIdStr = vm.envString("CONTEST_ID");
        bytes32 contestId = bytes32(vm.parseBytes32(contestIdStr));

        // Get DA Layer URL and API key
        string memory daLayerUrl = vm.envString("COSTON2_DA_LAYER_URL");
        string memory apiKey = vm.envString("X_API_KEY");

        console.log("Retrieving attestation proof for match ID:", matchId);
        console.log("Contest ID:", contestIdStr);

        // Read the request bytes and voting round ID from files
        string memory requestBytes = vm.readFile(
            string(abi.encodePacked("data/", matchId, "_abiEncodedRequest.txt"))
        );

        string memory votingRoundIdStr = vm.readFile(
            string(abi.encodePacked("data/", matchId, "_votingRoundId.txt"))
        );
        uint32 votingRoundId = uint32(vm.parseUint(votingRoundIdStr));

        console.log(
            "Retrieved request bytes and voting round ID:",
            votingRoundId
        );

        // Prepare headers for DA Layer request
        string[] memory headers = new string[](2);
        headers[0] = string.concat('"X-API-KEY": "', apiKey, '"');
        headers[1] = '"Content-Type": "application/json"';

        // Prepare body for DA Layer request
        string memory body = string.concat(
            '{"votingRoundId":',
            votingRoundIdStr,
            ',"requestBytes":"',
            requestBytes,
            '"}'
        );

        // Create DA Layer URL
        string memory url = string.concat(
            daLayerUrl,
            "api/v1/fdc/proof-by-request-round-raw"
        );

        console.log("Sending request to DA Layer...");

        // Send request to DA Layer
        (uint256 status, bytes memory data) = url.post(headers, body);

        console.log("DA Layer response status:", status);

        // Parse the proof response
        bytes memory dataJson = vm.parseJson(string(data));
        ParsableProof memory proof = abi.decode(dataJson, (ParsableProof));

        console.log(
            "Attestation type:",
            vm.toString(proof.attestationType)
        );
        console.log("Proofs length:", proof.proofs.length);

        IJsonApi.Response memory proofResponse = abi.decode(
            proof.responseHex,
            (IJsonApi.Response)
        );

        // Format the proof for the contract
        IJsonApi.Proof memory _proof = IJsonApi.Proof(
            proof.proofs,
            proofResponse
        );

        // Save the formatted proof
        vm.writeFile(
            string(abi.encodePacked("data/", matchId, "_proof.json")),
            vm.serializeBytes32("proof", "proofs", proof.proofs)
        );

        // Get ContestFactory address from file
        string memory deployedAddressesFile = vm.readFile(
            "data/deployed-addresses.txt"
        );
        string memory contestFactoryAddressStr = vm.parseJsonString(
            string(
                abi.encodePacked('{"address":"', deployedAddressesFile, '"}')
            ),
            ".address"
        );
        address contestFactoryAddress = vm.parseAddress(
            contestFactoryAddressStr
        );

        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);

        // Connect to ContestFactory
        ContestFactory contestFactory = ContestFactory(contestFactoryAddress);

        // Finalize scores
        console.log("Finalizing scores...");
        contestFactory.finalizeScores(contestId, _proof);

        // Get contest details after finalization
        ContestData.Contest memory contest = contestFactory.getContest(
            contestId
        );

        // Stop broadcasting for a moment to avoid unnecessary transactions
        vm.stopBroadcast();

        console.log("Scores finalized successfully!");
        console.log("Contest details after finalization:");
        console.log("  Status:", uint256(contest.status));
        console.log("  Scores Finalized:", contest.scoresFinalized);
        console.log("  Prize Pool:", contest.prizePool);

        // Start broadcasting again for prize distribution
        vm.startBroadcast(deployerPrivateKey);

        // Distribute prizes
        console.log("Distributing prizes...");
        contestFactory.distributePrizes(contestId);

        // Stop broadcasting
        vm.stopBroadcast();

        console.log("Prizes distributed successfully!");
    }
}
