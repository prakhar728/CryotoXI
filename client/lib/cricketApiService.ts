// src/services/cricketApiService.js

/**
 * Service for interacting with Cricket API endpoints
 */
const BASE_URL = 'https://api.cricapi.com/v1';

/**
 * Get API key from environment variables
 * In Next.js, you should use the process.env.NEXT_PUBLIC_CRICKET_API_KEY for client-side or
 * process.env.CRICKET_API_KEY for server-side
 */
const getApiKey = () => {
  // When using from server components
  if (typeof window === 'undefined') {
    return process.env.CRICKET_API_KEY;
  }
  // When using from client components
  return process.env.NEXT_PUBLIC_CRICKET_API_KEY;
};

/**
 * Format date to YYYY-MM-DD
 * @param {Date} date - Date object
 * @returns {string} Formatted date string
 */
const formatDate = (date) => {
  return date.toISOString().split('T')[0];
};

/**
 * Format time from GMT string to local time format HH:MM
 * @param {string} dateTimeGMT - GMT datetime string
 * @returns {string} Formatted time string
 */
const formatTimeFromGMT = (dateTimeGMT: string) => {
  const date = new Date(dateTimeGMT);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

/**
 * Format time from GMT string to local time format HH:MM
 * @param {string} dateTimeGMT - GMT datetime string
 * @returns {string} Formatted time string
 */
function toUnixTimestamp(dateTimeGMT: string): number {
  // Parse the input date string and get the timestamp in milliseconds
  const date = new Date(dateTimeGMT);
  
  // Convert to seconds by dividing by 1000
  return Math.floor(date.getTime() / 1000);
}

/**
 * Generic function to make API calls to Cricket API
 * @param {string} endpoint - API endpoint
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} - API response
 */
export const callCricketApi = async (endpoint, params = {}) => {
  try {
    const apiKey = getApiKey();
    if (!apiKey) {
      throw new Error('Cricket API key is not defined in environment variables');
    }

    const queryParams = new URLSearchParams({
      apikey: apiKey,
      ...params
    });

    const response = await fetch(`${BASE_URL}/${endpoint}?${queryParams}`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.status !== 'success') {
      throw new Error(data.message || 'API returned unsuccessful status');
    }
    
    return data;
  } catch (error) {
    console.error(`Error calling Cricket API endpoint ${endpoint}:`, error);
    throw error;
  }
};

/**
 * Get match information by match ID
 * @param {string} matchId - Match ID
 * @returns {Promise<Object>} - Match information
 */
export const getMatchInfo = async (matchId) => {
  return callCricketApi('match_info', { id: matchId });
};

/**
 * Get match squad information by match ID
 * @param {string} matchId - Match ID
 * @returns {Promise<Object>} - Squad information
 */
export const getMatchSquad = async (matchId) => {
  return callCricketApi('match_squad', { id: matchId });
};

/**
 * Get current matches
 * @returns {Promise<Object>} - List of current matches
 */
export const getCurrentMatches = async () => {
  return callCricketApi('matches_current');
};

/**
 * Get upcoming matches
 * @returns {Promise<Object>} - List of upcoming matches
 */
export const getUpcomingMatches = async () => {
  return callCricketApi('matches_upcoming');
};

/**
 * Get player information by player ID
 * @param {string} playerId - Player ID
 * @returns {Promise<Object>} - Player information
 */
export const getPlayerInfo = async (playerId) => {
  return callCricketApi('players_info', { id: playerId });
};

/**
 * Format match data for tournament creation form
 * @param {Object} matchData - Raw match data from API
 * @returns {Object} - Formatted data for tournament form
 */
export const formatMatchDataForForm = (matchData) => {
  if (!matchData || !matchData.data) {
    throw new Error('Invalid match data');
  }
  
  const match = matchData.data;
  
  // Extract team names or use short names if available
  const teamA = match.teams[0];
  const teamB = match.teams[1];
  
  // Get short names (typically country/team codes like IND, AUS, etc.)
  // This is simplified - in a real app you might have a mapping of full names to short codes
  const getShortName = (teamName) => {
    if (!teamName) return '';
    // Extract initials or use a specific mapping
    // This is a simple implementation - you might want to enhance this
    const words = teamName.split(' ');
    if (words.length === 1) {
      return teamName.substring(0, 3).toUpperCase();
    }
    return words.map(word => word.charAt(0)).join('').toUpperCase();
  };
  
  const teamAShort = getShortName(teamA);
  const teamBShort = getShortName(teamB);
  
  // Format match type
  let type = 'T20';
  if (match.matchType) {
    if (match.matchType.toLowerCase().includes('odi')) {
      type = 'ODI';
    } else if (match.matchType.toLowerCase().includes('test')) {
      type = 'Test';
    } else if (match.matchType.toLowerCase().includes('t20')) {
      type = 'T20';
    }
  }
  
  // Determine if the match has started/ended
  const isUpcoming = !match.matchStarted;
  const isOngoing = match.matchStarted && !match.matchEnded;
  const isCompleted = match.matchEnded;
  
  // Get match date and time
  let dateStr = '';
  let timeStr = '';
  let unixTime = 0;
  
  if (match.dateTimeGMT) {
    const matchDate = new Date(match.dateTimeGMT);
    dateStr = formatDate(matchDate);
    timeStr = formatTimeFromGMT(match.dateTimeGMT);
    unixTime = toUnixTimestamp(match.dateTimeGMT);
  } else if (match.date) {
    dateStr = match.date;
  }
  
  // Format status based on match state
  let status = match.status;
  
  // Create the formatted object
  return {
    id: match.id,
    teamA: teamAShort,
    teamB: teamBShort,
    teamAFull: teamA,
    teamBFull: teamB,
    type: type,
    date: dateStr,
    time: timeStr,
    unixTime,
    venue: match.venue || '',
    status: status,
    isUpcoming,
    isOngoing,
    isCompleted,
    // Default values for tournament creation
    entryFee: 2, // Default entry fee
    prizePool: 500, // Default prize pool
    maxParticipants: 10000, // Default max participants
    description: `${teamA} vs ${teamB} - ${type} Match at ${match.venue || 'TBD'}`,
    tossWinner: match.tossWinner || '',
    tossChoice: match.tossChoice || '',
    matchWinner: match.matchWinner || '',
    // Add other relevant fields
  };
};

export default {
  getMatchInfo,
  getMatchSquad,
  getCurrentMatches,
  getUpcomingMatches,
  getPlayerInfo,
  formatMatchDataForForm
};