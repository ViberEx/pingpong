const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const timerDiv = document.getElementById('timer');
const playerNameInput = document.getElementById('player-name');
const difficultySelect = document.getElementById('difficulty');
const historyDiv = document.getElementById('history');

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

// 难度配置
const DIFFICULTY = {
  easy:   { PADDLE_SPEED: 4, BALL_SPEED: 3, LABEL: "简单" },
  medium: { PADDLE_SPEED: 6, BALL_SPEED: 5, LABEL: "中等" },
  hard:   { PADDLE_SPEED: 9, BALL_SPEED: 7, LABEL: "困难" }
};
let currentDifficulty = 'medium';
let PADDLE_SPEED = DIFFICULTY[currentDifficulty].PADDLE_SPEED;
let BALL_SPEED = DIFFICULTY[currentDifficulty].BALL_SPEED;

// Paddle settings
const PADDLE_WIDTH = 12;
const PADDLE_HEIGHT = 80;
const PADDLE_MARGIN = 20;

// Ball settings
const BALL_RADIUS = 10;

let leftScore = 0;
let rightScore = 0;

const leftPaddle = {
  x: PADDLE_MARGIN,
  y: HEIGHT / 2 - PADDLE_HEIGHT / 2,
  width: PADDLE_WIDTH,
  height: PADDLE_HEIGHT,
  dy: 0
};

const rightPaddle = {
  x: WIDTH - PADDLE_MARGIN - PADDLE_WIDTH,
  y: HEIGHT / 2 - PADDLE_HEIGHT / 2,
  width: PADDLE_WIDTH,
  height: PADDLE_HEIGHT,
  dy: 0
};

const ball = {
  x: WIDTH / 2,
  y: HEIGHT / 2,
  radius: BALL_RADIUS,
  dx: 0,
  dy: 0
};

let gameRunning = false;
let gameLoopId = null;
let startTime = 0;
let elapsedTime = 0;
let timerInterval = null;
let playerName = "玩家";

let historyRecords = [];
const WIN_SCORE = 5;

function drawPaddle(paddle) {
  ctx.fillStyle = "#fff";
  ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}
function drawBall(ball) {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = "#fff";
  ctx.fill();
  ctx.closePath();
}
function drawCenterLine() {
  ctx.strokeStyle = "#fff";
  ctx.setLineDash([10, 10]);
  ctx.beginPath();
  ctx.moveTo(WIDTH / 2, 0);
  ctx.lineTo(WIDTH / 2, HEIGHT);
  ctx.stroke();
  ctx.setLineDash([]);
}
function resetBall(direction) {
  ball.x = WIDTH / 2;
  ball.y = HEIGHT / 2;
  ball.dx = BALL_SPEED * direction;
  ball.dy = BALL_SPEED * (Math.random() * 2 - 1);
}
function updateScore() {
  document.getElementById("left-score").textContent = leftScore;
  document.getElementById("right-score").textContent = rightScore;
}
function formatTime(ms) {
  const sec = Math.floor(ms / 1000);
  const min = Math.floor(sec / 60);
  const mm = String(min).padStart(2, "0");
  const ss = String(sec % 60).padStart(2, "0");
  const ms1 = Math.floor((ms % 1000) / 100);
  return `${mm}:${ss}.${ms1}`;
}
function updateTimerDisplay() {
  timerDiv.textContent = formatTime(elapsedTime);
}
function startTimer() {
  startTime = Date.now() - elapsedTime;
  timerInterval = setInterval(() => {
    elapsedTime = Date.now() - startTime;
    updateTimerDisplay();
  }, 100);
}
function stopTimer() {
  clearInterval(timerInterval);
  updateTimerDisplay();
}
function resetGameState() {
  leftScore = 0;
  rightScore = 0;
  updateScore();
  leftPaddle.y = HEIGHT / 2 - PADDLE_HEIGHT / 2;
  rightPaddle.y = HEIGHT / 2 - PADDLE_HEIGHT / 2;
  leftPaddle.dy = 0;
  rightPaddle.dy = 0;
  resetBall(Math.random() > 0.5 ? 1 : -1);
  elapsedTime = 0;
  updateTimerDisplay();
}
function startGame() {
  // 读取难度
  currentDifficulty = difficultySelect.value;
  PADDLE_SPEED = DIFFICULTY[currentDifficulty].PADDLE_SPEED;
  BALL_SPEED = DIFFICULTY[currentDifficulty].BALL_SPEED;

  resetGameState();
  gameRunning = true;
  startBtn.disabled = true;
  stopBtn.disabled = false;
  difficultySelect.disabled = true;
  playerNameInput.disabled = true;
  playerName = playerNameInput.value.trim() || "玩家";
  startTimer();
  gameLoopId = requestAnimationFrame(update);
}
function endGame(showRecord = true) {
  gameRunning = false;
  stopBtn.disabled = true;
  startBtn.disabled = false;
  difficultySelect.disabled = false;
  playerNameInput.disabled = false;
  stopTimer();
  cancelAnimationFrame(gameLoopId);
  if (showRecord) {
    historyRecords.unshift({
      player: playerName,
      ai: "AI",
      left: leftScore,
      right: rightScore,
      time: formatTime(elapsedTime),
      difficulty: DIFFICULTY[currentDifficulty].LABEL
    });
    showHistory();
  }
}
function checkGameOver() {
  if (leftScore >= WIN_SCORE || rightScore >= WIN_SCORE) {
    endGame();
    setTimeout(() => {
      alert(
        `游戏结束!\n${playerName}得分: ${leftScore}\nAI得分: ${rightScore}\n用时: ${formatTime(elapsedTime)}\n难度: ${DIFFICULTY[currentDifficulty].LABEL}`
      );
    }, 50);
    return true;
  }
  return false;
}
function showHistory() {
  if (historyRecords.length === 0) {
    historyDiv.style.display = "none";
    return;
  }
  let html = `<b>历史成绩:</b><br/><table><tr><th>昵称</th><th>玩家得分</th><th>AI得分</th><th>用时</th><th>难度</th></tr>`;
  historyRecords.forEach((h) => {
    html += `<tr>
      <td>${h.player}</td>
      <td>${h.left}</td>
      <td>${h.right}</td>
      <td>${h.time}</td>
      <td>${h.difficulty}</td>
    </tr>`;
  });
  html += "</table>";
  historyDiv.innerHTML = html;
  historyDiv.style.display = "block";
}
function update() {
  if (!gameRunning) return;

  // Move ball
  ball.x += ball.dx;
  ball.y += ball.dy;

  // Ball collision with top/bottom walls
  if (ball.y - ball.radius < 0) {
    ball.y = ball.radius;
    ball.dy *= -1;
  }
  if (ball.y + ball.radius > HEIGHT) {
    ball.y = HEIGHT - ball.radius;
    ball.dy *= -1;
  }

  // Left paddle collision
  if (
    ball.x - ball.radius < leftPaddle.x + leftPaddle.width &&
    ball.y > leftPaddle.y &&
    ball.y < leftPaddle.y + leftPaddle.height
  ) {
    ball.x = leftPaddle.x + leftPaddle.width + ball.radius;
    ball.dx *= -1;
    ball.dy += leftPaddle.dy * 0.2;
  }
  // Right paddle collision
  if (
    ball.x + ball.radius > rightPaddle.x &&
    ball.y > rightPaddle.y &&
    ball.y < rightPaddle.y + rightPaddle.height
  ) {
    ball.x = rightPaddle.x - ball.radius;
    ball.dx *= -1;
    ball.dy += rightPaddle.dy * 0.2;
  }

  // Score check
  if (ball.x - ball.radius < 0) {
    rightScore++;
    updateScore();
    if (checkGameOver()) return;
    resetBall(1);
  }
  if (ball.x + ball.radius > WIDTH) {
    leftScore++;
    updateScore();
    if (checkGameOver()) return;
    resetBall(-1);
  }

  // AI for right paddle: follow the ball
  let target = ball.y - rightPaddle.height / 2;
  let diff = target - rightPaddle.y;
  rightPaddle.dy = Math.sign(diff) * Math.min(PADDLE_SPEED, Math.abs(diff));
  rightPaddle.y += rightPaddle.dy;
  if (rightPaddle.y < 0) rightPaddle.y = 0;
  if (rightPaddle.y + rightPaddle.height > HEIGHT)
    rightPaddle.y = HEIGHT - rightPaddle.height;

  // Draw everything
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  drawCenterLine();
  drawPaddle(leftPaddle);
  drawPaddle(rightPaddle);
  drawBall(ball);

  gameLoopId = requestAnimationFrame(update);
}

// 只在游戏 running 时响应鼠标和触摸事件
canvas.addEventListener('mousemove', function (e) {
  if (!gameRunning) return;
  const rect = canvas.getBoundingClientRect();
  const y = e.clientY - rect.top;
  let newY = y - leftPaddle.height / 2;
  if (newY < 0) newY = 0;
  if (newY + leftPaddle.height > HEIGHT)
    newY = HEIGHT - leftPaddle.height;
  leftPaddle.dy = newY - leftPaddle.y;
  leftPaddle.y = newY;
});
canvas.addEventListener('touchmove', function (e) {
  if (!gameRunning) return;
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const touch = e.touches[0];
  const y = touch.clientY - rect.top;
  let newY = y - leftPaddle.height / 2;
  if (newY < 0) newY = 0;
  if (newY + leftPaddle.height > HEIGHT)
    newY = HEIGHT - leftPaddle.height;
  leftPaddle.dy = newY - leftPaddle.y;
  leftPaddle.y = newY;
}, { passive: false });

startBtn.onclick = () => {
  if (!gameRunning) startGame();
};
stopBtn.onclick = () => {
  if (gameRunning) endGame(false);
};

window.onload = function () {
  updateScore();
  updateTimerDisplay();
  showHistory();
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  drawCenterLine();
  drawPaddle(leftPaddle);
  drawPaddle(rightPaddle);
  drawBall(ball);
};

