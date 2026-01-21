// Configuración del juego
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const gridSize = 20;
const tileCount = canvas.width / gridSize;

// Variables del juego
let snake = [{ x: 10, y: 10 }];
let food = { x: 15, y: 15 };
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let score = 0;
let level = 1;
let gameRunning = false;
let gamePaused = false;
let gameOver = false;
let speed = 7; // Actualización por frame
let frameCount = 0;

// Elementos del DOM
const scoreDisplay = document.getElementById('score');
const levelDisplay = document.getElementById('level');
const statusDisplay = document.getElementById('status');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const speedDisplay = document.getElementById('speedDisplay');
const speedBar = document.getElementById('speedBar');

// Elementos móviles
const mobileControls = document.getElementById('mobileControls');
const mobileStartBtn = document.getElementById('mobileStartBtn');
const mobilePauseBtn = document.getElementById('mobilePauseBtn');
const arrowButtons = document.querySelectorAll('.arrow-btn');

// Detectar si es dispositivo móvil
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// Si es móvil, ocultar botones de escritorio y mostrar móviles
if (isMobile) {
    document.querySelector('.button-group').style.display = 'none';
    mobileControls.style.display = 'flex';
}

// Configuración de niveles de velocidad
const speedLevels = [
    { minSpeed: 1, maxSpeed: 3, emoji: '🐢', name: 'Muy Lenta', color: '#4ade80' },
    { minSpeed: 3, maxSpeed: 5, emoji: '🐇', name: 'Lenta', color: '#22c55e' },
    { minSpeed: 5, maxSpeed: 7, emoji: '🦊', name: 'Normal', color: '#f59e0b' },
    { minSpeed: 7, maxSpeed: 9, emoji: '⚡', name: 'Rápida', color: '#f97316' },
    { minSpeed: 9, maxSpeed: 10, emoji: '🔥', name: '¡EXTREMA!', color: '#ef4444' }
];

// Event Listeners - Escritorio
startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', togglePause);
resetBtn.addEventListener('click', resetGame);

// Event Listeners - Móvil
mobileStartBtn.addEventListener('click', startGame);
mobilePauseBtn.addEventListener('click', togglePause);

// Botones de dirección móvil
arrowButtons.forEach(btn => {
    btn.addEventListener('click', handleMobileDirection);
    // Prevenir zoom en móviles
    btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        handleMobileDirection.call(btn, e);
    }, { passive: false });
});

// Teclado
document.addEventListener('keydown', handleKeyPress);

// Funciones principales
function startGame() {
    if (!gameRunning) {
        gameRunning = true;
        gamePaused = false;
        gameOver = false;

        // Actualizar botones de escritorio
        startBtn.disabled = true;
        pauseBtn.disabled = false;

        // Actualizar botones móviles
        mobileStartBtn.disabled = true;
        mobilePauseBtn.disabled = false;

        statusDisplay.textContent = '¡Juego en progreso!';
        statusDisplay.classList.remove('gameover');
        gameLoop();
    }
}

function togglePause() {
    if (gameRunning) {
        gamePaused = !gamePaused;
        if (gamePaused) {
            pauseBtn.textContent = 'Reanudar';
            mobilePauseBtn.textContent = 'Reanudar';
            statusDisplay.textContent = '⏸️ Juego pausado';
        } else {
            pauseBtn.textContent = 'Pausar';
            mobilePauseBtn.textContent = 'Pausar';
            statusDisplay.textContent = '▶️ Juego en progreso';
            gameLoop();
        }
    }
}

function updateSpeed() {
    // Calcular velocidad basada en nivel (1-10)
    const maxLevel = 10;
    const speedRatio = Math.min(level / maxLevel, 1);
    speed = 1 + speedRatio * 9; // Rango de 1 a 10

    // Determinar el nivel de velocidad
    let speedLevel = speedLevels[0];
    for (let sl of speedLevels) {
        if (speed >= sl.minSpeed && speed < sl.maxSpeed) {
            speedLevel = sl;
            break;
        }
    }
    if (speed >= 9) speedLevel = speedLevels[4]; // Extrema

    // Actualizar display
    speedDisplay.textContent = `${speedLevel.emoji} ${speedLevel.name}`;

    // Actualizar barra de velocidad
    const fillPercentage = (speed / 10) * 100;
    speedBar.style.width = fillPercentage + '%';
    speedBar.style.backgroundColor = speedLevel.color;
}

function resetGame() {
    snake = [{ x: 10, y: 10 }];
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    score = 0;
    level = 1;
    speed = 1;
    gameRunning = false;
    gamePaused = false;
    gameOver = false;
    frameCount = 0;

    scoreDisplay.textContent = '0';
    levelDisplay.textContent = '1';
    speedDisplay.textContent = '🐢 Muy Lenta';
    speedBar.style.width = '0%';
    statusDisplay.textContent = 'Presiona "Iniciar Juego" para comenzar';
    statusDisplay.classList.remove('gameover');

    // Actualizar botones de escritorio
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    pauseBtn.textContent = 'Pausar';

    // Actualizar botones móviles
    mobileStartBtn.disabled = false;
    mobilePauseBtn.disabled = true;
    mobilePauseBtn.textContent = 'Pausar';

    generarComida();
    draw();
}

function handleKeyPress(e) {
    if (!gameRunning) return;

    switch (e.key) {
        case 'ArrowUp':
            if (direction.y === 0) {
                nextDirection = { x: 0, y: -1 };
                e.preventDefault();
            }
            break;
        case 'ArrowDown':
            if (direction.y === 0) {
                nextDirection = { x: 0, y: 1 };
                e.preventDefault();
            }
            break;
        case 'ArrowLeft':
            if (direction.x === 0) {
                nextDirection = { x: -1, y: 0 };
                e.preventDefault();
            }
            break;
        case 'ArrowRight':
            if (direction.x === 0) {
                nextDirection = { x: 1, y: 0 };
                e.preventDefault();
            }
            break;
        case ' ':
            togglePause();
            e.preventDefault();
            break;
    }
}

function handleMobileDirection(e) {
    if (!gameRunning) return;

    const direction_map = this.dataset.direction;

    switch (direction_map) {
        case 'up':
            if (direction.y === 0) {
                nextDirection = { x: 0, y: -1 };
            }
            break;
        case 'down':
            if (direction.y === 0) {
                nextDirection = { x: 0, y: 1 };
            }
            break;
        case 'left':
            if (direction.x === 0) {
                nextDirection = { x: -1, y: 0 };
            }
            break;
        case 'right':
            if (direction.x === 0) {
                nextDirection = { x: 1, y: 0 };
            }
            break;
    }
}

function gameLoop() {
    if (!gamePaused && gameRunning) {
        frameCount++;
        // Mayor velocidad = menor intervalo de frames
        const speedThreshold = Math.max(1, 11 - speed);
        if (frameCount >= speedThreshold) {
            update();
            frameCount = 0;
        }
    }

    draw();

    if (gameRunning && !gameOver) {
        requestAnimationFrame(gameLoop);
    }
}

function update() {
    direction = nextDirection;

    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

    // Verificar colisiones con paredes
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        endGame();
        return;
    }

    // Verificar colisión consigo mismo
    for (let segment of snake) {
        if (head.x === segment.x && head.y === segment.y) {
            endGame();
            return;
        }
    }

    snake.unshift(head);

    // Verificar si comió la comida
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreDisplay.textContent = score;

        // Aumentar nivel cada 25 puntos
        const newLevel = Math.floor(score / 25) + 1;
        if (newLevel !== level) {
            level = newLevel;
            levelDisplay.textContent = level;
            updateSpeed();
        }

        generarComida();
    } else {
        snake.pop();
    }
}

function generarComida() {
    let newFood;
    let validPosition = false;

    while (!validPosition) {
        newFood = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };

        validPosition = !snake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
    }

    food = newFood;
}

function draw() {
    // Limpiar canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Dibujar grid (opcional, para mejor visualización)
    ctx.strokeStyle = '#2a2a2a';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= tileCount; i++) {
        ctx.beginPath();
        ctx.moveTo(i * gridSize, 0);
        ctx.lineTo(i * gridSize, canvas.height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i * gridSize);
        ctx.lineTo(canvas.width, i * gridSize);
        ctx.stroke();
    }

    // Dibujar culebrita
    snake.forEach((segment, index) => {
        if (index === 0) {
            // Cabeza - gradiente verde
            const gradient = ctx.createLinearGradient(
                segment.x * gridSize, segment.y * gridSize,
                (segment.x + 1) * gridSize, (segment.y + 1) * gridSize
            );
            gradient.addColorStop(0, '#4ade80');
            gradient.addColorStop(1, '#16a34a');
            ctx.fillStyle = gradient;
        } else {
            // Cuerpo - verde más oscuro
            ctx.fillStyle = '#22c55e';
        }

        ctx.fillRect(
            segment.x * gridSize + 1,
            segment.y * gridSize + 1,
            gridSize - 2,
            gridSize - 2
        );

        // Borde de los segmentos
        ctx.strokeStyle = '#15803d';
        ctx.lineWidth = 1;
        ctx.strokeRect(
            segment.x * gridSize + 1,
            segment.y * gridSize + 1,
            gridSize - 2,
            gridSize - 2
        );
    });

    // Dibujar ojos de la cabeza
    if (snake.length > 0) {
        const head = snake[0];
        ctx.fillStyle = '#000';
        const eyeOffset = 4;
        const eyeSize = 2;

        if (direction.x === 1) {
            // Mirando derecha
            ctx.fillRect(head.x * gridSize + 12, head.y * gridSize + 6, eyeSize, eyeSize);
            ctx.fillRect(head.x * gridSize + 12, head.y * gridSize + 12, eyeSize, eyeSize);
        } else if (direction.x === -1) {
            // Mirando izquierda
            ctx.fillRect(head.x * gridSize + 6, head.y * gridSize + 6, eyeSize, eyeSize);
            ctx.fillRect(head.x * gridSize + 6, head.y * gridSize + 12, eyeSize, eyeSize);
        } else if (direction.y === -1) {
            // Mirando arriba
            ctx.fillRect(head.x * gridSize + 6, head.y * gridSize + 6, eyeSize, eyeSize);
            ctx.fillRect(head.x * gridSize + 12, head.y * gridSize + 6, eyeSize, eyeSize);
        } else if (direction.y === 1) {
            // Mirando abajo
            ctx.fillRect(head.x * gridSize + 6, head.y * gridSize + 12, eyeSize, eyeSize);
            ctx.fillRect(head.x * gridSize + 12, head.y * gridSize + 12, eyeSize, eyeSize);
        }
    }

    // Dibujar comida (manzana)
    const gradient = ctx.createRadialGradient(
        food.x * gridSize + gridSize / 2, food.y * gridSize + gridSize / 2, 2,
        food.x * gridSize + gridSize / 2, food.y * gridSize + gridSize / 2, gridSize / 2
    );
    gradient.addColorStop(0, '#ff6b6b');
    gradient.addColorStop(1, '#c92a2a');
    ctx.fillStyle = gradient;
    ctx.fillRect(
        food.x * gridSize + 2,
        food.y * gridSize + 2,
        gridSize - 4,
        gridSize - 4
    );

    // Tallo de la manzana
    ctx.fillStyle = '#4a7c4e';
    ctx.fillRect(
        food.x * gridSize + 8,
        food.y * gridSize,
        4,
        4
    );
}

function endGame() {
    gameRunning = false;
    gameOver = true;
    pauseBtn.disabled = true;
    startBtn.disabled = false;
    statusDisplay.textContent = `🎮 ¡GAME OVER! Puntuación Final: ${score}`;
    statusDisplay.classList.add('gameover');
    draw();
}

// Inicializar el juego
resetGame();
