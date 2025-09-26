const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

// Paddle settings
const PADDLE_WIDTH = 12;
const PADDLE_HEIGHT = 80;
const PADDLE_MARGIN = 20;
const PADDLE_SPEED = 6;

// Ball settings
const BALL_RADIUS = 10;
const BALL_SPEED = 5;

// Score
let leftScore = 0;
let rightScore = 0;

// Paddle objects
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

// Ball object
const ball = {
  x: WIDTH / 2,
  y: HEIGHT / 2,
  radius: BALL_RADIUS,
  dx: BALL_SPEED * (Math.random() > 0.5 ? 1 : -1),
  dy: BALL_SPEED * (Math.random() * 2 - 1)
};

// Draw paddle
function drawPaddle(paddle) {
  ctx.fillStyle = "#fff";
  ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

// Draw ball
function drawBall(ball) {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = "#fff";
  ctx.fill();
  ctx.closePath();
}

// Draw center dashed line
function drawCenterLine() {
  ctx.strokeStyle = "#fff";
  ctx.setLineDash([10, 10]);
  ctx.beginPath();
  ctx.moveTo(WIDTH / 2, 0);
  ctx.lineTo(WIDTH / 2, HEIGHT);
  ctx.stroke();
  ctx.setLineDash([]);
}

// Reset ball to the center
function resetBall(direction) {
  ball.x = WIDTH / 2;
  ball.y = HEIGHT / 2;
  ball.dx = BALL_SPEED * direction;
  ball.dy = BALL_SPEED * (Math.random() * 2 - 1);
}

// Update the score display
function updateScore() {
  document.getElementById("left-score").textContent = leftScore;
  document.getElementById("right-score").textContent = rightScore;
}

// Game loop
function update() {
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
    // Add some "english" based on paddle movement
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
    resetBall(1);
  }
  if (ball.x + ball.radius > WIDTH) {
    leftScore++;
    updateScore();
    resetBall(-1);
  }

  // AI for right paddle: follow the ball
  let target = ball.y - rightPaddle.height / 2;
  let diff = target - rightPaddle.y;
  rightPaddle.dy = Math.sign(diff) * Math.min(PADDLE_SPEED, Math.abs(diff));
  rightPaddle.y += rightPaddle.dy;
  // Clamp
  if (rightPaddle.y < 0) rightPaddle.y = 0;
  if (rightPaddle.y + rightPaddle.height > HEIGHT)
    rightPaddle.y = HEIGHT - rightPaddle.height;

  // Draw everything
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  drawCenterLine();
  drawPaddle(leftPaddle);
  drawPaddle(rightPaddle);
  drawBall(ball);

  requestAnimationFrame(update);
}

// Mouse moves left paddle
canvas.addEventListener('mousemove', function (e) {
  const rect = canvas.getBoundingClientRect();
  const y = e.clientY - rect.top;
  // Center the paddle on the mouse
  let newY = y - leftPaddle.height / 2;
  // Clamp
  if (newY < 0) newY = 0;
  if (newY + leftPaddle.height > HEIGHT)
    newY = HEIGHT - leftPaddle.height;
  leftPaddle.dy = newY - leftPaddle.y; // For "english" on hit
  leftPaddle.y = newY;
});

// Touch support for mobile
canvas.addEventListener('touchmove', function (e) {
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

// Start the game
updateScore();
update();