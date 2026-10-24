'use strict';

const { tournamentService } = require('./tournament-service');

function createTournamentRoutes({
  service = tournamentService,
  authenticateUser,
  parseBody,
  json,
  fail
}) {
  async function handle(req, res, url) {
    const p = url.pathname;
    const method = req.method;

    // 1. List Tournaments: GET /api/tournaments
    if (p === '/api/tournaments' && method === 'GET') {
      const list = await service.listTournaments();
      json(res, 200, list);
      return true;
    }

    // 2. Create Tournament: POST /api/admin/tournaments
    if (p === '/api/admin/tournaments' && method === 'POST') {
      const user = await authenticateUser(req);
      if (!user) throw fail(401, 'Cần đăng nhập tài khoản Admin');
      const body = await parseBody(req);
      const created = await service.createTournament(body, user);
      json(res, 201, created);
      return true;
    }

    // 3. Batch run all pending matches: POST /api/admin/tournaments/:id/run-all-matches
    const runAllMatch = p.match(/^\/api\/admin\/tournaments\/([a-zA-Z0-9_-]{1,64})\/run-all-matches$/);
    if (runAllMatch && method === 'POST') {
      const user = await authenticateUser(req);
      const tId = runAllMatch[1];
      const result = await service.runAllPendingMatches(tId, user);
      json(res, 200, result);
      return true;
    }

    // 4. Open Registration: POST /api/admin/tournaments/:id/open-registration
    const openRegMatch = p.match(/^\/api\/admin\/tournaments\/([a-zA-Z0-9_-]{1,64})\/open-registration$/);
    if (openRegMatch && method === 'POST') {
      const user = await authenticateUser(req);
      const tId = openRegMatch[1];
      const t = await service.openRegistration(tId, user);
      json(res, 200, t);
      return true;
    }

    // 5. Lock Submissions: POST /api/admin/tournaments/:id/lock-submissions
    const lockMatch = p.match(/^\/api\/admin\/tournaments\/([a-zA-Z0-9_-]{1,64})\/lock-submissions$/);
    if (lockMatch && method === 'POST') {
      const user = await authenticateUser(req);
      const tId = lockMatch[1];
      const t = await service.lockSubmissions(tId, user);
      json(res, 200, t);
      return true;
    }

    // 6. Generate Bracket: POST /api/admin/tournaments/:id/generate-bracket
    const genMatch = p.match(/^\/api\/admin\/tournaments\/([a-zA-Z0-9_-]{1,64})\/generate-bracket$/);
    if (genMatch && method === 'POST') {
      const user = await authenticateUser(req);
      const tId = genMatch[1];
      const t = await service.generateBracket(tId, user);
      json(res, 200, t);
      return true;
    }

    // 7. Approve all participants: POST /api/admin/tournaments/:id/participants/approve-all
    const approveAllMatch = p.match(/^\/api\/admin\/tournaments\/([a-zA-Z0-9_-]{1,64})\/participants\/approve-all$/);
    if (approveAllMatch && method === 'POST') {
      const user = await authenticateUser(req);
      const tId = approveAllMatch[1];
      const t = await service.approveAllParticipants(tId, user);
      json(res, 200, t);
      return true;
    }

    // 8. Approve specific participant: POST /api/admin/tournaments/:id/participants/:userId/approve
    const approveMatch = p.match(/^\/api\/admin\/tournaments\/([a-zA-Z0-9_-]{1,64})\/participants\/([a-zA-Z0-9_-]{1,64})\/approve$/);
    if (approveMatch && method === 'POST') {
      const user = await authenticateUser(req);
      const [, tId, targetUserId] = approveMatch;
      const t = await service.approveParticipant(tId, targetUserId, user);
      json(res, 200, t);
      return true;
    }

    // 9. Reject specific participant: POST /api/admin/tournaments/:id/participants/:userId/reject
    const rejectMatch = p.match(/^\/api\/admin\/tournaments\/([a-zA-Z0-9_-]{1,64})\/participants\/([a-zA-Z0-9_-]{1,64})\/reject$/);
    if (rejectMatch && method === 'POST') {
      const user = await authenticateUser(req);
      const [, tId, targetUserId] = rejectMatch;
      const body = await parseBody(req).catch(() => ({}));
      const t = await service.rejectParticipant(tId, targetUserId, body.reason, user);
      json(res, 200, t);
      return true;
    }

    // 10. Match Controls: start, pause, resume, cancel, adjudicate
    // POST /api/admin/tournaments/:id/matches/:matchId/(start|pause|resume|cancel|adjudicate|rematch)
    const matchControlMatch = p.match(/^\/api\/admin\/tournaments\/([a-zA-Z0-9_-]{1,64})\/matches\/([a-zA-Z0-9_-]{1,64})\/(start|pause|resume|cancel|adjudicate|rematch)$/);
    if (matchControlMatch && method === 'POST') {
      const user = await authenticateUser(req);
      const [, tId, matchId, action] = matchControlMatch;
      const body = await parseBody(req).catch(() => ({}));

      if (action === 'start') {
        const result = await service.startMatch(tId, matchId, user);
        json(res, 200, result);
        return true;
      }
      if (action === 'rematch') {
        const result = await service.rematchMatch(tId, matchId, user);
        json(res, 200, result);
        return true;
      }
      if (action === 'pause') {
        const result = await service.pauseMatch(tId, matchId, body.reason, user);
        json(res, 200, result);
        return true;
      }
      if (action === 'resume') {
        const result = await service.resumeMatch(tId, matchId, user);
        json(res, 200, result);
        return true;
      }
      if (action === 'cancel') {
        const result = await service.cancelMatch(tId, matchId, body.reason, user);
        json(res, 200, result);
        return true;
      }
      if (action === 'adjudicate') {
        const result = await service.adjudicateMatch(tId, matchId, { winner: body.winner, reason: body.reason }, user);
        json(res, 200, result);
        return true;
      }
    }

    // 11. Publish Results: POST /api/admin/tournaments/:id/publish-results
    const publishMatch = p.match(/^\/api\/admin\/tournaments\/([a-zA-Z0-9_-]{1,64})\/publish-results$/);
    if (publishMatch && method === 'POST') {
      const user = await authenticateUser(req);
      const tId = publishMatch[1];
      const t = await service.publishResults(tId, user);
      json(res, 200, t);
      return true;
    }

    // 12. Register Participant (Student): POST /api/tournaments/:id/register
    const regParticipantMatch = p.match(/^\/api\/tournaments\/([a-zA-Z0-9_-]{1,64})\/register$/);
    if (regParticipantMatch && method === 'POST') {
      const user = await authenticateUser(req);
      if (!user) throw fail(401, 'Vui lòng đăng nhập để đăng ký giải đấu');
      const tId = regParticipantMatch[1];
      const body = await parseBody(req);
      const t = await service.registerParticipant(tId, body, user);
      json(res, 200, t);
      return true;
    }

    // 13. Unregister Participant (Student): POST /api/tournaments/:id/unregister
    const unregParticipantMatch = p.match(/^\/api\/tournaments\/([a-zA-Z0-9_-]{1,64})\/unregister$/);
    if (unregParticipantMatch && method === 'POST') {
      const user = await authenticateUser(req);
      if (!user) throw fail(401, 'Vui lòng đăng nhập để hủy đăng ký');
      const tId = unregParticipantMatch[1];
      const t = await service.unregisterParticipant(tId, user);
      json(res, 200, t);
      return true;
    }

    // 14. Single Tournament Detail: GET /api/tournaments/:id
    const singleMatch = p.match(/^\/api\/tournaments\/([a-zA-Z0-9_-]{1,64})$/);
    if (singleMatch && method === 'GET') {
      const t = await service.getTournament(singleMatch[1]);
      json(res, 200, t);
      return true;
    }

    // 15. Update Tournament (Admin): PATCH /api/admin/tournaments/:id
    const updateMatch = p.match(/^\/api\/admin\/tournaments\/([a-zA-Z0-9_-]{1,64})$/);
    if (updateMatch && method === 'PATCH') {
      const user = await authenticateUser(req);
      const body = await parseBody(req);
      const t = await service.updateTournament(updateMatch[1], body, user);
      json(res, 200, t);
      return true;
    }

    // 16. Delete Tournament (Admin): DELETE /api/admin/tournaments/:id
    if (updateMatch && method === 'DELETE') {
      const user = await authenticateUser(req);
      const result = await service.deleteTournament(updateMatch[1], user);
      json(res, 200, result);
      return true;
    }

    // 17. Tournament Match Replay: GET /api/matches/:id/replay
    const replayMatch = p.match(/^\/api\/matches\/([a-zA-Z0-9_-]{1,64})\/replay$/);
    if (replayMatch && method === 'GET') {
      const replay = await service.getMatchReplay(replayMatch[1]);
      if (replay) {
        json(res, 200, replay);
        return true;
      }
    }

    // 18. Tournament Match Detail: GET /api/matches/:id
    const matchMeta = p.match(/^\/api\/matches\/(M-[a-zA-Z0-9_-]{1,64})$/);
    if (matchMeta && method === 'GET') {
      const match = await service.getMatch(matchMeta[1]);
      if (match) {
        json(res, 200, match);
        return true;
      }
    }

    return false;
  }

  return { handle };
}

module.exports = {
  createTournamentRoutes
};
