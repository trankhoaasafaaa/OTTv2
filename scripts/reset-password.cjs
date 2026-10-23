'use strict';

require('dotenv/config');
const fs = require('node:fs');
const path = require('node:path');
const bcrypt = require('bcryptjs');

const username = String(process.argv[2] || 'admin').trim().toLowerCase();
const newPassword = String(process.argv[3] || process.env.OTT_NEW_PASSWORD || '').trim();

if (!username || !newPassword) {
  console.error('Usage: node scripts/reset-password.cjs <username> <new_password>');
  process.exit(1);
}

async function main() {
  const hash = await bcrypt.hash(newPassword, 12);
  let updatedPg = false;
  let updatedJson = false;

  // 1. Update PostgreSQL if available
  try {
    const prisma = require('../server/db');
    const user = await prisma.user.update({
      where: { username },
      data: { passwordHash: hash }
    });
    console.log(`[PostgreSQL] Đã đổi mật khẩu cho user: ${user.username} (role: ${user.role})`);
    updatedPg = true;
    await prisma.$disconnect();
  } catch (err) {
    console.log(`[PostgreSQL] Bỏ qua (không kết nối hoặc user không tồn tại): ${err.message}`);
  }

  // 2. Update data/db.json if available
  try {
    const dbPath = path.resolve(__dirname, '../data/db.json');
    if (fs.existsSync(dbPath)) {
      const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
      if (!data.users) data.users = {};
      const existing = data.users[username] || {};
      data.users[username] = {
        ...existing,
        passwordHash: hash,
        role: existing.role || (username === 'admin' ? 'ADMIN' : 'STUDENT'),
        updatedAt: new Date().toISOString()
      };
      fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
      console.log(`[data/db.json] Đã đổi mật khẩu cho user: ${username} (role: ${data.users[username].role})`);
      updatedJson = true;
    }
  } catch (err) {
    console.log(`[data/db.json] Bỏ qua: ${err.message}`);
  }

  if (!updatedPg && !updatedJson) {
    throw new Error(`Không thể cập nhật mật khẩu cho user: ${username}`);
  }

  console.log(`\n🎉 Đổi mật khẩu thành công!`);
  console.log(`Username: ${username}`);
  console.log(`Password: ${newPassword}`);
}

main().catch(err => {
  console.error('Lỗi:', err.message);
  process.exit(1);
});
