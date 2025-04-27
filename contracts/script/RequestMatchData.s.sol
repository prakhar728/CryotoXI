// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import "../src/ContestFactory.sol";
import "flare-periphery/src/coston2/ContractRegistry.sol";
import "flare-periphery/src/coston2/IJsonApi.sol";
import "surl/Surl.sol";

contract RequestMatchDataScript is Script {
    using Surl for *;

    function toUtf8HexString(
        string memory _string
    ) internal pure returns (string memory) {
        bytes memory bytesData = abi.encodePacked(_string);
        string memory encodedString = toHexString(bytesData);
        uint256 stringLength = bytes(encodedString).length;
        require(stringLength <= 64, "String too long");
        uint256 paddingLength = 64 - stringLength + 2;
        for (uint256 i = 0; i < paddingLength; i++) {
            encodedString = string.concat(encodedString, "0");
        }
        return encodedString;
    }

    function toHexString(
        bytes memory data
    ) public pure returns (string memory) {
        bytes memory alphabet = "0123456789abcdef";
        bytes memory str = new bytes(2 + data.length * 2);
        str[0] = "0";
        str[1] = "x";
        for (uint i = 0; i < data.length; i++) {
            str[2 + i * 2] = alphabet[uint(uint8(data[i] >> 4))];
            str[3 + i * 2] = alphabet[uint(uint8(data[i] & 0x0f))];
        }
        return string(str);
    }

    struct AttestationResponse {
        string status;
        string abiEncodedRequest;
    }

    function run() external {
        // Get private key from environment variable
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        // Get match ID and contest ID
        string memory matchId = vm.envString("MATCH_ID");
        string memory contestIdStr = vm.envString("CONTEST_ID");
        bytes32 contestId = bytes32(vm.parseBytes32(contestIdStr));

        // Get verifier API key
        string memory verifierApiKey = vm.envString("VERIFIER_API_KEY");

        // Get cricket API key
        string memory cricketApiKey = vm.envString("CRICKET_API_KEY");

        console.log("Requesting match data for match ID:", matchId);
        console.log("Contest ID:", contestIdStr);

        // Prepare attestation request
        string memory attestationTypeName = "JsonApi";
        string memory attestationType = toUtf8HexString("IJsonApi");
        string memory sourceName = "WEB2";
        string memory sourceId = toUtf8HexString(sourceName);

        console.log(cricketApiKey);

        // Construct the cricket API URL
        string memory url = string(
            abi.encodePacked(
                "https://api.cricapi.com/v1/match_scorecard?apikey=",
                cricketApiKey,
                "&id=",
                matchId
            )
        );

        // string memory postprocessJq = '{\\"matchId\\": .data.id}';

        // JQ filter for extracting player data
        string memory postprocessJq = "{matchId: .data.id, matchName: .data.name, matchStatus: .data.status, teams: .data.teams, playerPerformances: [(.data.scorecard[]? | .batting[]? | {playerId: .batsman.id, name: .batsman.name, runs: (.r | tonumber), balls: (.b | tonumber), fours: (.\"4s\" | tonumber), sixes: (.\"6s\" | tonumber), strikeRate: (.sr | tonumber), wickets: 0, maidens: 0, runsConceded: 0, economy: 0, wides: 0, noBalls: 0, catches: 0, runouts: 0, stumpings: 0, fantasyPoints: 0}), (.data.scorecard[]? | .bowling[]? | {playerId: .bowler.id, name: .bowler.name, runs: 0, balls: 0, fours: 0, sixes: 0, strikeRate: 0, wickets: (.w | tonumber), maidens: (.m | tonumber), runsConceded: (.r | tonumber), economy: (.eco | tonumber), wides: (.wd | tonumber), noBalls: (.nb | tonumber), catches: 0, runouts: 0, stumpings: 0, fantasyPoints: 0}), (.data.scorecard[]? | .catching[]? | {playerId: .catcher.id, name: .catcher.name, runs: 0, balls: 0, fours: 0, sixes: 0, strikeRate: 0, wickets: 0, maidens: 0, runsConceded: 0, economy: 0, wides: 0, noBalls: 0, catches: (.catch | tonumber), runouts: (.runout | tonumber), stumpings: (.stumped | tonumber), fantasyPoints: 0})]}";


        // ABISignature for PlayerPerformance that matches ScoringEngine requirements
        string memory abiSignature = 
        '{\\"components\\": [{\\"internalType\\": \\"string\\", \\"name\\": \\"matchId\\", \\"type\\": \\"string\\"},{\\"internalType\\": \\"string\\", \\"name\\": \\"matchName\\", \\"type\\": \\"string\\"},{\\"internalType\\": \\"string\\", \\"name\\": \\"matchStatus\\", \\"type\\": \\"string\\"},{\\"internalType\\": \\"string[]\\", \\"name\\": \\"teams\\", \\"type\\": \\"string[]\\"},{\\"components\\": [{\\"internalType\\": \\"string\\", \\"name\\": \\"playerId\\", \\"type\\": \\"string\\"},{\\"internalType\\": \\"string\\", \\"name\\": \\"name\\", \\"type\\": \\"string\\"},{\\"internalType\\": \\"uint256\\", \\"name\\": \\"runs\\", \\"type\\": \\"uint256\\"},{\\"internalType\\": \\"uint256\\", \\"name\\": \\"balls\\", \\"type\\": \\"uint256\\"},{\\"internalType\\": \\"uint256\\", \\"name\\": \\"fours\\", \\"type\\": \\"uint256\\"},{\\"internalType\\": \\"uint256\\", \\"name\\": \\"sixes\\", \\"type\\": \\"uint256\\"},{\\"internalType\\": \\"uint256\\", \\"name\\": \\"strikeRate\\", \\"type\\": \\"uint256\\"},{\\"internalType\\": \\"uint256\\", \\"name\\": \\"wickets\\", \\"type\\": \\"uint256\\"},{\\"internalType\\": \\"uint256\\", \\"name\\": \\"maidens\\", \\"type\\": \\"uint256\\"},{\\"internalType\\": \\"uint256\\", \\"name\\": \\"runsConceded\\", \\"type\\": \\"uint256\\"},{\\"internalType\\": \\"uint256\\", \\"name\\": \\"economy\\", \\"type\\": \\"uint256\\"},{\\"internalType\\": \\"uint256\\", \\"name\\": \\"wides\\", \\"type\\": \\"uint256\\"},{\\"internalType\\": \\"uint256\\", \\"name\\": \\"noBalls\\", \\"type\\": \\"uint256\\"},{\\"internalType\\": \\"uint256\\", \\"name\\": \\"catches\\", \\"type\\": \\"uint256\\"},{\\"internalType\\": \\"uint256\\", \\"name\\": \\"runouts\\", \\"type\\": \\"uint256\\"},{\\"internalType\\": \\"uint256\\", \\"name\\": \\"stumpings\\", \\"type\\": \\"uint256\\"},{\\"internalType\\": \\"uint256\\", \\"name\\": \\"fantasyPoints\\", \\"type\\": \\"uint256\\"}], \\"internalType\\": \\"struct PlayerPerformance[]\\", \\"name\\": \\"playerPerformances\\", \\"type\\": \\"tuple[]\\"}], \\"name\\": \\"MatchScorecard\\", \\"type\\": \\"tuple\\"}';


        
        // string memory abiSignature = '{\\"components\\": ['
        // '{\\"internalType\\": \\"string\\", \\"name\\": \\"matchId\\", \\"type\\": \\"string\\"}'
        // '], \\"name\\": \\"MatchBasicInfo\\", \\"type\\": \\"tuple\\"}';

        // Prepare request body
        string memory requestBody = string(
            abi.encodePacked(
                '{"url": "',
                url,
                '", "postprocessJq": "',
                postprocessJq,
                '", "abi_signature": "',
                abiSignature,
                '"}'
            )
        );

        // Prepare headers for verifier request
        string[] memory headers = new string[](2);
        headers[0] = string.concat('"X-API-KEY": "', verifierApiKey, '"');
        headers[1] = '"Content-Type": "application/json"';

        // Prepare body for verifier request
        string memory body = string.concat(
            '{"attestationType": "',
            attestationType,
            '", "sourceId": "',
            sourceId,
            '", "requestBody": ',
            requestBody,
            "}"
        );

        // Create verifier URL
        // string memory verifierUrl = "https://fdc-verifiers-testnet.flare.network/verifier/WEB2/JsonApi/prepareRequest";

        string memory baseUrl = "https://jq-verifier-test.flare.rocks/";
        string memory verifierUrl = string.concat(
            baseUrl,
            attestationTypeName,
            "/prepareRequest"
        );

        console.log("Sending request to verifier...", verifierUrl);

        // Send request to verifier
        (uint256 status, bytes memory data) = verifierUrl.post(headers, body);

        console.log("Verifier response status:", status);

        // Parse the attestation response
        string memory dataString = string(data);
        console.log("Response data string:", dataString);

        string memory _status = vm.parseJsonString(dataString, ".status");
        string memory abiEncodedRequestHex = vm.parseJsonString(
            dataString,
            ".abiEncodedRequest"
        );

        console.log("Parsed status:", _status);
        console.log("Parsed abiEncodedRequestHex:", abiEncodedRequestHex);
        // bytes memory dataJson = vm.parseJson(dataString);

        bytes memory abiEncodedRequestBytes = vm.parseBytes(
            abiEncodedRequestHex
        );

        console.log("ABI encoded request received");

        // Save the abiEncodedRequest to a file
        vm.writeFile(
            string(
                abi.encodePacked("data/", matchId, "_abiEncodedRequest.txt")
            ),
            abiEncodedRequestHex
        );

        console.log(
            string(
                abi.encodePacked(
                    "ABI encoded request saved to data/",
                    matchId,
                    "_abiEncodedRequest.txt"
                )
            )
        );

        // Get ContestFactory address from file
        string memory contestFactoryAddressStr = vm.readFile(
            "data/deployed-addresses.txt"
        );
        // Trim any whitespace if needed
        address contestFactoryAddress = vm.parseAddress(
            contestFactoryAddressStr
        );

        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);

        // Get request fee
        IFdcRequestFeeConfigurations fdcRequestFeeConfigurations = ContractRegistry
                .getFdcRequestFeeConfigurations();
        uint256 requestFee = fdcRequestFeeConfigurations.getRequestFee(
            abiEncodedRequestBytes
        );

        console.log("Request fee:", requestFee);

        // Connect to ContestFactory
        ContestFactory contestFactory = ContestFactory(contestFactoryAddress);

        // Request match data
        contestFactory.requestMatchData{value: requestFee}(contestId, abiEncodedRequestBytes);

        // Get current voting round ID
        IFlareSystemsManager flareSystemsManager = ContractRegistry
            .getFlareSystemsManager();
        uint32 votingRoundId = flareSystemsManager.getCurrentVotingEpochId();

        // Stop broadcasting
        vm.stopBroadcast();

        console.log("Match data requested successfully");
        console.log("Current voting round ID:", votingRoundId);

        // Save the voting round ID to a file
        vm.writeFile(
            string(abi.encodePacked("data/", matchId, "_votingRoundId.txt")),
            vm.toString(votingRoundId)
        );

        console.log(
            string(
                abi.encodePacked(
                    "Voting round ID saved to data/",
                    matchId,
                    "_votingRoundId.txt"
                )
            )
        );
        console.log(
            "Now waiting for the voting round to finalize (up to 3 minutes)..."
        );
    }
}
