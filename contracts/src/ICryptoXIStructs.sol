// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

/**
 * @title IDecentraPlayStructs
 * @dev Interface for common structures used in the fantasy cricket game
 */
interface ICryptoXIStructs {
    // Define the structure for a contest
    struct Contest {
        uint256 id;
        string matchId;        // Match ID from cricket API
        string ipfsHash;       // Link to match/player data on IPFS
        uint256 entryFee;      // Entry fee in FLR (e.g. 0.5 * 10^18)
        uint256 startTime;     // Unix timestamp when match starts
        uint256 endTime;       // Unix timestamp when match ends
        uint256 totalPool;     // Total prize pool
        uint256 totalEntries;  // Number of teams entered
        bool isScored;         // Whether the contest has been scored
        bool isFinalized;      // Whether rewards have been distributed
    }

    // Define the structure for a user's team
    struct Team {
        address owner;         // User who owns this team
        string[] playerIds;    // Array of player IDs (exactly 11)
        string captainId;      // Player ID of captain (2x points)
        string viceCaptainId;  // Player ID of vice-captain (1.5x points)
        uint256 totalPoints;   // Total points scored by the team
    }

    // Define the structure for player performance
    struct PlayerScore {
        string playerId;       // Player ID from cricket API
        string playerName;     // Player name for readability
        uint256 runs;          // Runs scored
        uint256 fours;         // Number of 4s hit
        uint256 sixes;         // Number of 6s hit
        uint256 wickets;       // Wickets taken
        uint256 catches;       // Catches taken
        uint256 runouts;       // Run outs effected
        uint256 stumpings;     // Stumpings effected
        uint256 totalPoints;   // Total fantasy points
    }
}