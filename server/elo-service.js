'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { DATA_DIR } = require('./storage-paths');
const {current}=require('./durable/context');

const RATINGS_FILE = path.join(DATA_DIR, 'ratings.json');

// Ensure data directory exists
fs.mkdirSync(DATA_DIR, { recursive: true });

function loadRatings() {
  if(current()) return current().ratings;
  try {
    if (fs.existsSync(RATINGS_FILE)) {
      const data = JSON.parse(fs.readFileSync(RATINGS_FILE, 'utf8'));
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        // If data is in accounts format, unpack each bot into ratings[botId]
        if (data.accounts && typeof data.accounts === 'object') {
          const unpacked = {};
          for (const acc of Object.values(data.accounts)) {
            if (acc && Array.isArray(acc.bots)) {
              for (const b of acc.bots) {
                if (b && (b.id || b.name)) {
                  const botId = b.id || b.name;
                  unpacked[botId] = {
                    id: botId,
                    name: b.name || botId,
                    owner: acc.username || 'Người chơi',
                    lang: b.lang || acc.lang || 'Python',
                    elo: 1200,
                    lastChange: 0,
                    wins: 0,
                    losses: 0,
                    draws: 0,
                    games: 0,
                    updatedAt: acc.updatedAt || new Date().toISOString()
                  };
                }
              }
            }
          }
          saveRatings(unpacked);
          return unpacked;
        }
        return data;
      }
    }
  } catch (err) {
    console.error('[EloService] Failed to read ratings.json:', err.message);
  }
  return {};
}

function saveRatings(ratings) {
  if(current()) { current().ratings=ratings; return; }
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
 * Ensure individual bot entry exists in ratings
 */
function ensureBotEntry(ratings, { id, name, owner, lang }) {
  if (!id) return null;
  if (!ratings[id]) {
    ratings[id] = {
      id,
      name: name || id,
      owner: owner || 'Người chơi',
      lang: lang || 'Python',
      elo: 1200,
      lastChange: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      games: 0,
      updatedAt: new Date().toISOString()
    };
  } else {
    if (name && ratings[id].name !== name) ratings[id].name = name;
    if (owner && ratings[id].owner !== owner) ratings[id].owner = owner;
    if (lang && ratings[id].lang !== lang) ratings[id].lang = lang;
  }
  return ratings[id];
}

/**
 * Update Elo per bot after a completed match (both tournament and regular matches).
 * Each bot tracks its own individual Elo rating.
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
  if (!idA || !idB || idA === idB) return null;

  const scope=current();
  const receiptKey=matchId && String(matchId);
  if(scope && !receiptKey) throw new Error('A durable rating result requires matchId');
  if(scope && scope.receipts[receiptKey]) { const old=scope.receipts[receiptKey].result; return old?.imported?null:old; }

  const ratings = loadRatings();
  const botA = ensureBotEntry(ratings, { id: idA, name: nameA, owner: ownerA, lang: langA });
  const botB = ensureBotEntry(ratings, { id: idB, name: nameB, owner: ownerB, lang: langB });

  if (!botA || !botB) return null;

  let scoreA = 0.5;
  if (winner === 'PLAYER_A' || winner === 'p1') {
    scoreA = 1;
  } else if (winner === 'PLAYER_B' || winner === 'p2') {
    scoreA = 0;
  }

  // Calculate Elo delta using each bot's individual rating
  const deltaA = calculateEloChange(botA.elo, botB.elo, scoreA);
  const deltaB = -deltaA;

  botA.elo = Math.max(100, botA.elo + deltaA);
  botB.elo = Math.max(100, botB.elo + deltaB);

  botA.lastChange = deltaA;
  botB.lastChange = deltaB;

  botA.games++;
  botB.games++;

  if (scoreA === 1) {
    botA.wins++;
    botB.losses++;
  } else if (scoreA === 0) {
    botB.wins++;
    botA.losses++;
  } else {
    botA.draws++;
    botB.draws++;
  }

  botA.updatedAt = new Date().toISOString();
  botB.updatedAt = new Date().toISOString();

  saveRatings(ratings);

  const result = {
    matchId,
    idA,
    idB,
    ownerA: botA.owner,
    ownerB: botB.owner,
    scoreA,
    deltaA,
    deltaB,
    newEloA: botA.elo,
    newEloB: botB.elo,
    reason
  };
  if(scope) scope.receipts[receiptKey]={id:receiptKey,result};
  return result;
}

/**
 * Register or update a submission in ratings
 */
function registerBot({ id, name, owner, lang }) {
  if (!id) return null;
  const ratings = loadRatings();
  const entry = ensureBotEntry(ratings, { id, name, owner, lang });
  saveRatings(ratings);
  return entry;
}

/**
 * Get individual bot Elo
 */
function getBotElo(idOrName) {
  const ratings = loadRatings();
  if (ratings[idOrName]) return ratings[idOrName].elo;
  for (const r of Object.values(ratings)) {
    if (r.id === idOrName || r.name === idOrName) return r.elo;
  }
  return 1200;
}

/**
 * Get account highest bot Elo
 */
function getAccountElo(username) {
  const ratings = loadRatings();
  const userBots = Object.values(ratings).filter(r => r.owner && r.owner.toLowerCase() === String(username).toLowerCase());
  if (userBots.length > 0) {
    return Math.max(...userBots.map(b => b.elo));
  }
  return 1200;
}

/**
 * Get sorted leaderboard of individual bots with owner account display
 */
function getLeaderboard(extraSubmissions = []) {
  const ratings = loadRatings();

  if (Array.isArray(extraSubmissions) && extraSubmissions.length > 0) {
    let changed = false;
    for (const sub of extraSubmissions) {
      if (sub && sub.id && !ratings[sub.id]) {
        ensureBotEntry(ratings, {
          id: sub.id,
          name: sub.botName || sub.filename || sub.name || sub.id,
          owner: sub.ownedBy || sub.username || sub.user?.username || 'Người chơi',
          lang: sub.language || sub.lang || 'Python'
        });
        changed = true;
      }
    }
    if (changed) saveRatings(ratings);
  }

  return Object.values(ratings)
    .sort((a, b) => b.elo - a.elo || b.wins - a.wins || a.losses - b.losses)
    .map((r, i) => ({
      id: r.id,
      rank: String(i + 1).padStart(2, '0'),
      name: r.name,
      owner: r.owner || 'Người chơi',
      competitor: r.owner ? `${r.owner} • ${r.name}` : r.name,
      lang: r.lang || 'Python',
      elo: r.elo,
      change: r.lastChange > 0 ? `+${r.lastChange}` : (r.lastChange < 0 ? `${r.lastChange}` : '0'),
      lastChange: r.lastChange || 0,
      wins: r.wins || 0,
      losses: r.losses || 0,
      draws: r.draws || 0,
      games: r.games || 0,
      updatedAt: r.updatedAt
    }));
}

module.exports = {
  loadRatings,
  saveRatings,
  calculateEloChange,
  recordMatchResult,
  registerBot,
  getBotElo,
  getAccountElo,
  getLeaderboard,
  RATINGS_FILE
};
