const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [
    { x: 10, y: 10 },
];
let food = generateFood();
let dx = 0;
let dy = 0;
let score = 0;
let gameLoop = null;
let isPaused = false;
let gameOver = false;

// Initialize game speed
let gameSpeed = 100;

function generateFood() {
    return {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
    };
}

function drawGame() {
    clearCanvas();
    moveSnake();
    drawFood();
    drawSnake();
    checkCollision();
    updateScore();
}

function clearCanvas() {
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawSnake() {
    ctx.fillStyle = '#4CAF50';
    snake.forEach((segment, index) => {
        if (index === 0) {
            // Draw head with gradient
            const gradient = ctx.createRadialGradient(
                segment.x * gridSize + gridSize/2,
                segment.y * gridSize + gridSize/2,
                0,
                segment.x * gridSize + gridSize/2,
                segment.y * gridSize + gridSize/2,
                gridSize/2
            );
            gradient.addColorStop(0, '#69F0AE');
            gradient.addColorStop(1, '#4CAF50');
            ctx.fillStyle = gradient;
        } else {
            ctx.fillStyle = '#4CAF50';
        }
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
    });
}

function drawFood() {
    ctx.fillStyle = '#FF5252';
    ctx.beginPath();
    ctx.arc(
        food.x * gridSize + gridSize/2,
        food.y * gridSize + gridSize/2,
        gridSize/2 - 2,
        0,
        Math.PI * 2
    );
    ctx.fill();
}

function moveSnake() {
    if (isPaused || gameOver) return;

    const head = { x: snake[0].x + dx, y: snake[0].y + dy };

    // Wrap around screen edges
    head.x = (head.x + tileCount) % tileCount;
    head.y = (head.y + tileCount) % tileCount;

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        score += 10;
        food = generateFood();
        increaseSpeed();
    } else {
        snake.pop();
    }
}

function checkCollision() {
    const head = snake[0];
    
    // Check self-collision
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            endGame();
        }
    }
}

function updateScore() {
    document.getElementById('score').textContent = `Score: ${score}`;
}

function increaseSpeed() {
    if (gameSpeed > 50) {
        gameSpeed -= 2;
        clearInterval(gameLoop);
        gameLoop = setInterval(drawGame, gameSpeed);
    }
}

function endGame() {
    gameOver = true;
    clearInterval(gameLoop);
    document.getElementById('game-over').style.display = 'block';
    document.getElementById('final-score').textContent = score;
}

function restartGame() {
    snake = [{ x: 10, y: 10 }];
    food = generateFood();
    dx = 0;
    dy = 0;
    score = 0;
    gameSpeed = 100;
    gameOver = false;
    isPaused = false;
    document.getElementById('game-over').style.display = 'none';
    clearInterval(gameLoop);
    gameLoop = setInterval(drawGame, gameSpeed);
}

function togglePause() {
    isPaused = !isPaused;
}

// Handle keyboard controls
document.addEventListener('keydown', (event) => {
    if (gameOver) return;

    switch(event.key) {
        case 'ArrowUp':
            if (dy !== 1) { dx = 0; dy = -1; }
            break;
        case 'ArrowDown':
            if (dy !== -1) { dx = 0; dy = 1; }
            break;
        case 'ArrowLeft':
            if (dx !== 1) { dx = -1; dy = 0; }
            break;
        case 'ArrowRight':
            if (dx !== -1) { dx = 1; dy = 0; }
            break;
    }
});

// Add touch controls for mobile devices
let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener('touchstart', (event) => {
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
});

canvas.addEventListener('touchmove', (event) => {
    if (gameOver) return;
    event.preventDefault();

    const touchEndX = event.touches[0].clientX;
    const touchEndY = event.touches[0].clientY;
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (deltaX > 0 && dx !== -1) { dx = 1; dy = 0; }
        else if (deltaX < 0 && dx !== 1) { dx = -1; dy = 0; }
    } else {
        // Vertical swipe
        if (deltaY > 0 && dy !== -1) { dx = 0; dy = 1; }
        else if (deltaY < 0 && dy !== 1) { dx = 0; dy = -1; }
    }
});

// Start the game
gameLoop = setInterval(drawGame, gameSpeed);