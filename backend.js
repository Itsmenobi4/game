const board = document.getElementById('board');
const message = document.getElementById('message');
let currentPlayer = 'X';
let cells = Array(9).fill(null);
let gameActive = true;
let cellElements = [];

let playerXName = "Player X";
let playerOName = "Player O";
let vsAI = false;

const clickSound = new Audio('click.mp3');
const winSound = new Audio('win.mp3');
const drawSound = new Audio('draw.mp3');

function startGame() {
  playerXName = document.getElementById("playerX").value || "Player X";
  playerOName = document.getElementById("playerO").value || "Player O";
  
  const selectedMode = document.querySelector('input[name="mode"]:checked').value;
  vsAI = selectedMode === 'pvc';

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
  }, 500); // delay biar keliatan gantian
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
    highlightWinner();
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
  let available = cells.map((val, idx) => val === null ? idx : null).filter(val => val !== null);
  if (available.length === 0 || !gameActive) return;
  let randomIndex = available[Math.floor(Math.random() * available.length)];
  playMove(randomIndex, 'O');
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
        cellElements[i].style.transform = 'scale(1.2)';
        setTimeout(() => {
          cellElements[i].style.transform = 'scale(1)';
        }, 300);
      });
      return true;
    }
    return false;
  });
}

function restartGame() {
  currentPlayer = 'X';
  cells = Array(9).fill(null);
  gameActive = true;

  const endOptions = document.getElementById("end-options");
  if (endOptions) endOptions.style.display = "none";

  createBoard();
  updateTurnText();
}

function showEndOptions() {
  const endOptions = document.getElementById("end-options");
  if (endOptions) {
    endOptions.style.display = "flex";
  }
}

function gantiPemain() {
  document.getElementById("player-setup").style.display = "block";
  document.getElementById("game-container").classList.add("hidden");
  document.getElementById("end-options").style.display = "none";
}
function togglePlayerOInput() {
  const selected = document.querySelector('input[name="mode"]:checked');
  const playerOInput = document.getElementById("playerO-label");

  if (selected && selected.value === 'pvc') {
    playerOInput.style.display = "none";
  } else {
    playerOInput.style.display = "block";
  }
}

window.addEventListener('DOMContentLoaded', () => {
  togglePlayerOInput();

  document.querySelectorAll('input[name="mode"]').forEach(radio => {
    radio.addEventListener('change', togglePlayerOInput);
  });
});
