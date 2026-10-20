/* OTT Arena API bridge — PostgreSQL sessions + HttpOnly cookie */

// ============================================================
// AUTH STATE
// ============================================================

const authState = {
  username: null,
  role: null,
  email: null,
  authenticated: false
};

let registrationOpen = false;
let authSubmitting = false;
let authPageMode = 'login';
let previousPage = 'overview';

localStorage.removeItem('ott_token');
localStorage.removeItem('ott_username');

function saveAuth(user) {
  Object.assign(authState, {
    username: user.username,
    role: user.role,
    email: user.email,
    authenticated: true
  });
}

function clearAuth() {
  Object.assign(authState, {
    username: null,
    role: null,
    email: null,
    authenticated: false
  });
}

// ============================================================
// API CLIENT
// ============================================================

const api = {
  async call(url, options = {}) {
    let response;

    try {
      response = await fetch('/api' + url, {
        ...options,
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
          'X-OTT-Request': '1',
          ...(options.headers || {})
        }
      });
    } catch {
      throw Error('Không thể kết nối tới backend');
    }

    const value = await response.json();

    if (
      response.status === 401 &&
      !url.startsWith('/auth/')
    ) {
      clearAuth();

      if (typeof render === 'function') {
        render();
      }
    }

    if (!response.ok) {
      throw Object.assign(
        Error(value.error || 'Yêu cầu thất bại'),
        { status: response.status }
      );
    }

    return value;
  },

  get(path) {
    return this.call(path);
  },

  post(path, payload) {
    return this.call(path, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }
};

function escapeHtml(value) {
  return String(value ?? '').replace(
    /[&<>"']/g,
    character => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[character]
  );
}

// ============================================================
// LOGIN / REGISTER
// ============================================================

function openLoginPage() {
  if (state.page !== 'login') {
    previousPage = state.page || 'overview';
  }

  state.modal = null;
  authPageMode = 'login';

  go('login');
}

function switchAuthMode(mode) {
  if (authSubmitting) return;

  if (mode === 'register' && !registrationOpen) {
    return;
  }

  authPageMode = mode === 'register'
    ? 'register'
    : 'login';

  renderLoginPage();
}

function showAuthAlert(message, type = 'error') {
  const alertBox = document.getElementById('loginAlertBox');

  if (!alertBox) return;

  alertBox.style.display = 'flex';
  alertBox.className = 'login-alert ' + type;

  alertBox.innerHTML = `
    <span aria-hidden="true">
      ${type === 'success' ? '✓' : '⚠'}
    </span>
    <span>${escapeHtml(message)}</span>
  `;
}

async function handleAuthSubmit(event) {
  event?.preventDefault();

  if (authSubmitting) return;

  const submitButton =
    document.getElementById('loginSubmitBtn');

  const usernameInput =
    document.getElementById('loginUsername');

  const passwordInput =
    document.getElementById('loginPassword');

  const confirmInput =
    document.getElementById('loginPasswordConfirm');

  const emailInput =
    document.getElementById('registerEmail');

  const username = usernameInput?.value
    ?.trim()
    ?.toLowerCase();

  const password = passwordInput?.value;

  const mode = authPageMode;

  if (!username) {
    showAuthAlert('Vui lòng nhập tên tài khoản.');
    usernameInput?.focus();
    return;
  }

  if (!password) {
    showAuthAlert('Vui lòng nhập mật khẩu.');
    passwordInput?.focus();
    return;
  }

  if (mode === 'register') {
    if (!registrationOpen) {
      showAuthAlert('Đăng ký đang đóng.');
      return;
    }

    if (password !== confirmInput?.value) {
      showAuthAlert('Mật khẩu xác nhận không khớp.');
      confirmInput?.focus();
      return;
    }
  }

  authSubmitting = true;

  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = 'Đang xử lý...';
  }

  try {
    const endpoint = mode === 'register'
      ? '/auth/register'
      : '/auth/login';

    const payload = {
      username,
      password
    };

    if (mode === 'register') {
      payload.email = emailInput?.value?.trim() || null;
    }

    const user = await api.post(endpoint, payload);

    saveAuth(user);

    showAuthAlert(
      'Thành công! Chào mừng ' + user.username + '.',
      'success'
    );

    notice('Đã đăng nhập: ' + user.username);

    setTimeout(() => {
      if (state.page !== 'login') return;

      go(
        mode === 'register'
          ? 'overview'
          : previousPage || 'overview'
      );
    }, 350);
  } catch (error) {
    showAuthAlert(error.message);

    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = mode === 'register'
        ? 'Tạo tài khoản →'
        : 'Đăng nhập ngay →';
    }
  } finally {
    authSubmitting = false;
  }
}

function renderLoginPage() {
  const app = document.getElementById('app');

  if (!app) return;

  if (!registrationOpen) {
    authPageMode = 'login';
  }

  const registering = authPageMode === 'register';

  document.documentElement.className =
    state.theme === 'light' ? 'light' : '';

  app.innerHTML = `
    <div class="login-page-wrap">
      <header class="login-header">
        <div>
          <div style="font-weight:800;font-size:18px">
            OTT<span class="accent">ARENA</span>
          </div>
          <div class="tiny muted">BOT BATTLE PLATFORM</div>
        </div>

        <div style="display:flex;gap:12px;flex-wrap:wrap">
          <button
            type="button"
            class="btn sm secondary"
            onclick="go(previousPage || 'overview')"
          >
            ← Quay lại
          </button>

          <button
            type="button"
            class="iconbtn"
            title="Chuyển giao diện sáng/tối"
            onclick="
              state.theme=state.theme==='dark'?'light':'dark';
              localStorage.setItem(
                'ott-theme',
                JSON.stringify(state.theme)
              );
              renderLoginPage()
            "
          >
            ${svg(state.theme === 'dark' ? 'sun' : 'moon')}
          </button>
        </div>
      </header>

      <main class="login-body-center">
        <div class="login-card">
          <div style="text-align:center;margin-bottom:24px">
            <h2>
              ${registering
                ? 'Đăng ký tài khoản mới'
                : 'Đăng nhập Arena'}
            </h2>

            <p class="muted small">
              ${registering
                ? 'Tạo tài khoản Student để nộp bot và luyện tập.'
                : 'Đăng nhập để quản lý bot và tài khoản của bạn.'}
            </p>
          </div>

          ${registrationOpen ? `
            <div class="login-tabs">
              <button
                type="button"
                class="login-tab-btn ${!registering ? 'active' : ''}"
                onclick="switchAuthMode('login')"
              >
                Đăng nhập
              </button>

              <button
                type="button"
                class="login-tab-btn ${registering ? 'active' : ''}"
                onclick="switchAuthMode('register')"
              >
                Đăng ký
              </button>
            </div>
          ` : ''}

          <div
            id="loginAlertBox"
            role="alert"
            aria-live="polite"
            style="display:none"
          ></div>

          <form id="authForm" onsubmit="handleAuthSubmit(event)">
            <div class="form-group">
              <label class="form-label" for="loginUsername">
                Tên tài khoản
              </label>

              <input
                class="field"
                id="loginUsername"
                autocomplete="username"
                maxlength="32"
                placeholder="Ví dụ: student_one"
                required
              >

              <p class="tiny muted">
                2–32 ký tự: chữ thường, số hoặc dấu gạch dưới.
              </p>
            </div>

            <div class="form-group">
              <label class="form-label" for="loginPassword">
                Mật khẩu
              </label>

              <input
                class="field"
                id="loginPassword"
                type="password"
                autocomplete="${registering
                  ? 'new-password'
                  : 'current-password'}"
                required
              >
            </div>

            ${registering ? `
              <p class="tiny muted">
                Mật khẩu cần ít nhất 12 ký tự, có chữ và số;
                tối đa 72 byte UTF-8.
              </p>

              <div class="form-group">
                <label class="form-label" for="registerEmail">
                  Email — tùy chọn
                </label>

                <input
                  class="field"
                  id="registerEmail"
                  type="email"
                  autocomplete="email"
                  maxlength="254"
                >
              </div>

              <div class="form-group">
                <label
                  class="form-label"
                  for="loginPasswordConfirm"
                >
                  Xác nhận mật khẩu
                </label>

                <input
                  class="field"
                  id="loginPasswordConfirm"
                  type="password"
                  autocomplete="new-password"
                  required
                >
              </div>
            ` : ''}

            <button
              class="btn"
              id="loginSubmitBtn"
              type="submit"
              style="
                width:100%;
                margin-top:12px;
                justify-content:center;
              "
            >
              ${registering
                ? 'Tạo tài khoản →'
                : 'Đăng nhập ngay →'}
            </button>
          </form>

          ${!registrationOpen ? `
            <p class="tiny muted" style="margin-top:20px">
              Đăng ký đang đóng.
              Liên hệ Ban tổ chức để được cấp tài khoản.
            </p>
          ` : ''}
        </div>
      </main>
    </div>
  `;
}

// ============================================================
// ACCOUNT MENU
// ============================================================

function injectTopNavAuth() {
  const actions = document.querySelector('.topactions');

  if (!actions) return;

  document.getElementById('authUserWrap')?.remove();
  document.getElementById('authNavBtn')?.remove();

  if (!authState.authenticated) {
    const button = document.createElement('button');

    button.id = 'authNavBtn';
    button.className = 'btn sm';
    button.type = 'button';
    button.onclick = openLoginPage;
    button.textContent = 'Đăng nhập';

    actions.prepend(button);
    return;
  }

  const wrapper = document.createElement('div');

  wrapper.id = 'authUserWrap';
  wrapper.className = 'auth-user-dropdown-wrap';

  const initials = authState.username
    .slice(0, 2)
    .toUpperCase();

  wrapper.innerHTML = `
    <button
      class="btn sm secondary"
      id="authNavBtn"
      type="button"
      onclick="toggleUserMenu(event)"
    >
      <span class="user-avatar-badge">
        ${escapeHtml(initials)}
      </span>

      <span>${escapeHtml(authState.username)}</span>
      <span aria-hidden="true">▼</span>
    </button>

    <div
      class="auth-dropdown-menu"
      id="authDropdownMenu"
      style="display:none"
    >
      <div class="auth-dropdown-header">
        <strong>${escapeHtml(authState.username)}</strong>
        <div class="tiny muted">
          ${escapeHtml(authState.role)}
        </div>
      </div>

      <button
        type="button"
        class="auth-dropdown-item"
        onclick="go('submit')"
      >
        Bot của tôi
      </button>

      <button
        type="button"
        class="auth-dropdown-item"
        onclick="go('arena')"
      >
        Đấu trường
      </button>

      <button
        type="button"
        class="auth-dropdown-item"
        onclick="location.href='/account.html'"
      >
        Tài khoản & phiên đăng nhập
      </button>

      ${authState.role === 'ADMIN' ? `
        <button
          type="button"
          class="auth-dropdown-item"
          onclick="location.href='/account.html#admin'"
        >
          Quản lý tài khoản
        </button>
      ` : ''}

      <div class="auth-dropdown-divider"></div>

      <button
        type="button"
        class="auth-dropdown-item danger"
        onclick="authLogout()"
      >
        Đăng xuất
      </button>
    </div>
  `;

  actions.prepend(wrapper);
}

function toggleUserMenu(event) {
  event?.stopPropagation();

  const menu = document.getElementById('authDropdownMenu');

  if (!menu) return;

  menu.style.display =
    menu.style.display === 'none' ? 'flex' : 'none';
}

function updateSidebarProfile() {
  const profile = document.querySelector('.side-profile');

  if (!profile) return;

  if (authState.authenticated) {
    const initials = authState.username
      .slice(0, 2)
      .toUpperCase();

    profile.innerHTML = `
      <span class="avatar">
        ${escapeHtml(initials)}
      </span>

      <div>
        <div class="strong small">
          ${escapeHtml(authState.username)}
        </div>

        <div class="tiny muted">
          ${escapeHtml(authState.role)}
        </div>
      </div>

      <button
        type="button"
        class="iconbtn"
        title="Quản lý tài khoản"
        onclick="location.href='/account.html'"
      >
        ⋯
      </button>
    `;
  } else {
    profile.innerHTML = `
      <span class="avatar">?</span>

      <div>
        <div class="strong small">Khách</div>

        <button
          type="button"
          class="btn sm secondary"
          onclick="openLoginPage()"
        >
          Đăng nhập
        </button>
      </div>
    `;
  }
}

async function authLogout() {
  try {
    await api.post('/auth/logout', {});

    clearAuth();

    notice('Đã đăng xuất và thu hồi phiên.');
    go('overview');
  } catch (error) {
    notice('Chưa đăng xuất được: ' + error.message);
  }
}

async function restoreAuth() {
  try {
    const config = await api.get('/auth/config');
    registrationOpen = config.registrationOpen === true;
  } catch {
    registrationOpen = false;
  }

  try {
    saveAuth(await api.get('/auth/me'));
  } catch (error) {
    if (error.status === 401) {
      clearAuth();
    }
  }

  if (state.page === 'login') {
    renderLoginPage();
  } else {
    injectTopNavAuth();
    updateSidebarProfile();
  }
}

// ============================================================
// WEBSOCKET
// ============================================================

let wsConn = null;
let wsReconnectTimer = null;
let wsWatchingMatch = null;

function connectWebSocket() {
  if (wsConn && wsConn.readyState < 2) return;

  const protocol = location.protocol === 'https:'
    ? 'wss://'
    : 'ws://';

  wsConn = new WebSocket(
    protocol + location.host + '/ws'
  );

  wsConn.onopen = () => {
    if (wsReconnectTimer) {
      clearTimeout(wsReconnectTimer);
      wsReconnectTimer = null;
    }

    updateWSIndicator(true);
  };

  wsConn.onmessage = event => {
    try {
      handleWSMessage(JSON.parse(event.data));
    } catch (error) {
      console.warn('[WS]', error);
    }
  };

  wsConn.onclose = () => {
    updateWSIndicator(false);

    wsReconnectTimer = setTimeout(
      connectWebSocket,
      3000
    );
  };

  wsConn.onerror = () => {};
}

function handleWSMessage(message) {
  switch (message.event) {
    case 'welcome':
      updateServerStats(message);
      break;

    case 'match-queued':
      if (message.match) {
        notice(
          'Trận mới xếp hàng: ' +
          message.match.a + ' vs ' +
          message.match.b
        );
      }

      void loadBackend();
      break;

    case 'match-started':
      if (message.ownedBy === authState.username) {
        notice(
          'Trận của bạn đã bắt đầu: ' +
          message.matchId
        );
      }

      updateServerStats(message);
      break;

    case 'match-finished':
      if (message.ownedBy === authState.username) {
        const result = message.winner === 'p1'
          ? message.a + ' thắng'
          : message.winner === 'p2'
            ? message.b + ' thắng'
            : 'Hòa';

        notice(
          'Trận của bạn kết thúc: ' + result
        );
      }

      void loadBackend();

      if (wsWatchingMatch === message.matchId) {
        wsWatchingMatch = null;

        if (message.status === 'completed') {
          void openServerMatch(message.matchId);
        } else {
          notice(
            'Trận thất bại: ' +
            (message.reason || 'Lỗi không xác định')
          );
        }
      }

      break;
  }
}

function updateWSIndicator(online) {
  const indicator =
    document.getElementById('wsStatusIndicator');

  if (!indicator) return;

  indicator.textContent = online ? 'Live' : 'Offline';
  indicator.style.color = online ? '#4ade80' : '#f87171';
}

function updateServerStats(message) {
  const counter =
    document.getElementById('activeJobsCount');

  if (
    counter &&
    message.activeJobs !== undefined
  ) {
    counter.textContent =
      message.activeJobs + ' active / ' +
      (message.pendingJobs || 0) + ' pending';
  }
}

async function waitForMatch(id) {
  if (wsConn && wsConn.readyState === 1) {
    wsWatchingMatch = id;

    notice(
      'Đang chờ kết quả trận [' + id + ']...'
    );

    setTimeout(() => {
      if (wsWatchingMatch !== id) return;

      wsWatchingMatch = null;

      notice(
        'Thời gian chờ quá lâu. Kiểm tra Match Arena.'
      );
    }, 300000);

    return;
  }

  try {
    for (let attempt = 0; attempt < 240; attempt++) {
      const match = await api.get(
        '/matches/' + encodeURIComponent(id)
      );

      if (match.status === 'completed') {
        await loadBackend();
        await openServerMatch(id);

        notice('Trận kết thúc: ' + match.reason);
        return;
      }

      if (match.status === 'failed') {
        await loadBackend();

        notice(
          'Trận thất bại: ' +
          (match.error || match.reason)
        );

        return;
      }

      await new Promise(resolve => {
        setTimeout(resolve, 2000);
      });
    }

    notice(
      'Trận vẫn đang chạy. Kiểm tra Match Arena.'
    );
  } catch (error) {
    notice(
      'Lỗi theo dõi trận: ' + error.message
    );
  }
}

// ============================================================
// BACKEND DATA / REPLAY
// ============================================================

let serverMatches = [];

async function loadBackend() {
  try {
    const [submissions, matchList, rankings] =
      await Promise.all([
        api.get('/submissions'),
        api.get('/matches'),
        api.get('/leaderboard')
      ]);

    state.submissions = submissions.map(submission => ({
      ...submission,
      date: new Date(submission.date).toLocaleDateString(
        'en-US',
        {
          month: 'short',
          day: '2-digit',
          year: 'numeric'
        }
      )
    }));

    serverMatches = matchList;

    matches.splice(
      0,
      matches.length,
      ...matchList.map(match => ({
        ...match,
        score: match.status === 'completed'
          ? match.winner === 'p1'
            ? '1 – 0'
            : match.winner === 'p2'
              ? '0 – 1'
              : '0.5 – 0.5'
          : match.status,
        type: match.mode === 'submitted'
          ? 'Submitted bots'
          : 'Built-in demo',
        time: new Date(match.createdAt).toLocaleString(
          'en-US'
        ),
        turns: match.turns || 0
      }))
    );

    const completed = matchList.find(
      match => match.status === 'completed'
    );

    if (
      completed &&
      (
        !matchList.some(
          match => match.id === state.selectedMatch
        ) ||
        !replayCache[state.selectedMatch]
      )
    ) {
      state.selectedMatch = completed.id;

      try {
        replayCache[completed.id] = await api.get(
          '/matches/' +
          encodeURIComponent(completed.id) +
          '/replay'
        );
      } catch (error) {
        console.warn(
          'Replay not loaded:',
          error.message
        );
      }
    }

    players.splice(
      0,
      players.length,
      ...rankings.map((player, index) => [
        String(index + 1).padStart(2, '0'),
        player.name,
        player.name.slice(0, 2).toUpperCase(),
        player.lang,
        player.elo,
        '+0',
        ['purple', 'blue', 'orange', 'pink'][index % 4]
      ])
    );

    state.serverOnline = true;

    // Tránh xóa nội dung người dùng đang nhập ở trang đăng nhập.
    if (state.page !== 'login') {
      render();
    }
  } catch (error) {
    state.serverOnline = false;

    console.warn(
      'Backend unavailable:',
      error.message
    );
  }
}

const demoReplayBuilder = buildReplay;

buildReplay = function (id) {
  if (replayCache[id]) {
    return replayCache[id];
  }

  if (serverMatches.some(match => match.id === id)) {
    return {
      snapshots: [initialOTT(1)],
      events: [],
      winner: null
    };
  }

  return demoReplayBuilder(id);
};

async function openServerMatch(id) {
  try {
    state.playing = false;
    clearInterval(timer);

    const replay = await api.get(
      '/matches/' +
      encodeURIComponent(id) +
      '/replay'
    );

    replayCache[id] = replay;

    state.selectedMatch = id;
    state.play = 0;

    go('arena');
  } catch (error) {
    notice(
      'Replay chưa sẵn sàng: ' + error.message
    );
  }
}

openMatch = function (id) {
  if (serverMatches.some(match => match.id === id)) {
    return openServerMatch(id);
  }

  state.selectedMatch = id;
  state.play = 0;
  state.playing = false;

  clearInterval(timer);

  go('arena');
};

// ============================================================
// MATCH ACTIONS
// ============================================================

async function createServerMatch() {
  if (!authState.authenticated) {
    openLoginPage();
    return;
  }

  const a = document.getElementById('playerA')?.value ||
    'Greedy Bot';

  const b = document.getElementById('playerB')?.value ||
    'Random Bot';

  try {
    const job = await api.post('/matches', {
      a,
      b,
      maxMoves: Number(state.maxMoves) || 200,
      first: state.firstMove,
      pieces: 6
    });

    notice('Trận demo đã được xếp hàng.');

    await loadBackend();
    await waitForMatch(job.id);
  } catch (error) {
    notice(
      'Không thể tạo trận demo: ' + error.message
    );
  }
}

async function createSubmittedMatch() {
  if (!authState.authenticated) {
    openLoginPage();
    return;
  }

  const submissionA =
    document.getElementById('submissionA')?.value;

  const submissionB =
    document.getElementById('submissionB')?.value;

  const maxMoves = Number(
    document.getElementById('duelMaxMoves')?.value || 200
  );

  const first =
    document.getElementById('duelFirst')?.value || 'Random';

  if (
    !submissionA ||
    !submissionB ||
    submissionA === submissionB
  ) {
    notice('Chọn hai bot khác nhau.');
    return;
  }

  if (
    !Number.isInteger(maxMoves) ||
    maxMoves < 1 ||
    maxMoves > 1000
  ) {
    notice('Move limit phải từ 1–1000.');
    return;
  }

  try {
    const job = await api.post('/matches', {
      submissionA,
      submissionB,
      maxMoves,
      first,
      pieces: 6
    });

    notice('Đã xếp hàng trận: ' + job.id);

    await loadBackend();
    await waitForMatch(job.id);
  } catch (error) {
    notice(
      'Không thể bắt đầu trận: ' + error.message
    );
  }
}

async function challengeMatch() {
  if (!authState.authenticated) {
    notice('Bạn cần đăng nhập trước khi thách đấu.');
    openLoginPage();
    return;
  }

  const myBot =
    document.getElementById('challengeBot')?.value;

  const maxMoves = Number(
    document.getElementById('challengeMaxMoves')?.value ||
    200
  );

  if (!myBot) {
    notice('Hãy chọn bot của bạn.');
    return;
  }

  if (
    !Number.isInteger(maxMoves) ||
    maxMoves < 1 ||
    maxMoves > 1000
  ) {
    notice('Move limit phải từ 1–1000.');
    return;
  }

  const button =
    document.getElementById('challengeBtn');

  if (button) {
    button.disabled = true;
    button.textContent = 'Đang tìm đối thủ...';
  }

  try {
    const job = await api.post('/matches', {
      submissionA: myBot,
      maxMoves,
      pieces: 6,
      first: 'Random'
    });

    notice(
      'Đã ghép trận với ' +
      (job.opponent || 'đối thủ ngẫu nhiên') +
      ' [' + job.id + ']'
    );

    await loadBackend();
    await waitForMatch(job.id);
  } catch (error) {
    notice(
      'Không thể tạo trận: ' + error.message
    );
  } finally {
    render();
  }
}

async function checkJudge() {
  try {
    const status = await api.get('/judge/status');

    state.dockerReady = status.dockerReady;

    const environment =
      document.getElementById('judgeEnvironment');

    if (environment) {
      environment.textContent = status.dockerReady
        ? '● Docker sandbox ready (' +
          status.activeJobs + ' active)'
        : '● Khởi động Docker Desktop để chạy bot';
    }
  } catch {
    state.dockerReady = false;
  }
}

// ============================================================
// EXISTING AUTH UI STYLES
// ============================================================

function injectAuthStyles() {
  if (document.getElementById('ott-auth-custom-styles')) {
    return;
  }

  const style = document.createElement('style');

  style.id = 'ott-auth-custom-styles';

  style.textContent = `
    .toast {
      z-index: 100000 !important;
    }

    .auth-user-dropdown-wrap {
      position: relative;
      display: inline-flex;
      align-items: center;
    }

    #authNavBtn {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      font-weight: 700;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .user-avatar-badge {
      display: inline-grid;
      place-items: center;
      width: 22px;
      height: 22px;
      border-radius: 6px;
      background: linear-gradient(135deg,#7c6fff,#ec6e9a);
      color: #fff;
      font-size: 11px;
      font-weight: 800;
    }

    .auth-dropdown-menu {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      min-width: 220px;
      background: var(--surface,#171d1e);
      border: 1px solid var(--line,#2b3434);
      border-radius: 12px;
      box-shadow: 0 16px 40px rgba(0,0,0,0.5);
      padding: 8px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .auth-dropdown-header {
      padding: 8px 10px;
      border-bottom: 1px solid var(--line,#2b3434);
      margin-bottom: 4px;
    }

    .auth-dropdown-item {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 9px 12px;
      background: transparent;
      border: none;
      border-radius: 8px;
      color: var(--text,#f0f2eb);
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      text-align: left;
    }

    .auth-dropdown-item:hover {
      background: var(--surface2,#1e2526);
    }

    .auth-dropdown-item.danger {
      color: #f87171;
    }

    .auth-dropdown-divider {
      height: 1px;
      background: var(--line,#2b3434);
      margin: 4px 0;
    }

    .login-page-wrap {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background: var(--bg,#0c1011);
      color: var(--text,#f0f2eb);
    }

    .login-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
      padding: 16px 24px;
      border-bottom: 1px solid var(--line,#2b3434);
      background: var(--surface,#171d1e);
    }

    .login-body-center {
      flex: 1;
      display: grid;
      place-items: center;
      padding: 40px 16px;
    }

    .login-card {
      width: 100%;
      max-width: 440px;
      background: var(--surface,#171d1e);
      border: 1px solid var(--line,#2b3434);
      border-radius: 18px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.55);
      padding: 32px 24px;
    }

    .login-tabs {
      display: flex;
      gap: 6px;
      background: var(--surface2,#1e2526);
      padding: 5px;
      border-radius: 11px;
      margin-bottom: 22px;
    }

    .login-tab-btn {
      flex: 1;
      padding: 10px;
      border-radius: 8px;
      border: none;
      background: transparent;
      color: var(--muted,#899493);
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
    }

    .login-tab-btn.active {
      background: var(--surface,#171d1e);
      color: var(--text,#f0f2eb);
    }

    .login-alert {
      padding: 12px 14px;
      border-radius: 10px;
      font-size: 13px;
      margin-bottom: 18px;
      display: flex;
      gap: 10px;
      line-height: 1.45;
    }

    .login-alert.error {
      background: rgba(248,113,113,0.15);
      border: 1px solid rgba(248,113,113,0.4);
      color: #fca5a5;
    }

    .login-alert.success {
      background: rgba(74,222,128,0.15);
      border: 1px solid rgba(74,222,128,0.4);
      color: #86efac;
    }

    @media (prefers-reduced-motion: reduce) {
      #authNavBtn {
        transition: none;
      }
    }
  `;

  document.head.appendChild(style);
}

// ============================================================
// INITIALIZATION
// ============================================================

document.addEventListener('click', event => {
  const menu =
    document.getElementById('authDropdownMenu');

  const button =
    document.getElementById('authNavBtn');

  if (
    menu &&
    menu.style.display !== 'none' &&
    (!button || !button.contains(event.target))
  ) {
    menu.style.display = 'none';
  }
});

function setupAuthIntegration() {
  injectAuthStyles();

  const originalRender = render;

  render = function () {
    if (state.page === 'login') {
      renderLoginPage();
      return;
    }

    originalRender();

    injectTopNavAuth();
    updateSidebarProfile();
  };

  render();

  void restoreAuth().then(() => loadBackend());

  void checkJudge();

  connectWebSocket();
}

window.addEventListener('hashchange', () => {
  if (location.hash === '#admin') {
    void checkJudge();
  }
});

if (document.readyState === 'loading') {
  window.addEventListener(
    'DOMContentLoaded',
    setupAuthIntegration
  );
} else {
  setupAuthIntegration();
}