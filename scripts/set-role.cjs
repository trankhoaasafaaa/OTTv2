'use strict';

require('dotenv/config');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const username = (process.argv[2] || '').trim().toLowerCase();
  const role = (process.argv[3] || 'ADMIN').toUpperCase();

  if (!username) {
    console.log('Cách dùng: node scripts/set-role.cjs <username> [ADMIN|JUDGE|STUDENT]');
    process.exit(1);
  }

  if (!['ADMIN', 'JUDGE', 'STUDENT'].includes(role)) {
    console.error('Role không hợp lệ. Chọn: ADMIN, JUDGE, hoặc STUDENT');
    process.exit(1);
  }

  try {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      console.error(`Không tìm thấy người dùng có username "${username}" trong database.`);
      process.exit(1);
    }

    const updated = await prisma.user.update({
      where: { username },
      data: { role }
    });

    console.log(`✓ Đã cập nhật quyền thành công: User "${updated.username}" -> Role: [${updated.role}]`);
  } catch (err) {
    console.error('Lỗi khi cập nhật role:', err.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
