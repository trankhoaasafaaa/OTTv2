'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { TournamentService, TOURNAMENTS_FILE } = require('../server/tournaments/tournament-service');
const { RATINGS_FILE } = require('../server/elo-service');

const adminUser = { id: 'usr-admin-1', username: 'admin', role: 'ADMIN' };
const studentUser1 = { id: 'usr-stu-1', username: 'alice', role: 'STUDENT' };
const studentUser2 = { id: 'usr-stu-2', username: 'bob', role: 'STUDENT' };
const studentUser3 = { id: 'usr-stu-3', username: 'charlie', role: 'STUDENT' };
const studentUser4 = { id: 'usr-stu-4', username: 'david', role: 'STUDENT' };
const studentUser5 = { id: 'usr-stu-5', username: 'eve', role: 'STUDENT' };

function cleanTestDb() {
  try {
    if (fs.existsSync(TOURNAMENTS_FILE)) {
      fs.unlinkSync(TOURNAMENTS_FILE);
    }
  } catch (err) {}
  try {
    if (fs.existsSync(RATINGS_FILE)) {
      fs.unlinkSync(RATINGS_FILE);
    }
  } catch (err) {}
}

test('Admin permissions: Student cannot create tournament, Admin can', () => {
  cleanTestDb();
  const service = new TournamentService();

  assert.throws(() => {
    service.createTournament({ name: 'Student Tourney', format: 'ROUND_ROBIN' }, studentUser1);
  }, /Chỉ Admin mới có quyền/);

  const t = service.createTournament({
    name: 'Giải Đấu Mùa Thu 2026',
    format: 'ROUND_ROBIN',
    description: 'Giải đấu vòng tròn tính điểm'
  }, adminUser);

  assert.equal(t.name, 'Giải Đấu Mùa Thu 2026');
  assert.equal(t.format, 'ROUND_ROBIN');
  assert.equal(t.status, 'DRAFT');
  assert.equal(t.refereeLogs.length, 1);
  assert.equal(t.refereeLogs[0].action, 'CREATE_TOURNAMENT');
});

test('Tournament lifecycle: Registration, approval, lock submissions', () => {
  cleanTestDb();
  const service = new TournamentService();
  const t = service.createTournament({ name: 'Championship 2026', format: 'ROUND_ROBIN' }, adminUser);

  // Student cannot register when in DRAFT
  assert.throws(() => {
    service.registerParticipant(t.id, { submissionId: 'SUB-A', submissionName: 'alice.py' }, studentUser1);
  }, /không mở đăng ký/);

  // Admin opens registration
  service.openRegistration(t.id, adminUser);
  const registeredT = service.getTournament(t.id);
  assert.equal(registeredT.status, 'REGISTRATION');

  // Students register their official bots
  service.registerParticipant(t.id, {
    submissionId: 'SUB-A',
    submissionName: 'alice_bot.py',
    submissionLang: 'Python',
    submissionVersion: 'v1.0'
  }, studentUser1);

  service.registerParticipant(t.id, {
    submissionId: 'SUB-B',
    submissionName: 'bob_bot.c',
    submissionLang: 'C',
    submissionVersion: 'v2.0'
  }, studentUser2);

  service.registerParticipant(t.id, {
    submissionId: 'SUB-C',
    submissionName: 'charlie_bot.java',
    submissionLang: 'Java',
    submissionVersion: 'v1.5'
  }, studentUser3);

  const withEntries = service.getTournament(t.id);
  assert.equal(withEntries.entries.length, 3);
  assert.equal(withEntries.entries[0].status, 'PENDING');

  // Admin approves participants
  service.approveParticipant(t.id, studentUser1.id, adminUser);
  service.approveAllParticipants(t.id, adminUser);

  const approvedT = service.getTournament(t.id);
  assert.equal(approvedT.entries.every(e => e.status === 'APPROVED'), true);

  // Admin locks submissions
  service.lockSubmissions(t.id, adminUser);
  const lockedT = service.getTournament(t.id);
  assert.equal(lockedT.status, 'SUBMISSIONS_CLOSED');
});

test('Format 1: Round-Robin circle pairing and 3-1-0 points scoring', async () => {
  cleanTestDb();
  const service = new TournamentService();
  const t = service.createTournament({ name: 'Vòng Tròn 4 Đội', format: 'ROUND_ROBIN' }, adminUser);
  service.openRegistration(t.id, adminUser);

  // 4 participants
  const participants = [studentUser1, studentUser2, studentUser3, studentUser4];
  participants.forEach(p => {
    service.registerParticipant(t.id, { submissionId: `SUB-${p.id}`, submissionName: `${p.username}.py` }, p);
  });
  service.approveAllParticipants(t.id, adminUser);
  service.lockSubmissions(t.id, adminUser);

  // Generate Round-Robin schedule
  service.generateBracket(t.id, adminUser);
  const generatedT = service.getTournament(t.id);

  assert.equal(generatedT.status, 'RUNNING');
  // For 4 teams: total rounds = 4 - 1 = 3 rounds, 2 matches each = 6 matches total
  assert.equal(generatedT.rounds.length, 3);
  assert.equal(generatedT.matches.length, 6);

  // Test adjudicating a match: Alice wins vs Bob (3 points vs 0 points)
  const match1 = generatedT.matches[0];
  service.adjudicateMatch(t.id, match1.id, { winner: 'PLAYER_A', reason: 'Thắng thuyết phục' }, adminUser);

  const afterM1 = service.getTournament(t.id);
  const m1Updated = afterM1.matches.find(m => m.id === match1.id);
  assert.equal(m1Updated.status, 'COMPLETED');
  assert.equal(m1Updated.winner, 'PLAYER_A');

  const pAStanding = afterM1.standings.find(s => s.userId === match1.playerA.userId);
  const pBStanding = afterM1.standings.find(s => s.userId === match1.playerB.userId);
  assert.equal(pAStanding.points, 3);
  assert.equal(pAStanding.wins, 1);
  assert.equal(pBStanding.points, 0);
  assert.equal(pBStanding.losses, 1);

  // Test draw match: 1 point each
  const match2 = generatedT.matches[1];
  service.adjudicateMatch(t.id, match2.id, { winner: 'DRAW', reason: 'Hai bên hòa điểm' }, adminUser);

  const afterM2 = service.getTournament(t.id);
  const pA2Standing = afterM2.standings.find(s => s.userId === match2.playerA.userId);
  const pB2Standing = afterM2.standings.find(s => s.userId === match2.playerB.userId);
  assert.equal(pA2Standing.points, 1);
  assert.equal(pA2Standing.draws, 1);
  assert.equal(pB2Standing.points, 1);
  assert.equal(pB2Standing.draws, 1);

  // Adjudicate remaining matches so we can publish results
  for (let i = 2; i < generatedT.matches.length; i++) {
    service.adjudicateMatch(t.id, generatedT.matches[i].id, { winner: 'PLAYER_A', reason: 'Đấu xong' }, adminUser);
  }

  // Publish results
  service.publishResults(t.id, adminUser);
  const completedT = service.getTournament(t.id);
  assert.equal(completedT.status, 'COMPLETED');
  assert.ok(completedT.champion);
  assert.ok(completedT.runnerUp);
});

test('Format 2: Single Elimination with ODD participants receives BYE into next round', () => {
  cleanTestDb();
  const service = new TournamentService();
  const t = service.createTournament({ name: 'Cúp Knockout 3 Người', format: 'SINGLE_ELIMINATION' }, adminUser);
  service.openRegistration(t.id, adminUser);

  // 3 participants (ODD number: 3 players in a 4-bracket -> 1 BYE advances straight to round 2)
  const participants = [studentUser1, studentUser2, studentUser3];
  participants.forEach(p => {
    service.registerParticipant(t.id, { submissionId: `SUB-${p.id}`, submissionName: `${p.username}.py` }, p);
  });
  service.approveAllParticipants(t.id, adminUser);
  service.lockSubmissions(t.id, adminUser);

  service.generateBracket(t.id, adminUser);
  const bracketT = service.getTournament(t.id);

  assert.equal(bracketT.status, 'RUNNING');
  assert.equal(bracketT.rounds.length, 2); // Bán kết (2 matches) + Chung kết (1 match)

  // One match in Round 1 must be a BYE because odd number of participants!
  const byeMatch = bracketT.matches.find(m => m.isBye);
  assert.ok(byeMatch, 'Must have a BYE match for odd participants');
  assert.equal(byeMatch.status, 'COMPLETED');
  assert.equal(byeMatch.winner, 'PLAYER_A');
  assert.ok(byeMatch.score.includes('BYE'));

  // The advancing player must already be placed in Round 2 (Final)
  const finalMatch = bracketT.matches.find(m => m.roundName === 'Chung kết');
  assert.ok(finalMatch);
  assert.ok(
    (finalMatch.playerA && finalMatch.playerA.userId === byeMatch.playerA.userId) ||
    (finalMatch.playerB && finalMatch.playerB.userId === byeMatch.playerA.userId),
    'BYE recipient must advance directly into the next round'
  );

  // Play the non-bye semifinal match
  const semiMatch = bracketT.matches.find(m => !m.isBye && m.roundName === 'Bán kết');
  service.adjudicateMatch(t.id, semiMatch.id, { winner: 'PLAYER_A', reason: 'Thắng bán kết' }, adminUser);

  // Now Final match has both players
  const afterSemi = service.getTournament(t.id);
  const readyFinal = afterSemi.matches.find(m => m.roundName === 'Chung kết');
  assert.ok(readyFinal.playerA && readyFinal.playerB, 'Final must have both players populated');

  // Adjudicate Final
  service.adjudicateMatch(t.id, readyFinal.id, { winner: 'PLAYER_A', reason: 'Vô địch' }, adminUser);

  // Publish results and crown champion
  service.publishResults(t.id, adminUser);
  const crownedT = service.getTournament(t.id);
  assert.equal(crownedT.status, 'COMPLETED');
  assert.equal(crownedT.champion.userId, readyFinal.playerA.userId);
  assert.equal(crownedT.runnerUp.userId, readyFinal.playerB.userId);
});

test('Referee Match Controls: Pause, resume, cancel, referee audit logs', () => {
  cleanTestDb();
  const service = new TournamentService();
  const t = service.createTournament({ name: 'Giải Trọng Tài Test', format: 'ROUND_ROBIN' }, adminUser);
  service.openRegistration(t.id, adminUser);

  [studentUser1, studentUser2].forEach(p => {
    service.registerParticipant(t.id, { submissionId: `SUB-${p.id}`, submissionName: `${p.username}.py` }, p);
  });
  service.approveAllParticipants(t.id, adminUser);
  service.lockSubmissions(t.id, adminUser);
  service.generateBracket(t.id, adminUser);

  const currentT = service.getTournament(t.id);
  const m1 = currentT.matches[0];

  // Pause match
  service.pauseMatch(t.id, m1.id, 'Kiểm tra đường truyền mạng', adminUser);
  let updatedT = service.getTournament(t.id);
  let updatedM1 = updatedT.matches.find(m => m.id === m1.id);
  assert.equal(updatedM1.status, 'PAUSED');
  assert.equal(updatedM1.pausedReason, 'Kiểm tra đường truyền mạng');

  // Resume match
  service.resumeMatch(t.id, m1.id, adminUser);
  updatedT = service.getTournament(t.id);
  updatedM1 = updatedT.matches.find(m => m.id === m1.id);
  assert.equal(updatedM1.status, 'QUEUED');
  assert.equal(updatedM1.pausedReason, null);

  // Cancel match
  service.cancelMatch(t.id, m1.id, 'Bot không phản hồi quy chuẩn', adminUser);
  updatedT = service.getTournament(t.id);
  updatedM1 = updatedT.matches.find(m => m.id === m1.id);
  assert.equal(updatedM1.status, 'CANCELLED');

  // Verify referee audit log contains all operations
  const actions = updatedT.refereeLogs.map(l => l.action);
  assert.ok(actions.includes('CREATE_TOURNAMENT'));
  assert.ok(actions.includes('OPEN_REGISTRATION'));
  assert.ok(actions.includes('APPROVE_ALL'));
  assert.ok(actions.includes('LOCK_SUBMISSIONS'));
  assert.ok(actions.includes('GENERATE_ROUNDS'));
  assert.ok(actions.includes('PAUSE_MATCH'));
  assert.ok(actions.includes('RESUME_MATCH'));
  assert.ok(actions.includes('CANCEL_MATCH'));
});

test('Rematch Match: Completed match can be rematched with audit log', async () => {
  cleanTestDb();
  const service = new TournamentService();
  const t = service.createTournament({ name: 'Giải Đấu Lại Test', format: 'ROUND_ROBIN' }, adminUser);
  service.openRegistration(t.id, adminUser);

  [studentUser1, studentUser2].forEach(p => {
    service.registerParticipant(t.id, { submissionId: `SUB-${p.id}`, submissionName: `${p.username}.py` }, p);
  });
  service.approveAllParticipants(t.id, adminUser);
  service.lockSubmissions(t.id, adminUser);
  service.generateBracket(t.id, adminUser);

  const currentT = service.getTournament(t.id);
  const m1 = currentT.matches[0];

  // Adjudicate first result
  service.adjudicateMatch(t.id, m1.id, { winner: 'PLAYER_A', reason: 'Thắng lần 1' }, adminUser);
  let afterFirst = service.getTournament(t.id);
  assert.equal(afterFirst.matches[0].status, 'COMPLETED');
  assert.equal(afterFirst.matches[0].winner, 'PLAYER_A');

  // Rematch
  await service.rematchMatch(t.id, m1.id, adminUser, async () => {
    return { winner: 'p2', reason: 'Thắng đấu lại', events: [], turns: 15 };
  });

  const afterRematch = service.getTournament(t.id);
  const rematchedM = afterRematch.matches[0];
  assert.equal(rematchedM.status, 'COMPLETED');
  assert.equal(rematchedM.winner, 'PLAYER_B');
  assert.equal(rematchedM.score, '0 – 1');
  assert.equal(rematchedM.reason, 'Thắng đấu lại');

  // Check audit log
  const rematchLog = afterRematch.refereeLogs.find(l => l.action === 'MATCH_REMATCH');
  assert.ok(rematchLog, 'Must have MATCH_REMATCH action in referee logs');
});

test('Delete Tournament: Admin can delete tournament in any state without restriction', () => {
  cleanTestDb();
  const service = new TournamentService();
  const t = service.createTournament({ name: 'Giải Đang Chạy Cần Xóa', format: 'ROUND_ROBIN' }, adminUser);
  service.openRegistration(t.id, adminUser);
  [studentUser1, studentUser2].forEach(p => {
    service.registerParticipant(t.id, { submissionId: `SUB-${p.id}`, submissionName: `${p.username}.py` }, p);
  });
  service.approveAllParticipants(t.id, adminUser);
  service.lockSubmissions(t.id, adminUser);
  service.generateBracket(t.id, adminUser);

  const runningT = service.getTournament(t.id);
  assert.equal(runningT.status, 'RUNNING');

  // Deleting a RUNNING tournament must succeed immediately
  const res = service.deleteTournament(t.id, adminUser);
  assert.equal(res.ok, true);
  assert.equal(res.deleted, t.id);

  // Must no longer exist in tournament list
  const list = service.listTournaments();
  assert.equal(list.some(item => item.id === t.id), false);
  cleanTestDb();
  try { fs.writeFileSync(TOURNAMENTS_FILE, '[]\n', 'utf8'); } catch (_) {}
});

test('Elo Rating System: Calculates win/loss delta and populates leaderboard with competitor account name', async () => {
  cleanTestDb();
  const eloService = require('../server/elo-service');

  // Initial match: Player A vs Player B
  const res = eloService.recordMatchResult({
    idA: 'SUB-BOT-A',
    nameA: 'TitanBot.py',
    ownerA: 'player_alpha',
    langA: 'Python',
    idB: 'SUB-BOT-B',
    nameB: 'ShadowBot.c',
    ownerB: 'player_beta',
    langB: 'C',
    winner: 'PLAYER_A',
    matchId: 'M-TEST-ELO-1'
  });

  assert.ok(res, 'Must return elo update result');
  assert.ok(res.deltaA > 0, 'Winner must gain Elo points');
  assert.ok(res.deltaB < 0, 'Loser must lose Elo points');
  assert.equal(res.deltaA, -res.deltaB, 'Points gained must equal points lost');
  assert.equal(res.newEloA, 1200 + res.deltaA);
  assert.equal(res.newEloB, 1200 + res.deltaB);

  // Leaderboard check
  const board = eloService.getLeaderboard();
  assert.equal(board.length, 2);
  assert.equal(board[0].owner, 'player_alpha');
  assert.equal(board[0].name, 'TitanBot.py');
  assert.equal(board[0].elo, 1200 + res.deltaA);
  assert.ok(board[0].change.startsWith('+'));
  assert.equal(board[1].owner, 'player_beta');
  assert.ok(board[1].change.startsWith('-'));

  // Account-level Elo check: Player A plays with a second bot (TitanBot_v2.py) against Player Gamma
  const res2 = eloService.recordMatchResult({
    idA: 'SUB-BOT-A2',
    nameA: 'TitanBot_v2.py',
    ownerA: 'player_alpha',
    langA: 'Python',
    idB: 'SUB-BOT-G',
    nameB: 'GammaBot.java',
    ownerB: 'player_gamma',
    langB: 'Java',
    winner: 'PLAYER_A',
    matchId: 'M-TEST-ELO-2'
  });

  assert.ok(res2, 'Second match with different bot of player_alpha must succeed');
  assert.equal(res2.newEloA, 1200 + res.deltaA + res2.deltaA, 'Account Elo accumulates across all bots of player_alpha');

  // Verify internal match between 2 bots of the same account does not change Elo
  const selfMatch = eloService.recordMatchResult({
    idA: 'SUB-BOT-A',
    nameA: 'TitanBot.py',
    ownerA: 'player_alpha',
    langA: 'Python',
    idB: 'SUB-BOT-A2',
    nameB: 'TitanBot_v2.py',
    ownerB: 'player_alpha',
    langB: 'Python',
    winner: 'PLAYER_A',
    matchId: 'M-TEST-SELF'
  });
  assert.equal(selfMatch.deltaA, 0, 'Internal match between bots of the same account cannot alter Elo');
  assert.equal(selfMatch.deltaB, 0);

  // Leaderboard should have 3 unique accounts (player_alpha has 2 bots under 1 account row)
  const board2 = eloService.getLeaderboard();
  assert.equal(board2.length, 3, 'Leaderboard must group by account, not bot');
  const alphaRow = board2.find(r => r.owner === 'player_alpha');
  assert.ok(alphaRow);
  assert.equal(alphaRow.elo, 1200 + res.deltaA + res2.deltaA);
  assert.equal(alphaRow.botCount, 2, 'Must track that player_alpha owns 2 bots');

  // Tournament match elo integration check
  const service = new TournamentService();
  const t = service.createTournament({ name: 'Giải Đấu Tính Elo', format: 'ROUND_ROBIN' }, adminUser);
  service.openRegistration(t.id, adminUser);
  service.registerParticipant(t.id, { submissionId: 'SUB-TOUR-1', submissionName: 'AlphaBot.py', submissionLang: 'Python' }, studentUser1);
  service.registerParticipant(t.id, { submissionId: 'SUB-TOUR-2', submissionName: 'BetaBot.c', submissionLang: 'C' }, studentUser2);
  service.approveAllParticipants(t.id, adminUser);
  service.lockSubmissions(t.id, adminUser);
  service.generateBracket(t.id, adminUser);

  const beforeMatch = service.getTournament(t.id);
  const match = beforeMatch.matches[0];
  const execRes = await service.startMatch(t.id, match.id, adminUser);

  assert.ok(execRes.match.eloChange, 'Tournament match must record eloChange');
  assert.ok(execRes.match.eloChange.playerA, 'Must have eloChange for playerA');
  assert.ok(execRes.match.eloChange.playerB, 'Must have eloChange for playerB');

  cleanTestDb();
});



