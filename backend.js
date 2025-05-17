const board = document.getElementById('board');
const message = document.getElementById('message');
let currentPlayer = 'X';
let cells = Array(9).fill(null);
let gameActive = true;
let cellElements = [];

let playerXName = "Player X";
let playerOName = "Player O";
let vsAI = false;
let difficulty = 'easy'; 

const clickSound = new Audio('click.mp3');
const winSound = new Audio('win.mp3');
const drawSound = new Audio('draw.mp3');

function startGame() {
  playerXName = document.getElementById("playerX").value || "Player X";
  playerOName = document.getElementById("playerO").value || "Player O";

  const selectedMode = document.querySelector('input[name="mode"]:checked').value;
  vsAI = selectedMode === 'pvc';

  difficulty = document.getElementById("difficulty").value;

  document.getElementById("player-setup").style.display = "none";
  document.getElementById("game-container").classList.remove("hidden");

  const endOptions = document.getElementById("end-options");
  if (endOptions) endOptions.style.display = "none";

  restartGame();
}

function createBoard() {
  board.innerHTML = '';
  cellElements = [];

  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.className =
      'w-24 h-24 bg-white border-2 border-indigo-300 flex items-center justify-center text-4xl font-extrabold text-indigo-700 rounded-xl shadow-md hover:bg-indigo-100 transition cursor-pointer cell-animate';
    cell.dataset.index = i;
    cell.addEventListener('click', handleClick);
    board.appendChild(cell);
    cellElements.push(cell);
  }
}

function handleClick(e) {
  const index = e.target.dataset.index;
  if (!gameActive || cells[index]) return;

  playMove(index, currentPlayer);

  if (!gameActive || !vsAI || currentPlayer !== 'O') return;

  setTimeout(() => {
    aiMove();
  }, 500);
}

function playMove(index, player) {
  if (cells[index]) return;

  clickSound.play();
  cells[index] = player;
  cellElements[index].textContent = player;

  if (checkWinner()) {
    const winnerName = player === 'X' ? playerXName : playerOName;
    message.textContent = `${winnerName} menang! 🎉`;
    winSound.play();
    gameActive = false;
    showEndOptions();
    return;
  }

  if (cells.every(cell => cell)) {
    message.textContent = "Seri! 🤝";
    drawSound.play();
    gameActive = false;
    showEndOptions();
    return;
  }

  currentPlayer = player === 'X' ? 'O' : 'X';
  updateTurnText();
}

function aiMove() {
  if (!gameActive) return;

  let moveIndex;

  switch (difficulty) {
    case 'easy':
      moveIndex = getRandomMove();
      break;
    case 'medium':
      moveIndex = getMediumMove();
      break;
    case 'hard':
      moveIndex = getHardMove();
      break;
    case 'very-hard':
      moveIndex = getBestMove();
      break;
    default:
      moveIndex = getRandomMove();
  }

  playMove(moveIndex, 'O');
}

function getAvailableMoves() {
  return cells.map((val, idx) => val === null ? idx : null).filter(val => val !== null);
}

function getRandomMove() {
  const available = getAvailableMoves();
  return available[Math.floor(Math.random() * available.length)];
}

function getMediumMove() {
  let move = findWinningMove('O');
  if (move !== null) return move;

  move = findWinningMove('X');
  if (move !== null) return move;
  return getRandomMove();
}

function getHardMove() {
  let move = findWinningMove('O');
  if (move !== null) return move;

  move = findWinningMove('X');
  if (move !== null) return move;

  if (cells[4] === null) return 4;

  const corners = [0, 2, 6, 8].filter(i => cells[i] === null);
  if (corners.length > 0) return corners[Math.floor(Math.random() * corners.length)];

  return getRandomMove();
}

function getBestMove() {
  let bestScore = -Infinity;
  let move = null;
  const available = getAvailableMoves();

  for (const idx of available) {
    cells[idx] = 'O';
    let score = minimax(cells, 0, false);
    cells[idx] = null;

    if (score > bestScore) {
      bestScore = score;
      move = idx;
    }
  }
  return move;
}

function minimax(boardState, depth, isMaximizing) {
  const winner = getWinner(boardState);
  if (winner === 'O') return 10 - depth;
  if (winner === 'X') return depth - 10;
  if (boardState.every(cell => cell !== null)) return 0;

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (boardState[i] === null) {
        boardState[i] = 'O';
        let score = minimax(boardState, depth + 1, false);
        boardState[i] = null;
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < 9; i++) {
      if (boardState[i] === null) {
        boardState[i] = 'X';
        let score = minimax(boardState, depth + 1, true);
        boardState[i] = null;
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
}

function getWinner(boardState) {
  const winCombos = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];

  for (const combo of winCombos) {
    const [a, b, c] = combo;
    if (boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c]) {
      return boardState[a];
    }
  }
  return null;
}

function findWinningMove(player) {
  const available = getAvailableMoves();
  for (const idx of available) {
    cells[idx] = player;
    if (checkWinnerTemp(cells)) {
      cells[idx] = null;
      return idx;
    }
    cells[idx] = null;
  }
  return null;
}

function checkWinnerTemp(boardState) {
  const winCombos = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  return winCombos.some(combo => {
    const [a, b, c] = combo;
    return boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c];
  });
}

function updateTurnText() {
  const currentName = currentPlayer === 'X' ? playerXName : playerOName;
  message.textContent = `Giliran: ${currentName}`;
}

function checkWinner() {
  const winCombos = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];

  return winCombos.some(combo => {
    const [a, b, c] = combo;
    if (cells[a] && cells[a] === cells[b] && cells[a] === cells[c]) {
      combo.forEach(i => {
        cellElements[i].classList.add('win-glow');
        cellElements[i].style.transform = 'scale(1.1)';
      });
      return true;
    }
    return false;
  });
}

function showEndOptions() {
  const endOptions = document.getElementById("end-options");
  if (endOptions) {
    endOptions.style.display = "flex";
  }
}

function restartGame() {
  cells = Array(9).fill(null);
  currentPlayer = 'X';
  gameActive = true;
  message.textContent = "";
  createBoard();
  updateTurnText();
}

function gantiPemain() {
  document.getElementById("game-container").classList.add("hidden");
  document.getElementById("player-setup").style.display = "flex";
  restartGame();
}

function togglePlayerOInput() {
  const mode = document.querySelector('input[name="mode"]:checked').value;
  const playerOInput = document.getElementById("playerO");
  const difficultyContainer = document.getElementById("difficulty-container");

  if (mode === 'pvc') {
    playerOInput.value = "AI";
    playerOInput.disabled = true;
    difficultyContainer.classList.remove("hidden");
  } else {
    playerOInput.value = "";
    playerOInput.disabled = false;
    difficultyContainer.classList.add("hidden");
  }
}
function restartGame() {
  cells = Array(9).fill(null);
  currentPlayer = 'X';
  gameActive = true;
  message.textContent = "";
  createBoard();
  updateTurnText();

  const endOptions = document.getElementById("end-options");
  if (endOptions) {
    endOptions.style.display = "none";
  }
}

createBoard();
updateTurnText();
togglePlayerOInput();
