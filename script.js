const game = document.getElementById("game");
const result = document.getElementById("result");
const startBtn = document.getElementById("startBtn");

const ROWS = 15;
const COLS = 15;
const FIRE_RANGE = 2;

let cells = [];
let map = [];
let bombs = [];
let fires = [];
let gameOver = true;
let loop;

// players
const p1 = { x: 1, y: 1, cls: "player1" };
const p2 = { x: 13, y: 13, cls: "player2" };

startBtn.addEventListener("click", startGame);

function startGame() {
  startBtn.blur(); 
  gameOver = false;
  result.textContent = "";

  bombs = [];
  fires = [];
  cells = [];
  map = [];

  game.innerHTML = "";
  generateMap();
  draw();

  clearInterval(loop);
  loop = setInterval(gameLoop, 100);
}

// ===== MAP =====
function generateMap() {
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      let tile = 0;
      if (
        x === 0 || y === 0 ||
        x === COLS - 1 || y === ROWS - 1 ||
        (x % 2 === 0 && y % 2 === 0)
      ) tile = 1;
      else if (Math.random() < 0.3 && !(x < 3 && y < 3) && !(x > 11 && y > 11))
        tile = 2;

      map.push(tile);

      const cell = document.createElement("div");
      cell.className = "cell";
      game.appendChild(cell);
      cells.push(cell);
    }
  }

  p1.x = 1; p1.y = 1;
  p2.x = 13; p2.y = 13;
}

function idx(x, y) {
  return y * COLS + x;
}

// ===== DRAW =====
function draw() {
  cells.forEach((cell, i) => {
    cell.className = "cell";
    if (map[i] === 1) cell.classList.add("wall");
    else if (map[i] === 2) cell.classList.add("block");
    else cell.classList.add("empty");
  });

  bombs.forEach(b => cells[idx(b.x, b.y)].classList.add("bomb"));
  fires.forEach(f => cells[idx(f.x, f.y)].classList.add("fire"));

  cells[idx(p1.x, p1.y)].classList.add("player1");
  cells[idx(p2.x, p2.y)].classList.add("player2");
}

// ===== MOVE =====
function move(p, dx, dy) {
  if (gameOver) return;
  const nx = p.x + dx;
  const ny = p.y + dy;

  const bomb = bombs.find(b => b.x === nx && b.y === ny && !b.passable);
  if (bomb) return;

  if (map[idx(nx, ny)] === 0) {
    p.x = nx;
    p.y = ny;

    draw();
  }
}

// ===== BOMB =====
function placeBomb(p) {
  if (gameOver) return;

  if (bombs.some(b => b.x === p.x && b.y === p.y)) return;

  bombs.push({
    x: p.x,
    y: p.y,
    timer: 25,
    passable: true
  });
}

function explode(b) {
  addFire(b.x, b.y);

  directions.forEach(d => {
    for (let i = 1; i <= FIRE_RANGE; i++) {
      const nx = b.x + d.x * i;
      const ny = b.y + d.y * i;
      const id = idx(nx, ny);

      if (map[id] === 1) break;

      addFire(nx, ny);

      if (map[id] === 2) {
        map[id] = 0;
        break;
      }
    }
  });
}

function addFire(x, y) {
  fires.push({ x, y, timer: 6 });

  if (p1.x === x && p1.y === y) endGame("🏆 Player 2 Wins!");
  if (p2.x === x && p2.y === y) endGame("🏆 Player 1 Wins!");
}

function endGame(text) {
  gameOver = true;
  result.textContent = text;
}

// ===== LOOP =====
function gameLoop() {
  bombs.forEach(b => {
    b.timer--;
    if (b.passable && (p1.x !== b.x || p1.y !== b.y) && (p2.x !== b.x || p2.y !== b.y)) {
      b.passable = false;
    }
  });

  bombs.filter(b => b.timer <= 0).forEach(explode);
  bombs = bombs.filter(b => b.timer > 0);

  fires.forEach(f => f.timer--);
  fires = fires.filter(f => f.timer > 0);

  draw();
}

const directions = [
  { x: 1, y: 0 }, { x: -1, y: 0 },
  { x: 0, y: 1 }, { x: 0, y: -1 }
];

// ===== CONTROLS =====
document.addEventListener("keydown", e => {
    const key = e.key.toLowerCase();
  
    if (["enter", " "].includes(key)) e.preventDefault();
    if (gameOver) return;
  
    // Player 1
    if (key === "w") move(p1, 0, -1);
    if (key === "s") move(p1, 0, 1);
    if (key === "a") move(p1, -1, 0);
    if (key === "d") move(p1, 1, 0);
  
    if (e.code === "Space") placeBomb(p1);
  
    // Player 2
    if (e.key === "ArrowUp") move(p2, 0, -1);
    if (e.key === "ArrowDown") move(p2, 0, 1);
    if (e.key === "ArrowLeft") move(p2, -1, 0);
    if (e.key === "ArrowRight") move(p2, 1, 0);
  
    if (e.key === "Enter") placeBomb(p2);
  });
  