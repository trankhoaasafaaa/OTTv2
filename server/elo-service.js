'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { DATA_DIR } = require('./storage-paths');

const RATINGS_FILE = path.join(DATA_DIR, 'ratings.json');

// Ensure data directory exists
fs.mkdirSync(DATA_DIR, { recursive: true });

function normalizeKey(str) {
  return String(str || '').trim().toLowerCase();
}

/**
 * Loads ratings file. Automatically migrates legacy per-bot structure to unified account structure.
 */
function loadRatings() {
  try {
    if (fs.existsSync(RATINGS_FILE)) {
      const data = JSON.parse(fs.readFileSync(RATINGS_FILE, 'utf8'));
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        if (data.accounts && typeof data.accounts === 'object') {
          return data;
        }

        // Migrate legacy flat structure (where keys were bot/submission IDs) to accounts
        const migrated = { accounts: {} };
        for (const [id, item] of Object.entries(data)) {
          if (item && typeof item === 'object') {
            const owner = item.owner || item.username || item.name || id;
            const key = normalizeKey(owner);
            if (!migrated.accounts[key]) {
              migrated.accounts[key] = {
                username: owner,
                key,
                elo: item.elo || 1200,
                lastChange: item.lastChange || 0,
                wins: item.wins || 0,
                losses: item.losses || 0,
                draws: item.draws || 0,
                games: item.games || 0,
                bots: [],
                latestBotName: item.name || id,
                lang: item.lang || 'Python',
                updatedAt: item.updatedAt || new Date().toISOString()
              };
            }
            migrated.accounts[key].bots.push({
              id: item.id || id,
              name: item.name || id,
              lang: item.lang || 'Python'
            });
            if (item.name) migrated.accounts[key].latestBotName = item.name;
          }
        }
        saveRatings(migrated);
        return migrated;
      }
    }
  } catch (err) {
    console.error('[EloService] Failed to read ratings.json:', err.message);
  }
  return { accounts: {} };
}

function saveRatings(ratings) {
  try {
    const tmp = RATINGS_FILE + '.tmp.' + crypto.randomBytes(4).toString('hex');
    fs.writeFileSync(tmp, JSON.stringify(ratings, null, 2), 'utf8');
    fs.renameSync(tmp, RATINGS_FILE);
  } catch (err) {
    console.error('[EloService] Failed to save ratings.json:', err.message);
  }
}

/**
 * Standard Elo formula with K-factor = 32
 * Expected score: Ea = 1 / (1 + 10^((Rb - Ra) / 400))
 * Change: delta = round(K * (score - Ea))
 * Wins are strictly positive (at least +1), losses strictly negative (at least -1).
 */
function calculateEloChange(ratingA, ratingB, scoreA, kFactor = 32) {
  const ea = 1 / (1 + 10 ** ((ratingB - ratingA) / 400));
  let delta = Math.round(kFactor * (scoreA - ea));

  if (scoreA === 1 && delta <= 0) delta = 1;
  if (scoreA === 0 && delta >= 0) delta = -1;

  return delta;
}

/**
 * Ensures an account exists in the ratings store, and links any given bot to it.
 * All bots of the same account share that account's single Elo rating.
 */
function ensureAccount(ratings, owner, botInfo = {}) {
  if (!ratings.accounts) ratings.accounts = {};

  const rawOwner = String(owner || botInfo.name || botInfo.id || 'Người chơi').trim();
  const key = normalizeKey(rawOwner);
  if (!key) return null;

  if (!ratings.accounts[key]) {
    ratings.accounts[key] = {
      username: rawOwner,
      key,
      elo: 1200,
      lastChange: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      games: 0,
      bots: [],
      latestBotName: botInfo.name || null,
      lang: botInfo.lang || 'Python',
      updatedAt: new Date().toISOString()
    };
  } else {
    // If stored username was a fallback and now we have an explicit username, update display
    if (ratings.accounts[key].username === 'Người chơi' && rawOwner !== 'Người chơi') {
      ratings.accounts[key].username = rawOwner;
    }
  }

  const acc = ratings.accounts[key];

  // Link bot to account if provided
  if (botInfo && (botInfo.id || botInfo.name)) {
    const botId = botInfo.id || botInfo.name;
    const botName = botInfo.name || botInfo.id;
    const botLang = botInfo.lang || 'Python';
    const existing = acc.bots.find(b => (b.id && b.id === botId) || (b.name && b.name === botName));
    if (!existing) {
      acc.bots.push({ id: botId, name: botName, lang: botLang });
    } else {
      if (botId && !existing.id) existing.id = botId;
      if (botName) existing.name = botName;
      if (botLang) existing.lang = botLang;
    }
    if (botName) acc.latestBotName = botName;
    if (botLang) acc.lang = botLang;
  }

  return acc;
}

/**
 * Update unified Account Elo after a completed match (both tournament and friendly/practice matches).
 * All bots of an account share that account's Elo.
 * If bot 1 of Account A beats bot 2 of Account B, Account A gains Elo and Account B loses Elo.
 * Matches between two bots of the same account do not change Elo.
 */
function recordMatchResult({
  idA,
  nameA,
  ownerA,
  langA,
  idB,
  nameB,
  ownerB,
  langB,
  winner, // 'PLAYER_A' | 'p1' | 'PLAYER_B' | 'p2' | 'DRAW' | null
  matchId,
  reason = 'victory'
}) {
  const ratings = loadRatings();

  const accA = ensureAccount(ratings, ownerA, { id: idA, name: nameA, lang: langA });
  const accB = ensureAccount(ratings, ownerB, { id: idB, name: nameB, lang: langB });

  if (!accA || !accB) return null;

  // If both bots belong to the SAME account, do not alter account Elo
  if (accA.key === accB.key) {
    return {
      matchId,
      idA,
      idB,
      ownerA: accA.username,
      ownerB: accB.username,
      scoreA: 0.5,
      deltaA: 0,
      deltaB: 0,
      newEloA: accA.elo,
      newEloB: accB.elo,
      reason: 'Trận đấu nội bộ cùng tài khoản (không đổi Elo)'
    };
  }

  let scoreA = 0.5;
  if (winner === 'PLAYER_A' || winner === 'p1') {
    scoreA = 1;
  } else if (winner === 'PLAYER_B' || winner === 'p2') {
    scoreA = 0;
  }

  // Calculate Elo change using the shared Account Elo
  const deltaA = calculateEloChange(accA.elo, accB.elo, scoreA);
  const deltaB = -deltaA;

  accA.elo = Math.max(100, accA.elo + deltaA);
  accB.elo = Math.max(100, accB.elo + deltaB);

  accA.lastChange = deltaA;
  accB.lastChange = deltaB;

  accA.games++;
  accB.games++;

  if (scoreA === 1) {
    accA.wins++;
    accB.losses++;
  } else if (scoreA === 0) {
    accB.wins++;
    accA.losses++;
  } else {
    accA.draws++;
    accB.draws++;
  }

  accA.updatedAt = new Date().toISOString();
  accB.updatedAt = new Date().toISOString();

  saveRatings(ratings);

  return {
    matchId,
    idA,
    idB,
    ownerA: accA.username,
    ownerB: accB.username,
    scoreA,
    deltaA,
    deltaB,
    newEloA: accA.elo,
    newEloB: accB.elo,
    reason
  };
}

/**
 * Register or link a submission to its owner's account
 */
function registerBot({ id, name, owner, lang }) {
  const ratings = loadRatings();
  const acc = ensureAccount(ratings, owner, { id, name, lang });
  saveRatings(ratings);
  return acc;
}

/**
 * Get account Elo rating
 */
function getAccountElo(username) {
  const ratings = loadRatings();
  const key = normalizeKey(username);
  return ratings.accounts?.[key]?.elo || 1200;
}

/**
 * Get bot Elo (inherits its account's Elo)
 */
function getBotElo(botIdOrName) {
  const ratings = loadRatings();
  for (const acc of Object.values(ratings.accounts || {})) {
    if (acc.bots && acc.bots.some(b => b.id === botIdOrName || b.name === botIdOrName)) {
      return acc.elo;
    }
  }
  return 1200;
}

/**
 * Get sorted leaderboard ranked by Account Elo
 */
function getLeaderboard(extraSubmissions = []) {
  const ratings = loadRatings();

  if (Array.isArray(extraSubmissions) && extraSubmissions.length > 0) {
    let changed = false;
    for (const sub of extraSubmissions) {
      if (sub) {
        const owner = sub.ownedBy || sub.username || sub.user?.username || 'Người chơi';
        const botId = sub.id;
        const name = sub.filename || sub.name || sub.id;
        const lang = sub.language || sub.lang || 'Python';
        ensureAccount(ratings, owner, { id: botId, name, lang });
        changed = true;
      }
    }
    if (changed) saveRatings(ratings);
  }

  const list = Object.values(ratings.accounts || {});

  return list
    .sort((a, b) => b.elo - a.elo || b.wins - a.wins || a.losses - b.losses)
    .map((acc, i) => {
      const primaryBot = acc.latestBotName || (acc.bots && acc.bots[0]?.name) || 'Bot';
      return {
        id: acc.username,
        rank: String(i + 1).padStart(2, '0'),
        name: primaryBot,
        username: acc.username,
        owner: acc.username,
        competitor: acc.username,
        botCount: (acc.bots && acc.bots.length) || 1,
        bots: acc.bots || [],
        lang: acc.lang || 'Python',
        elo: acc.elo,
        change: acc.lastChange > 0 ? `+${acc.lastChange}` : (acc.lastChange < 0 ? `${acc.lastChange}` : '0'),
        lastChange: acc.lastChange || 0,
        wins: acc.wins || 0,
        losses: acc.losses || 0,
        draws: acc.draws || 0,
        games: acc.games || 0,
        updatedAt: acc.updatedAt
      };
    });
}

module.exports = {
  loadRatings,
  saveRatings,
  calculateEloChange,
  recordMatchResult,
  registerBot,
  getAccountElo,
  getBotElo,
  getLeaderboard,
  RATINGS_FILE
};
