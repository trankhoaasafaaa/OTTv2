import { playhtml } from "https://unpkg.com/playhtml";

// --- Constants & Utilities ---
const ROWS = 8;
const COLS = 8;
const ICONS = { rock: '✊', paper: '✋', scissors: '✌️' };

const P1_VICTORY = { r: 0, c: 7 }; // h8 (top-right)
const P2_VICTORY = { r: 7, c: 0 }; // a1 (bottom-left)

// Generate random symmetrical board
function createInitialBoard(pieceCount = 6) {
  const board = Array(ROWS).fill(null).map(() => Array(COLS).fill(null));
  
  // Find all available cells in the lower-left triangle (where r > c)
  const availableCells = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (r > c) {
        availableCells.push({ r, c });
      }
    }
  }

  // Shuffle availableCells to pick random positions
  for (let i = availableCells.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [availableCells[i], availableCells[j]] = [availableCells[j], availableCells[i]];
  }

  const types = ['rock', 'paper', 'scissors'];

  // Place pieces symmetrically
  for (let i = 0; i < pieceCount && i < availableCells.length; i++) {
    const cell = availableCells[i];
    const randomType = types[Math.floor(Math.random() * types.length)];
    
    // P1 initial piece
    board[cell.r][cell.c] = { owner: 'p1', type: randomType };
    
    // P2 initial piece (reflected over main diagonal a8-h1 [c, r])
    board[cell.c][cell.r] = { owner: 'p2', type: randomType };
  }

  return board;
}

// Check combat (Rock-Paper-Scissors rules)
// Returns true if attacker beats defender
function canBeat(attackerType, defenderType) {
  if (attackerType === 'rock' && defenderType === 'scissors') return true;
  if (attackerType === 'scissors' && defenderType === 'paper') return true;
  if (attackerType === 'paper' && defenderType === 'rock') return true;
  return false;
}

// --- Global Variables ---
let selectedPiece = null; // {r, c}
let localTeam = 'observer';

let syncState = {
  board: createInitialBoard(),
  turn: 'p1',
  winner: null
};

// UI Elements
const boardEl = document.getElementById('board');
const statusEl = document.getElementById('status');
const resetBtn = document.getElementById('reset-btn');
const pieceCountInput = document.getElementById('piece-count');
const teamSelect = document.getElementById('team-select');
const gameContainer = document.getElementById('game-container');

teamSelect.addEventListener('change', (e) => {
  localTeam = e.target.value;
  selectedPiece = null;
  renderBoard();
});

// Boot up playhtml
playhtml.init();

// Register our element for custom syncing
playhtml.register(gameContainer, {
  defaultData: {
    board: createInitialBoard(),
    turn: 'p1',
    winner: null
  },
  updateElement: ({ data }) => {
    if (data) {
      syncState = data;
      selectedPiece = null;
      renderBoard();
      updateStatus();
    }
  }
});

function setSyncState(newState) {
  // Use playhtml's injected setData method if available
  if (typeof gameContainer.setData === 'function') {
    gameContainer.setData(newState);
  } else {
    // Fallback if not ready
    syncState = newState;
    renderBoard();
    updateStatus();
  }
}

resetBtn.addEventListener('click', () => {
  let count = parseInt(pieceCountInput.value) || 6;
  if (count < 1) count = 1;
  if (count > 28) count = 28;
  pieceCountInput.value = count;
  
  setSyncState({
    board: createInitialBoard(count),
    turn: 'p1',
    winner: null
  });
});

// --- Game Logic ---

function handleCellClick(r, c) {
  if (!syncState || syncState.winner) return; // Game over or not ready
  if (localTeam !== syncState.turn) return; // Not our turn

  const cell = syncState.board[r][c];

  // If clicked on own piece, select it
  if (cell && cell.owner === localTeam) {
    if (selectedPiece && selectedPiece.r === r && selectedPiece.c === c) {
      selectedPiece = null; // deselect
    } else {
      selectedPiece = { r, c };
    }
    renderBoard();
    return;
  }

  // If a piece is selected and clicked on a valid target (move or attack)
  if (selectedPiece) {
    const validMoves = getValidMoves(selectedPiece.r, selectedPiece.c);
    const move = validMoves.find(m => m.r === r && m.c === c);
    
    if (move) {
      executeMove(selectedPiece.r, selectedPiece.c, r, c);
    } else {
      // Invalid move, just clear selection
      selectedPiece = null;
      renderBoard();
    }
  }
}

function getValidMoves(r, c) {
  const piece = syncState.board[r][c];
  if (!piece) return [];
  const moves = [];

  // King move (8 directions)
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = r + dr;
      const nc = c + dc;
      
      if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
        const targetCell = syncState.board[nr][nc];
        if (!targetCell) {
          moves.push({ r: nr, c: nc, type: 'move' });
        } else if (targetCell.owner !== piece.owner) {
          // Attack check
          if (canBeat(piece.type, targetCell.type)) {
            moves.push({ r: nr, c: nc, type: 'attack' });
          }
        }
      }
    }
  }
  return moves;
}

function executeMove(fromR, fromC, toR, toC) {
  const newBoard = JSON.parse(JSON.stringify(syncState.board));
  const piece = newBoard[fromR][fromC];
  
  // Move piece
  newBoard[toR][toC] = piece;
  newBoard[fromR][fromC] = null;

  let winner = null;
  // Check victory condition (reach target cell)
  if (piece.owner === 'p1' && toR === P1_VICTORY.r && toC === P1_VICTORY.c) {
    winner = 'p1';
  } else if (piece.owner === 'p2' && toR === P2_VICTORY.r && toC === P2_VICTORY.c) {
    winner = 'p2';
  }

  // Check wipeout victory
  let p1Count = 0, p2Count = 0;
  for(let i = 0; i < ROWS; i++){
      for(let j = 0; j < COLS; j++){
          if(newBoard[i][j]){
              if(newBoard[i][j].owner === 'p1') p1Count++;
              if(newBoard[i][j].owner === 'p2') p2Count++;
          }
      }
  }
  if (p1Count === 0) winner = 'p2';
  if (p2Count === 0) winner = 'p1';

  const nextTurn = syncState.turn === 'p1' ? 'p2' : 'p1';
  
  selectedPiece = null;
  setSyncState({
    board: newBoard,
    turn: nextTurn,
    winner: winner
  });
}

// --- Rendering ---
function renderBoard() {
  if (!syncState) return;
  boardEl.innerHTML = '';
  
  let validMoves = [];
  if (selectedPiece) {
    validMoves = getValidMoves(selectedPiece.r, selectedPiece.c);
  }

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cellDiv = document.createElement('div');
      cellDiv.classList.add('cell');
      
      // Checkerboard pattern
      if ((r + c) % 2 === 1) cellDiv.classList.add('light');

      // Victory tiles highlight
      if (r === P1_VICTORY.r && c === P1_VICTORY.c) cellDiv.classList.add('victory-p1');
      if (r === P2_VICTORY.r && c === P2_VICTORY.c) cellDiv.classList.add('victory-p2');

      const piece = syncState.board[r][c];
      if (piece) {
        const pieceDiv = document.createElement('div');
        pieceDiv.classList.add('piece', piece.owner);
        pieceDiv.textContent = ICONS[piece.type];
        
        if (selectedPiece && selectedPiece.r === r && selectedPiece.c === c) {
          pieceDiv.classList.add('selected');
        }
        
        cellDiv.appendChild(pieceDiv);
      }

      // Valid move highlights
      const move = validMoves.find(m => m.r === r && m.c === c);
      if (move) {
        cellDiv.classList.add(move.type === 'attack' ? 'valid-attack' : 'valid-move');
      }

      cellDiv.addEventListener('click', () => handleCellClick(r, c));
      boardEl.appendChild(cellDiv);
    }
  }
}

function updateStatus() {
  if (!syncState) return;
  
  if (syncState.winner) {
    statusEl.textContent = syncState.winner === 'p1' ? '🎉 Player 1 (Blue) Wins! 🎉' : '🎉 Player 2 (Red) Wins! 🎉';
    statusEl.style.color = syncState.winner === 'p1' ? 'var(--p1-color)' : 'var(--p2-color)';
    statusEl.style.textShadow = `0 0 10px ${syncState.winner === 'p1' ? 'var(--p1-color)' : 'var(--p2-color)'}`;
  } else {
    // Add localTeam status indication
    const teamText = localTeam === 'p1' ? ' (You are Blue)' : (localTeam === 'p2' ? ' (You are Red)' : ' (Observer)');
    statusEl.textContent = (syncState.turn === 'p1' ? "Player 1's Turn (Blue)" : "Player 2's Turn (Red)") + teamText;
    statusEl.style.color = syncState.turn === 'p1' ? 'var(--p1-color)' : 'var(--p2-color)';
    statusEl.style.textShadow = 'none';
  }
}
