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
let boardSize = 3; // Default size
let winningLength = 3; // Default winning condition

const clickSound = new Audio('click.mp3');
const winSound = new Audio('win.mp3');
const drawSound = new Audio('draw.mp3');
const bgSound = new Audio('background.mp3');
bgSound.loop = true;
bgSound.volume = 0.3;

function startGame() {
  playerXName = document.getElementById("playerX").value || "Player X";
  playerOName = document.getElementById("playerO").value || "Player O";

  const selectedMode = document.querySelector('input[name="mode"]:checked').value;
  vsAI = selectedMode === 'pvc';
  difficulty = document.getElementById("difficulty").value;
  
  // Get selected board size
  boardSize = parseInt(document.querySelector('input[name="board-size"]:checked').value);
  winningLength = boardSize === 3 ? 3 : boardSize === 6 ? 4 : 5;

  document.getElementById("player-setup").style.display = "none";
  document.getElementById("game-container").classList.remove("hidden");

  const endOptions = document.getElementById("end-options");
  if (endOptions) endOptions.style.display = "none";

  restartGame();

  bgSound.play().catch(err => {
    console.log("Audio gagal diputar karena belum ada interaksi user:", err);
  });
}

function createBoard() {
  board.innerHTML = '';
  cellElements = [];
  cells = Array(boardSize * boardSize).fill(null);
  
  // Adjust board grid based on size
  board.className = `grid gap-2 justify-center`;
  board.style.gridTemplateColumns = `repeat(${boardSize}, minmax(0, 1fr))`;

  for (let i = 0; i < boardSize * boardSize; i++) {
    const cell = document.createElement('div');
    // Adjust cell size based on board size
    const cellSize = boardSize === 3 ? 'w-24 h-24' : 
                    boardSize === 6 ? 'w-16 h-16' : 'w-12 h-12';
    const textSize = boardSize === 3 ? 'text-4xl' : 
                    boardSize === 6 ? 'text-2xl' : 'text-xl';
    
    cell.className = `${cellSize} bg-white border-2 border-indigo-300 flex items-center justify-center ${textSize} font-extrabold text-indigo-700 rounded-xl shadow-md hover:bg-indigo-100 transition cursor-pointer cell-animate`;
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
      moveIndex = boardSize === 3 ? getMediumMove() : getRandomMove(); // Medium only for 3x3
      break;
    case 'hard':
      moveIndex = boardSize === 3 ? getHardMove() : getRandomMove(); // Hard only for 3x3
      break;
    case 'very-hard':
      moveIndex = boardSize === 3 ? getBestMove() : getRandomMove(); // Very-hard only for 3x3
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

  if (cells[4] === null && boardSize === 3) return 4;

  const corners = [0, 2, 6, 8].filter(i => cells[i] === null);
  if (corners.length > 0 && boardSize === 3) return corners[Math.floor(Math.random() * corners.length)];

  return getRandomMove();
}

function getBestMove() {
  if (boardSize !== 3) return getRandomMove(); // Only for 3x3
    
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
    for (let i = 0; i < boardSize * boardSize; i++) {
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
    for (let i = 0; i < boardSize * boardSize; i++) {
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
  // Check rows
  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col <= boardSize - winningLength; col++) {
      const firstCell = boardState[row * boardSize + col];
      if (!firstCell) continue;
      
      let win = true;
      for (let i = 1; i < winningLength; i++) {
        if (boardState[row * boardSize + col + i] !== firstCell) {
          win = false;
          break;
        }
      }
      if (win) return firstCell;
    }
  }

  // Check columns
  for (let col = 0; col < boardSize; col++) {
    for (let row = 0; row <= boardSize - winningLength; row++) {
      const firstCell = boardState[row * boardSize + col];
      if (!firstCell) continue;
      
      let win = true;
      for (let i = 1; i < winningLength; i++) {
        if (boardState[(row + i) * boardSize + col] !== firstCell) {
          win = false;
          break;
        }
      }
      if (win) return firstCell;
    }
  }

  // Check diagonals (top-left to bottom-right)
  for (let row = 0; row <= boardSize - winningLength; row++) {
    for (let col = 0; col <= boardSize - winningLength; col++) {
      const firstCell = boardState[row * boardSize + col];
      if (!firstCell) continue;
      
      let win = true;
      for (let i = 1; i < winningLength; i++) {
        if (boardState[(row + i) * boardSize + (col + i)] !== firstCell) {
          win = false;
          break;
        }
      }
      if (win) return firstCell;
    }
  }

  // Check diagonals (top-right to bottom-left)
  for (let row = 0; row <= boardSize - winningLength; row++) {
    for (let col = winningLength - 1; col < boardSize; col++) {
      const firstCell = boardState[row * boardSize + col];
      if (!firstCell) continue;
      
      let win = true;
      for (let i = 1; i < winningLength; i++) {
        if (boardState[(row + i) * boardSize + (col - i)] !== firstCell) {
          win = false;
          break;
        }
      }
      if (win) return firstCell;
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
  // Check rows
  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col <= boardSize - winningLength; col++) {
      const firstCell = boardState[row * boardSize + col];
      if (!firstCell) continue;
      
      let win = true;
      for (let i = 1; i < winningLength; i++) {
        if (boardState[row * boardSize + col + i] !== firstCell) {
          win = false;
          break;
        }
      }
      if (win) return true;
    }
  }

  // Check columns
  for (let col = 0; col < boardSize; col++) {
    for (let row = 0; row <= boardSize - winningLength; row++) {
      const firstCell = boardState[row * boardSize + col];
      if (!firstCell) continue;
      
      let win = true;
      for (let i = 1; i < winningLength; i++) {
        if (boardState[(row + i) * boardSize + col] !== firstCell) {
          win = false;
          break;
        }
      }
      if (win) return true;
    }
  }

  // Check diagonals (top-left to bottom-right)
  for (let row = 0; row <= boardSize - winningLength; row++) {
    for (let col = 0; col <= boardSize - winningLength; col++) {
      const firstCell = boardState[row * boardSize + col];
      if (!firstCell) continue;
      
      let win = true;
      for (let i = 1; i < winningLength; i++) {
        if (boardState[(row + i) * boardSize + (col + i)] !== firstCell) {
          win = false;
          break;
        }
      }
      if (win) return true;
    }
  }

  // Check diagonals (top-right to bottom-left)
  for (let row = 0; row <= boardSize - winningLength; row++) {
    for (let col = winningLength - 1; col < boardSize; col++) {
      const firstCell = boardState[row * boardSize + col];
      if (!firstCell) continue;
      
      let win = true;
      for (let i = 1; i < winningLength; i++) {
        if (boardState[(row + i) * boardSize + (col - i)] !== firstCell) {
          win = false;
          break;
        }
      }
      if (win) return true;
    }
  }

  return false;
}

function updateTurnText() {
  const currentName = currentPlayer === 'X' ? playerXName : playerOName;
  message.textContent = `Giliran: ${currentName}`;
}

function checkWinner() {
  // Check rows
  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col <= boardSize - winningLength; col++) {
      const firstCell = cells[row * boardSize + col];
      if (!firstCell) continue;
      
      let win = true;
      for (let i = 1; i < winningLength; i++) {
        if (cells[row * boardSize + col + i] !== firstCell) {
          win = false;
          break;
        }
      }
      if (win) {
        // Highlight winning cells
        for (let i = 0; i < winningLength; i++) {
          const idx = row * boardSize + col + i;
          cellElements[idx].classList.add('win-glow');
          cellElements[idx].style.transform = 'scale(1.1)';
        }
        return true;
      }
    }
  }

  // Check columns
  for (let col = 0; col < boardSize; col++) {
    for (let row = 0; row <= boardSize - winningLength; row++) {
      const firstCell = cells[row * boardSize + col];
      if (!firstCell) continue;
      
      let win = true;
      for (let i = 1; i < winningLength; i++) {
        if (cells[(row + i) * boardSize + col] !== firstCell) {
          win = false;
          break;
        }
      }
      if (win) {
        // Highlight winning cells
        for (let i = 0; i < winningLength; i++) {
          const idx = (row + i) * boardSize + col;
          cellElements[idx].classList.add('win-glow');
          cellElements[idx].style.transform = 'scale(1.1)';
        }
        return true;
      }
    }
  }

  // Check diagonals (top-left to bottom-right)
  for (let row = 0; row <= boardSize - winningLength; row++) {
    for (let col = 0; col <= boardSize - winningLength; col++) {
      const firstCell = cells[row * boardSize + col];
      if (!firstCell) continue;
      
      let win = true;
      for (let i = 1; i < winningLength; i++) {
        if (cells[(row + i) * boardSize + (col + i)] !== firstCell) {
          win = false;
          break;
        }
      }
      if (win) {
        // Highlight winning cells
        for (let i = 0; i < winningLength; i++) {
          const idx = (row + i) * boardSize + (col + i);
          cellElements[idx].classList.add('win-glow');
          cellElements[idx].style.transform = 'scale(1.1)';
        }
        return true;
      }
    }
  }

  // Check diagonals (top-right to bottom-left)
  for (let row = 0; row <= boardSize - winningLength; row++) {
    for (let col = winningLength - 1; col < boardSize; col++) {
      const firstCell = cells[row * boardSize + col];
      if (!firstCell) continue;
      
      let win = true;
      for (let i = 1; i < winningLength; i++) {
        if (cells[(row + i) * boardSize + (col - i)] !== firstCell) {
          win = false;
          break;
        }
      }
      if (win) {
        // Highlight winning cells
        for (let i = 0; i < winningLength; i++) {
          const idx = (row + i) * boardSize + (col - i);
          cellElements[idx].classList.add('win-glow');
          cellElements[idx].style.transform = 'scale(1.1)';
        }
        return true;
      }
    }
  }

  return false;
}

function showEndOptions() {
  const endOptions = document.getElementById("end-options");
  if (endOptions) {
    endOptions.style.display = "flex";
  }
}

function restartGame() {
  cells = Array(boardSize * boardSize).fill(null);
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

let isMusicPlaying = true;

function toggleMusic() {
  if (isMusicPlaying) {
    bgSound.pause();
    document.getElementById("music-btn").textContent = "🔇";
  } else {
    bgSound.play();
    document.getElementById("music-btn").textContent = "🔈";
  }
  isMusicPlaying = !isMusicPlaying;
}

createBoard();
updateTurnText();
togglePlayerOInput();
