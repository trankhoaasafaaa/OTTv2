'use strict';

require('dotenv/config');

const bcrypt = require('bcryptjs');
const prisma = require('../server/db');

const {
  validateUsername,
  validatePassword
} = require('../server/auth/service');

async function main() {
  const username = validateUsername(process.argv[2]);

  const password = validatePassword(
    process.env.OTT_NEW_PASSWORD
  );

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.$transaction(async tx => {
    // Cùng khóa với các thao tác quản trị tài khoản.
    await tx.$executeRaw`
      SELECT pg_advisory_xact_lock(740017)
    `;

    const existingAdmins = await tx.user.count({
      where: {
        role: 'ADMIN'
      }
    });

    if (existingAdmins > 0) {
      throw new Error(
        'Đã có Admin. Script bootstrap không tạo thêm Admin.'
      );
    }

    const existingUser = await tx.user.findUnique({
      where: {
        username
      }
    });

    if (existingUser) {
      throw new Error(
        'Username đã tồn tại. Script không sửa tài khoản cũ.'
      );
    }

    const user = await tx.user.create({
      data: {
        username,
        passwordHash,
        role: 'ADMIN',
        isActive: true
      }
    });

    await tx.auditLog.create({
      data: {
        actorId: user.id,
        action: 'ADMIN_BOOTSTRAPPED',
        entityType: 'User',
        entityId: user.id,
        metadata: {
          channel: 'trusted-local-cli'
        }
      }
    });

    return user;
  });

  console.log(
    `Đã tạo Admin: ${admin.username}; id=${admin.id}`
  );
}

main()
  .catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());