'use strict';

const issues = [];

if (process.env.NODE_ENV !== 'production') {
  issues.push('NODE_ENV must be production');
}

try {
  const raw = process.env.DATABASE_URL;

  if (!raw || raw !== raw.trim()) {
    throw new Error('Missing URL or surrounding whitespace');
  }

  const url = new URL(raw);

  if (!['postgres:', 'postgresql:'].includes(url.protocol)) {
    issues.push('DATABASE_URL must use PostgreSQL');
  }

  if (!url.hostname.endsWith('.render.com')) {
    issues.push('DATABASE_URL must use the full Render External hostname');
  }

  if (!url.pathname.slice(1)) {
    issues.push('DATABASE_URL is missing the database name');
  }

  if (url.searchParams.get('sslmode') !== 'require') {
    issues.push('DATABASE_URL is missing sslmode=require');
  }

  if (url.searchParams.get('sslaccept') !== 'strict') {
    issues.push('DATABASE_URL is missing sslaccept=strict');
  }
} catch {
  issues.push(
    'DATABASE_URL is missing or invalid; remove surrounding quotes and whitespace'
  );
}

try {
  const raw = process.env.FRONTEND_ORIGIN;
  const url = new URL(raw);

  if (url.protocol !== 'https:' || url.origin !== raw) {
    issues.push(
      'FRONTEND_ORIGIN must be an exact HTTPS origin without trailing slash'
    );
  }
} catch {
  issues.push('FRONTEND_ORIGIN is missing or invalid');
}

if (!/^[a-f0-9]{64}$/.test(process.env.WORKER_TOKEN || '')) {
  issues.push(
    'WORKER_TOKEN must contain exactly 64 lowercase hexadecimal characters'
  );
}

for (const issue of issues) {
  console.error('[Config]', issue);
}

if (issues.length > 0) {
  process.exitCode = 1;
} else {
  console.log(
    '[Config] Environment format checks passed; database connectivity not yet checked.'
  );
}
