// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "flare-periphery/src/coston2/ContractRegistry.sol";
import "flare-periphery/src/coston2/IFdcVerification.sol";
import "flare-periphery/src/coston2/IJsonApi.sol";
import "./ContestData.sol";

/**
 * @title FDCDataConsumer
 * @dev Handles FDC attestations for cricket match data
 */
contract FDCDataConsumer {
    using ContractRegistry for *;
    
    event AttestationRequested(string matchId, uint32 votingRoundId);
    event AttestationProcessed(string matchId, bool success);
    
    // Mapping to store match ID to voting round ID
    mapping(string => uint32) private matchToVotingRound;
    
    // Base URL for cricket API
    string private constant BASE_URL = "https://api.cricapi.com/v1/match_scorecard";
    
    /**
     * @dev Request match scorecard attestation from FDC
     * @param matchId The cricket API match ID
     * @param apiKey The API key for the cricket data provider
     * @return votingRoundId The FDC voting round ID for this attestation
     */
    function requestMatchScorecard(string memory matchId, string memory apiKey) external payable returns (uint32) {
        // Construct the full URL with API key and match ID
        string memory url = string(abi.encodePacked(BASE_URL, "?apikey=", apiKey, "&id=", matchId));
        
        // JQ filter to extract relevant data from API response
        string memory postprocessJq = '{' 
            '"matchId": .data.id, '
            '"matchName": .data.name, '
            '"matchStatus": .data.status, '
            '"teams": .data.teams, '
            '"playerPerformances": ['
                '(.data.scorecard[0].batting[] | {'
                    '"playerId": .batsman.id, '
                    '"name": .batsman.name, '
                    '"runs": .r, '
                    '"balls": .b, '
                    '"fours": ."4s", '
                    '"sixes": ."6s", '
                    '"strikeRate": .sr'
                '}), '
                '(.data.scorecard[0].bowling[] | {'
                    '"playerId": .bowler.id, '
                    '"name": .bowler.name, '
                    '"overs": .o, '
                    '"maidens": .m, '
                    '"wickets": .w, '
                    '"runsConceded": .r, '
                    '"economy": .eco, '
                    '"wides": .wd, '
                    '"noBalls": .nb'
                '}), '
                '(.data.scorecard[1].batting[] | {'
                    '"playerId": .batsman.id, '
                    '"name": .batsman.name, '
                    '"runs": .r, '
                    '"balls": .b, '
                    '"fours": ."4s", '
                    '"sixes": ."6s", '
                    '"strikeRate": .sr'
                '}), '
                '(.data.scorecard[1].bowling[] | {'
                    '"playerId": .bowler.id, '
                    '"name": .bowler.name, '
                    '"overs": .o, '
                    '"maidens": .m, '
                    '"wickets": .w, '
                    '"runsConceded": .r, '
                    '"economy": .eco, '
                    '"wides": .wd, '
                    '"noBalls": .nb'
                '}), '
                '(.data.scorecard[0].catching[] | {'
                    '"playerId": .catcher.id, '
                    '"name": .catcher.name, '
                    '"catches": .catch, '
                    '"runouts": .runout, '
                    '"stumpings": .stumped'
                '}), '
                '(.data.scorecard[1].catching[] | {'
                    '"playerId": .catcher.id, '
                    '"name": .catcher.name, '
                    '"catches": .catch, '
                    '"runouts": .runout, '
                    '"stumpings": .stumped'
                '})'
            ']'
        '}';
        
        // Define the ABI signature for the response data structure
        string memory abiSignature = '{\"components\": ['
            '{\"internalType\": \"string\", \"name\": \"matchId\", \"type\": \"string\"},'
            '{\"internalType\": \"string\", \"name\": \"matchName\", \"type\": \"string\"},'
            '{\"internalType\": \"string\", \"name\": \"matchStatus\", \"type\": \"string\"},'
            '{\"internalType\": \"string[]\", \"name\": \"teams\", \"type\": \"string[]\"},'
            '{\"components\": ['
                '{\"internalType\": \"string\", \"name\": \"playerId\", \"type\": \"string\"},'
                '{\"internalType\": \"string\", \"name\": \"name\", \"type\": \"string\"},'
                '{\"internalType\": \"uint256\", \"name\": \"runs\", \"type\": \"uint256\"},'
                '{\"internalType\": \"uint256\", \"name\": \"balls\", \"type\": \"uint256\"},'
                '{\"internalType\": \"uint256\", \"name\": \"fours\", \"type\": \"uint256\"},'
                '{\"internalType\": \"uint256\", \"name\": \"sixes\", \"type\": \"uint256\"},'
                '{\"internalType\": \"uint256\", \"name\": \"strikeRate\", \"type\": \"uint256\"},'
                '{\"internalType\": \"uint256\", \"name\": \"overs\", \"type\": \"uint256\"},'
                '{\"internalType\": \"uint256\", \"name\": \"maidens\", \"type\": \"uint256\"},'
                '{\"internalType\": \"uint256\", \"name\": \"wickets\", \"type\": \"uint256\"},'
                '{\"internalType\": \"uint256\", \"name\": \"runsConceded\", \"type\": \"uint256\"},'
                '{\"internalType\": \"uint256\", \"name\": \"economy\", \"type\": \"uint256\"},'
                '{\"internalType\": \"uint256\", \"name\": \"wides\", \"type\": \"uint256\"},'
                '{\"internalType\": \"uint256\", \"name\": \"noBalls\", \"type\": \"uint256\"},'
                '{\"internalType\": \"uint256\", \"name\": \"catches\", \"type\": \"uint256\"},'
                '{\"internalType\": \"uint256\", \"name\": \"runouts\", \"type\": \"uint256\"},'
                '{\"internalType\": \"uint256\", \"name\": \"stumpings\", \"type\": \"uint256\"},'
                '{\"internalType\": \"uint256\", \"name\": \"fantasyPoints\", \"type\": \"uint256\"}'
            '], \"internalType\": \"struct PlayerPerformance[]\", \"name\": \"playerPerformances\", \"type\": \"tuple[]\"}'
        '], \"name\": \"MatchScorecard\", \"type\": \"tuple\"}';
        
        // Prepare request body for JsonApi attestation
        string memory requestBody = string(abi.encodePacked(
            '{\"url\": \"', url, 
            '\", \"postprocessJq\": \"', postprocessJq, 
            '\", \"abi_signature\": \"', abiSignature, '\"}'
        ));
        
        // Convert attestation type and source ID to UTF-8 hex string
        bytes32 attestationType = bytes32(bytes("JsonApi"));
        bytes32 sourceId = bytes32(bytes("WEB2"));
        
        // Encode the request for FDC
        bytes memory abiEncodedRequest = abi.encode(
            attestationType,
            sourceId,
            requestBody
        );
        
        // Get request fee
        IFdcRequestFeeConfigurations fdcRequestFeeConfigurations = ContractRegistry
            .getFdcRequestFeeConfigurations();
        uint256 requestFee = fdcRequestFeeConfigurations.getRequestFee(abiEncodedRequest);
        
        require(msg.value >= requestFee, "Insufficient fee for attestation request");
        
        // Submit attestation request to FDC Hub
        IFdcHub fdcHub = ContractRegistry.getFdcHub();
        fdcHub.requestAttestation{value: requestFee}(abiEncodedRequest);
        
        // Calculate the voting round ID
        IFlareSystemsManager flareSystemsManager = ContractRegistry.getFlareSystemsManager();
        uint32 votingRoundId = flareSystemsManager.getCurrentVotingEpochId();
        
        // Store mapping of match ID to voting round
        matchToVotingRound[matchId] = votingRoundId;
        
        emit AttestationRequested(matchId, votingRoundId);
        
        return votingRoundId;
    }
    
    /**
     * @dev Process attestation proof from FDC
     * @param matchId The cricket API match ID
     * @param proof The JsonApi proof from FDC
     * @return scorecard The match scorecard data
     */
    function processAttestationProof(
        string memory matchId, 
        IJsonApi.Proof calldata proof
    ) external returns (ContestData.MatchScorecard memory) {
        // Verify the proof using FDC Verification contract
        bool isValid = ContractRegistry.auxiliaryGetIJsonApiVerification().verifyJsonApi(proof);
        require(isValid, "Invalid FDC proof");
        
        // Decode the attestation response
        bytes memory responseData = proof.data.responseBody.abi_encoded_data;
        ContestData.MatchScorecard memory scorecard = abi.decode(
            responseData, 
            (ContestData.MatchScorecard)
        );
        
        // Verify match ID matches
        require(
            keccak256(abi.encodePacked(scorecard.matchId)) == keccak256(abi.encodePacked(matchId)), 
            "Match ID mismatch"
        );
        
        emit AttestationProcessed(matchId, true);
        
        return scorecard;
    }
    
    /**
     * @dev Get the voting round ID for a match
     * @param matchId The cricket API match ID
     * @return The voting round ID
     */
    function getVotingRoundId(string memory matchId) external view returns (uint32) {
        return matchToVotingRound[matchId];
    }
}