'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.resolve(ROOT, process.env.OTT_DATA_DIR ||
  (process.env.OTT_MODE === 'offline' ? 'data-offline' : 'data'));

// Database paths remain logical data/... identifiers for compatibility with existing rows.
// Physical files are resolved under the selected instance's DATA_DIR.
function ensureStorageIdentity(config, databaseUrl) {
  const db = new URL(databaseUrl);
  const hostname = ['localhost', '[::1]', '::1'].includes(db.hostname) ? '127.0.0.1' : db.hostname;
  const databaseKey = `${hostname}:${db.port || 5432}${db.pathname}?schema=${db.searchParams.get('schema') || 'public'}`;
  const expected = {
    version: 1,
    mode: config.mode,
    databaseHash: crypto.createHash('sha256').update(databaseKey).digest('hex')
  };
  fs.mkdirSync(config.dataDir, {recursive: true, mode: 0o700});
  const marker = path.join(config.dataDir, '.ott-storage.json');
  try {
    fs.writeFileSync(marker, JSON.stringify(expected), {flag: 'wx', mode: 0o600});
  } catch (error) {
    if (error.code !== 'EEXIST') throw error;
  }
  let actual;
  try { actual = JSON.parse(fs.readFileSync(marker, 'utf8')); }
  catch { throw new Error('Invalid storage identity marker; verify the selected data directory'); }
  if (actual.version !== 1 || actual.mode !== expected.mode || actual.databaseHash !== expected.databaseHash)
    throw new Error('Data directory belongs to another mode/database. Select a separate OTT_DATA_DIR; do not overwrite its marker.');
}

module.exports = {DATA_DIR, ensureStorageIdentity};
