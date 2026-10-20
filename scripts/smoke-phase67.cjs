'use strict';

const origin =
  process.env.SMOKE_BASE_URL ||
  'http://127.0.0.1:3001';

async function check(method, pathname, expected) {
  const response = await fetch(origin + pathname, {
    method,
    headers: {
      'X-OTT-Request': '1'
    }
  });

  let data;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (response.status !== expected) {
    throw new Error(
      `${method} ${pathname}: ` +
      `expected ${expected}, got ${response.status}; ` +
      JSON.stringify(data)
    );
  }

  console.log(
    `OK ${response.status}: ${method} ${pathname}`
  );

  return data;
}

async function main() {
  const health = await check(
    'GET',
    '/api/health',
    200
  );

  if (health.persistence !== 'PostgreSQL') {
    throw new Error(
      'Đang chạy sai backend: cần PostgreSQL'
    );
  }

  await check('GET', '/api/overview', 200);
  await check('GET', '/api/submissions', 200);
  await check('GET', '/api/matches', 200);
  await check('GET', '/api/leaderboard', 200);
  await check('GET', '/api/settings', 200);

  // Script không gửi cookie nên các API riêng tư phải từ chối.
  await check('GET', '/api/auth/me', 401);
  await check('GET', '/api/auth/sessions', 401);
  await check('GET', '/api/admin/users', 401);
  await check('POST', '/api/matches', 401);

  const config = await check(
    'GET',
    '/api/auth/config',
    200
  );

  if (!config.registrationOpen) {
    await check(
      'POST',
      '/api/auth/register',
      403
    );
  }

  const csrfResponse = await fetch(
    origin + '/api/auth/logout',
    {
      method: 'POST'
    }
  );

  if (csrfResponse.status !== 403) {
    throw new Error(
      'Request thiếu header CSRF phải bị từ chối với 403'
    );
  }

  console.log('OK 403: request thiếu header CSRF');
  console.log('Smoke test PASSED.');
  console.log(
    'Chưa kiểm tra đăng nhập hợp lệ, Docker hoặc bot execution.'
  );
}

main().catch(error => {
  console.error(
    'Smoke test FAILED:',
    error.message
  );

  process.exitCode = 1;
});