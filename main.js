// ============================================================
//  RPS Tactics — main.js
//  Multiplayer via PeerJS (WebRTC P2P), no external backend needed
// ============================================================

const ROWS = 8, COLS = 8;
const ICONS = { rock: '✊', paper: '✋', scissors: '✌️' };
const P1_VICTORY = { r: 0, c: 7 }; // h8
const P2_VICTORY = { r: 7, c: 0 }; // a1
const TYPES = ['rock', 'paper', 'scissors'];

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
let localTeam = 'p1';  // 'p1' | 'p2' for online; both for local
let gameMode = null;    // 'local' | 'online'

// ---- PeerJS ----
let peer = null;
let conn = null;

// ---- DOM ----
const startScreen   = document.getElementById('start-screen');
const gameContainer = document.getElementById('game-container');
const boardEl       = document.getElementById('board');
const statusEl      = document.getElementById('status');
const resetBtn      = document.getElementById('reset-btn');
const backBtn       = document.getElementById('back-btn');
const pieceCountEl  = document.getElementById('piece-count');
const pieceCountStartEl = document.getElementById('piece-count-start');
const onlineBadge   = document.getElementById('online-badge');

// Start screen elements
const btnLocal   = document.getElementById('btn-local');
const btnHost    = document.getElementById('btn-host');
const btnJoin    = document.getElementById('btn-join');
const hostUi     = document.getElementById('host-ui');
const roomCodeEl = document.getElementById('room-code');
const copyBtn    = document.getElementById('btn-copy-code');
const joinInput  = document.getElementById('join-input');
const connStatus = document.getElementById('connection-status');

// ============================================================
//  START SCREEN LOGIC
// ============================================================
btnLocal.addEventListener('click', () => {
  gameMode = 'local';
  localTeam = 'p1'; // both players use keyboard on same machine
  startGame(parseInt(pieceCountStartEl.value) || 6);
});

btnHost.addEventListener('click', () => {
  setStatus('Đang tạo phòng...', '');
  hostUi.classList.remove('hidden');
  btnHost.disabled = true;
  
  const code = generateCode();
  roomCodeEl.textContent = code;
  initPeer(code.toLowerCase(), null); // use short code as peer ID
});

btnJoin.addEventListener('click', () => {
  const code = joinInput.value.trim().toUpperCase();
  if (code.length < 3) { setStatus('Nhập mã phòng hợp lệ!', 'error'); return; }
  setStatus('Đang kết nối...', '');
  initPeer(null, code); // join as guest
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

      peer.on('connection', (connection) => {
        conn = connection;
        setupConnection();
        // Host: don't wait for conn.on('open') — it may already be open.
        // Start game immediately and broadcast state to guest.
        setStatus('', '');
        startGame(parseInt(pieceCountStartEl.value) || 6, true);
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

function setupConnection() {
  conn.on('open', () => {
    // GUEST: connection opened — show game screen immediately
    // and wait for host to broadcast initial state.
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

function sendState(state) {
  if (conn && conn.open) {
    conn.send({ type: 'state', payload: state });
  }
}

// ============================================================
//  GAME LOGIC
// ============================================================
function startGame(pieceCount, broadcast = false) {
  const count = Math.max(1, Math.min(28, pieceCount));
  gameState = {
    board: createInitialBoard(count),
    turn: 'p1',
    winner: null
  };
  selectedPiece = null;
  pieceCountEl.value = count;

  // Show game, hide start
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
  // Show game screen if still on start screen (guest receives host's first broadcast)
  if (gameContainer.classList.contains('hidden')) {
    startScreen.classList.add('hidden');
    gameContainer.classList.remove('hidden');
    if (gameMode === 'online') onlineBadge.classList.remove('hidden');
  }
  renderBoard();
  updateStatus();
}

resetBtn.addEventListener('click', () => {
  const count = parseInt(pieceCountEl.value) || 6;
  if (gameMode === 'online' && localTeam !== 'p1') {
    statusEl.textContent = 'Chỉ Host (P1) mới có thể tạo ván mới!';
    return;
  }
  const newState = {
    board: createInitialBoard(count),
    turn: 'p1',
    winner: null
  };
  applyState(newState);
  sendState(newState);
});

backBtn.addEventListener('click', () => {
  if (conn) conn.close();
  if (peer) peer.destroy();
  peer = null; conn = null;
  gameMode = null;
  gameContainer.classList.add('hidden');
  startScreen.classList.remove('hidden');
  hostUi.classList.add('hidden');
  btnHost.disabled = false;
  joinInput.value = '';
  setStatus('', '');
  onlineBadge.classList.add('hidden');
});

function handleCellClick(r, c) {
  if (!gameState || gameState.winner) return;

  // In local mode, current turn player can always click
  // In online mode, only allow clicking your own pieces
  if (gameMode === 'online' && localTeam !== gameState.turn) return;
  if (gameMode === 'local' && gameState.turn !== gameState.turn) return;

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

  const newState = {
    board: newBoard,
    turn: gameState.turn === 'p1' ? 'p2' : 'p1',
    winner
  };

  selectedPiece = null;
  applyState(newState);
  sendState(newState);
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

      cell.addEventListener('click', () => handleCellClick(r, c));
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
  } else {
    const turn = gameState.turn;
    const myTurn = gameMode === 'local' || localTeam === turn;
    const who = turn === 'p1' ? 'Player 1 (Xanh)' : 'Player 2 (Đỏ)';
    statusEl.textContent = myTurn ? `🎯 Lượt của ${who} — Bạn đi!` : `⏳ Lượt của ${who}...`;
    statusEl.style.color = turn === 'p1' ? 'var(--p1-color)' : 'var(--p2-color)';
    statusEl.style.textShadow = 'none';
  }
}
