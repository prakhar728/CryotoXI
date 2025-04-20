// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

/**
 * @title ContestData
 * @dev Data structures for CryptoXI Fantasy Cricket platform
 */
contract ContestData {
    // Enum to represent match status
    enum MatchStatus {
        UPCOMING,
        LIVE,
        COMPLETED,
        CANCELLED
    }

    // Contest structure
    struct Contest {
        bytes32 contestId;       // Unique contest identifier
        string matchId;          // External API match ID
        string ipfsHash;         // IPFS hash for match metadata
        uint256 entryFee;        // Entry fee in FLR tokens
        uint256 startTime;       // Match start timestamp
        uint256 endTime;         // Match end timestamp
        uint256 prizePool;       // Total prize pool
        uint256 participantCount; // Number of participants
        MatchStatus status;      // Current match status
        bool scoresFinalized;    // Whether scores have been finalized
    }

    // Player data structure
    struct Player {
        string playerId;         // External API player ID
        string name;             // Player name
        string team;             // Player's team
        string role;             // Player role (batsman, bowler, all-rounder, wicket-keeper)
    }

    // User Team structure
    struct UserTeam {
        address userAddress;     // User wallet address
        bytes32 contestId;       // Contest ID
        string[] playerIds;      // Selected player IDs (11 players)
        string captainId;        // Captain player ID
        string viceCaptainId;    // Vice-captain player ID
        uint256 totalPoints;     // Total points scored
        uint256 rank;            // Rank in the contest
    }

    // Player Performance structure - data from API via FDC
    struct PlayerPerformance {
        string playerId;         // External API player ID
        
        // Batting stats
        uint256 runs;            // Runs scored
        uint256 balls;           // Balls faced
        uint256 fours;           // Number of boundaries
        uint256 sixes;           // Number of sixes
        uint256 strikeRate;      // Strike rate (multiplied by 100 for fixed point)
        
        // Bowling stats
        uint256 overs;           // Overs bowled (multiplied by 10 for fixed point, e.g. 4.2 = 42)
        uint256 maidens;         // Maiden overs
        uint256 wickets;         // Wickets taken
        uint256 runsConceded;    // Runs conceded
        uint256 economy;         // Economy rate (multiplied by 100 for fixed point)
        uint256 wides;           // Wide balls
        uint256 noBalls;         // No balls
        
        // Fielding stats
        uint256 catches;         // Catches taken
        uint256 runouts;         // Run outs
        uint256 stumpings;       // Stumpings
        
        // Calculated fantasy points
        uint256 fantasyPoints;   // Total fantasy points
    }

    // Attestation data structure for Flare Data Connector
    struct MatchScorecard {
        string matchId;          // Match ID
        string matchName;        // Match name
        string matchStatus;      // Match status
        string[] teams;          // Team names
        PlayerPerformance[] playerPerformances; // All player performances
    }

    // For prize distribution
    struct PrizeBreakdown {
        uint256 rank;            // Rank position
        uint256 percentage;      // Percentage of prize pool (multiplied by 100)
    }
}