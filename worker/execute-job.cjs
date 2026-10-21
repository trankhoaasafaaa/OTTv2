'use strict';

// No API token, session or database credentials in this process.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {duel, botDirectory, safeFile} = require('../server/bot-runner');
const {runMatch} = require('../server/engine');

process.once('message', async job => {
  try {
    if (
      !job ||
      !Array.isArray(job.submissions) ||
      job.submissions.length !== 2
    ) {
      throw Error('Invalid job');
    }

    for (const submission of job.submissions) {
      const name = safeFile(submission.name, submission.lang);
      const directory = botDirectory(submission.id);

      if (
        typeof submission.content !== 'string' ||
        Buffer.byteLength(submission.content) > 500000 ||
        crypto.createHash('sha256')
          .update(submission.content)
          .digest('hex') !== submission.sha256
      ) {
        throw Error('Source checksum mismatch');
      }

      fs.mkdirSync(directory, {
        recursive: true,
        mode: 0o755
      });

      // Explicit permissions: mkdir/write modes are filtered by umask.
      // These are temporary bot files mounted into the sandbox.
      fs.chmodSync(directory, 0o755);

      const filename = path.join(directory, name);

      fs.writeFileSync(filename, submission.content, {
        mode: 0o644,
        flag: 'wx'
      });

      fs.chmodSync(filename, 0o644);
    }

    const replay = await duel(
      job.submissions[0],
      job.submissions[1],
      job.options,
      runMatch
    );

    process.send({replay}, () => process.exit(0));
  } catch (error) {
    process.send({
      error: 'Bot preparation/execution failed: ' +
        String(error.kind || 'runner-error')
    }, () => process.exit(1));
  }
});
