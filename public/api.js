/* OTT Arena API bridge & account management */

// ─── Auth state ───────────────────────────────────────────────────────────────
const authState = {id: null, username: null, role: null, email: null, authenticated: false};
let registrationOpen = false;
let authGeneration = 0;
let backendLoadGeneration = 0;
function resetSubmissionState() {
  state.submissions = [];
  state.selectedFile = null;
  state.challengeBotId = '';
  state.challengeReady = false;
  state.challengePending = false;
  state.modal = null;
  localStorage.removeItem('ott-submissions');
}
resetSubmissionState();
// Remove credentials left by the legacy JWT frontend.
localStorage.removeItem('ott_token');
localStorage.removeItem('ott_username');
function saveAuth(user) {
  if (!authState.authenticated || authState.id !== user.id) {
    authGeneration++;
    resetSubmissionState();
  }
  Object.assign(authState, {id: user.id, username: user.username, role: user.role, email: user.email, authenticated: true});
}
function clearAuth() {
  authGeneration++;
  resetSubmissionState();
  Object.assign(authState, {id: null, username: null, role: null, email: null, authenticated: false});
}

const api = {
  async call(url, options = {}) {
    const requestAuthGeneration = authGeneration;
    let response;
    try {
      response = await fetch('/api' + url, {
        ...options,
        credentials: 'same-origin',
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
          'X-OTT-Request': '1',
          ...(options.headers || {})
        }
      });
    } catch (netErr) {
      throw Error('Chưa thể kết nối. Vui lòng đợi một lúc rồi thử lại.');
    }
    let value;
    try { value = await response.json(); }
    catch { throw Error('Chưa tải được dữ liệu. Vui lòng thử lại sau ít phút.'); }
    if (response.status === 401 && requestAuthGeneration === authGeneration && !url.startsWith('/auth/')) {
      clearAuth();
      if (typeof render === 'function') render();
    }
    if (!response.ok) throw Object.assign(Error(value.error || 'Yêu cầu thất bại'), {status: response.status});
    return value;
  },
  get(path) { return this.call(path); },
  post(path, payload) { return this.call(path, { method: 'POST', body: JSON.stringify(payload) }); },
  patch(path, payload) { return this.call(path, { method: 'PATCH', body: JSON.stringify(payload) }); },
  put(path, payload) { return this.call(path, { method: 'PUT', body: JSON.stringify(payload) }); },
  delete(path) { return this.call(path, { method: 'DELETE' }); }
};

function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

// ─── Login & Register Page Logic ──────────────────────────────────────────────
let authPageMode = 'login'; // 'login' | 'register'
let previousPage = 'overview';

function openLoginPage() {
  if (state.page !== 'login') {
    previousPage = state.page || 'overview';
  }
  authPageMode = 'login';
  go('login');
}

function switchAuthMode(mode) {
  if (mode === 'register' && !registrationOpen) return;
  authPageMode = mode;
  renderLoginPage();
}

function showAuthAlert(msg, type = 'error') {
  const alertBox = document.getElementById('loginAlertBox');
  if (!alertBox) return;
  alertBox.style.display = 'flex';
  alertBox.className = 'login-alert ' + type;
  alertBox.innerHTML = `
    <span style="font-size:16px;line-height:1">${type === 'success' ? '✓' : '⚠'}</span>
    <span style="flex:1">${escapeHtml(msg)}</span>
  `;
}

async function handleAuthSubmit(e) {
  if (e) e.preventDefault();
  const submitBtn = document.getElementById('loginSubmitBtn');
  const usernameInput = document.getElementById('loginUsername');
  const passwordInput = document.getElementById('loginPassword');
  const confirmInput = document.getElementById('loginPasswordConfirm');

  const isEn = (typeof state !== 'undefined' && state.lang === 'en');
  const username = usernameInput?.value?.trim()?.toLowerCase();
  const password = passwordInput?.value;

  if (!username) {
    showAuthAlert(isEn ? 'Please enter a username' : 'Vui lòng nhập tên tài khoản', 'error');
    usernameInput?.focus();
    return;
  }
  if (!password) {
    showAuthAlert(isEn ? 'Please enter password' : 'Vui lòng nhập mật khẩu', 'error');
    passwordInput?.focus();
    return;
  }

  if (authPageMode === 'register') {
    const confirm = confirmInput?.value;
    if (password !== confirm) {
      showAuthAlert(isEn ? 'Passwords do not match. Please verify!' : 'Mật khẩu xác nhận không khớp. Vui lòng kiểm tra lại!', 'error');
      confirmInput?.focus();
      return;
    }
  }

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = isEn ? 'Processing...' : 'Đang xử lý...';
  }

  try {
    const endpoint = authPageMode === 'register' ? '/auth/register' : '/auth/login';
    const email = document.getElementById('registerEmail')?.value || null;
    const data = await api.post(endpoint, { username, password, ...(authPageMode === 'register' ? {email} : {}) });
    saveAuth(data);
    await loadBackend();

    showAuthAlert(
      (authPageMode === 'register' 
        ? (isEn ? 'Registration successful! ' : 'Đăng ký thành công! ') 
        : (isEn ? 'Sign in successful! ' : 'Đăng nhập thành công! ')) +
      (isEn ? 'Welcome ' : 'Chào mừng ') + data.username + (isEn ? '. Redirecting to arena...' : '. Đang chuyển về màn hình chính...'),
      'success'
    );
    notice((isEn ? 'Signed in as: ' : 'Đăng nhập thành công: ') + data.username);

    setTimeout(() => {
      go(previousPage || 'overview');
    }, 350);
  } catch (err) {
    showAuthAlert(err.message || (isEn ? 'Authentication failed. Please try again!' : 'Đăng nhập thất bại. Vui lòng thử lại!'), 'error');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = authPageMode === 'login' ? (isEn ? 'Sign In Now →' : 'Đăng nhập ngay →') : (isEn ? 'Create Account & Sign In →' : 'Tạo tài khoản & Đăng nhập →');
    }
  }
}

function renderLoginPage() {
  const appEl = document.getElementById('app');
  if (!appEl) return;
  document.documentElement.className = state.theme === 'light' ? 'light' : '';
  const isEn = (typeof state !== 'undefined' && state.lang === 'en');

  appEl.innerHTML = `
    <div class="login-page-wrap">
      <header class="login-header">
        <div style="display:flex;align-items:center;gap:12px;cursor:pointer" onclick="go(previousPage || 'overview')">
          <span class="brandicon">◈</span>
          <div>
            <div style="font-weight:800;font-size:18px;letter-spacing:-0.5px">OTT<span class="accent">ARENA</span></div>
            <div class="tiny muted" style="letter-spacing:1px">${isEn ? 'BOT BATTLE PLATFORM' : 'NỀN TẢNG ĐẤU BOT'}</div>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:12px">
          <button class="lang-toggle-btn" title="${isEn ? 'Switch language (VI / EN)' : 'Chuyển đổi ngôn ngữ (VI / EN)'}" onclick="toggleLang();renderLoginPage()" type="button" aria-label="Toggle language">
            <span class="lang-tag ${!isEn?'active':''}">VI</span>
            <span class="lang-sep">/</span>
            <span class="lang-tag ${isEn?'active':''}">EN</span>
          </button>
          <button class="btn sm secondary" onclick="go(previousPage || 'overview')">
            ${isEn ? '← Back to main' : '← Quay lại chương trình'}
          </button>
          <button class="iconbtn" title="${isEn ? 'Toggle theme' : 'Chuyển theme sáng/tối'}" onclick="if(typeof toggleTheme==='function')toggleTheme();else{state.theme=state.theme==='dark'?'light':'dark';localStorage.setItem('ott-theme',JSON.stringify(state.theme));}renderLoginPage()" type="button" aria-label="Toggle theme">
            ${svg(state.theme==='dark'?'sun':'moon')}
          </button>
        </div>
      </header>
      <main class="login-body-center">
        <div class="login-card">
          <div style="text-align:center;margin-bottom:24px">
            <h2 style="font-size:24px;margin-bottom:8px">
              ${authPageMode === 'login' ? (isEn ? 'Sign in to Arena' : 'Đăng nhập Arena') : (isEn ? 'Create an Account' : 'Đăng ký tài khoản mới')}
            </h2>
            <p class="muted small" style="margin:0">
              ${authPageMode === 'login' 
                ? (isEn ? 'Sign in to manage your bots and compete on the leaderboard' : 'Đăng nhập để quản lý bot của bạn và tham gia thi đấu xếp hạng') 
                : (isEn ? 'Create an account to upload bots and duel other players' : 'Tạo tài khoản để upload bot và thi đấu trực tiếp với người chơi khác')}
            </p>
          </div>

          <div class="login-tabs">
            <button type="button" class="login-tab-btn ${authPageMode === 'login' ? 'active' : ''}" onclick="switchAuthMode('login')">
              ${isEn ? 'Sign In' : 'Đăng nhập'}
            </button>
            <button type="button" class="login-tab-btn ${authPageMode === 'register' ? 'active' : ''}" onclick="switchAuthMode('register')">
              ${isEn ? 'Register' : 'Đăng ký tài khoản'}
            </button>
          </div>

          <div id="loginAlertBox" role="alert" aria-live="polite" style="display:none"></div>

          <form id="authForm" onsubmit="handleAuthSubmit(event)">
            <div class="form-group">
              <label class="form-label" for="loginUsername">${isEn ? 'Username' : 'Tên tài khoản (Username)'}</label>
              <input class="field" id="loginUsername" placeholder="${isEn ? 'e.g. player_one, pro_bot...' : 'ví dụ: player_one, pro_bot...'}" autocomplete="username" required autofocus>
              <div class="tiny muted" style="margin-top:5px">${isEn ? 'Lowercase letters, numbers or underscore (2-32 chars)' : 'Chữ thường, số hoặc dấu gạch dưới (2-32 ký tự)'}</div>
            </div>

            <div class="form-group">
              <label class="form-label" for="loginPassword">${isEn ? 'Password' : 'Mật khẩu (Password)'}</label>
              <input class="field" id="loginPassword" type="password" placeholder="${isEn ? 'Enter password...' : 'Nhập mật khẩu...'}" autocomplete="${authPageMode === 'login' ? 'current-password' : 'new-password'}" required>
            </div>

            ${authPageMode === 'register' ? `
            <p class="tiny muted">${isEn ? 'At least 12 chars with letters and numbers (max 72 bytes).' : 'Ít nhất 12 ký tự, có chữ và số; tối đa 72 byte UTF-8.'}</p>
            <div class="form-group">
              <label class="form-label" for="registerEmail">${isEn ? 'Email (optional)' : 'Email (tùy chọn)'}</label>
              <input class="field" id="registerEmail" type="email" autocomplete="email" maxlength="254">
            </div>
            <div class="form-group">
              <label class="form-label" for="loginPasswordConfirm">${isEn ? 'Confirm Password' : 'Xác nhận mật khẩu'}</label>
              <input class="field" id="loginPasswordConfirm" type="password" placeholder="${isEn ? 'Re-enter password...' : 'Nhập lại mật khẩu để xác nhận...'}" autocomplete="new-password" required>
            </div>` : ''}

            <button class="btn" id="loginSubmitBtn" type="submit" style="width:100%;padding:13px;font-size:14px;margin-top:10px;justify-content:center">
              ${authPageMode === 'login' ? (isEn ? 'Sign In Now →' : 'Đăng nhập ngay →') : (isEn ? 'Create Account & Sign In →' : 'Tạo tài khoản & Đăng nhập →')}
            </button>
          </form>

          <div style="margin-top:22px;text-align:center">
            <p class="tiny muted" style="margin:0">
              💡 ${authPageMode === 'login' 
                ? (isEn ? 'No account yet? <a href="javascript:void(0)" onclick="switchAuthMode(\'register\')" style="color:var(--accent);font-weight:700">Register here</a>' : 'Chưa có tài khoản? <a href="javascript:void(0)" onclick="switchAuthMode(\'register\')" style="color:var(--accent);font-weight:700">Đăng ký ngay tại đây</a>')
                : (isEn ? 'Already have an account? <a href="javascript:void(0)" onclick="switchAuthMode(\'login\')" style="color:var(--accent);font-weight:700">Sign in here</a>' : 'Đã có tài khoản? <a href="javascript:void(0)" onclick="switchAuthMode(\'login\')" style="color:var(--accent);font-weight:700">Đăng nhập tại đây</a>')}
            </p>
          </div>
        </div>
      </main>
    </div>
  `;
}

// ─── Header & Sidebar Auth UI Integration ─────────────────────────────────────
function injectTopNavAuth() {
  const actions = document.querySelector('.topactions');
  if (!actions) return;

  const oldWrap = document.getElementById('authUserWrap');
  if (oldWrap) oldWrap.remove();
  const oldBtn = document.getElementById('authNavBtn');
  if (oldBtn) oldBtn.remove();

  if (authState.username) {
    const wrap = document.createElement('div');
    wrap.id = 'authUserWrap';
    wrap.className = 'auth-user-dropdown-wrap';
    const initials = authState.username.slice(0, 2).toUpperCase();
    const isEn = (typeof state !== 'undefined' && state.lang === 'en');
    wrap.innerHTML = `
      <button class="btn sm secondary" id="authNavBtn" type="button" onclick="toggleUserMenu(event)">
        <span class="user-avatar-badge">${escapeHtml(initials)}</span>
        <span style="font-weight:700">${escapeHtml(authState.username)}</span>
        <span style="font-size:10px;opacity:0.7">▼</span>
      </button>
      <div class="auth-dropdown-menu" id="authDropdownMenu" style="display:none">
        <div class="auth-dropdown-header">
          <div style="font-weight:700;font-size:13px">${escapeHtml(authState.username)}</div>
          <div class="tiny muted">${escapeHtml(authState.role)}</div>
        </div>
        <button type="button" class="auth-dropdown-item" onclick="go('submit')">
          <span>⇧</span> ${isEn ? 'My Bots' : 'Bot của tôi'}
        </button>
        <button type="button" class="auth-dropdown-item" onclick="go('play')"><span>⚔</span> ${isEn ? 'Bot Duel' : 'Đấu bot'}</button>
        <button type="button" class="auth-dropdown-item" onclick="go('arena')">
          <span>⚔</span> ${isEn ? 'Match Arena' : 'Đấu trường Arena'}
        </button>
        <button type="button" class="auth-dropdown-item" onclick="go('account')">${isEn ? 'Account & Sessions' : 'Tài khoản & phiên đăng nhập'}</button>
        ${authState.role === 'ADMIN' ? `<button type="button" class="auth-dropdown-item" onclick="go('users')">${isEn ? 'User Management' : 'Quản lý tài khoản'}</button>` : ''}
        <div class="auth-dropdown-divider"></div>
        <button type="button" class="auth-dropdown-item danger" onclick="authLogout()">
          <span>🚪</span> ${isEn ? 'Sign Out' : 'Đăng xuất'}
        </button>
      </div>
    `;
    actions.prepend(wrap);
    if (typeof updateNavSliderState === 'function') {
      setTimeout(updateNavSliderState, 60);
    }
  }
}

function toggleUserMenu(event) {
  if (event) event.stopPropagation();
  const menu = document.getElementById('authDropdownMenu');
  if (menu) {
    menu.style.display = menu.style.display === 'none' ? 'flex' : 'none';
  }
}

function updateSidebarProfile() {
  const profileEl = document.querySelector('.side-profile');
  if (!profileEl) return;
  if (authState.username) {
    const initials = authState.username.slice(0, 2).toUpperCase();
    const isEn = (typeof state !== 'undefined' && state.lang === 'en');
    profileEl.innerHTML = `
      <span class="avatar" style="background:#5c4fff;color:#fff">${escapeHtml(initials)}</span>
      <div>
        <div class="strong small">${escapeHtml(authState.username)}</div>
        <div class="tiny muted">${isEn ? 'Signed in · Online' : 'Đã đăng nhập · Online'}</div>
      </div>
      <button class="iconbtn" title="${isEn ? 'Sign out' : 'Đăng xuất'}" style="width:26px;height:26px;margin-left:auto;font-size:12px" onclick="authLogout()">🚪</button>
    `;
  } else {
    const isEn = (typeof state !== 'undefined' && state.lang === 'en');
    profileEl.innerHTML = `
      <span class="avatar" style="background:#303839;color:#a9b6b1">?</span>
      <div>
        <div class="strong small">${isEn ? 'Guest' : 'Khách'}</div>
        <div class="tiny muted"><a href="javascript:void(0)" onclick="openLoginPage()" style="color:var(--accent);font-weight:700">${isEn ? 'Sign in' : 'Đăng nhập'}</a> ${isEn ? 'to compete' : 'để thi đấu'}</div>
      </div>
    `;
  }
}

async function authLogout() {
  try {
    await api.post('/auth/logout', {});
    clearAuth();
    const isEn = (typeof state !== 'undefined' && state.lang === 'en');
    notice(isEn ? 'Signed out and session revoked.' : 'Đã đăng xuất và thu hồi phiên đăng nhập.');
    go('overview');
  } catch (e) { 
    const isEn = (typeof state !== 'undefined' && state.lang === 'en');
    notice((isEn ? 'Could not sign out: ' : 'Chưa đăng xuất được: ') + e.message); 
  }
}

// ─── WebSocket real-time connection ───────────────────────────────────────────
let wsConn = null;
let wsReconnectTimer = null;

function connectWebSocket() {
  if (wsConn && wsConn.readyState < 2) return;
  const wsUrl = (location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host + '/ws';
  wsConn = new WebSocket(wsUrl);

  wsConn.onopen = () => {
    console.log('[WS] Connected to OTT Arena server');
    if (wsReconnectTimer) { clearTimeout(wsReconnectTimer); wsReconnectTimer = null; }
    updateWSIndicator(true);
  };

  wsConn.onmessage = (evt) => {
    try { handleWSMessage(JSON.parse(evt.data)); } catch (e) { console.warn('[WS] Parse error', e); }
  };

  wsConn.onclose = () => {
    updateWSIndicator(false);
    wsReconnectTimer = setTimeout(connectWebSocket, 3000);
  };

  wsConn.onerror = () => {};
}

function handleWSMessage(msg) {
  switch (msg.event) {
    case 'welcome':
      updateServerStats(msg);
      break;
    case 'match-queued':
      notice('Trận mới xếp hàng: ' + msg.match.a + ' vs ' + msg.match.b);
      void loadBackend();
      break;
    case 'match-started':
      if (msg.ownedBy && msg.ownedBy === authState.username) {
        notice('Trận của bạn đã bắt đầu: ' + msg.a + ' vs ' + msg.b + ' [' + msg.matchId + ']');
      }
      updateServerStats(msg);
      break;
    case 'match-finished': {
      const isMyMatch = msg.ownedBy && msg.ownedBy === authState.username;
      if (isMyMatch) {
        const resultTxt = msg.winner === 'p1' ? msg.a + ' thắng' : msg.winner === 'p2' ? msg.b + ' thắng' : 'Hòa';
        notice('Trận của bạn kết thúc! ' + resultTxt + ' (' + msg.reason + ')');
      }
      void loadBackend();
      if (wsWatchingMatch === msg.matchId) {
        wsWatchingMatch = null;
        if (msg.status === 'completed') {
          openServerMatch(msg.matchId).catch(() => {});
        } else {
          notice('Trận thất bại: ' + (msg.reason || 'lỗi không xác định'));
        }
      }
      break;
    }
  }
}

function updateWSIndicator(online) {
  const el = document.getElementById('wsStatusIndicator');
  if (!el) return;
  el.textContent = online ? 'Live' : 'Offline';
  el.style.color = online ? '#4ade80' : '#f87171';
}

function updateServerStats(msg) {
  const el = document.getElementById('activeJobsCount');
  if (el && msg.activeJobs !== undefined) el.textContent = msg.activeJobs + ' active / ' + (msg.pendingJobs || 0) + ' pending';
}

// ─── WebSocket-based match watching ───────────────────────────────────────────
let wsWatchingMatch = null;

async function waitForMatch(id) {
  if (wsConn && wsConn.readyState === 1) {
    wsWatchingMatch = id;
    notice('Đang chờ kết quả trận [' + id + '] qua WebSocket...');
    setTimeout(() => {
      if (wsWatchingMatch === id) {
        wsWatchingMatch = null;
        notice('Thời gian chờ quá lâu. Kiểm tra Match Arena.');
      }
    }, 300000);
  } else {
    try {
      for (let attempts = 0; attempts < 240; attempts++) {
        const match = await api.get('/matches/' + encodeURIComponent(id));
        if (match.status === 'completed') {
          await loadBackend();
          await openServerMatch(id);
          notice('Trận kết thúc: ' + match.reason);
          return;
        }
        if (match.status === 'failed') {
          await loadBackend();
          notice('Trận thất bại: ' + (match.error || match.reason));
          return;
        }
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      notice('Trận vẫn đang chạy. Kiểm tra Match Arena.');
    } catch (e) {
      notice('Lỗi theo dõi trận: ' + e.message);
    }
  }
}

// ─── Arena & Tournament Data Loading ──────────────────────────────────────────
let serverMatches = [];

async function loadBackend() {
  const generation = authGeneration;
  const requestId = ++backendLoadGeneration;
  const userId = authState.id;
  const stillCurrent = () => generation === authGeneration && requestId === backendLoadGeneration;
  try {
    const [sub, match, rank, matchStatus] = await Promise.all([
      authState.authenticated ? api.get('/submissions') : Promise.resolve([]),
      api.get('/matches'),
      api.get('/leaderboard'),
      api.get('/judge/status').catch(() => null)
    ]);
    if (!stillCurrent()) return;
    if (!Array.isArray(sub) || sub.some(s => !userId || s.userId !== userId)) {
      throw Error('Danh sách bài nộp không khớp tài khoản. Vui lòng đăng nhập lại.');
    }
    // Only an explicit server capability enables matchmaking; Docker availability alone is insufficient.
    state.challengeReady = matchStatus?.challengeReady === true;
    const realMatches = match.filter(m => m.mode === 'submitted');
    state.submissions = sub.map(s => ({
      ...s,
      botName: s.botName || s.name,
      date: new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
    }));
    serverMatches = realMatches;
    matches.splice(0, matches.length, ...realMatches.map(m => ({
      ...m,
      score: m.status === 'completed' ? (m.winner === 'p1' ? '1 – 0' : m.winner === 'p2' ? '0 – 1' : '0.5 – 0.5') : m.status,
      type: 'Bot match',
      time: new Date(m.createdAt).toLocaleString('en-US'),
      turns: m.turns || 0
    })));
    if (realMatches.length) {
      const completed = realMatches.find(m => m.status === 'completed');
      if (completed && (!realMatches.some(m => m.id === state.selectedMatch) || !replayCache[state.selectedMatch])) {
        state.selectedMatch = completed.id;
        try {
          replayCache[completed.id] = await api.get('/matches/' + encodeURIComponent(completed.id) + '/replay');
        } catch (e) {
          console.warn('Replay not loaded:', e.message);
        }
      }
    }
    if (!stillCurrent()) return;
    if (rank.length > 0) {
      players.splice(0, players.length, ...rank.map((p, i) => [
        String(i + 1).padStart(2, '0'),
        p.owner ? `${p.owner} • ${p.name}` : p.name,
        (p.owner || p.name).slice(0, 2).toUpperCase(),
        p.lang || 'Python',
        p.elo || 1200,
        p.change || (p.lastChange > 0 ? `+${p.lastChange}` : (p.lastChange < 0 ? `${p.lastChange}` : '0')),
        ['purple', 'blue', 'orange', 'pink'][i % 4],
        p.owner || null,
        p.name || null,
        1,
        p.wins || 0,
        p.losses || 0
      ]));
    } else if (sub.length > 0) {
      players.splice(0, players.length, ...sub.map((s, i) => [
        String(i + 1).padStart(2, '0'),
        authState.username ? `${authState.username} • ${s.name}` : s.name,
        (authState.username || s.name).slice(0, 2).toUpperCase(),
        s.lang || 'Python',
        1200,
        '0',
        ['purple', 'blue', 'orange', 'pink'][i % 4],
        authState.username || null,
        s.name || null,
        1,
        0,
        0
      ]));
    }

    try {
      const tourneys = await api.get('/tournaments');
      if (Array.isArray(tourneys)) {
        state.tournaments = tourneys;
        if (state.selectedTournamentId) {
          try {
            state.tournamentDetail = await api.get('/tournaments/' + encodeURIComponent(state.selectedTournamentId));
          } catch (te) {}
        }
      }
    } catch (te) {}

    state.serverOnline = true;
    state.dataStatus = 'ready';
    render();
  } catch (e) {
    if (!stillCurrent()) return;
    resetSubmissionState();
    state.serverOnline = false;
    state.dataStatus = 'error';
    render();
    console.warn('Backend unavailable:', e.message);
  }
}

buildReplay = function (id) { return replayCache[id] || null; };

async function openServerMatch(id) {
  try {
    state.playing = false;
    clearInterval(timer);
    const replay = await api.get('/matches/' + encodeURIComponent(id) + '/replay');
    replayCache[id] = replay;
    state.selectedMatch = id;
    state.play = 0;
    go('arena');
  } catch (e) {
    notice('Replay chưa sẵn sàng: ' + e.message);
  }
}

openMatch = function (id) {
  if (serverMatches.some(m => m.id === id)) return openServerMatch(id);
  state.selectedMatch = id;
  state.play = 0;
  state.playing = false;
  clearInterval(timer);
  go('arena');
};

async function createSubmittedMatch() {
  if (!authState.authenticated) {
    notice('Bạn cần đăng nhập trước khi tham gia trận đấu.');
    openLoginPage();
    return;
  }
  const submissionA = document.getElementById('submissionA')?.value;
  const submissionB = document.getElementById('submissionB')?.value;
  const maxMoves = Number(document.getElementById('duelMaxMoves')?.value || 200);
  const first = document.getElementById('duelFirst')?.value || 'Random';
  if (!submissionA || !submissionB || submissionA === submissionB) return notice('Chọn 2 bot khác nhau.');
  if (!Number.isInteger(maxMoves) || maxMoves < 1 || maxMoves > 1000) return notice('Move limit phải từ 1-1000.');
  try {
    const job = await api.post('/matches', { submissionA, submissionB, maxMoves, first, pieces: 6 });
    notice('Đang chạy trận đấu bot: ' + job.id);
    await loadBackend();
    await waitForMatch(job.id);
  } catch (e) {
    notice('Không thể bắt đầu trận: ' + e.message);
  }
}

async function challengeMatch() {
  const isEn = (typeof state !== 'undefined' && state.lang === 'en');
  if (!authState.authenticated) { openLoginPage(); return; }
  if (state.challengePending) return;
  if (!state.challengeReady || state.dataStatus !== 'ready') {
    notice(isEn ? 'Matchmaking not ready. Please try again shortly.' : 'Thi đấu hiện chưa sẵn sàng. Vui lòng thử lại sau.');
    return;
  }
  const myBot = document.getElementById('challengeBot')?.value;
  const ownBot = state.submissions.find(b => b.id === myBot && b.userId === authState.id);
  if (!ownBot) { notice(isEn ? 'Please choose a bot belonging to your account.' : 'Hãy chọn một bot thuộc tài khoản của bạn.'); return; }
  const maxMoves = Number(document.getElementById('challengeMaxMoves')?.value || 200);
  if (!Number.isInteger(maxMoves) || maxMoves < 1 || maxMoves > 1000) {
    notice(isEn ? 'Move limit must be between 1 and 1000.' : 'Giới hạn lượt phải từ 1 đến 1000.'); return;
  }
  const generation = authGeneration;
  state.challengeBotId = myBot;
  state.maxMoves = maxMoves;
  state.challengePending = true;
  render();
  try {
    const job = await api.post('/matches', {submissionA: myBot, maxMoves, pieces: 6, first: 'Random'});
    if (generation !== authGeneration) return;
    notice((isEn ? 'Match request queued: ' : 'Yêu cầu đã được tiếp nhận: ') + job.id);
    await loadBackend();
    if (generation !== authGeneration) return;
    await waitForMatch(job.id);
  } catch (e) {
    if (generation === authGeneration) notice((isEn ? 'Failed to create match: ' : 'Không thể tạo trận: ') + e.message);
  } finally {
    if (generation === authGeneration) { state.challengePending = false; render(); }
  }
}

// ─── Inject Custom Styles for Auth, Dropdown & Login Page ─────────────────────
function injectAuthStyles() {
  const style = document.createElement('style');
  style.id = 'ott-auth-custom-styles';
  style.textContent = `
    .toast { z-index: 100000 !important; }
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
      background: linear-gradient(135deg, #7c6fff, #ec6e9a);
      color: #fff;
      font-size: 11px;
      font-weight: 800;
      line-height: 1;
    }
    .auth-dropdown-menu {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      min-width: 200px;
      background: var(--bg-card);
      border: 1px solid var(--line);
      border-radius: 12px;
      box-shadow: 0 16px 40px rgba(0,0,0,0.35);
      padding: 8px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 3px;
      animation: authFadeIn 0.15s ease-out;
    }
    @keyframes authFadeIn {
      from { opacity: 0; transform: translateY(-6px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .auth-dropdown-header {
      padding: 8px 10px;
      border-bottom: 1px solid var(--line);
      margin-bottom: 4px;
      color: var(--text-title);
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
      color: var(--text-title);
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      text-align: left;
      transition: background 0.15s;
    }
    .auth-dropdown-item:hover {
      background: var(--bg-card-hover);
    }
    .auth-dropdown-item.danger {
      color: #f87171;
    }
    .auth-dropdown-item.danger:hover {
      background: rgba(248, 113, 113, 0.14);
    }
    .auth-dropdown-divider {
      height: 1px;
      background: var(--line);
      margin: 4px 0;
    }

    /* Login Page Styles */
    .login-page-wrap {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background: var(--bg-primary);
      color: var(--text-body);
    }
    .login-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 36px;
      border-bottom: 1px solid var(--line);
      background: var(--bg-secondary);
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
      background: var(--bg-card);
      border: 1px solid var(--line);
      border-radius: 18px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.35);
      padding: 34px 32px;
      position: relative;
    }
    .login-tabs {
      display: flex;
      gap: 6px;
      background: var(--bg-secondary);
      padding: 5px;
      border-radius: 11px;
      margin-bottom: 22px;
    }
    .login-tab-btn {
      flex: 1;
      padding: 10px;
      text-align: center;
      border-radius: 8px;
      border: none;
      background: transparent;
      color: var(--text-muted);
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
    }
    .login-tab-btn.active {
      background: var(--accent);
      color: #FFFFFF;
      box-shadow: 0 3px 10px rgba(0,0,0,0.25);
    }
    .login-alert {
      padding: 12px 14px;
      border-radius: 10px;
      font-size: 13px;
      margin-bottom: 18px;
      display: flex;
      align-items: center;
      gap: 10px;
      line-height: 1.45;
    }
    .login-alert.error {
      background: rgba(248, 113, 113, 0.15);
      border: 1px solid rgba(248, 113, 113, 0.4);
      color: #fca5a5;
    }
    .login-alert.success {
      background: rgba(74, 222, 128, 0.15);
      border: 1px solid rgba(74, 222, 128, 0.4);
      color: #86efac;
    }
  `;
  document.head.appendChild(style);
}

// Close user menu when clicking outside
document.addEventListener('click', (e) => {
  const menu = document.getElementById('authDropdownMenu');
  const btn = document.getElementById('authNavBtn');
  if (menu && menu.style.display !== 'none' && (!btn || !btn.contains(e.target))) {
    menu.style.display = 'none';
  }
});

// ─── Initialization & Render Patching ─────────────────────────────────────────
// Registration follows the organizer's server-side setting.
const originalLoginRender = renderLoginPage;
renderLoginPage = function() {
  if (!registrationOpen) authPageMode = 'login';
  originalLoginRender();
  if (!registrationOpen) {
    document.querySelector('.login-tabs')?.remove();
    const footer = document.querySelector('.login-card > div[style*="margin-top:22px"]');
    if (footer) footer.textContent = 'Đăng ký đang đóng. Liên hệ Ban tổ chức để được cấp tài khoản.';
  }
};
async function restoreAuth() {
  try { registrationOpen = (await api.get('/auth/config')).registrationOpen === true; }
  catch { registrationOpen = false; }
  try { saveAuth(await api.get('/auth/me')); }
  catch (e) { if (e.status === 401) clearAuth(); }
  if (state.page === 'login') renderLoginPage();
  else { injectTopNavAuth(); updateSidebarProfile(); }
}

let accountRenderVersion = 0;
let accountListPage = 1;
let accountSearch = '';
function accountError(message) {
  const el = document.getElementById('accountMessage');
  if (el) el.textContent = message;
}
async function renderAccountPage(force = false) {
  const version = ++accountRenderVersion;
  const page = state.page;
  if (!force && document.getElementById('accountPage')?.dataset.page === page) return;
  if (typeof applyTheme === 'function') applyTheme(state.theme);
  else {
    document.documentElement.className = state.theme === 'light' ? 'light' : '';
    document.documentElement.setAttribute('data-theme', state.theme);
  }
  const isEn = (typeof state !== 'undefined' && state.lang === 'en');
  document.getElementById('app').innerHTML = `
    <div class="login-page-wrap"><header class="login-header" style="flex-wrap:wrap;gap:12px">
      <strong>OTT ARENA · ${page === 'users' ? (isEn ? 'User Management' : 'Quản lý tài khoản') : (isEn ? 'Account' : 'Tài khoản')}</strong>
      <div style="display:flex;align-items:center;gap:10px">
        <button class="lang-toggle-btn" title="${isEn ? 'Switch language (VI / EN)' : 'Chuyển đổi ngôn ngữ (VI / EN)'}" onclick="toggleLang();renderAccountPage(true)" type="button" aria-label="Toggle language">
          <span class="lang-tag ${!isEn?'active':''}">VI</span>
          <span class="lang-sep">/</span>
          <span class="lang-tag ${isEn?'active':''}">EN</span>
        </button>
        <button class="btn sm secondary" onclick="go('overview')">${isEn ? '← Main Page' : '← Trang chính'}</button>
      </div>
    </header><main id="accountPage" data-page="${page}" style="width:min(960px,100%);margin:auto;padding:20px;box-sizing:border-box;overflow-wrap:anywhere">
      <p id="accountMessage" role="status" aria-live="polite">${isEn ? 'Loading...' : 'Đang tải...'}</p><div id="accountContent"></div>
    </main></div>`;
  try {
    const user = await api.get('/auth/me'); saveAuth(user);
    let body = '';
    if (page === 'users') {
      if (user.role !== 'ADMIN') throw Error('Chỉ Admin được quản lý tài khoản.');
      const data = await api.get('/admin/users?page=' + accountListPage + '&q=' + encodeURIComponent(accountSearch));
      body = `<form onsubmit="event.preventDefault();accountSearch=document.getElementById('accountSearch').value;accountListPage=1;void renderAccountPage(true)" style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px">
        <label for="accountSearch">Tìm username</label><input class="field" id="accountSearch" value="${escapeHtml(accountSearch)}" maxlength="32"><button class="btn sm">Tìm kiếm</button></form>
        <p>${data.total} tài khoản · Trang ${data.page}</p>
        ${data.users.length ? data.users.map(u => `<section class="card" style="padding:16px;margin-bottom:12px">
          <strong>${escapeHtml(u.username)}</strong> · ${u.isActive ? 'Đang hoạt động' : 'Đã khóa'}
          <p class="tiny muted">${escapeHtml(u.email || 'Chưa có email')}</p>
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
            <label for="role-${u.id}">Vai trò</label><select class="field" id="role-${u.id}" style="width:auto" ${u.id === user.id ? 'disabled' : ''}>
              ${['STUDENT','JUDGE','ADMIN'].map(r => `<option ${r === u.role ? 'selected' : ''}>${r}</option>`).join('')}</select>
            <button class="btn sm secondary" ${u.id === user.id ? 'disabled' : ''} onclick="changeAccount(this,'${u.id}','role',document.getElementById('role-${u.id}').value)">Lưu quyền</button>
            <button class="btn sm secondary" ${u.id === user.id ? 'disabled' : ''} onclick="changeAccount(this,'${u.id}','status',${!u.isActive})">${u.isActive ? 'Khóa' : 'Mở khóa'}</button>
          </div></section>`).join('') : '<p>Không tìm thấy tài khoản.</p>'}
        <div style="display:flex;gap:8px"><button class="btn sm secondary" ${data.page <= 1 ? 'disabled' : ''} onclick="accountListPage--;void renderAccountPage(true)">← Trước</button>
        <button class="btn sm secondary" ${data.page * data.pageSize >= data.total ? 'disabled' : ''} onclick="accountListPage++;void renderAccountPage(true)">Sau →</button></div>`;
    } else {
      const sessions = await api.get('/auth/sessions');
      body = `<section class="card" style="padding:20px;margin-bottom:20px"><h2>${escapeHtml(user.username)}</h2><p>Vai trò: ${escapeHtml(user.role)}</p>
        <form onsubmit="saveProfile(event)" style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
          <label for="profileEmail">Email (chưa xác minh)</label><input class="field" id="profileEmail" type="email" autocomplete="email" maxlength="254" value="${escapeHtml(user.email || '')}">
          <button class="btn sm">Lưu hồ sơ</button></form></section>
        <h2>Phiên đăng nhập</h2><p class="muted small">Thu hồi phiên sẽ yêu cầu thiết bị đó đăng nhập lại.</p>
        ${sessions.map(s => `<section class="card" style="padding:16px;margin-bottom:12px">
          <strong>${s.current ? 'Thiết bị hiện tại' : 'Phiên khác'}</strong>
          <p class="tiny muted">Đăng nhập: ${escapeHtml(new Date(s.createdAt).toLocaleString('vi-VN'))} · Hết hạn: ${escapeHtml(new Date(s.expiresAt).toLocaleString('vi-VN'))}</p>
          <button class="btn sm secondary" onclick="revokeAccountSession(this,'${s.id}',${s.current})">${s.current ? 'Đăng xuất thiết bị này' : 'Thu hồi phiên'}</button></section>`).join('')}`;
    }
    if (version !== accountRenderVersion || state.page !== page) return;
    document.getElementById('accountContent').innerHTML = body;
    accountError('');
  } catch (e) {
    if (version === accountRenderVersion && state.page === page) accountError(e.message);
  }
}
async function saveProfile(event) {
  event.preventDefault();
  const button = event.target.querySelector('button'); button.disabled = true;
  try {
    saveAuth(await api.call('/users/me', {method:'PATCH', body:JSON.stringify({email:document.getElementById('profileEmail').value || null})}));
    accountError('Đã lưu hồ sơ. Email chưa được xác minh.');
  } catch (e) { accountError(e.message); }
  finally { button.disabled = false; }
}
async function changeAccount(button, id, action, value) {
  button.disabled = true;
  try {
    await api.call('/admin/users/' + id + '/' + action, {method:'PATCH', body:JSON.stringify(action === 'role' ? {role:value} : {isActive:value})});
    await renderAccountPage(true);
    accountError('Đã cập nhật. Các phiên cũ của tài khoản đã được thu hồi.');
  } catch (e) { accountError(e.message); button.disabled = false; }
}
async function revokeAccountSession(button, id, current) {
  button.disabled = true;
  try {
    await api.call('/auth/sessions/' + id, {method:'DELETE'});
    if (current) { clearAuth(); go('overview'); }
    else await renderAccountPage(true);
  } catch (e) { accountError(e.message); button.disabled = false; }
}

function setupAuthIntegration() {
  injectAuthStyles();

  // Patch global render function to support dedicated login page and inject navbar auth
  const _origRender = render;
  render = function() {
    if (state.page === 'login') { renderLoginPage(); return; }
    if (state.page === 'account' || state.page === 'users') { void renderAccountPage(); return; }
    _origRender();
    injectTopNavAuth();
    updateSidebarProfile();
  };

  if (state.page === 'login') {
    renderLoginPage();
  } else {
    injectTopNavAuth();
    updateSidebarProfile();
  }

  void restoreAuth().then(() => loadBackend());
  connectWebSocket();
}



if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', setupAuthIntegration);
} else {
  setupAuthIntegration();
}