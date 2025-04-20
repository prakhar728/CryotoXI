// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {Script} from "dependencies/forge-std-1.9.5/src/Script.sol";
import {Base} from "./Base.s.sol";
import {Surl} from "dependencies/surl-0.0.0/src/Surl.sol";
import {IJsonApi} from "dependencies/flare-periphery-0.0.22/src/coston2/attestation-client/IJsonApi.sol";

/**
 * @title FDCMatchScorecard
 * @dev Script to request and retrieve cricket match scorecard data via FDC
 */
string constant attestationTypeName = "JsonApi";
string constant dirPath = "data/";

contract PrepareAttestationRequest is Script {
    using Surl for *;

    // Cricket API details
    string public apiKey;
    string public apiUrl;
    string public matchId;
    
    // JQ filter to extract player stats
    string public postprocessJq = '{matchId: .data.id, players: [(.data.scorecard[].batting[] | {id: .batsman.id, name: .batsman.name, runs: .r, fours: ."4s", sixes: ."6s"}), (.data.scorecard[].bowling[] | {id: .bowler.id, name: .bowler.name, wickets: .w}), (.data.scorecard[].catching[] | {id: .catcher.id, name: .catcher.name, catches: .catch, runouts: .runout, stumpings: .stumped})]}';
    
    // ABI signature for decoding the response
    string public abiSignature = '{\\"components\\": [{\\"internalType\\": \\"string\\", \\"name\\": \\"matchId\\", \\"type\\": \\"string\\"},{\\"components\\": [{\\"internalType\\": \\"string\\", \\"name\\": \\"id\\", \\"type\\": \\"string\\"},{\\"internalType\\": \\"string\\", \\"name\\": \\"name\\", \\"type\\": \\"string\\"},{\\"internalType\\": \\"uint256\\", \\"name\\": \\"runs\\", \\"type\\": \\"uint256\\"},{\\"internalType\\": \\"uint256\\", \\"name\\": \\"fours\\", \\"type\\": \\"uint256\\"},{\\"internalType\\": \\"uint256\\", \\"name\\": \\"sixes\\", \\"type\\": \\"uint256\\"},{\\"internalType\\": \\"uint256\\", \\"name\\": \\"wickets\\", \\"type\\": \\"uint256\\"},{\\"internalType\\": \\"uint256\\", \\"name\\": \\"catches\\", \\"type\\": \\"uint256\\"},{\\"internalType\\": \\"uint256\\", \\"name\\": \\"runouts\\", \\"type\\": \\"uint256\\"},{\\"internalType\\": \\"uint256\\", \\"name\\": \\"stumpings\\", \\"type\\": \\"uint256\\"}], \\"internalType\\": \\"struct PlayerData[]\\", \\"name\\": \\"players\\", \\"type\\": \\"tuple[]\\"}],\\"name\\": \\"CricketData\\",\\"type\\": \\"tuple\\"}';

    string public sourceName = "WEB2";

    function prepareRequestBody(
        string memory url,
        string memory postprocessJq,
        string memory abiSignature
    ) private pure returns (string memory) {
        return string.concat(
            '{"url": "',
            url,
            '","postprocessJq": "',
            postprocessJq,
            '","abi_signature": "',
            abiSignature,
            '"}'
        );
    }

    function run() external {
        // Load environment variables
        apiKey = vm.envString("CRICKET_API_KEY");
        matchId = vm.envString("MATCH_ID");
        
        // Construct the API URL
        apiUrl = string.concat(
            "https://api.cricapi.com/v1/match_scorecard?apikey=",
            apiKey,
            "&id=",
            matchId
        );
        
        // Preparing request data
        string memory attestationType = Base.toUtf8HexString(attestationTypeName);
        string memory sourceId = Base.toUtf8HexString(sourceName);
        string memory requestBody = prepareRequestBody(
            apiUrl,
            postprocessJq,
            abiSignature
        );

        // Prepare the attestation request
        (string[] memory headers, string memory body) = Base.prepareAttestationRequest(
            attestationType, 
            sourceId, 
            requestBody
        );

        // Post to verifier
        string memory verifierUrl = string.concat(
            "https://fdc-verifiers-testnet.flare.network/verifier/",
            sourceName,
            "/",
            attestationTypeName,
            "/prepareRequest"
        );
        
        console.log("Posting to verifier URL: %s", verifierUrl);
        
        (uint256 status, bytes memory data) = Base.postAttestationRequest(
            verifierUrl,
            headers,
            body
        );
        
        console.log("Response status: %d", status);
        
        // Parse response
        Base.AttestationResponse memory response = Base.parseAttestationRequest(data);
        
        // Write to file
        Base.writeToFile(
            dirPath,
            string.concat(attestationTypeName, "_abiEncodedRequest"),
            Strings.toHexString(response.abiEncodedRequest),
            true
        );
    }
}

contract SubmitAttestationRequest is Script {
    function run() external {
        string memory requestBytes = vm.readLine(
            string.concat(
                dirPath,
                attestationTypeName,
                "_abiEncodedRequest",
                ".txt"
            )
        );
        
        bytes memory abiEncodedRequest = vm.parseBytes(requestBytes);
        
        // Submit to FDC
        Base.submitAttestationRequest(abiEncodedRequest);
        
        // Calculate and save round ID
        uint32 roundId = Base.calculateRoundId();
        
        Base.writeToFile(
            dirPath,
            string.concat(attestationTypeName, "_votingRoundId"),
            Strings.toString(roundId),
            true
        );
    }
}

contract RetrieveDataAndProof is Script {
    using Surl for *;

    function run() external {
        string memory daLayerUrl = vm.envString("COSTON2_DA_LAYER_URL");
        string memory apiKey = vm.envString("X_API_KEY");

        string memory requestBytes = vm.readLine(
            string.concat(
                dirPath,
                attestationTypeName,
                "_abiEncodedRequest",
                ".txt"
            )
        );
        string memory votingRoundId = vm.readLine(
            string.concat(
                dirPath,
                attestationTypeName,
                "_votingRoundId",
                ".txt"
            )
        );

        console.log("votingRoundId: %s\n", votingRoundId);
        console.log("requestBytes: %s\n", requestBytes);

        // Prepare and send request to DA Layer
        string[] memory headers = Base.prepareHeaders(apiKey);
        string memory body = string.concat(
            '{"votingRoundId":',
            votingRoundId,
            ',"requestBytes":"',
            requestBytes,
            '"}'
        );
        
        string memory url = string.concat(
            daLayerUrl,
            "api/v1/fdc/proof-by-request-round-raw"
        );
        
        console.log("Posting to DA Layer URL: %s\n", url);
        
        (uint256 status, bytes memory data) = Base.postAttestationRequest(url, headers, body);
        
        console.log("Response status: %d", status);
        
        // Parse the response
        bytes memory dataJson = Base.parseData(data);
        Base.ParsableProof memory proof = abi.decode(dataJson, (Base.ParsableProof));

        // Decode the response data
        IJsonApi.Response memory proofResponse = abi.decode(
            proof.responseHex,
            (IJsonApi.Response)
        );

        // Create IJsonApi.Proof struct
        IJsonApi.Proof memory _proof = IJsonApi.Proof(
            proof.proofs,
            proofResponse
        );

        // Save the proof for use in contracts
        Base.writeToFile(
            dirPath,
            string.concat(attestationTypeName, "_proof"),
            Strings.toHexString(abi.encode(_proof)),
            true
        );
    }
}