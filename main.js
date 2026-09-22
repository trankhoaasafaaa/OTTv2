// ============================================================
//  RPS Tactics — main.js
//  Multiplayer via PeerJS (WebRTC P2P), no external backend needed
//  Lobby via Firebase Realtime Database
// ============================================================

// ============================================================
//  FIREBASE CONFIG — Điền thông tin Firebase project của bạn vào đây
//  Xem hướng dẫn: https://firebase.google.com/docs/web/setup
// ============================================================
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getDatabase, ref, set, remove, onValue, off, serverTimestamp, onDisconnect }
  from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js';

const FIREBASE_CONFIG = {
  apiKey:            "PASTE_YOUR_API_KEY",
  authDomain:        "PASTE_YOUR_AUTH_DOMAIN",
  databaseURL:       "PASTE_YOUR_DATABASE_URL",   // ← bắt buộc cho Realtime DB
  projectId:         "PASTE_YOUR_PROJECT_ID",
  storageBucket:     "PASTE_YOUR_STORAGE_BUCKET",
  messagingSenderId: "PASTE_YOUR_SENDER_ID",
  appId:             "PASTE_YOUR_APP_ID"
};

let firebaseApp = null;
let db = null;
let myRoomRef = null;
let lobbyUnsubscribe = null;

function initFirebase() {
  try {
    firebaseApp = initializeApp(FIREBASE_CONFIG);
    db = getDatabase(firebaseApp);
    startLobbyListener();
  } catch (e) {
    console.warn('Firebase không khả dụng:', e.message);
    setLobbyStatus('⚠️ Lobby offline (chưa cấu hình Firebase)', 'warn');
  }
}

// ============================================================
//  CONSTANTS
// ============================================================
const ROWS = 8, COLS = 8;
const ICONS = { rock: '✊', paper: '✋', scissors: '✌️' };
const P1_VICTORY = { r: 0, c: 7 }; // h8
const P2_VICTORY = { r: 7, c: 0 }; // a1
const TYPES = ['rock', 'paper', 'scissors'];
const LOBBY_TTL_MS = 10 * 60 * 1000; // 10 phút

// ---- Utilities ----
function canBeat(a, d) {
  return (a === 'rock' && d === 'scissors') ||
         (a === 'scissors' && d === 'paper') ||
         (a === 'paper' && d === 'rock');
}

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 5; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function createInitialBoard(pieceCount = 6) {
  const board = Array(ROWS).fill(null).map(() => Array(COLS).fill(null));
  const cells = [];
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      if (r > c) cells.push({ r, c });

  // Fisher-Yates shuffle
  for (let i = cells.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cells[i], cells[j]] = [cells[j], cells[i]];
  }

  for (let i = 0; i < Math.min(pieceCount, cells.length); i++) {
    const { r, c } = cells[i];
    const type = TYPES[Math.floor(Math.random() * TYPES.length)];
    board[r][c] = { owner: 'p1', type };
    board[c][r] = { owner: 'p2', type }; // symmetric
  }
  return board;
}

// ---- Game State ----
let gameState = { board: null, turn: 'p1', winner: null };
let selectedPiece = null;
let localTeam = 'p1';  // 'p1' | 'p2' | 'spectator'
let gameMode = null;    // 'local' | 'online' | 'spectator'

// ---- PeerJS ----
let peer = null;
let conn = null;                     // connection tới đối thủ (host↔guest)
const spectatorConns = new Map();    // host quản lý các spectator connections

// ---- DOM ----
const startScreen    = document.getElementById('start-screen');
const gameContainer  = document.getElementById('game-container');
const boardEl        = document.getElementById('board');
const statusEl       = document.getElementById('status');
const resetBtn       = document.getElementById('reset-btn');
const backBtn        = document.getElementById('back-btn');
const pieceCountEl   = document.getElementById('piece-count');
const pieceCountStartEl = document.getElementById('piece-count-start');
const onlineBadge    = document.getElementById('online-badge');
const spectatorBadge = document.getElementById('spectator-badge');

// Start screen elements
const btnLocal   = document.getElementById('btn-local');
const btnHost    = document.getElementById('btn-host');
const btnJoin    = document.getElementById('btn-join');
const hostUi     = document.getElementById('host-ui');
const roomCodeEl = document.getElementById('room-code');
const copyBtn    = document.getElementById('btn-copy-code');
const joinInput  = document.getElementById('join-input');
const connStatus = document.getElementById('connection-status');

// Lobby elements
const lobbyList     = document.getElementById('lobby-list');
const lobbyEmpty    = document.getElementById('lobby-empty');
const lobbyStatusEl = document.getElementById('lobby-status');

// ============================================================
//  START SCREEN LOGIC
// ============================================================
btnLocal.addEventListener('click', () => {
  gameMode = 'local';
  localTeam = 'p1';
  startGame(parseInt(pieceCountStartEl.value) || 6);
});

btnHost.addEventListener('click', () => {
  setStatus('Đang tạo phòng...', '');
  hostUi.classList.remove('hidden');
  btnHost.disabled = true;

  const code = generateCode();
  roomCodeEl.textContent = code;
  initPeer(code.toLowerCase(), null);
});

btnJoin.addEventListener('click', () => {
  const code = joinInput.value.trim().toUpperCase();
  if (code.length < 3) { setStatus('Nhập mã phòng hợp lệ!', 'error'); return; }
  setStatus('Đang kết nối...', '');
  initPeer(null, code);
});

copyBtn.addEventListener('click', () => {
  navigator.clipboard.writeText(roomCodeEl.textContent).then(() => {
    copyBtn.textContent = '✅ Đã copy!';
    setTimeout(() => { copyBtn.textContent = '📋 Copy mã'; }, 2000);
  });
});

joinInput.addEventListener('input', () => {
  joinInput.value = joinInput.value.toUpperCase();
});

function setStatus(msg, type = '') {
  connStatus.textContent = msg;
  connStatus.className = 'status-msg' + (type ? ' ' + type : '');
}

function setLobbyStatus(msg, type = '') {
  lobbyStatusEl.textContent = msg;
  lobbyStatusEl.className = 'lobby-status-msg' + (type ? ' ' + type : '');
}

// ============================================================
//  FIREBASE LOBBY
// ============================================================
function registerRoom(code, pieceCount) {
  if (!db) return;
  myRoomRef = ref(db, `rooms/${code.toLowerCase()}`);
  const roomData = {
    code: code.toUpperCase(),
    status: 'waiting',
    players: 1,
    pieceCount,
    moveCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  set(myRoomRef, roomData);
  // Tự động xóa khi Host disconnect
  onDisconnect(myRoomRef).remove();
}

function updateRoomStatus(status, extraData = {}) {
  if (!db || !myRoomRef) return;
  set(myRoomRef, {
    ...extraData,
    status,
    updatedAt: serverTimestamp()
  }).catch(() => {});
}

function updateRoomPlayers(count) {
  if (!db || !myRoomRef) return;
  import('https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js')
    .then(({ update }) => update(myRoomRef, { players: count, updatedAt: serverTimestamp() }))
    .catch(() => {});
}

function removeRoom() {
  if (myRoomRef) {
    remove(myRoomRef).catch(() => {});
    myRoomRef = null;
  }
}

function incrementMoveCount() {
  if (!db || !myRoomRef || !gameState) return;
  let p1c = 0, p2c = 0;
  gameState.board.forEach(row => row.forEach(cell => {
    if (cell?.owner === 'p1') p1c++;
    if (cell?.owner === 'p2') p2c++;
  }));
  import('https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js')
    .then(({ update }) => update(myRoomRef, {
      moveCount: (gameState._moveCount || 0),
      p1Pieces: p1c,
      p2Pieces: p2c,
      updatedAt: serverTimestamp()
    })).catch(() => {});
}

function startLobbyListener() {
  if (!db) return;
  const roomsRef = ref(db, 'rooms');
  onValue(roomsRef, (snapshot) => {
    const rooms = snapshot.val() || {};
    renderLobby(rooms);
  });
}

function renderLobby(rooms) {
  // Xóa tất cả card phòng cũ (giữ lại empty notice)
  Array.from(lobbyList.querySelectorAll('.lobby-card')).forEach(el => el.remove());

  const entries = Object.values(rooms).filter(r => r && r.code);

  if (entries.length === 0) {
    lobbyEmpty.classList.remove('hidden');
    return;
  }
  lobbyEmpty.classList.add('hidden');

  entries.forEach(room => {
    const card = buildRoomCard(room);
    lobbyList.appendChild(card);
  });
}

function buildRoomCard(room) {
  const card = document.createElement('div');
  card.className = 'lobby-card';

  const isPlaying = room.status === 'playing';
  const isFinished = room.status === 'finished';

  const statusBadge = isFinished
    ? `<span class="room-badge badge-finished">🏁 Kết thúc</span>`
    : isPlaying
      ? `<span class="room-badge badge-playing"><span class="live-dot"></span>Đang chơi</span>`
      : `<span class="room-badge badge-waiting"><span class="dot"></span>Chờ người</span>`;

  const moves = room.moveCount ? `<span class="room-meta">⚡ ${room.moveCount} nước</span>` : '';
  const pieces = room.p1Pieces !== undefined
    ? `<span class="room-meta">🔵 ${room.p1Pieces} &nbsp;🔴 ${room.p2Pieces}</span>`
    : '';

  card.innerHTML = `
    <div class="room-card-header">
      <span class="room-code-label">${room.code}</span>
      ${statusBadge}
    </div>
    <div class="room-card-meta">
      <span class="room-meta">👥 ${room.players || 1}/2</span>
      ${moves}
      ${pieces}
    </div>
    <button class="btn-spectate" data-code="${room.code.toLowerCase()}">
      👁 Quan sát
    </button>
  `;

  card.querySelector('.btn-spectate').addEventListener('click', () => {
    spectateRoom(room.code.toLowerCase());
  });

  return card;
}

// ============================================================
//  PEERJS NETWORKING
// ============================================================
function initPeer(myId, targetId) {
  peer = new Peer(myId);

  peer.on('open', (id) => {
    if (targetId === null) {
      // HOST mode
      gameMode = 'online';
      localTeam = 'p1';
      setStatus('Đã tạo phòng! Đang chờ người chơi...', '');
      const code = roomCodeEl.textContent;
      const pieceCount = parseInt(pieceCountStartEl.value) || 6;
      registerRoom(code, pieceCount);

      peer.on('connection', (connection) => {
        const isSpectator = connection.metadata?.role === 'spectator';

        if (isSpectator) {
          // Xử lý spectator connection
          handleSpectatorConnection(connection);
        } else {
          // Guest player
          conn = connection;
          setupConnection();
          setStatus('', '');
          startGame(parseInt(pieceCountStartEl.value) || 6, false);
          // Cập nhật lobby
          updateRoomPlayers(2);
          updateRoomStatusOnline('playing');
          conn.on('open', () => {
            sendState(gameState);
          });
        }
      });
    } else {
      // GUEST / JOIN mode
      gameMode = 'online';
      localTeam = 'p2';
      conn = peer.connect(targetId.toLowerCase());
      setupConnection();
    }
  });

  peer.on('error', (err) => {
    setStatus('Lỗi kết nối: ' + err.type, 'error');
    btnHost.disabled = false;
    roomCodeEl.textContent = '---';
    hostUi.classList.add('hidden');
  });
}

function updateRoomStatusOnline(status) {
  if (!db || !myRoomRef || !gameState) return;
  import('https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js')
    .then(({ update }) => update(myRoomRef, { status, updatedAt: serverTimestamp() }))
    .catch(() => {});
}

function setupConnection() {
  conn.on('open', () => {
    if (localTeam === 'p2') {
      setStatus('', '');
      startScreen.classList.add('hidden');
      gameContainer.classList.remove('hidden');
      onlineBadge.classList.remove('hidden');
      statusEl.textContent = '⏳ Đang chờ host khởi động...';
      statusEl.style.color = '#fbbf24';
    }
  });

  conn.on('data', (data) => {
    if (data.type === 'state') {
      applyState(data.payload);
    }
  });

  conn.on('close', () => {
    if (gameContainer.classList.contains('hidden')) return;
    statusEl.textContent = '⚠️ Đối thủ đã ngắt kết nối.';
    statusEl.style.color = '#fbbf24';
  });

  conn.on('error', (err) => {
    setStatus('Lỗi kết nối: ' + err, 'error');
  });
}

// ---- Spectator connections (managed by Host) ----
function handleSpectatorConnection(connection) {
  spectatorConns.set(connection.peer, connection);

  connection.on('open', () => {
    // Gửi state hiện tại ngay cho spectator
    if (gameState?.board) {
      connection.send({ type: 'state', payload: gameState });
    }
  });

  connection.on('close', () => {
    spectatorConns.delete(connection.peer);
  });

  connection.on('error', () => {
    spectatorConns.delete(connection.peer);
  });
}

// ---- Spectate a room ----
function spectateRoom(roomCode) {
  setLobbyStatus('Đang kết nối để quan sát...', '');
  gameMode = 'spectator';
  localTeam = 'spectator';
  peer = new Peer();

  peer.on('open', () => {
    const spectConn = peer.connect(roomCode.toLowerCase(), {
      metadata: { role: 'spectator' }
    });

    spectConn.on('open', () => {
      setLobbyStatus('', '');
      startScreen.classList.add('hidden');
      gameContainer.classList.remove('hidden');
      spectatorBadge.classList.remove('hidden');
      resetBtn.style.display = 'none';
      pieceCountEl.disabled = true;
      statusEl.textContent = '👁 Đang quan sát...';
      statusEl.style.color = '#a78bfa';
    });

    spectConn.on('data', (data) => {
      if (data.type === 'state') {
        applyState(data.payload);
        // Overwrite status for spectator
        if (!gameState?.winner) {
          const turn = gameState.turn;
          const who = turn === 'p1' ? 'Player 1 (Xanh)' : 'Player 2 (Đỏ)';
          statusEl.textContent = `👁 Lượt của ${who}`;
          statusEl.style.color = turn === 'p1' ? 'var(--p1-color)' : 'var(--p2-color)';
        }
      }
    });

    spectConn.on('close', () => {
      statusEl.textContent = '⚠️ Phòng đã đóng hoặc ván kết thúc.';
      statusEl.style.color = '#fbbf24';
    });

    spectConn.on('error', () => {
      setLobbyStatus('Không thể kết nối để quan sát.', 'warn');
      gameMode = null;
      localTeam = 'p1';
      startScreen.classList.remove('hidden');
      gameContainer.classList.add('hidden');
    });
  });

  peer.on('error', (err) => {
    setLobbyStatus('Lỗi: ' + err.type, 'warn');
    gameMode = null;
    localTeam = 'p1';
  });
}

function sendState(state) {
  // Gửi cho guest player
  if (conn && conn.open) {
    conn.send({ type: 'state', payload: state });
  }
  // Gửi cho tất cả spectators
  spectatorConns.forEach((sc) => {
    if (sc.open) sc.send({ type: 'state', payload: state });
  });
}

// ============================================================
//  GAME LOGIC
// ============================================================
function startGame(pieceCount, broadcast = false) {
  const count = Math.max(1, Math.min(28, pieceCount));
  gameState = {
    board: createInitialBoard(count),
    turn: 'p1',
    winner: null,
    _moveCount: 0
  };
  selectedPiece = null;
  pieceCountEl.value = count;

  startScreen.classList.add('hidden');
  gameContainer.classList.remove('hidden');

  if (gameMode === 'online') {
    onlineBadge.classList.remove('hidden');
  }

  if (broadcast && gameMode === 'online') {
    sendState(gameState);
  }

  renderBoard();
  updateStatus();
}

function applyState(state) {
  gameState = state;
  selectedPiece = null;
  if (gameContainer.classList.contains('hidden')) {
    startScreen.classList.add('hidden');
    gameContainer.classList.remove('hidden');
    if (gameMode === 'online') onlineBadge.classList.remove('hidden');
  }
  renderBoard();
  updateStatus();
}

resetBtn.addEventListener('click', () => {
  if (gameMode === 'spectator') return;
  const count = parseInt(pieceCountEl.value) || 6;
  if (gameMode === 'online' && localTeam !== 'p1') {
    statusEl.textContent = 'Chỉ Host (P1) mới có thể tạo ván mới!';
    return;
  }
  const newState = {
    board: createInitialBoard(count),
    turn: 'p1',
    winner: null,
    _moveCount: 0
  };
  applyState(newState);
  sendState(newState);
  if (gameMode === 'online' && localTeam === 'p1') {
    updateRoomStatusOnline('playing');
  }
});

backBtn.addEventListener('click', () => {
  if (conn) conn.close();
  if (peer) peer.destroy();
  peer = null; conn = null;
  spectatorConns.clear();
  gameMode = null;
  localTeam = 'p1';
  removeRoom();
  gameContainer.classList.add('hidden');
  startScreen.classList.remove('hidden');
  hostUi.classList.add('hidden');
  btnHost.disabled = false;
  joinInput.value = '';
  setStatus('', '');
  setLobbyStatus('', '');
  onlineBadge.classList.add('hidden');
  spectatorBadge.classList.add('hidden');
  resetBtn.style.display = '';
  pieceCountEl.disabled = false;
});

function handleCellClick(r, c) {
  if (!gameState || gameState.winner) return;
  if (gameMode === 'spectator') return; // spectator không được click

  if (gameMode === 'online' && localTeam !== gameState.turn) return;

  const cell = gameState.board[r][c];
  const activeTeam = gameMode === 'online' ? localTeam : gameState.turn;

  if (cell && cell.owner === activeTeam) {
    selectedPiece = (selectedPiece?.r === r && selectedPiece?.c === c)
      ? null
      : { r, c };
    renderBoard();
    return;
  }

  if (selectedPiece) {
    const moves = getValidMoves(selectedPiece.r, selectedPiece.c);
    const mv = moves.find(m => m.r === r && m.c === c);
    if (mv) {
      executeMove(selectedPiece.r, selectedPiece.c, r, c);
    } else {
      selectedPiece = null;
      renderBoard();
    }
  }
}

function getValidMoves(r, c) {
  const piece = gameState.board[r][c];
  if (!piece) return [];
  const moves = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (!dr && !dc) continue;
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) continue;
      const target = gameState.board[nr][nc];
      if (!target) {
        moves.push({ r: nr, c: nc, type: 'move' });
      } else if (target.owner !== piece.owner && canBeat(piece.type, target.type)) {
        moves.push({ r: nr, c: nc, type: 'attack' });
      }
    }
  }
  return moves;
}

function executeMove(fromR, fromC, toR, toC) {
  const newBoard = JSON.parse(JSON.stringify(gameState.board));
  const piece = newBoard[fromR][fromC];
  newBoard[toR][toC] = piece;
  newBoard[fromR][fromC] = null;

  let winner = null;
  if (piece.owner === 'p1' && toR === P1_VICTORY.r && toC === P1_VICTORY.c) winner = 'p1';
  if (piece.owner === 'p2' && toR === P2_VICTORY.r && toC === P2_VICTORY.c) winner = 'p2';

  let p1c = 0, p2c = 0;
  newBoard.forEach(row => row.forEach(cell => {
    if (cell?.owner === 'p1') p1c++;
    if (cell?.owner === 'p2') p2c++;
  }));
  if (!winner && p1c === 0) winner = 'p2';
  if (!winner && p2c === 0) winner = 'p1';

  const moveCount = (gameState._moveCount || 0) + 1;
  const newState = {
    board: newBoard,
    turn: gameState.turn === 'p1' ? 'p2' : 'p1',
    winner,
    _moveCount: moveCount
  };

  selectedPiece = null;
  applyState(newState);
  sendState(newState);

  // Cập nhật lobby
  if (gameMode === 'online' && localTeam === 'p1') {
    import('https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js')
      .then(({ update }) => {
        if (myRoomRef) update(myRoomRef, {
          moveCount,
          p1Pieces: p1c,
          p2Pieces: p2c,
          status: winner ? 'finished' : 'playing',
          updatedAt: serverTimestamp()
        });
      }).catch(() => {});
  }
}

// ============================================================
//  RENDERING
// ============================================================
function renderBoard() {
  boardEl.innerHTML = '';
  const validMoves = selectedPiece ? getValidMoves(selectedPiece.r, selectedPiece.c) : [];

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = document.createElement('div');
      cell.className = 'cell' + ((r + c) % 2 === 1 ? ' light' : '');

      if (r === P1_VICTORY.r && c === P1_VICTORY.c) cell.classList.add('victory-p1');
      if (r === P2_VICTORY.r && c === P2_VICTORY.c) cell.classList.add('victory-p2');

      const piece = gameState.board[r][c];
      if (piece) {
        const p = document.createElement('div');
        p.className = `piece ${piece.owner}`;
        p.textContent = ICONS[piece.type];
        if (selectedPiece?.r === r && selectedPiece?.c === c) p.classList.add('selected');
        cell.appendChild(p);
      }

      const mv = validMoves.find(m => m.r === r && m.c === c);
      if (mv) cell.classList.add(mv.type === 'attack' ? 'valid-attack' : 'valid-move');

      if (gameMode !== 'spectator') {
        cell.addEventListener('click', () => handleCellClick(r, c));
      }
      boardEl.appendChild(cell);
    }
  }
}

function updateStatus() {
  if (gameState.winner) {
    const w = gameState.winner;
    const name = w === 'p1' ? 'Player 1 (Xanh)' : 'Player 2 (Đỏ)';
    statusEl.textContent = `🎉 ${name} Thắng! 🎉`;
    statusEl.style.color = w === 'p1' ? 'var(--p1-color)' : 'var(--p2-color)';
    statusEl.style.textShadow = `0 0 15px ${w === 'p1' ? 'var(--p1-color)' : 'var(--p2-color)'}`;
    return;
  }

  if (gameMode === 'spectator') {
    const turn = gameState.turn;
    const who = turn === 'p1' ? 'Player 1 (Xanh)' : 'Player 2 (Đỏ)';
    statusEl.textContent = `👁 Lượt của ${who}`;
    statusEl.style.color = turn === 'p1' ? 'var(--p1-color)' : 'var(--p2-color)';
    statusEl.style.textShadow = 'none';
    return;
  }

  const turn = gameState.turn;
  const myTurn = gameMode === 'local' || localTeam === turn;
  const who = turn === 'p1' ? 'Player 1 (Xanh)' : 'Player 2 (Đỏ)';
  statusEl.textContent = myTurn ? `🎯 Lượt của ${who} — Bạn đi!` : `⏳ Lượt của ${who}...`;
  statusEl.style.color = turn === 'p1' ? 'var(--p1-color)' : 'var(--p2-color)';
  statusEl.style.textShadow = 'none';
}

// ============================================================
//  INIT
// ============================================================
initFirebase();
