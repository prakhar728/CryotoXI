// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./ICryptoXIStructs.sol";
import "./utils/Base.sol";
import {IFdcHub} from "dependencies/flare-periphery-0.0.22/src/coston2/IFdcHub.sol";
import {ContractRegistry} from "dependencies/flare-periphery-0.0.22/src/coston2/ContractRegistry.sol";
import {IJsonApi} from "dependencies/flare-periphery-0.0.22/src/coston2/attestation-client/IJsonApi.sol";

/**
 * @title FDCConnector
 * @dev Handles interaction with Flare Data Connector (FDC) for cricket data
 */
contract FDCConnector is Ownable, ICryptoXIStructs {
    // Define the scoring system points
    uint256 public constant POINTS_PER_RUN = 1;
    uint256 public constant POINTS_PER_FOUR = 1;
    uint256 public constant POINTS_PER_SIX = 2;
    uint256 public constant POINTS_PER_WICKET = 25;
    uint256 public constant POINTS_PER_CATCH = 8;
    uint256 public constant POINTS_PER_RUNOUT = 6;
    uint256 public constant POINTS_PER_STUMPING = 10;
    uint256 public constant POINTS_CAPTAIN_MULTIPLIER = 2;  // 2x
    uint256 public constant POINTS_VICE_CAPTAIN_MULTIPLIER = 15; // 1.5x (multiplied by 10 for integer math)
    
    // Store cricket API key (only visible to admin)
    string private cricketApiKey;
    
    // Mapping from matchId => playerId => PlayerScore
    mapping(string => mapping(string => PlayerScore)) private playerScores;
    
    // Mapping from matchId => array of playerIds
    mapping(string => string[]) private matchPlayerIds;
    
    // Event for when player scores are updated
    event PlayerScoresUpdated(string indexed matchId, uint256 playerCount);
    event FDCRequestInitiated(string matchId, bytes abiEncodedRequest);
    
    constructor(string memory _cricketApiKey) Ownable(msg.sender) {
        cricketApiKey = _cricketApiKey;
    }
    
    /**
     * @dev Update the cricket API key
     * @param _newApiKey New API key
     */
    function updateApiKey(string memory _newApiKey) external onlyOwner {
        cricketApiKey = _newApiKey;
    }
    
    /**
     * @dev Request match scorecard data from cricket API via FDC
     * @param matchId ID of the match to request data for
     */
    function requestMatchScorecard(string memory matchId) external onlyOwner {
        // Prepare the JsonApi attestation request
        string memory url = string.concat(
            "https://api.cricapi.com/v1/match_scorecard?apikey=",
            cricketApiKey,
            "&id=",
            matchId
        );
        
        // Define JQ filter to extract player stats
        string memory postprocessJq = string.concat(
            '{matchId: .data.id, players: [',
            '(.data.scorecard[].batting[] | {',
            'id: .batsman.id,',
            'name: .batsman.name,',
            'runs: .r,',
            'fours: ."4s",',
            'sixes: ."6s"',
            '}),',
            '(.data.scorecard[].bowling[] | {',
            'id: .bowler.id,',
            'name: .bowler.name,',
            'wickets: .w',
            '}),',
            '(.data.scorecard[].catching[] | {',
            'id: .catcher.id,',
            'name: .catcher.name,',
            'catches: .catch,',
            'runouts: .runout,',
            'stumpings: .stumped',
            '})',
            ']}'
        );
        
        // ABI signature for decoding the response
        string memory abiSignature = string.concat(
            '{\\"components\\": [',
            '{\\"internalType\\": \\"string\\", \\"name\\": \\"matchId\\", \\"type\\": \\"string\\"},',
            '{\\"components\\": [',
            '{\\"internalType\\": \\"string\\", \\"name\\": \\"id\\", \\"type\\": \\"string\\"},',
            '{\\"internalType\\": \\"string\\", \\"name\\": \\"name\\", \\"type\\": \\"string\\"},',
            '{\\"internalType\\": \\"uint256\\", \\"name\\": \\"runs\\", \\"type\\": \\"uint256\\"},',
            '{\\"internalType\\": \\"uint256\\", \\"name\\": \\"fours\\", \\"type\\": \\"uint256\\"},',
            '{\\"internalType\\": \\"uint256\\", \\"name\\": \\"sixes\\", \\"type\\": \\"uint256\\"},',
            '{\\"internalType\\": \\"uint256\\", \\"name\\": \\"wickets\\", \\"type\\": \\"uint256\\"},',
            '{\\"internalType\\": \\"uint256\\", \\"name\\": \\"catches\\", \\"type\\": \\"uint256\\"},',
            '{\\"internalType\\": \\"uint256\\", \\"name\\": \\"runouts\\", \\"type\\": \\"uint256\\"},',
            '{\\"internalType\\": \\"uint256\\", \\"name\\": \\"stumpings\\", \\"type\\": \\"uint256\\"}',
            '], \\"internalType\\": \\"struct PlayerData[]\\", \\"name\\": \\"players\\", \\"type\\": \\"tuple[]\\"}',
            '],',
            '\\"name\\": \\"CricketData\\",\\"type\\": \\"tuple\\"}'
        );
        
        // Prepare request body
        string memory requestBody = string.concat(
            '{"url": "',
            url,
            '","postprocessJq": "',
            postprocessJq,
            '","abi_signature": "',
            abiSignature,
            '"}'
        );
        
        // Convert to UTF8 hex strings as required by FDC
        string memory attestationType = Base.toUtf8HexString("JsonApi");
        string memory sourceId = Base.toUtf8HexString("WEB2");
        
        // Prepare FDC request
        // This would be handled in a script for actual deployment
        // For contract purposes, we just emit an event
        bytes memory abiEncodedRequest = abi.encodePacked(attestationType, sourceId, requestBody);
        
        emit FDCRequestInitiated(matchId, abiEncodedRequest);
    }

    /**
     * @dev Process verified scorecard data from FDC
     * @param proof JsonApi proof from FDC containing player statistics
     */
    function processVerifiedScorecard(IJsonApi.Proof memory proof) external onlyOwner {
        // Verify the proof is valid using FDC verification
        bool isValid = ContractRegistry
            .getFdcVerification()
            .verifyJsonApi(proof);
            
        require(isValid, "Invalid FDC proof");
        
        // Decode the response data
        // This is a simplified representation - actual implementation would parse the JSON structure
        bytes memory responseData = proof.data.responseBody.abi_encoded_data;
        
        // For demonstration purposes - in a real implementation, we would decode the ABI-encoded data
        // and extract player stats to calculate fantasy points
        
        // Example hard-coded match ID - in reality this would come from the decoded data
        string memory matchId = "example-match-id";
        
        // Clear existing player IDs for this match
        delete matchPlayerIds[matchId];
        
        // Placeholder for player processing - would be replaced with actual JSON parsing logic
        emit PlayerScoresUpdated(matchId, 0);
    }
    
    /**
     * @dev Manually set player scores (for testing or backup)
     * @param matchId ID of the match
     * @param playerIds Array of player IDs
     * @param playerNames Array of player names
     * @param runs Array of runs scored
     * @param fours Array of 4s hit
     * @param sixes Array of 6s hit
     * @param wickets Array of wickets taken
     * @param catches Array of catches taken
     * @param runouts Array of run outs effected
     * @param stumpings Array of stumpings effected
     */
    function setPlayerScores(
        string memory matchId,
        string[] memory playerIds,
        string[] memory playerNames,
        uint256[] memory runs,
        uint256[] memory fours,
        uint256[] memory sixes,
        uint256[] memory wickets,
        uint256[] memory catches,
        uint256[] memory runouts,
        uint256[] memory stumpings
    ) external onlyOwner {
        require(
            playerIds.length == playerNames.length &&
            playerIds.length == runs.length &&
            playerIds.length == fours.length &&
            playerIds.length == sixes.length &&
            playerIds.length == wickets.length &&
            playerIds.length == catches.length &&
            playerIds.length == runouts.length &&
            playerIds.length == stumpings.length,
            "Array lengths must match"
        );
        
        // Clear existing player IDs for this match
        delete matchPlayerIds[matchId];
        
        for (uint256 i = 0; i < playerIds.length; i++) {
            string memory playerId = playerIds[i];
            
            // Calculate total points
            uint256 totalPoints = 
                runs[i] * POINTS_PER_RUN +
                fours[i] * POINTS_PER_FOUR +
                sixes[i] * POINTS_PER_SIX +
                wickets[i] * POINTS_PER_WICKET +
                catches[i] * POINTS_PER_CATCH +
                runouts[i] * POINTS_PER_RUNOUT +
                stumpings[i] * POINTS_PER_STUMPING;
            
            // Store player score
            PlayerScore storage score = playerScores[matchId][playerId];
            score.playerId = playerId;
            score.playerName = playerNames[i];
            score.runs = runs[i];
            score.fours = fours[i];
            score.sixes = sixes[i];
            score.wickets = wickets[i];
            score.catches = catches[i];
            score.runouts = runouts[i];
            score.stumpings = stumpings[i];
            score.totalPoints = totalPoints;
            
            // Add player ID to the match's player list
            matchPlayerIds[matchId].push(playerId);
        }
        
        emit PlayerScoresUpdated(matchId, playerIds.length);
    }
    
    /**
     * @dev Get a player's score for a match
     * @param matchId ID of the match
     * @param playerId ID of the player
     * @return PlayerScore struct
     */
    function getPlayerScore(string memory matchId, string memory playerId) external view returns (PlayerScore memory) {
        return playerScores[matchId][playerId];
    }
    
    /**
     * @dev Get all player scores for a match
     * @param matchId ID of the match
     * @return Array of PlayerScore structs
     */
    function getAllPlayerScores(string memory matchId) external view returns (PlayerScore[] memory) {
        string[] memory playerIds = matchPlayerIds[matchId];
        PlayerScore[] memory scores = new PlayerScore[](playerIds.length);
        
        for (uint256 i = 0; i < playerIds.length; i++) {
            scores[i] = playerScores[matchId][playerIds[i]];
        }
        
        return scores;
    }
}