'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { DATA_DIR } = require('../storage-paths');
const { runMatch } = require('../engine');

const TOURNAMENTS_FILE = path.join(DATA_DIR, 'tournaments.json');

// Ensure data directory exists
fs.mkdirSync(DATA_DIR, { recursive: true });

function loadTournaments() {
  try {
    if (fs.existsSync(TOURNAMENTS_FILE)) {
      const data = JSON.parse(fs.readFileSync(TOURNAMENTS_FILE, 'utf8'));
      if (Array.isArray(data)) return data;
    }
  } catch (err) {
    console.error('[TournamentService] Failed to read tournaments.json:', err.message);
  }
  return [];
}

function saveTournaments(tournaments) {
  const tmpFile = TOURNAMENTS_FILE + '.tmp.' + crypto.randomBytes(4).toString('hex');
  fs.writeFileSync(tmpFile, JSON.stringify(tournaments, null, 2), 'utf8');
  fs.renameSync(tmpFile, TOURNAMENTS_FILE);
}

function error(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function requireAdmin(user) {
  if (!user || (user.role !== 'ADMIN' && user.role !== 'JUDGE')) {
    throw error(403, 'Chỉ Admin mới có quyền thiết lập và điều hành giải đấu');
  }
}

function requireAuth(user) {
  if (!user || !user.id) {
    throw error(401, 'Vui lòng đăng nhập để thực hiện thao tác');
  }
}

function createLog(actor, action, details, metadata = {}) {
  return {
    id: 'LOG-' + crypto.randomBytes(4).toString('hex').toUpperCase(),
    timestamp: new Date().toISOString(),
    actorId: actor?.id || null,
    actorName: actor?.username || 'System',
    actorRole: actor?.role || 'SYSTEM',
    action,
    details,
    metadata
  };
}

class TournamentService {
  constructor(opts = {}) {
    this.runner = opts.runner || null;
    this.store = opts.store || null;
  }

  // ============================================================
  // PUBLIC QUERIES
  // ============================================================

  listTournaments() {
    const list = loadTournaments();
    return list.map(t => ({
      id: t.id,
      name: t.name,
      description: t.description,
      format: t.format, // 'ROUND_ROBIN' | 'SINGLE_ELIMINATION'
      status: t.status, // 'DRAFT', 'REGISTRATION', 'SUBMISSIONS_CLOSED', 'RUNNING', 'COMPLETED', 'CANCELLED'
      entryCount: (t.entries || []).length,
      approvedCount: (t.entries || []).filter(e => e.status === 'APPROVED').length,
      matchCount: (t.matches || []).length,
      completedMatches: (t.matches || []).filter(m => m.status === 'COMPLETED').length,
      champion: t.champion || null,
      runnerUp: t.runnerUp || null,
      thirdPlace: t.thirdPlace || null,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt
    })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  getTournament(id) {
    const list = loadTournaments();
    const t = list.find(item => item.id === id);
    if (!t) throw error(404, 'Không tìm thấy giải đấu');
    return t;
  }

  // ============================================================
  // ADMIN ACTIONS: CRUD & PHASES
  // ============================================================

  createTournament(data, user) {
    requireAdmin(user);
    const name = String(data.name || '').trim();
    if (!name || name.length < 3 || name.length > 100) {
      throw error(400, 'Tên giải đấu phải từ 3 đến 100 ký tự');
    }

    const format = String(data.format || 'ROUND_ROBIN').toUpperCase();
    if (!['ROUND_ROBIN', 'SINGLE_ELIMINATION'].includes(format)) {
      throw error(400, 'Thể thức giải đấu phải là ROUND_ROBIN hoặc SINGLE_ELIMINATION');
    }

    const maxMoves = Number(data.maxMoves) || 200;
    const pieces = Number(data.pieces) || 6;
    const first = ['Random', 'Player A', 'Player B'].includes(data.first) ? data.first : 'Random';

    const tournament = {
      id: 'TOUR-' + crypto.randomBytes(4).toString('hex').toUpperCase(),
      name,
      description: String(data.description || '').trim().slice(0, 500),
      format,
      status: 'DRAFT',
      config: { maxMoves, pieces, first },
      entries: [],
      rounds: [],
      matches: [],
      standings: [],
      champion: null,
      runnerUp: null,
      thirdPlace: null,
      refereeLogs: [
        createLog(user, 'CREATE_TOURNAMENT', `Tạo giải đấu "${name}" thể thức ${format === 'ROUND_ROBIN' ? 'Đấu vòng tròn' : 'Đấu loại trực tiếp'}`)
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const list = loadTournaments();
    list.unshift(tournament);
    saveTournaments(list);
    return tournament;
  }

  updateTournament(id, data, user) {
    requireAdmin(user);
    const list = loadTournaments();
    const t = list.find(item => item.id === id);
    if (!t) throw error(404, 'Không tìm thấy giải đấu');

    if (t.status === 'COMPLETED') {
      throw error(400, 'Không thể chỉnh sửa giải đấu đã kết thúc');
    }

    if (data.name) {
      t.name = String(data.name).trim().slice(0, 100);
    }
    if (data.description !== undefined) {
      t.description = String(data.description).trim().slice(0, 500);
    }
    if (data.format && ['DRAFT', 'REGISTRATION'].includes(t.status)) {
      const format = String(data.format).toUpperCase();
      if (['ROUND_ROBIN', 'SINGLE_ELIMINATION'].includes(format)) {
        t.format = format;
      }
    }
    if (data.maxMoves) t.config.maxMoves = Number(data.maxMoves);
    if (data.pieces) t.config.pieces = Number(data.pieces);
    if (data.first) t.config.first = data.first;

    t.updatedAt = new Date().toISOString();
    t.refereeLogs.unshift(createLog(user, 'UPDATE_TOURNAMENT', `Cập nhật thông tin giải đấu`));
    saveTournaments(list);
    return t;
  }

  deleteTournament(id, user) {
    requireAdmin(user);
    const list = loadTournaments();
    const idx = list.findIndex(item => item.id === id);
    if (idx === -1) throw error(404, 'Không tìm thấy giải đấu');

    const t = list[idx];
    if (Array.isArray(t.matches)) {
      for (const m of t.matches) {
        if (m && m.id) {
          const replayFile = path.join(DATA_DIR, m.id + '.json');
          if (fs.existsSync(replayFile)) {
            try { fs.unlinkSync(replayFile); } catch (_) { }
          }
        }
      }
    }

    list.splice(idx, 1);
    saveTournaments(list);
    return { ok: true, deleted: id };
  }

  openRegistration(id, user) {
    requireAdmin(user);
    const list = loadTournaments();
    const t = list.find(item => item.id === id);
    if (!t) throw error(404, 'Không tìm thấy giải đấu');

    if (t.status !== 'DRAFT') {
      throw error(400, `Không thể mở đăng ký cho giải ở trạng thái ${t.status}`);
    }

    t.status = 'REGISTRATION';
    t.updatedAt = new Date().toISOString();
    t.refereeLogs.unshift(createLog(user, 'OPEN_REGISTRATION', `Mở cổng đăng ký tham gia giải đấu`));
    saveTournaments(list);
    return t;
  }

  // ============================================================
  // PARTICIPANT REGISTRATION & APPROVAL
  // ============================================================

  registerParticipant(id, { submissionId, submissionName, submissionLang, submissionVersion }, user) {
    requireAuth(user);
    const list = loadTournaments();
    const t = list.find(item => item.id === id);
    if (!t) throw error(404, 'Không tìm thấy giải đấu');

    if (t.status !== 'REGISTRATION') {
      throw error(400, 'Giải đấu hiện không mở đăng ký');
    }

    if (!submissionId) {
      throw error(400, 'Vui lòng chọn bot chính thức thi đấu');
    }

    const existingIdx = t.entries.findIndex(e => e.userId === user.id);
    const entryData = {
      userId: user.id,
      username: user.username,
      submissionId,
      submissionName: submissionName || 'Unknown Bot',
      submissionLang: submissionLang || 'Python',
      submissionVersion: submissionVersion || 'v1.0',
      status: 'PENDING',
      joinedAt: new Date().toISOString()
    };

    if (existingIdx >= 0) {
      // Update official bot registration
      t.entries[existingIdx] = {
        ...t.entries[existingIdx],
        ...entryData,
        status: 'PENDING' // Reset to pending approval when changing bot
      };
    } else {
      t.entries.push(entryData);
    }

    t.updatedAt = new Date().toISOString();
    saveTournaments(list);
    return t;
  }

  unregisterParticipant(id, user) {
    requireAuth(user);
    const list = loadTournaments();
    const t = list.find(item => item.id === id);
    if (!t) throw error(404, 'Không tìm thấy giải đấu');

    if (t.status !== 'REGISTRATION') {
      throw error(400, 'Không thể hủy đăng ký khi giải đấu đã chốt');
    }

    const idx = t.entries.findIndex(e => e.userId === user.id);
    if (idx === -1) throw error(400, 'Bạn chưa đăng ký giải này');

    t.entries.splice(idx, 1);
    t.updatedAt = new Date().toISOString();
    saveTournaments(list);
    return t;
  }

  approveParticipant(id, targetUserId, user) {
    requireAdmin(user);
    const list = loadTournaments();
    const t = list.find(item => item.id === id);
    if (!t) throw error(404, 'Không tìm thấy giải đấu');

    const entry = t.entries.find(e => e.userId === targetUserId);
    if (!entry) throw error(404, 'Không tìm thấy người tham gia');

    entry.status = 'APPROVED';
    t.updatedAt = new Date().toISOString();
    t.refereeLogs.unshift(createLog(
      user,
      'APPROVE_PARTICIPANT',
      `Duyệt thí sinh "${entry.username}" với bot chính thức "${entry.submissionName}"`,
      { targetUserId, submissionId: entry.submissionId }
    ));
    saveTournaments(list);
    return t;
  }

  rejectParticipant(id, targetUserId, reason, user) {
    requireAdmin(user);
    const list = loadTournaments();
    const t = list.find(item => item.id === id);
    if (!t) throw error(404, 'Không tìm thấy giải đấu');

    const entry = t.entries.find(e => e.userId === targetUserId);
    if (!entry) throw error(404, 'Không tìm thấy người tham gia');

    entry.status = 'REJECTED';
    entry.rejectReason = String(reason || 'Không đạt yêu cầu').slice(0, 200);
    t.updatedAt = new Date().toISOString();
    t.refereeLogs.unshift(createLog(
      user,
      'REJECT_PARTICIPANT',
      `Từ chối thí sinh "${entry.username}". Lý do: ${entry.rejectReason}`,
      { targetUserId, reason: entry.rejectReason }
    ));
    saveTournaments(list);
    return t;
  }

  approveAllParticipants(id, user) {
    requireAdmin(user);
    const list = loadTournaments();
    const t = list.find(item => item.id === id);
    if (!t) throw error(404, 'Không tìm thấy giải đấu');

    let approvedCount = 0;
    for (const e of t.entries) {
      if (e.status === 'PENDING') {
        e.status = 'APPROVED';
        approvedCount++;
      }
    }

    t.updatedAt = new Date().toISOString();
    t.refereeLogs.unshift(createLog(
      user,
      'APPROVE_ALL',
      `Duyệt toàn bộ ${approvedCount} thí sinh đang chờ tham gia giải`
    ));
    saveTournaments(list);
    return t;
  }

  lockSubmissions(id, user) {
    requireAdmin(user);
    const list = loadTournaments();
    const t = list.find(item => item.id === id);
    if (!t) throw error(404, 'Không tìm thấy giải đấu');

    if (!['REGISTRATION', 'DRAFT'].includes(t.status)) {
      throw error(400, `Không thể khóa bài nộp ở trạng thái ${t.status}`);
    }

    const approved = t.entries.filter(e => e.status === 'APPROVED');
    if (approved.length < 2) {
      throw error(400, `Cần ít nhất 2 thí sinh được duyệt (hiện có ${approved.length}) để khóa bài nộp và tạo giải`);
    }

    t.status = 'SUBMISSIONS_CLOSED';
    t.updatedAt = new Date().toISOString();
    t.refereeLogs.unshift(createLog(
      user,
      'LOCK_SUBMISSIONS',
      `Khóa cổng nộp bài. Chốt danh sách chính thức gồm ${approved.length} thí sinh.`
    ));
    saveTournaments(list);
    return t;
  }

  // ============================================================
  // BRACKET & ROUND GENERATION
  // ============================================================

  generateBracket(id, user) {
    requireAdmin(user);
    const list = loadTournaments();
    const t = list.find(item => item.id === id);
    if (!t) throw error(404, 'Không tìm thấy giải đấu');

    const approved = t.entries.filter(e => e.status === 'APPROVED');
    if (approved.length < 2) {
      throw error(400, `Cần ít nhất 2 thí sinh được duyệt để bốc thăm và tạo lịch thi đấu`);
    }

    if (t.format === 'ROUND_ROBIN') {
      this._generateRoundRobin(t, approved);
    } else {
      this._generateSingleElimination(t, approved);
    }

    t.status = 'RUNNING';
    t.updatedAt = new Date().toISOString();
    t.refereeLogs.unshift(createLog(
      user,
      'GENERATE_ROUNDS',
      `Tạo ${t.rounds.length} vòng đấu với tổng số ${t.matches.length} trận đấu theo thể thức ${t.format === 'ROUND_ROBIN' ? 'Vòng tròn' : 'Loại trực tiếp'}`
    ));

    saveTournaments(list);
    return t;
  }

  // ------------------------------------------------------------
  // Format 1: Round Robin Generator (Circle Method)
  // Win = 3, Draw = 1, Loss = 0
  // ------------------------------------------------------------
  _generateRoundRobin(t, participants) {
    const players = [...participants];
    const n = players.length;
    const isOdd = n % 2 !== 0;
    const effectivePlayers = [...players];
    if (isOdd) {
      effectivePlayers.push({ userId: '__BYE__', username: 'BYE' });
    }

    const totalRounds = effectivePlayers.length - 1;
    const half = effectivePlayers.length / 2;

    const rounds = [];
    const matches = [];

    // Initialize Standings
    t.standings = players.map((p, idx) => ({
      rank: idx + 1,
      userId: p.userId,
      username: p.username,
      botName: p.submissionName,
      botLang: p.submissionLang,
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      points: 0, // Win=3, Draw=1, Loss=0
      turns: 0
    }));

    let currentList = [...effectivePlayers];

    for (let r = 0; r < totalRounds; r++) {
      const roundMatches = [];
      const roundNumber = r + 1;
      const roundName = `Vòng ${roundNumber}`;

      for (let i = 0; i < half; i++) {
        const p1 = currentList[i];
        const p2 = currentList[currentList.length - 1 - i];

        // Skip match if one side is BYE
        if (p1.userId === '__BYE__' || p2.userId === '__BYE__') {
          continue;
        }

        // Alternate home/away sides
        const [home, away] = (r + i) % 2 === 0 ? [p1, p2] : [p2, p1];

        const matchId = 'M-' + crypto.randomBytes(4).toString('hex').toUpperCase();
        const match = {
          id: matchId,
          tournamentId: t.id,
          roundNumber,
          roundName,
          bracketIndex: matches.length,
          playerA: {
            userId: home.userId,
            username: home.username,
            submissionId: home.submissionId,
            botName: home.submissionName,
            botLang: home.submissionLang
          },
          playerB: {
            userId: away.userId,
            username: away.username,
            submissionId: away.submissionId,
            botName: away.submissionName,
            botLang: away.submissionLang
          },
          status: 'QUEUED',
          winner: null,
          score: 'Chờ đấu',
          reason: null,
          turns: 0,
          replayPath: null,
          replayAvailable: false,
          isBye: false,
          pausedReason: null,
          createdAt: new Date().toISOString(),
          finishedAt: null
        };

        matches.push(match);
        roundMatches.push(matchId);
      }

      rounds.push({
        roundNumber,
        name: roundName,
        status: r === 0 ? 'RUNNING' : 'PENDING',
        matchIds: roundMatches
      });

      // Circle rotation: keep index 0 fixed, rotate others
      const fixed = currentList[0];
      const rest = currentList.slice(1);
      const last = rest.pop();
      rest.unshift(last);
      currentList = [fixed, ...rest];
    }

    t.rounds = rounds;
    t.matches = matches;
  }

  // ------------------------------------------------------------
  // Format 2: Single Elimination / Knockout Bracket
  // Odd numbers get BYE to next round
  // ------------------------------------------------------------
  _generateSingleElimination(t, participants) {
    const players = [...participants];
    const n = players.length;

    // Power of 2 bracket size
    let bracketSize = 2;
    while (bracketSize < n) {
      bracketSize *= 2;
    }

    const byeCount = bracketSize - n;
    const totalRounds = Math.log2(bracketSize);

    function getRoundName(roundIdx, totalRounds) {
      const remaining = totalRounds - roundIdx;
      if (remaining === 1) return 'Chung kết';
      if (remaining === 2) return 'Bán kết';
      if (remaining === 3) return 'Tứ kết';
      return `Vòng ${roundIdx + 1}`;
    }

    const rounds = [];
    const allMatches = [];

    // Pre-create all matches across all rounds so nextMatchId pointers can be wired
    const roundMatchArrays = [];
    for (let r = 0; r < totalRounds; r++) {
      const count = bracketSize / Math.pow(2, r + 1);
      const roundName = getRoundName(r, totalRounds);
      const matchesInRound = [];

      for (let i = 0; i < count; i++) {
        const matchId = 'M-' + crypto.randomBytes(4).toString('hex').toUpperCase();
        matchesInRound.push({
          id: matchId,
          tournamentId: t.id,
          roundNumber: r + 1,
          roundName,
          bracketIndex: i,
          nextMatchId: null,
          nextMatchSlot: i % 2 === 0 ? 'playerA' : 'playerB',
          playerA: null,
          playerB: null,
          status: 'QUEUED',
          winner: null,
          score: 'Chờ đấu',
          reason: null,
          turns: 0,
          replayPath: null,
          replayAvailable: false,
          isBye: false,
          pausedReason: null,
          createdAt: new Date().toISOString(),
          finishedAt: null
        });
      }
      roundMatchArrays.push(matchesInRound);
    }

    // Connect nextMatchId for each match to the next round
    for (let r = 0; r < totalRounds - 1; r++) {
      const currentMatches = roundMatchArrays[r];
      const nextMatches = roundMatchArrays[r + 1];
      for (let i = 0; i < currentMatches.length; i++) {
        const nextIdx = Math.floor(i / 2);
        currentMatches[i].nextMatchId = nextMatches[nextIdx].id;
      }
    }

    // Populate Round 1 with players and assign BYEs for odd/unfilled slots
    // Seeds with BYE advance directly to Round 2!
    const round1 = roundMatchArrays[0];
    let playerIdx = 0;

    for (let i = 0; i < round1.length; i++) {
      const m = round1[i];
      const pA = players[playerIdx++];
      const pB = (i < byeCount) ? null : players[playerIdx++];

      m.playerA = {
        userId: pA.userId,
        username: pA.username,
        submissionId: pA.submissionId,
        botName: pA.submissionName,
        botLang: pA.submissionLang
      };

      if (!pB) {
        // BYE advancement!
        m.isBye = true;
        m.playerB = null;
        m.status = 'COMPLETED';
        m.winner = 'PLAYER_A';
        m.score = 'Vào thẳng (BYE)';
        m.reason = 'Thí sinh được vào thẳng vòng sau do lẻ cặp';
        m.finishedAt = new Date().toISOString();

        // Advance immediately to next match slot
        if (m.nextMatchId) {
          const nextMatch = roundMatchArrays[1][Math.floor(i / 2)];
          if (m.nextMatchSlot === 'playerA') {
            nextMatch.playerA = { ...m.playerA };
          } else {
            nextMatch.playerB = { ...m.playerA };
          }
        }
      } else {
        m.playerB = {
          userId: pB.userId,
          username: pB.username,
          submissionId: pB.submissionId,
          botName: pB.submissionName,
          botLang: pB.submissionLang
        };
      }
    }

    // Flatten rounds and matches
    for (let r = 0; r < totalRounds; r++) {
      const matchesInRound = roundMatchArrays[r];
      allMatches.push(...matchesInRound);
      rounds.push({
        roundNumber: r + 1,
        name: getRoundName(r, totalRounds),
        status: r === 0 ? 'RUNNING' : 'PENDING',
        matchIds: matchesInRound.map(m => m.id)
      });
    }

    t.rounds = rounds;
    t.matches = allMatches;
    t.standings = [];
  }

  // ============================================================
  // MATCH CONTROL: START, PAUSE, RESUME, CANCEL, ADJUDICATE
  // ============================================================

  async startMatch(tournamentId, matchId, user, executeRunner, isRematch = false) {
    requireAdmin(user);
    const list = loadTournaments();
    const t = list.find(item => item.id === tournamentId);
    if (!t) throw error(404, 'Không tìm thấy giải đấu');

    const match = (t.matches || []).find(m => m.id === matchId);
    if (!match) throw error(404, 'Không tìm thấy trận đấu');

    if (match.status === 'COMPLETED' && !isRematch) {
      throw error(400, 'Trận đấu này đã kết thúc');
    }

    if (!match.playerA || !match.playerB) {
      throw error(400, 'Trận đấu chưa đủ 2 đấu thủ');
    }

    match.status = 'RUNNING';
    match.pausedReason = null;
    t.updatedAt = new Date().toISOString();
    saveTournaments(list);

    // Run the match via runner or internal engine
    let replayResult = null;
    let winner = null;
    let reason = 'victory';
    let turns = 0;

    try {
      const seed = crypto.randomBytes(4).readUInt32LE(0);
      const opts = {
        seed,
        maxMoves: t.config.maxMoves || 200,
        pieces: t.config.pieces || 6,
        first: t.config.first || 'Random'
      };

      if (typeof executeRunner === 'function') {
        replayResult = await executeRunner(match, opts);
      } else {
        // Built-in tactical match simulation using game engine
        replayResult = await runMatch({
          ...opts,
          bots: ['greedy', 'random']
        });
      }

      winner = replayResult.winner === 'p1' ? 'PLAYER_A' : replayResult.winner === 'p2' ? 'PLAYER_B' : 'DRAW';
      reason = replayResult.reason || 'victory';
      turns = replayResult.turns || replayResult.events?.length || 0;

      // Save replay JSON to data/${matchId}.json
      const replayPath = path.join(DATA_DIR, matchId + '.json');
      fs.writeFileSync(replayPath, JSON.stringify(replayResult, null, 2), 'utf8');
      match.replayPath = `data/${matchId}.json`;
      match.replayAvailable = true;
    } catch (err) {
      console.error('[TournamentMatch] Run error:', err);
      // Mark as completed with forfeit or judge fallback if error
      winner = 'DRAW';
      reason = 'Lỗi thực thi bot: ' + err.message;
    }

    match.status = 'COMPLETED';
    match.winner = winner;
    match.score = winner === 'PLAYER_A' ? '1 – 0' : winner === 'PLAYER_B' ? '0 – 1' : '0.5 – 0.5';
    match.reason = reason;
    match.turns = turns;
    match.finishedAt = new Date().toISOString();

    // Update Round Robin Standings or Knockout Bracket
    if (t.format === 'ROUND_ROBIN') {
      this._updateRoundRobinStandings(t);
    } else if (t.format === 'SINGLE_ELIMINATION') {
      this._advanceKnockoutWinner(t, match);
    }

    t.updatedAt = new Date().toISOString();
    t.refereeLogs.unshift(createLog(
      user,
      isRematch ? 'MATCH_REMATCH' : 'START_MATCH',
      `${isRematch ? 'Đấu lại' : 'Hoàn tất'} trận ${match.id} (${match.roundName}): ${match.playerA.username} (${match.playerA.botName}) vs ${match.playerB.username} (${match.playerB.botName}). Kết quả: ${match.score} (${match.reason})`,
      { matchId: match.id, winner, score: match.score, reason, isRematch }
    ));

    saveTournaments(list);
    return { match, tournament: t };
  }

  async rematchMatch(tournamentId, matchId, user, executeRunner) {
    return this.startMatch(tournamentId, matchId, user, executeRunner, true);
  }

  pauseMatch(tournamentId, matchId, reason, user) {
    requireAdmin(user);
    const list = loadTournaments();
    const t = list.find(item => item.id === tournamentId);
    if (!t) throw error(404, 'Không tìm thấy giải đấu');

    const match = (t.matches || []).find(m => m.id === matchId);
    if (!match) throw error(404, 'Không tìm thấy trận đấu');

    if (match.status === 'COMPLETED') {
      throw error(400, 'Không thể tạm dừng trận đấu đã kết thúc');
    }

    match.status = 'PAUSED';
    match.pausedReason = String(reason || 'Trọng tài tạm dừng trận đấu').slice(0, 200);
    t.updatedAt = new Date().toISOString();
    t.refereeLogs.unshift(createLog(
      user,
      'PAUSE_MATCH',
      `Tạm dừng trận ${match.id} (${match.roundName}). Lý do: ${match.pausedReason}`,
      { matchId: match.id, reason: match.pausedReason }
    ));

    saveTournaments(list);
    return match;
  }

  resumeMatch(tournamentId, matchId, user) {
    requireAdmin(user);
    const list = loadTournaments();
    const t = list.find(item => item.id === tournamentId);
    if (!t) throw error(404, 'Không tìm thấy giải đấu');

    const match = (t.matches || []).find(m => m.id === matchId);
    if (!match) throw error(404, 'Không tìm thấy trận đấu');

    if (match.status !== 'PAUSED') {
      throw error(400, 'Trận đấu không ở trạng thái tạm dừng');
    }

    match.status = 'QUEUED';
    match.pausedReason = null;
    t.updatedAt = new Date().toISOString();
    t.refereeLogs.unshift(createLog(
      user,
      'RESUME_MATCH',
      `Tiếp tục trận ${match.id} (${match.roundName})`,
      { matchId: match.id }
    ));

    saveTournaments(list);
    return match;
  }

  cancelMatch(tournamentId, matchId, reason, user) {
    requireAdmin(user);
    const list = loadTournaments();
    const t = list.find(item => item.id === tournamentId);
    if (!t) throw error(404, 'Không tìm thấy giải đấu');

    const match = (t.matches || []).find(m => m.id === matchId);
    if (!match) throw error(404, 'Không tìm thấy trận đấu');

    match.status = 'CANCELLED';
    match.reason = String(reason || 'Trọng tài hủy trận đấu').slice(0, 200);
    match.score = 'Đã hủy';
    t.updatedAt = new Date().toISOString();
    t.refereeLogs.unshift(createLog(
      user,
      'CANCEL_MATCH',
      `Hủy trận ${match.id} (${match.roundName}). Lý do: ${match.reason}`,
      { matchId: match.id, reason: match.reason }
    ));

    saveTournaments(list);
    return match;
  }

  adjudicateMatch(tournamentId, matchId, { winner, reason }, user) {
    requireAdmin(user);
    const list = loadTournaments();
    const t = list.find(item => item.id === tournamentId);
    if (!t) throw error(404, 'Không tìm thấy giải đấu');

    const match = (t.matches || []).find(m => m.id === matchId);
    if (!match) throw error(404, 'Không tìm thấy trận đấu');

    if (!['PLAYER_A', 'PLAYER_B', 'DRAW'].includes(winner)) {
      throw error(400, 'Kết quả xử phải là PLAYER_A, PLAYER_B hoặc DRAW');
    }

    match.status = 'COMPLETED';
    match.winner = winner;
    match.score = winner === 'PLAYER_A' ? '1 – 0 (Xử thắng)' : winner === 'PLAYER_B' ? '0 – 1 (Xử thắng)' : '0.5 – 0.5 (Xử hòa)';
    match.reason = 'Trọng tài xử: ' + String(reason || 'Quyết định của trọng tài').slice(0, 200);
    match.finishedAt = new Date().toISOString();

    if (t.format === 'ROUND_ROBIN') {
      this._updateRoundRobinStandings(t);
    } else if (t.format === 'SINGLE_ELIMINATION') {
      this._advanceKnockoutWinner(t, match);
    }

    t.updatedAt = new Date().toISOString();
    t.refereeLogs.unshift(createLog(
      user,
      'ADJUDICATE_MATCH',
      `Trọng tài xử kết quả trận ${match.id} (${match.roundName}): ${match.score}. Lý do: ${match.reason}`,
      { matchId: match.id, winner, reason: match.reason }
    ));

    saveTournaments(list);
    return match;
  }

  async runAllPendingMatches(tournamentId, user, executeRunner) {
    requireAdmin(user);
    const list = loadTournaments();
    const t = list.find(item => item.id === tournamentId);
    if (!t) throw error(404, 'Không tìm thấy giải đấu');

    const pending = (t.matches || []).filter(m => m.status === 'QUEUED' && m.playerA && m.playerB);
    if (!pending.length) {
      throw error(400, 'Không có trận đấu nào đang chờ chạy');
    }

    const executed = [];
    for (const m of pending) {
      const res = await this.startMatch(tournamentId, m.id, user, executeRunner);
      executed.push(res.match);
    }

    return { executedCount: executed.length, tournament: this.getTournament(tournamentId) };
  }

  // ------------------------------------------------------------
  // Helper: Round Robin Standings recalculation
  // Points: Win = 3, Draw = 1, Loss = 0
  // ------------------------------------------------------------
  _updateRoundRobinStandings(t) {
    const statsMap = {};
    for (const p of t.entries.filter(e => e.status === 'APPROVED')) {
      statsMap[p.userId] = {
        userId: p.userId,
        username: p.username,
        botName: p.submissionName,
        botLang: p.submissionLang,
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        points: 0,
        turns: 0
      };
    }

    for (const m of t.matches) {
      if (m.status !== 'COMPLETED' || m.isBye || !m.playerA || !m.playerB) continue;
      const sA = statsMap[m.playerA.userId];
      const sB = statsMap[m.playerB.userId];
      if (!sA || !sB) continue;

      sA.played++;
      sB.played++;
      sA.turns += m.turns || 0;
      sB.turns += m.turns || 0;

      if (m.winner === 'PLAYER_A') {
        sA.wins++;
        sA.points += 3; // +3 for win
        sB.losses++;
        // 0 for loss
      } else if (m.winner === 'PLAYER_B') {
        sB.wins++;
        sB.points += 3; // +3 for win
        sA.losses++;
        // 0 for loss
      } else if (m.winner === 'DRAW') {
        sA.draws++;
        sB.draws++;
        sA.points += 1; // +1 for draw
        sB.points += 1; // +1 for draw
      }
    }

    // Sort by: Points DESC -> Wins DESC -> Turns/Less turns -> username
    const sorted = Object.values(statsMap).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.wins !== a.wins) return b.wins - a.wins;
      if (a.turns !== b.turns) return a.turns - b.turns;
      return a.username.localeCompare(b.username);
    });

    sorted.forEach((item, idx) => {
      item.rank = idx + 1;
    });

    t.standings = sorted;
  }

  // ------------------------------------------------------------
  // Helper: Advance Knockout Bracket Winner
  // ------------------------------------------------------------
  _advanceKnockoutWinner(t, match) {
    if (!match.nextMatchId) return;
    const nextMatch = t.matches.find(m => m.id === match.nextMatchId);
    if (!nextMatch) return;

    let advancingPlayer = null;
    if (match.winner === 'PLAYER_A') {
      advancingPlayer = { ...match.playerA };
    } else if (match.winner === 'PLAYER_B') {
      advancingPlayer = { ...match.playerB };
    } else {
      // In case of draw, Player A advances by default or coin flip
      advancingPlayer = { ...match.playerA };
    }

    if (match.nextMatchSlot === 'playerA') {
      nextMatch.playerA = advancingPlayer;
    } else {
      nextMatch.playerB = advancingPlayer;
    }
  }

  // ============================================================
  // PUBLISH RESULTS & CROWN CHAMPION
  // ============================================================

  publishResults(tournamentId, user) {
    requireAdmin(user);
    const list = loadTournaments();
    const t = list.find(item => item.id === tournamentId);
    if (!t) throw error(404, 'Không tìm thấy giải đấu');

    if (t.format === 'ROUND_ROBIN') {
      this._updateRoundRobinStandings(t);
      if (!t.standings.length) {
        throw error(400, 'Chưa có bảng xếp hạng để công bố kết quả');
      }

      t.champion = {
        userId: t.standings[0].userId,
        username: t.standings[0].username,
        botName: t.standings[0].botName,
        points: t.standings[0].points
      };

      if (t.standings[1]) {
        t.runnerUp = {
          userId: t.standings[1].userId,
          username: t.standings[1].username,
          botName: t.standings[1].botName,
          points: t.standings[1].points
        };
      }
      if (t.standings[2]) {
        t.thirdPlace = {
          userId: t.standings[2].userId,
          username: t.standings[2].username,
          botName: t.standings[2].botName,
          points: t.standings[2].points
        };
      }
    } else {
      // SINGLE_ELIMINATION: Find Final match
      const finalRound = t.rounds[t.rounds.length - 1];
      const finalMatch = t.matches.find(m => m.id === finalRound?.matchIds?.[0]);
      if (!finalMatch || finalMatch.status !== 'COMPLETED') {
        throw error(400, 'Trận chung kết chưa hoàn tất để công bố người vô địch');
      }

      if (finalMatch.winner === 'PLAYER_A') {
        t.champion = { ...finalMatch.playerA };
        t.runnerUp = { ...finalMatch.playerB };
      } else if (finalMatch.winner === 'PLAYER_B') {
        t.champion = { ...finalMatch.playerB };
        t.runnerUp = { ...finalMatch.playerA };
      } else {
        t.champion = { ...finalMatch.playerA };
        t.runnerUp = { ...finalMatch.playerB };
      }
    }

    t.status = 'COMPLETED';
    t.updatedAt = new Date().toISOString();
    t.refereeLogs.unshift(createLog(
      user,
      'PUBLISH_RESULTS',
      `Công bố kết quả giải đấu "${t.name}". Quán quân 🏆: ${t.champion?.username} (${t.champion?.botName}), Á quân 🥈: ${t.runnerUp?.username || '—'}`
    ));

    saveTournaments(list);
    return t;
  }
}

const defaultService = new TournamentService();

module.exports = {
  TournamentService,
  tournamentService: defaultService,
  loadTournaments,
  saveTournaments,
  TOURNAMENTS_FILE
};
