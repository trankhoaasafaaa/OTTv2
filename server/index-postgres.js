'use strict';

require('dotenv/config');

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const { WebSocketServer } = require('ws');
const { createAuthRoutes } = require('./auth/routes');

const repo = require('./pg/repository');
const adapter = require('./pg/adapters');
const jobs = require('./pg/jobs');
const runner = require('./bot-runner');

// ============================================================
// CONFIGURATION
// ============================================================

const ROOT = path.resolve(__dirname, '..');
const PUB = path.join(ROOT, 'public');
const DATA = path.join(ROOT, 'data');

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '127.0.0.1';

const ALLOW_SELF_REGISTER =
  process.env.ALLOW_SELF_REGISTER === 'true';

const SECURE_COOKIES =
  process.env.NODE_ENV === 'production' ||
  process.env.COOKIE_SECURE === 'true';

const PUBLIC_ORIGIN =
  process.env.PUBLIC_ORIGIN || null;

const MAX_BODY = 760000;

if (
  !Number.isInteger(PORT) ||
  PORT < 1 ||
  PORT > 65535
) {
  throw new Error('Invalid PORT');
}

if (PUBLIC_ORIGIN) {
  const parsedOrigin = new URL(PUBLIC_ORIGIN);

  if (
    !['http:', 'https:'].includes(parsedOrigin.protocol) ||
    parsedOrigin.origin !== PUBLIC_ORIGIN
  ) {
    throw new Error(
      'PUBLIC_ORIGIN phải là HTTP(S) origin, không có dấu / cuối'
    );
  }
}

if (
  process.env.NODE_ENV === 'production' &&
  (
    !PUBLIC_ORIGIN ||
    !PUBLIC_ORIGIN.startsWith('https://')
  )
) {
  throw new Error(
    'Production cần PUBLIC_ORIGIN dạng https://ten-mien'
  );
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon'
};

// ============================================================
// HTTP HELPERS
// ============================================================

function json(res, status, value) {
  if (res.headersSent) return;

  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff'
  });

  res.end(JSON.stringify(value));
}

function fail(status, message) {
  return Object.assign(new Error(message), {
    status
  });
}

function sameOrigin(req) {
  const origin = req.headers.origin;

  // CLI có thể không gửi Origin.
  // Các request thay đổi dữ liệu vẫn phải có X-OTT-Request.
  if (!origin) return true;

  try {
    const actual = new URL(origin).origin;

    const expected = PUBLIC_ORIGIN ||
      `${SECURE_COOKIES ? 'https' : 'http'}://${req.headers.host}`;

    return actual === expected;
  } catch {
    return false;
  }
}

async function parseBody(req) {
  return new Promise((resolve, reject) => {
    let length = 0;
    let rejected = false;

    const chunks = [];

    req.on('data', chunk => {
      length += chunk.length;

      if (rejected) return;

      if (length > MAX_BODY) {
        rejected = true;

        reject(
          fail(413, 'Payload too large')
        );

        req.resume();
        return;
      }

      chunks.push(chunk);
    });

    req.on('end', () => {
      if (rejected) return;

      try {
        const raw = Buffer.concat(chunks).toString('utf8');
        const parsed = JSON.parse(raw || '{}');

        if (
          !parsed ||
          typeof parsed !== 'object' ||
          Array.isArray(parsed)
        ) {
          throw new Error('Invalid JSON object');
        }

        resolve(parsed);
      } catch {
        reject(
          fail(400, 'Invalid JSON object')
        );
      }
    });

    req.on('error', reject);
  });
}

// ============================================================
// AUTHENTICATION
// ============================================================

const accounts = createAuthRoutes(repo.prisma, {
  json,
  parseBody,
  allowRegister: ALLOW_SELF_REGISTER,
  secure: SECURE_COOKIES
});

async function currentUser(req) {
  const identity = await accounts.auth.authenticate(req);

  return identity?.user || null;
}

const { createTournamentRoutes } = require('./tournaments/tournament-routes');
const tournamentRoutes = createTournamentRoutes({
  authenticateUser: async (req) => {
    return await currentUser(req);
  },
  parseBody,
  json,
  fail
});

// ============================================================
// WEBSOCKET BROADCAST
// ============================================================

let wss;

function broadcast(event, data) {
  if (!wss) return;

  const message = JSON.stringify({
    event,
    ...data
  });

  for (const client of wss.clients) {
    if (client.readyState !== 1) continue;

    try {
      client.send(message);
    } catch {
      // Một client lỗi không được làm gián đoạn broadcast.
    }
  }
}

jobs.onBroadcast(broadcast);

// ============================================================
// API ROUTES
// ============================================================

const matchRE =
  /^\/api\/matches\/(M-[A-Za-z0-9_-]{1,64})(?:\/(replay))?$/;

async function route(req, res, url) {
  const p = url.pathname;

  if (
    !['GET', 'POST', 'PATCH', 'DELETE'].includes(req.method)
  ) {
    throw fail(405, 'Method not allowed');
  }

  const changesData = ['POST', 'PATCH', 'DELETE']
    .includes(req.method);

  if (
    changesData &&
    (
      !sameOrigin(req) ||
      req.headers['x-ott-request'] !== '1'
    )
  ) {
    throw fail(
      403,
      'Cần request cùng origin và header X-OTT-Request: 1'
    );
  }

  // Các API đăng ký, đăng nhập, đăng xuất, session,
  // hồ sơ và quản trị tài khoản nằm trong auth/routes.js.
  if (await accounts.route(req, res, url)) {
    return;
  }

  if (await tournamentRoutes.handle(req, res, url)) {
    return;
  }

  // ----------------------------------------------------------
  // HEALTH
  // ----------------------------------------------------------

  if (p === '/api/health' && req.method === 'GET') {
    await repo.prisma.$queryRaw`SELECT 1`;

    return json(res, 200, {
      ok: true,
      version: '2.1.0-pg',
      persistence: 'PostgreSQL',
      botExecution: 'docker-sandbox',
      ...jobs.publicInfo()
    });
  }

  // ----------------------------------------------------------
  // JUDGE ENVIRONMENT
  // ----------------------------------------------------------

  if (
    p === '/api/judge/status' &&
    req.method === 'GET'
  ) {
    return json(res, 200, {
      dockerReady: runner.dockerAvailable(),
      images: runner.IMAGES,
      turnMs: runner.LIMITS.turnMs,
      ...jobs.publicInfo()
    });
  }

  // ----------------------------------------------------------
  // GAME DESCRIPTION
  // ----------------------------------------------------------

  if (p === '/api/game' && req.method === 'GET') {
    return json(res, 200, {
      id: 'ott-rps',
      version: '1.0.0',
      rows: 8,
      columns: 8,
      pieceTypes: [
        'rock',
        'paper',
        'scissors'
      ],
      capture: {
        rock: 'scissors',
        scissors: 'paper',
        paper: 'rock'
      },
      maxMoves: 200,
      goals: {
        p1: 'h8',
        p2: 'a1'
      }
    });
  }

  // ----------------------------------------------------------
  // OVERVIEW
  // ----------------------------------------------------------

  if (p === '/api/overview' && req.method === 'GET') {
    const queue = jobs.publicInfo();

    const overview = await repo.overview(
      queue.activeJobs,
      queue.pendingJobs,
      queue.maxConcurrent
    );

    return json(res, 200, overview);
  }

  // ----------------------------------------------------------
  // CURRENT ACCOUNT
  // ----------------------------------------------------------

  if (p === '/api/auth/me' && req.method === 'GET') {
    const user = await currentUser(req);

    if (!user) {
      throw fail(401, 'Cần đăng nhập');
    }

    const [bots, recentMatches] = await Promise.all([
      repo.listUserSubmissions(user.id),
      repo.listMyMatches(user.id)
    ]);

    return json(res, 200, {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      bots,
      recentMatches
    });
  }

  // ----------------------------------------------------------
  // LIST SUBMISSIONS
  // ----------------------------------------------------------

  if (
    p === '/api/submissions' &&
    req.method === 'GET'
  ) {
    const user = await currentUser(req);

    if (!user) {
      throw fail(401, 'Cần đăng nhập');
    }

    return json(
      res,
      200,
      await repo.listUserSubmissions(user.id)
    );
  }

  // ----------------------------------------------------------
  // CREATE SUBMISSION
  // ----------------------------------------------------------

  if (
    p === '/api/submissions' &&
    req.method === 'POST'
  ) {
    const user = await currentUser(req);

    if (!user) {
      throw fail(401, 'Cần đăng nhập');
    }

    const settings = await repo.getSettings();

    if (!settings.submissionsOpen) {
      throw fail(403, 'Submissions are closed');
    }

    const body = await parseBody(req);

    const name = body.name;
    const lang = body.lang;

    const version = String(
      body.version || 'v1.0'
    ).slice(0, 24);

    const source = body.content;

    try {
      runner.safeFile(name, lang);
    } catch (error) {
      throw fail(400, error.message);
    }

    if (
      typeof source !== 'string' ||
      Buffer.byteLength(source, 'utf8') < 1 ||
      Buffer.byteLength(source, 'utf8') > 500000
    ) {
      throw fail(
        400,
        'Source must be 1-500 KB'
      );
    }

    const id =
      'SUB-' +
      crypto.randomBytes(4).toString('hex').toUpperCase();

    const directory = runner.botDirectory(id);

    fs.mkdirSync(directory, {
      recursive: true,
      mode: 0o755
    });

    fs.chmodSync(directory, 0o755);

    let created;

    try {
      fs.writeFileSync(
        path.join(directory, name),
        source,
        {
          flag: 'wx',
          mode: 0o644
        }
      );

      created = await repo.storeSubmission({
        id,
        userId: user.id,
        filename: name,
        language: lang,
        version,
        sha256: crypto
          .createHash('sha256')
          .update(source)
          .digest('hex'),
        sourcePath: `data/bots/${id}/${name}`
      });
    } catch (error) {
      fs.rmSync(directory, {
        recursive: true,
        force: true
      });

      throw error;
    }

    // Giữ hành vi ở mục 6:
    // tự xếp một trận PRACTICE sau khi nộp bot nếu Docker sẵn sàng.
    try {
      const opponent = await repo.selectOpponent(id);
      const queue = jobs.publicInfo();

      if (
        opponent &&
        runner.dockerAvailable() &&
        queue.activeJobs + queue.pendingJobs < 50
      ) {
        const swap = crypto.randomInt(2) === 0;

        const match = await repo.newMatch({
          kind: 'PRACTICE',
          createdById: user.id,
          submissionAId: swap ? id : opponent.id,
          submissionBId: swap ? opponent.id : id,
          maxMoves: 200,
          pieces: 6,
          first: 'Random',
          autoMatch: true
        });

        jobs.submit(match.id);

        return json(res, 201, {
          ...created,
          autoMatch: match.id
        });
      }
    } catch (error) {
      console.error(
        '[Auto-match skipped]',
        error.message
      );
    }

    return json(res, 201, created);
  }

  // ----------------------------------------------------------
  // LEADERBOARD
  // ----------------------------------------------------------

  if (
    p === '/api/leaderboard' &&
    req.method === 'GET'
  ) {
    let pgRows = [];
    try { pgRows = await repo.leaderboard(); } catch (_) {}
    const eloService = require('./elo-service');
    return json(
      res,
      200,
      eloService.getLeaderboard(pgRows)
    );
  }

  // ----------------------------------------------------------
  // LIST MATCHES
  // ----------------------------------------------------------

  if (p === '/api/matches' && req.method === 'GET') {
    return json(
      res,
      200,
      await repo.listMatches()
    );
  }

  // ----------------------------------------------------------
  // MATCH DETAIL / REPLAY
  // ----------------------------------------------------------

  const matchPath = p.match(matchRE);

  if (matchPath && req.method === 'GET') {
    let row = await repo.findMatch(matchPath[1]);

    if (!row) {
      const replayPath = path.join(DATA, matchPath[1] + '.json');
      if (fs.existsSync(replayPath)) {
        try {
          const replay = JSON.parse(fs.readFileSync(replayPath, 'utf8'));
          if (!matchPath[2]) {
            return json(res, 200, {
              id: matchPath[1],
              status: 'completed',
              turns: replay.turns || replay.events?.length || 0,
              winner: replay.winner,
              reason: replay.reason
            });
          }
          return json(res, 200, replay);
        } catch {
          throw fail(500, 'Lỗi đọc file replay');
        }
      }
      throw fail(404, 'Match not found');
    }

    if (!matchPath[2]) {
      return json(res, 200, adapter.match(row));
    }

    if (row.status !== 'COMPLETED') {
      throw fail(
        409,
        'Match ' + row.status.toLowerCase()
      );
    }

    // Chỉ chấp nhận đường dẫn replay chuẩn do server tạo.
    if (row.replayPath !== `data/${row.id}.json`) {
      throw fail(
        409,
        'Replay path is not canonical'
      );
    }

    const filename = path.join(
      DATA,
      row.id + '.json'
    );

    let buffer;

    try {
      buffer = fs.readFileSync(filename);
    } catch {
      throw fail(404, 'Replay missing');
    }

    const digest = crypto
      .createHash('sha256')
      .update(buffer)
      .digest('hex');

    if (digest !== row.replayHash) {
      throw fail(
        409,
        'Replay integrity mismatch'
      );
    }

    let replay;

    try {
      replay = JSON.parse(
        buffer.toString('utf8')
      );
    } catch {
      throw fail(409, 'Invalid replay data');
    }

    return json(res, 200, replay);
  }

  // ----------------------------------------------------------
  // CREATE PRACTICE / DEMO MATCH
  // ----------------------------------------------------------

  if (p === '/api/matches' && req.method === 'POST') {
    const user = await currentUser(req);

    if (!user) {
      throw fail(401, 'Cần đăng nhập');
    }

    const body = await parseBody(req);

    const maxMoves = Number(body.maxMoves ?? 200);
    const pieces = Number(body.pieces ?? 6);
    const first = body.first || 'Random';

    if (
      !Number.isInteger(maxMoves) ||
      maxMoves < 1 ||
      maxMoves > 1000 ||
      !Number.isInteger(pieces) ||
      pieces < 1 ||
      pieces > 28 ||
      ![
        'Random',
        'Player A',
        'Player B'
      ].includes(first)
    ) {
      throw fail(
        400,
        'Invalid match configuration'
      );
    }

    const queue = jobs.publicInfo();

    if (queue.activeJobs + queue.pendingJobs >= 100) {
      throw fail(429, 'Match queue is full');
    }

    // Challenge mode:
    // người dùng chọn bot của mình, server chọn đối thủ.
    if (body.submissionA && !body.submissionB) {
      const mine = await repo.findSubmission(
        String(body.submissionA)
      );

      if (!mine || mine.userId !== user.id) {
        throw fail(
          403,
          'You do not own this submission'
        );
      }

      if (!runner.dockerAvailable()) {
        throw fail(
          503,
          'Docker is not available'
        );
      }

      const opponent = await repo.selectOpponent(
        mine.id
      );

      if (!opponent) {
        throw fail(
          400,
          'No other bots available'
        );
      }

      const swap = crypto.randomInt(2) === 0;

      const match = await repo.newMatch({
        kind: 'PRACTICE',
        createdById: user.id,
        submissionAId: swap ? mine.id : opponent.id,
        submissionBId: swap ? opponent.id : mine.id,
        maxMoves,
        pieces,
        first
      });

      jobs.submit(match.id);

      return json(res, 202, {
        ...match,
        opponent: opponent.filename,
        opponentId: opponent.id
      });
    }

    if (body.submissionA || body.submissionB) {
      throw fail(
        403,
        'Manual bot selection is disabled. Use Challenge mode.'
      );
    }

    // Built-in demo match.
    const match = await repo.newMatch({
      kind: 'DEMO',
      createdById: user.id,
      maxMoves,
      pieces,
      first,
      a: typeof body.a === 'string'
        ? body.a.slice(0, 64)
        : 'Greedy Bot',
      b: typeof body.b === 'string'
        ? body.b.slice(0, 64)
        : 'Random Bot'
    });

    jobs.submit(match.id);

    return json(res, 202, match);
  }

  // ----------------------------------------------------------
  // PUBLIC SETTINGS
  // ----------------------------------------------------------

  if (p === '/api/settings' && req.method === 'GET') {
    return json(
      res,
      200,
      await repo.getSettings()
    );
  }

  throw fail(404, 'API route not found');
}

// ============================================================
// HTTP SERVER / STATIC FILES
// ============================================================

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(
      req.url,
      'http://localhost'
    );

    if (url.pathname.startsWith('/api/')) {
      return await route(req, res, url);
    }

    if (!['GET', 'HEAD'].includes(req.method)) {
      return json(res, 405, {
        error: 'Method not allowed'
      });
    }

    const relativePath = decodeURIComponent(
      url.pathname
    ).replace(/^\/+/, '');

    const filename = path.resolve(
      PUB,
      relativePath || 'index.html'
    );

    if (
      !filename.startsWith(PUB + path.sep) ||
      !fs.existsSync(filename) ||
      !fs.statSync(filename).isFile()
    ) {
      return json(res, 404, {
        error: 'File not found'
      });
    }

    res.writeHead(200, {
      'Content-Type':
        MIME[path.extname(filename)] ||
        'application/octet-stream',

      'X-Content-Type-Options': 'nosniff',

      'Content-Security-Policy': [
        "default-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com",
        "script-src 'self' 'unsafe-inline'",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "img-src 'self' data:",
        "font-src 'self' https://fonts.gstatic.com"
      ].join('; ')
    });

    if (req.method === 'HEAD') {
      return res.end();
    }

    fs.createReadStream(filename).pipe(res);
  } catch (error) {
    console.error(
      '[API]',
      req.method,
      req.url,
      error.status ? error.message : error
    );

    if (res.headersSent) return;

    if (error.code === 'P2002') {
      return json(res, 409, {
        error: 'Username hoặc email đã được sử dụng'
      });
    }

    if (error.status === 429) {
      res.setHeader(
        'Retry-After',
        String(error.retryAfter || 600)
      );
    }

    json(res, error.status || 500, {
      error: error.status
        ? error.message
        : 'Internal server error'
    });
  }
});

// ============================================================
// WEBSOCKET SERVER
// ============================================================

wss = new WebSocketServer({
  server,
  path: '/ws'
});

wss.on('connection', (ws, req) => {
  if (!sameOrigin(req)) {
    ws.close(1008, 'Invalid origin');
    return;
  }

  ws.send(JSON.stringify({
    event: 'welcome',
    ...jobs.publicInfo()
  }));

  ws.on('error', () => {});
});

// ============================================================
// STARTUP
// ============================================================

async function main() {
  await repo.prisma.$connect();

  // Dừng sớm nếu thiếu bảng/migration tương thích từ mục 6.
  await repo.prisma.appSetting.findMany({
    take: 1
  });

  await jobs.recoverOnStart();

  server.listen(PORT, HOST, () => {
    console.log(
      `OTTv2 PostgreSQL API: http://${HOST}:${PORT}`
    );
  });
}

if (require.main === module) {
  main().catch(async error => {
    console.error('Startup failed:', error);

    await repo.prisma.$disconnect();

    process.exitCode = 1;
  });
}

module.exports = server;