'use strict';

const crypto = require('node:crypto');
const bcrypt = require('bcryptjs');

const COOKIE_NAME = 'ott_session';
const ROLES = ['STUDENT', 'JUDGE', 'ADMIN'];

function fail(status, message) {
  return Object.assign(new Error(message), { status });
}

function publicUser(user) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt
  };
}

function validateUsername(value) {
  if (typeof value !== 'string') {
    throw fail(400, 'Username không hợp lệ');
  }

  const username = value.trim().toLowerCase();

  if (!/^[a-z0-9_]{2,32}$/.test(username)) {
    throw fail(
      400,
      'Username phải có 2–32 ký tự: chữ thường, số hoặc dấu gạch dưới'
    );
  }

  return username;
}

function validatePassword(value) {
  if (
    typeof value !== 'string' ||
    value.length < 12 ||
    Buffer.byteLength(value, 'utf8') > 72 ||
    !/[A-Za-z]/.test(value) ||
    !/[0-9]/.test(value)
  ) {
    throw fail(
      400,
      'Mật khẩu cần ít nhất 12 ký tự, có chữ và số, tối đa 72 byte UTF-8'
    );
  }

  return value;
}

function validateEmail(value) {
  if (value === null || value === '') return null;

  if (typeof value !== 'string') {
    throw fail(400, 'Email không hợp lệ');
  }

  const email = value.trim().toLowerCase();

  if (
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    throw fail(400, 'Email không hợp lệ');
  }

  return email;
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function createAuthService(prisma, { secure = true } = {}) {
  const sessionDays = 7;

  function makeCookie(token, maxAge) {
    return [
      `${COOKIE_NAME}=${token}`,
      'HttpOnly',
      'SameSite=Lax',
      'Path=/',
      `Max-Age=${maxAge}`,
      ...(secure ? ['Secure'] : [])
    ].join('; ');
  }

  function clearCookie() {
    return makeCookie('', 0);
  }

  async function audit(tx, actorId, action, entityId, metadata = {}) {
    await tx.auditLog.create({
      data: {
        actorId,
        action,
        entityType: 'User',
        entityId,
        metadata
      }
    });
  }

  async function lockUser(tx, userId) {
    await tx.$executeRaw`
      SELECT pg_advisory_xact_lock(hashtext(${userId}))
    `;
  }

  async function issueSession(tx, userId) {
    // Khóa theo user để giới hạn phiên vẫn đúng khi nhiều request đồng thời.
    await lockUser(tx, userId);

    const now = new Date();

    await tx.session.deleteMany({
      where: {
        userId,
        OR: [
          { expiresAt: { lte: now } },
          { revokedAt: { not: null } }
        ]
      }
    });

    const sessions = await tx.session.findMany({
      where: { userId },
      orderBy: [
        { createdAt: 'desc' },
        { id: 'desc' }
      ]
    });

    // Tối đa 20 phiên hoạt động; đăng nhập mới thay phiên cũ nhất.
    if (sessions.length >= 20) {
      await tx.session.deleteMany({
        where: {
          id: {
            in: sessions.slice(19).map(session => session.id)
          }
        }
      });
    }

    const token = crypto.randomBytes(32).toString('hex');

    const expiresAt = new Date(
      now.getTime() + sessionDays * 24 * 60 * 60 * 1000
    );

    const session = await tx.session.create({
      data: {
        userId,
        tokenHash: hashToken(token),
        expiresAt
      }
    });

    return {
      session,
      cookie: makeCookie(token, sessionDays * 24 * 60 * 60)
    };
  }

  async function authenticate(req) {
    const cookie = (req.headers.cookie || '')
      .split(';')
      .map(part => part.trim())
      .find(part => part.startsWith(COOKIE_NAME + '='));

    const token = cookie?.slice(COOKIE_NAME.length + 1);

    if (!token || !/^[a-f0-9]{64}$/.test(token)) {
      return null;
    }

    const session = await prisma.session.findUnique({
      where: {
        tokenHash: hashToken(token)
      },
      include: {
        user: true
      }
    });

    if (
      !session ||
      session.revokedAt ||
      session.expiresAt <= new Date() ||
      !session.user.isActive
    ) {
      return null;
    }

    return {
      user: session.user,
      session
    };
  }

  async function register(body) {
    const username = validateUsername(body.username);
    const password = validatePassword(body.password);

    const email = body.email === undefined
      ? null
      : validateEmail(body.email);

    const passwordHash = await bcrypt.hash(password, 12);

    return prisma.$transaction(async tx => {
      const user = await tx.user.create({
        data: {
          username,
          email,
          passwordHash,

          // Luôn do server quyết định, bỏ qua body.role.
          role: 'STUDENT'
        }
      });

      const issued = await issueSession(tx, user.id);

      await audit(
        tx,
        user.id,
        'ACCOUNT_REGISTERED',
        user.id
      );

      return {
        user: publicUser(user),
        cookie: issued.cookie
      };
    });
  }

  // Username không tồn tại vẫn đi qua bcrypt.
  const dummyHash = bcrypt.hashSync(
    crypto.randomBytes(32).toString('hex'),
    12
  );

  async function login(body) {
    if (
      typeof body.username !== 'string' ||
      typeof body.password !== 'string' ||
      body.username.length > 64 ||
      body.password.length > 128
    ) {
      throw fail(401, 'Username hoặc mật khẩu không đúng');
    }

    const username = body.username.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { username }
    });

    const passwordMatches = await bcrypt.compare(
      body.password,
      user?.passwordHash || dummyHash
    );

    if (!passwordMatches || !user?.isActive) {
      throw fail(401, 'Username hoặc mật khẩu không đúng');
    }

    return prisma.$transaction(async tx => {
      await lockUser(tx, user.id);

      // Kiểm tra lại sau khi lấy khóa, tránh tạo phiên lúc tài khoản bị khóa.
      const current = await tx.user.findUnique({
        where: { id: user.id }
      });

      if (!current?.isActive) {
        throw fail(401, 'Username hoặc mật khẩu không đúng');
      }

      const issued = await issueSession(tx, user.id);

      await audit(
        tx,
        user.id,
        'ACCOUNT_LOGIN',
        user.id
      );

      return {
        user: publicUser(current),
        cookie: issued.cookie
      };
    });
  }

  async function logout(identity) {
    if (!identity) return;

    await prisma.$transaction(async tx => {
      await tx.session.updateMany({
        where: {
          id: identity.session.id,
          revokedAt: null
        },
        data: {
          revokedAt: new Date()
        }
      });

      await audit(
        tx,
        identity.user.id,
        'ACCOUNT_LOGOUT',
        identity.user.id
      );
    });
  }

  async function listSessions(identity) {
    const sessions = await prisma.session.findMany({
      where: {
        userId: identity.user.id,
        revokedAt: null,
        expiresAt: { gt: new Date() }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return sessions.map(session => ({
      id: session.id,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
      current: session.id === identity.session.id
    }));
  }

  async function revokeSession(identity, sessionId) {
    await prisma.$transaction(async tx => {
      const result = await tx.session.updateMany({
        where: {
          id: sessionId,

          // Không cho thu hồi phiên của người khác.
          userId: identity.user.id,
          revokedAt: null
        },
        data: {
          revokedAt: new Date()
        }
      });

      if (result.count !== 1) {
        throw fail(404, 'Không tìm thấy phiên');
      }

      await audit(
        tx,
        identity.user.id,
        'SESSION_REVOKED',
        identity.user.id,
        { sessionId }
      );
    });
  }

  async function updateProfile(identity, body) {
    if (
      !Object.hasOwn(body, 'email') ||
      Object.keys(body).some(key => key !== 'email')
    ) {
      throw fail(400, 'Chỉ được cập nhật trường email');
    }

    const email = validateEmail(body.email);

    return prisma.$transaction(async tx => {
      const user = await tx.user.update({
        where: {
          id: identity.user.id
        },
        data: {
          email
        }
      });

      await audit(
        tx,
        identity.user.id,
        'PROFILE_UPDATED',
        user.id,
        { fields: ['email'] }
      );

      return publicUser(user);
    });
  }

  async function adminUpdate(identity, userId, field, value) {
    if (identity.user.role !== 'ADMIN') {
      throw fail(403, 'Chỉ Admin được thực hiện thao tác này');
    }

    if (
      field === 'role'
        ? !ROLES.includes(value)
        : field !== 'isActive' || typeof value !== 'boolean'
    ) {
      throw fail(400, 'Dữ liệu cập nhật không hợp lệ');
    }

    return prisma.$transaction(async tx => {
      // Khóa chung cho thay đổi quyền/trạng thái quản trị.
      await tx.$executeRaw`
        SELECT pg_advisory_xact_lock(740017)
      `;

      const actor = await tx.user.findUnique({
        where: { id: identity.user.id }
      });

      if (!actor?.isActive || actor.role !== 'ADMIN') {
        throw fail(403, 'Chỉ Admin được thực hiện thao tác này');
      }

      await lockUser(tx, userId);

      const target = await tx.user.findUnique({
        where: { id: userId }
      });

      if (!target) {
        throw fail(404, 'Không tìm thấy tài khoản');
      }

      if (target[field] === value) {
        return publicUser(target);
      }

      const removesAdmin =
        (field === 'role' && value !== 'ADMIN') ||
        (field === 'isActive' && value === false);

      if (target.id === actor.id && removesAdmin) {
        throw fail(409, 'Không được tự hạ quyền hoặc khóa tài khoản');
      }

      if (
        target.role === 'ADMIN' &&
        target.isActive &&
        removesAdmin
      ) {
        const activeAdmins = await tx.user.count({
          where: {
            role: 'ADMIN',
            isActive: true
          }
        });

        if (activeAdmins <= 1) {
          throw fail(409, 'Phải giữ ít nhất một Admin đang hoạt động');
        }
      }

      const updated = await tx.user.update({
        where: { id: userId },
        data: { [field]: value }
      });

      // Đổi quyền hoặc khóa/mở tài khoản đều yêu cầu đăng nhập lại.
      await tx.session.updateMany({
        where: {
          userId,
          revokedAt: null
        },
        data: {
          revokedAt: new Date()
        }
      });

      await audit(
        tx,
        actor.id,
        field === 'role'
          ? 'USER_ROLE_CHANGED'
          : 'USER_STATUS_CHANGED',
        userId,
        {
          field,
          before: target[field],
          after: value
        }
      );

      return publicUser(updated);
    });
  }

  async function assignJudge(identity, tournamentId, userId) {
    if (identity.user.role !== 'ADMIN') {
      throw fail(403, 'Chỉ Admin được phân công Judge');
    }

    return prisma.$transaction(async tx => {
      await tx.$executeRaw`
        SELECT pg_advisory_xact_lock(740017)
      `;

      const actor = await tx.user.findUnique({
        where: { id: identity.user.id }
      });

      if (!actor?.isActive || actor.role !== 'ADMIN') {
        throw fail(403, 'Chỉ Admin được phân công Judge');
      }

      const [tournament, judge] = await Promise.all([
        tx.tournament.findUnique({
          where: { id: tournamentId }
        }),
        tx.user.findUnique({
          where: { id: userId }
        })
      ]);

      if (!tournament) {
        throw fail(404, 'Không tìm thấy giải đấu');
      }

      if (!judge?.isActive || judge.role !== 'JUDGE') {
        throw fail(400, 'Tài khoản phải là Judge đang hoạt động');
      }

      const assignment = await tx.tournamentStaff.upsert({
        where: {
          tournamentId_userId: { tournamentId, userId }
        },
        update: {},
        create: { tournamentId, userId }
      });

      await tx.auditLog.create({
        data: {
          actorId: actor.id,
          action: 'JUDGE_ASSIGNED',
          entityType: 'Tournament',
          entityId: tournamentId,
          metadata: { userId }
        }
      });

      return assignment;
    });
  }

  return {
    authenticate,
    register,
    login,
    logout,
    listSessions,
    revokeSession,
    updateProfile,
    adminUpdate,
    assignJudge,
    clearCookie
  };
}

async function requireTournamentStaff(prisma, user, tournamentId) {
  if (!user?.isActive) {
    throw fail(401, 'Cần đăng nhập');
  }

  if (user.role === 'ADMIN') return;

  if (user.role !== 'JUDGE') {
    throw fail(403, 'Không có quyền quản lý giải');
  }

  const assignment = await prisma.tournamentStaff.findUnique({
    where: {
      tournamentId_userId: {
        tournamentId,
        userId: user.id
      }
    }
  });

  if (!assignment) {
    throw fail(403, 'Judge chưa được phân công vào giải này');
  }
}

module.exports = {
  createAuthService,
  requireTournamentStaff,
  publicUser,
  validateUsername,
  validatePassword,
  validateEmail,
  fail
};
