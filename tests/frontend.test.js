'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');

const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');

const scripts = path.resolve(__dirname, '../public');

function makeContext() {
  const app = {
    innerHTML: ''
  };

  const context = {
    console,

    location: {
      hash: ''
    },

    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,

    localStorage: {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {}
    },

    window: {
      scrollTo: () => {},
      addEventListener: () => {}
    },

    document: {
      readyState: 'loading',
      addEventListener: () => {},

      documentElement: {
        className: ''
      },

      getElementById: id => {
        return id === 'app' ? app : null;
      },

      querySelector: () => null,

      createElement: () => ({
        textContent: ''
      }),

      body: {
        append: () => {}
      }
    },

    fetch: async url => {
      let data;

      if (url.includes('/submissions')) {
        data = [{
          id: 'SUB-A1B2C3D4',
          name: 'bot.c',
          lang: 'C',
          date: new Date().toISOString(),
          status: 'Stored',
          version: 'v1'
        }];
      } else if (
        url.includes('/matches') ||
        url.includes('/leaderboard')
      ) {
        data = [];
      } else {
        data = {
          dockerReady: false
        };
      }

      return {
        ok: true,
        status: 200,
        json: async () => data
      };
    }
  };

  vm.createContext(context);

  vm.runInContext(
    fs.readFileSync(
      path.join(scripts, 'app.js'),
      'utf8'
    ),
    context
  );

  vm.runInContext(
    fs.readFileSync(
      path.join(scripts, 'api.js'),
      'utf8'
    ),
    context
  );

  return {
    app,
    context
  };
}

test('major frontend views render', () => {
  const { app, context } = makeContext();

  for (const page of [
    'overview',
    'arena',
    'submit',
    'leaderboard',
    'tournaments',
    'admin'
  ]) {
    vm.runInContext(
      `go('${page}')`,
      context
    );

    assert.ok(app.innerHTML.includes('OTT'));
  }

  assert.ok(
    app.innerHTML.includes('Run built-in demo match')
  );

  assert.ok(
    app.innerHTML.includes('id="challengeBot"')
  );
});

test('empty server matches show an empty arena', async () => {
  const { app, context } = makeContext();

  await vm.runInContext(
    'loadBackend()',
    context
  );

  vm.runInContext(
    "go('arena')",
    context
  );

  assert.ok(
    app.innerHTML.includes('No match replays yet')
  );
});

test('registration form follows server setting', () => {
  const { app, context } = makeContext();

  vm.runInContext(
    "registrationOpen=true;switchAuthMode('register')",
    context
  );

  assert.ok(
    app.innerHTML.includes('id="registerEmail"')
  );

  assert.ok(
    app.innerHTML.includes('autocomplete="new-password"')
  );

  assert.ok(
    app.innerHTML.includes('role="alert"')
  );

  vm.runInContext(
    'registrationOpen=false;renderLoginPage()',
    context
  );

  assert.ok(
    !app.innerHTML.includes('id="registerEmail"')
  );
});

test('API uses cookies and CSRF header, not bearer JWT', async () => {
  const { context } = makeContext();

  let captured;

  context.fetch = async (url, options) => {
    captured = {
      url,
      options
    };

    return {
      ok: true,
      status: 200,
      json: async () => ({
        ok: true
      })
    };
  };

  await vm.runInContext(
    "saveAuth({username:'student',role:'STUDENT'});" +
    "api.post('/auth/logout',{})",
    context
  );

  assert.equal(
    captured.options.credentials,
    'same-origin'
  );

  assert.equal(
    captured.options.headers['X-OTT-Request'],
    '1'
  );

  assert.ok(
    !Object.hasOwn(
      captured.options.headers,
      'Authorization'
    )
  );
});