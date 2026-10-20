'use strict';

const {
  createAuthService,
  fail
} = require('./service');

function createLimiter({
  limit,
  windowMs = 600000,
  maxKeys = 10000
}) {
  const buckets = new Map();

  return function check(key) {
    const now = Date.now();

    if (buckets.size >= maxKeys) {
      for (const [storedKey, bucket] of buckets) {
        if (bucket.until <= now) {
          buckets.delete(storedKey);
        }
      }
    }

    let bucket = buckets.get(key);

    if (!bucket || bucket.until <= now) {
      if (!bucket && buckets.size >= maxKeys) {
        throw Object.assign(
          fail(429, 'Quá nhiều yêu cầu, vui lòng thử lại sau'),
          { retryAfter: Math.ceil(windowMs / 1000) }
        );
      }

      bucket = {
        count: 0,
        until: now + windowMs
      };

      buckets.set(key, bucket);
    }

    bucket.count += 1;

    if (bucket.count > limit) {
      throw Object.assign(
        fail(429, 'Quá nhiều yêu cầu, vui lòng thử lại sau'),
        {
          retryAfter: Math.max(
            1,
            Math.ceil((bucket.until - now) / 1000)
          )
        }
      );
    }
  };
}

function createAuthRoutes(
  prisma,
  { json, parseBody, allowRegister, secure }
) {
  const auth = createAuthService(prisma, { secure });

  const limitLoginIP = createLimiter({
    limit: 100
  });

  const limitLoginAccount = createLimiter({
    limit: 10
  });

  const limitRegisterIP = createLimiter({
    limit: 10,
    windowMs: 60 * 60 * 1000
  });

  async function requireAuth(req) {
    const identity = await auth.authenticate(req);

    if (!identity) {
      throw fail(401, 'Cần đăng nhập');
    }

    return identity;
  }

  async function requireAdmin(req) {
    const identity = await requireAuth(req);

    if (identity.user.role !== 'ADMIN') {
      throw fail(403, 'Chỉ Admin được thực hiện thao tác này');
    }

    return identity;
  }

  async function route(req, res, url) {
    const pathname = url.pathname;
    const method = req.method;
    const ip = req.socket.remoteAddress || 'unknown';

    function replyLogin(result, status = 200) {
      res.setHeader('Set-Cookie', result.cookie);
      json(res, status, result.user);
    }

    if (
      method === 'GET' &&
      pathname === '/api/auth/config'
    ) {
      json(res, 200, {
        registrationOpen: allowRegister
      });

      return true;
    }

    if (
      method === 'POST' &&
      pathname === '/api/auth/register'
    ) {
      if (!allowRegister) {
        throw fail(403, 'Đăng ký đang đóng');
      }

      limitRegisterIP(ip);

      const body = await parseBody(req);
      const result = await auth.register(body);

      replyLogin(result, 201);
      return true;
    }

    if (
      method === 'POST' &&
      pathname === '/api/auth/login'
    ) {
      limitLoginIP(ip);

      const body = await parseBody(req);

      const usernameKey = String(body.username || '')
        .trim()
        .toLowerCase()
        .slice(0, 64);

      limitLoginAccount(ip + ':' + usernameKey);

      const result = await auth.login(body);

      replyLogin(result);
      return true;
    }

    if (
      method === 'POST' &&
      pathname === '/api/auth/logout'
    ) {
      const identity = await auth.authenticate(req);

      await auth.logout(identity);

      res.setHeader('Set-Cookie', auth.clearCookie());

      json(res, 200, { ok: true });
      return true;
    }

    if (
      method === 'GET' &&
      pathname === '/api/auth/sessions'
    ) {
      const identity = await requireAuth(req);

      json(
        res,
        200,
        await auth.listSessions(identity)
      );

      return true;
    }

    const sessionMatch = pathname.match(
      /^\/api\/auth\/sessions\/([a-zA-Z0-9-]{1,64})$/
    );

    if (method === 'DELETE' && sessionMatch) {
      const identity = await requireAuth(req);
      const sessionId = sessionMatch[1];

      await auth.revokeSession(identity, sessionId);

      if (sessionId === identity.session.id) {
        res.setHeader('Set-Cookie', auth.clearCookie());
      }

      json(res, 200, { ok: true });
      return true;
    }

    if (
      method === 'PATCH' &&
      pathname === '/api/users/me'
    ) {
      const identity = await requireAuth(req);
      const body = await parseBody(req);

      json(
        res,
        200,
        await auth.updateProfile(identity, body)
      );

      return true;
    }

    if (
      method === 'GET' &&
      pathname === '/api/admin/users'
    ) {
      await requireAdmin(req);

      const page = Number(
        url.searchParams.get('page') || 1
      );

      if (
        !Number.isSafeInteger(page) ||
        page < 1 ||
        page > 100000
      ) {
        throw fail(400, 'Trang không hợp lệ');
      }

      const search = (
        url.searchParams.get('q') || ''
      ).trim().slice(0, 32);

      const where = search
        ? {
            username: {
              contains: search,
              mode: 'insensitive'
            }
          }
        : {};

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip: (page - 1) * 50,
          take: 50,
          orderBy: [
            { createdAt: 'desc' },
            { id: 'asc' }
          ],
          select: {
            id: true,
            username: true,
            email: true,
            role: true,
            isActive: true,
            createdAt: true
          }
        }),
        prisma.user.count({ where })
      ]);

      json(res, 200, {
        users,
        total,
        page,
        pageSize: 50
      });

      return true;
    }

    const adminMatch = pathname.match(
      /^\/api\/admin\/users\/([a-zA-Z0-9-]{1,64})\/(role|status)$/
    );

    if (method === 'PATCH' && adminMatch) {
      const identity = await requireAdmin(req);
      const body = await parseBody(req);

      const field = adminMatch[2] === 'role'
        ? 'role'
        : 'isActive';

      if (
        Object.keys(body).length !== 1 ||
        !Object.hasOwn(body, field)
      ) {
        throw fail(400, 'Dữ liệu cập nhật không hợp lệ');
      }

      const user = await auth.adminUpdate(
        identity,
        adminMatch[1],
        field,
        body[field]
      );

      json(res, 200, user);
      return true;
    }

    const staffMatch = pathname.match(
      /^\/api\/admin\/tournaments\/([a-zA-Z0-9-]{1,64})\/staff$/
    );

    if (method === 'POST' && staffMatch) {
      const identity = await requireAdmin(req);
      const body = await parseBody(req);

      if (
        typeof body.userId !== 'string' ||
        !/^[a-zA-Z0-9-]{1,64}$/.test(body.userId)
      ) {
        throw fail(400, 'userId không hợp lệ');
      }

      const assignment = await auth.assignJudge(
        identity,
        staffMatch[1],
        body.userId
      );

      json(res, 200, assignment);
      return true;
    }

    return false;
  }

  return {
    auth,
    route,
    requireAuth,
    requireAdmin
  };
}

module.exports = {
  createAuthRoutes,
  createLimiter
};
