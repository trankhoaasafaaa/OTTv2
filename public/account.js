'use strict';

const element = id => document.getElementById(id);

let currentUser = null;
let page = 1;
let search = '';
let usersRequestVersion = 0;

function showMessage(message) {
  element('message').textContent = message;
}

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

function applyTheme() {
  let theme = 'dark';

  try {
    theme = JSON.parse(
      localStorage.getItem('ott-theme') || '"dark"'
    );
  } catch {}

  document.documentElement.className =
    theme === 'light' ? 'light' : '';
  document.documentElement.setAttribute('data-theme', theme);
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) metaTheme.setAttribute('content', theme === 'light' ? '#F5EFE6' : '#0B130E');
}

async function request(path, method = 'GET', body) {
  const response = await fetch('/api' + path, {
    method,
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      'X-OTT-Request': '1'
    },
    ...(body === undefined
      ? {}
      : { body: JSON.stringify(body) })
  });

  const value = await response.json();

  if (response.status === 401) {
    element('profileSection').hidden = true;
    element('sessionsSection').hidden = true;
    element('adminSection').hidden = true;

    throw Error(
      'Phiên đã hết hiệu lực. Hãy trở về trang chính để đăng nhập.'
    );
  }

  if (!response.ok) {
    throw Error(value.error || 'Yêu cầu thất bại');
  }

  return value;
}

async function loadSessions() {
  const sessions = await request('/auth/sessions');

  element('sessionList').innerHTML = sessions.length
    ? sessions.map(session => `
      <article class="card" style="margin-bottom:12px">
        <div style="padding:16px">
          <strong>
            ${session.current
              ? 'Thiết bị hiện tại'
              : 'Phiên khác'}
          </strong>

          <p>
            Đăng nhập:
            ${escapeHtml(
              new Date(session.createdAt)
                .toLocaleString('vi-VN')
            )}
          </p>

          <p>
            Hết hạn:
            ${escapeHtml(
              new Date(session.expiresAt)
                .toLocaleString('vi-VN')
            )}
          </p>

          <button
            class="btn secondary"
            type="button"
            data-session-id="${escapeHtml(session.id)}"
            data-current="${session.current}"
          >
            ${session.current
              ? 'Đăng xuất thiết bị này'
              : 'Thu hồi phiên'}
          </button>
        </div>
      </article>
    `).join('')
    : '<p>Không có phiên đang hoạt động.</p>';
}

async function loadUsers() {
  const version = ++usersRequestVersion;

  const data = await request(
    '/admin/users?page=' + page +
    '&q=' + encodeURIComponent(search)
  );

  if (version !== usersRequestVersion) return;

  element('usersSummary').textContent =
    `${data.total} tài khoản · Trang ${data.page}`;

  element('previousPage').disabled = data.page <= 1;

  element('nextPage').disabled =
    data.page * data.pageSize >= data.total;

  element('userList').innerHTML = data.users.length
    ? data.users.map(user => {
        const isSelf = user.id === currentUser.id;

        return `
          <article class="card" style="margin-bottom:12px">
            <div style="padding:16px">
              <strong>
                ${escapeHtml(user.username)}
              </strong>

              <p>
                ${user.isActive
                  ? 'Đang hoạt động'
                  : 'Đã khóa'}
              </p>

              <p class="small">
                ID: ${escapeHtml(user.id)}
              </p>

              <p>
                ${escapeHtml(user.email || 'Chưa có email')}
              </p>

              <div
                style="
                  display:flex;
                  gap:8px;
                  align-items:center;
                  flex-wrap:wrap;
                "
              >
                <label>
                  Vai trò

                  <select
                    class="field"
                    data-role-select
                    ${isSelf ? 'disabled' : ''}
                  >
                    ${['STUDENT', 'JUDGE', 'ADMIN']
                      .map(role => `
                        <option
                          value="${role}"
                          ${role === user.role
                            ? 'selected'
                            : ''}
                        >
                          ${role}
                        </option>
                      `).join('')}
                  </select>
                </label>

                <button
                  class="btn secondary"
                  type="button"
                  data-user-id="${escapeHtml(user.id)}"
                  data-action="role"
                  ${isSelf ? 'disabled' : ''}
                >
                  Lưu quyền
                </button>

                <button
                  class="btn secondary"
                  type="button"
                  data-user-id="${escapeHtml(user.id)}"
                  data-action="status"
                  data-active="${user.isActive}"
                  ${isSelf ? 'disabled' : ''}
                >
                  ${user.isActive ? 'Khóa' : 'Mở khóa'}
                </button>
              </div>
            </div>
          </article>
        `;
      }).join('')
    : '<p>Không tìm thấy tài khoản.</p>';
}

element('profileForm').addEventListener(
  'submit',
  async event => {
    event.preventDefault();

    const button =
      event.target.querySelector('button');

    button.disabled = true;

    try {
      currentUser = await request(
        '/users/me',
        'PATCH',
        {
          email: element('profileEmail').value || null
        }
      );

      showMessage(
        'Đã lưu hồ sơ. Email hiện chưa được xác minh.'
      );
    } catch (error) {
      showMessage(error.message);
    } finally {
      button.disabled = false;
    }
  }
);

element('logoutButton').addEventListener(
  'click',
  async event => {
    const button = event.currentTarget;
    button.disabled = true;

    try {
      await request('/auth/logout', 'POST', {});
      location.href = '/';
    } catch (error) {
      showMessage(error.message);
      button.disabled = false;
    }
  }
);

element('sessionList').addEventListener(
  'click',
  async event => {
    const button = event.target.closest(
      '[data-session-id]'
    );

    if (!button || button.disabled) return;

    button.disabled = true;

    try {
      await request(
        '/auth/sessions/' +
        encodeURIComponent(button.dataset.sessionId),
        'DELETE'
      );

      if (button.dataset.current === 'true') {
        location.href = '/';
        return;
      }

      await loadSessions();
      showMessage('Đã thu hồi phiên.');
    } catch (error) {
      showMessage(error.message);
      button.disabled = false;
    }
  }
);

element('searchForm').addEventListener(
  'submit',
  async event => {
    event.preventDefault();

    search = element('searchUsername').value.trim();
    page = 1;

    const button =
      event.target.querySelector('button');

    button.disabled = true;

    try {
      await loadUsers();
      showMessage('');
    } catch (error) {
      showMessage(error.message);
    } finally {
      button.disabled = false;
    }
  }
);

element('previousPage').addEventListener(
  'click',
  async event => {
    const oldPage = page;

    event.currentTarget.disabled = true;
    page = Math.max(1, page - 1);

    try {
      await loadUsers();
    } catch (error) {
      page = oldPage;
      showMessage(error.message);
      element('previousPage').disabled = page <= 1;
    }
  }
);

element('nextPage').addEventListener(
  'click',
  async event => {
    const oldPage = page;

    event.currentTarget.disabled = true;
    page += 1;

    try {
      await loadUsers();
    } catch (error) {
      page = oldPage;
      showMessage(error.message);
      element('nextPage').disabled = false;
    }
  }
);

element('userList').addEventListener(
  'click',
  async event => {
    const button = event.target.closest('[data-action]');

    if (!button || button.disabled) return;

    const action = button.dataset.action;
    const userId = button.dataset.userId;

    const body = action === 'role'
      ? {
          role: button.closest('article')
            .querySelector('[data-role-select]').value
        }
      : {
          isActive: button.dataset.active !== 'true'
        };

    button.disabled = true;

    try {
      await request(
        '/admin/users/' +
        encodeURIComponent(userId) +
        '/' + action,
        'PATCH',
        body
      );

      await loadUsers();

      showMessage(
        'Đã cập nhật tài khoản và thu hồi các phiên cũ.'
      );
    } catch (error) {
      showMessage(error.message);
      button.disabled = false;
    }
  }
);

element('staffForm').addEventListener(
  'submit',
  async event => {
    event.preventDefault();

    const button =
      event.target.querySelector('button');

    button.disabled = true;

    try {
      const tournamentId =
        element('staffTournamentId').value.trim();

      const userId =
        element('staffJudgeId').value.trim();

      await request(
        '/admin/tournaments/' +
        encodeURIComponent(tournamentId) +
        '/staff',
        'POST',
        { userId }
      );

      showMessage(
        'Đã phân công Judge vào giải và ghi nhật ký.'
      );
    } catch (error) {
      showMessage(error.message);
    } finally {
      button.disabled = false;
    }
  }
);

element('themeButton').addEventListener('click', () => {
  const nextTheme =
    document.documentElement.classList.contains('light')
      ? 'dark'
      : 'light';

  localStorage.setItem(
    'ott-theme',
    JSON.stringify(nextTheme)
  );

  applyTheme();
});

async function main() {
  applyTheme();

  currentUser = await request('/auth/me');

  element('accountName').textContent =
    currentUser.username;

  element('accountRole').textContent =
    'Vai trò: ' + currentUser.role;

  element('profileEmail').value =
    currentUser.email || '';

  element('profileSection').hidden = false;
  element('sessionsSection').hidden = false;

  await loadSessions();

  if (currentUser.role === 'ADMIN') {
    element('adminSection').hidden = false;

    await loadUsers();

    if (location.hash === '#admin') {
      element('admin').scrollIntoView();
    }
  }

  showMessage('');
}

main().catch(error => {
  showMessage(error.message);
});