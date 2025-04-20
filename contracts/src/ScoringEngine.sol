// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "./ContestData.sol";

/**
 * @title ScoringEngine
 * @dev Handles fantasy cricket point calculations based on player performances
 */
library ScoringEngine {
    using ScoringEngine for ContestData.PlayerPerformance;

    // Point multipliers
    uint256 private constant CAPTAIN_MULTIPLIER = 2;
    uint256 private constant VICE_CAPTAIN_MULTIPLIER = 15; // 1.5x multiplied by 10 for fixed point

    // Fantasy point values
    uint256 private constant POINTS_PER_RUN = 1;
    uint256 private constant POINTS_PER_FOUR = 1;
    uint256 private constant POINTS_PER_SIX = 2;
    uint256 private constant POINTS_PER_WICKET = 25;
    uint256 private constant POINTS_PER_MAIDEN = 8;
    uint256 private constant POINTS_PER_CATCH = 8;
    uint256 private constant POINTS_PER_STUMPING = 12;
    uint256 private constant POINTS_PER_RUNOUT = 6;

    // Bonus points
    uint256 private constant BONUS_30_RUNS = 4;
    uint256 private constant BONUS_50_RUNS = 8;
    uint256 private constant BONUS_100_RUNS = 16;
    uint256 private constant BONUS_3_WICKETS = 4;
    uint256 private constant BONUS_4_WICKETS = 8;
    uint256 private constant BONUS_5_WICKETS = 16;

    // Duck penalty (0 runs for batsman)
    uint256 private constant DUCK_PENALTY = 2;

    /**
     * @dev Calculate fantasy points for a single player
     * @param performance The player's performance data
     * @return The total fantasy points for the player
     */
    function calculatePlayerPoints(
        ContestData.PlayerPerformance memory performance
    ) public pure returns (uint256) {
        uint256 points = 0;

        // Calculate batting points
        points += performance.runs * POINTS_PER_RUN;
        points += performance.fours * POINTS_PER_FOUR;
        points += performance.sixes * POINTS_PER_SIX;

        // Batting bonus points
        if (performance.runs >= 100) {
            points += BONUS_100_RUNS;
        } else if (performance.runs >= 50) {
            points += BONUS_50_RUNS;
        } else if (performance.runs >= 30) {
            points += BONUS_30_RUNS;
        }

        // Duck penalty (only apply if player batted)
        if (performance.runs == 0 && performance.balls > 0) {
            points = points > DUCK_PENALTY ? points - DUCK_PENALTY : 0;
        }

        // Calculate bowling points
        points += performance.wickets * POINTS_PER_WICKET;
        points += performance.maidens * POINTS_PER_MAIDEN;

        // Bowling bonus points
        if (performance.wickets >= 5) {
            points += BONUS_5_WICKETS;
        } else if (performance.wickets >= 4) {
            points += BONUS_4_WICKETS;
        } else if (performance.wickets >= 3) {
            points += BONUS_3_WICKETS;
        }

        // Calculate fielding points
        points += performance.catches * POINTS_PER_CATCH;
        points += performance.stumpings * POINTS_PER_STUMPING;
        points += performance.runouts * POINTS_PER_RUNOUT;

        return points;
    }

    /**
     * @dev Calculate total fantasy points for a user team
     * @param playerPerformances Array of all player performances in the match
     * @param userTeam User's selected team
     * @return Total fantasy points
     */
    function calculateTeamPoints(
        ContestData.PlayerPerformance[] memory playerPerformances,
        ContestData.UserTeam memory userTeam
    ) public pure returns (uint256) {
        uint256 totalPoints = 0;

        // For each player in the user's team
        for (uint256 i = 0; i < userTeam.playerIds.length; i++) {
            string memory playerId = userTeam.playerIds[i];

            // Find this player's performance data
            ContestData.PlayerPerformance memory playerPerf;
            bool playerFound = false;

            // Linear search through performances
            for (uint256 j = 0; j < playerPerformances.length; j++) {
                if (
                    keccak256(
                        abi.encodePacked(playerPerformances[j].playerId)
                    ) == keccak256(abi.encodePacked(playerId))
                ) {
                    playerPerf = playerPerformances[j];
                    playerFound = true;
                    break;
                }
            }

            // Skip if player performance data is not available
            if (!playerFound) {
                continue;
            }

            uint256 playerPoints = calculatePlayerPoints(playerPerf);

            // Apply captain/vice-captain multipliers
            if (
                keccak256(abi.encodePacked(playerId)) ==
                keccak256(abi.encodePacked(userTeam.captainId))
            ) {
                playerPoints = playerPoints * CAPTAIN_MULTIPLIER;
            } else if (
                keccak256(abi.encodePacked(playerId)) ==
                keccak256(abi.encodePacked(userTeam.viceCaptainId))
            ) {
                playerPoints = (playerPoints * VICE_CAPTAIN_MULTIPLIER) / 10; // Adjust for fixed point
            }

            totalPoints += playerPoints;
        }

        return totalPoints;
    }

    /**
     * @dev Process match scorecard data and calculate fantasy points for all players
     * @param scorecard The match scorecard data
     * @return Processed scorecard with fantasy points calculated
     */
    function processMatchScorecard(
        ContestData.MatchScorecard memory scorecard
    ) public pure returns (ContestData.MatchScorecard memory) {
        for (uint256 i = 0; i < scorecard.playerPerformances.length; i++) {
            scorecard
                .playerPerformances[i]
                .fantasyPoints = calculatePlayerPoints(
                scorecard.playerPerformances[i]
            );
        }

        return scorecard;
    }
}
