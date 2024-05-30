const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const menu = document.getElementById('menu');
const gameOverMenu = document.getElementById('gameOverMenu');
const highscoreMenu = document.getElementById('highscoreMenu');
const highscoreList = document.getElementById('highscoreList');
const playerSelect = document.getElementById('playerSelect');
const colorPickerContainer = document.getElementById('colorPickerContainer');

let selectedPlayer = 'Player 1';
let selectedColor = 'yellow';

const bird = {
    x: 50,
    y: 150,
    width: 20,
    height: 20,
    gravity: 0.4,
    lift: -8,
    velocity: 0
};

const pipes = [];
const pipeWidth = 30;
const pipeGap = 120;
let frameCount = 0;
let score = 0;
let gameOver = false;
let powerUp = null;
let powerUpActive = false;
let powerUpEndTime = 0;
let nextPowerUpTime = getRandomPowerUpTime();

const bgImage = new Image();
bgImage.src = 'fluppy_bg.jpeg';

const flapSound = new Audio('sfx_wing.mp3');
const dieSound = new Audio('sfx_die.mp3');
const powerUpImage = new Image();
powerUpImage.src = 'star.png';

colorPickerContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('color-picker')) {
        document.querySelectorAll('.color-picker').forEach(picker => {
            picker.classList.remove('selected');
        });
        e.target.classList.add('selected');
        selectedColor = e.target.getAttribute('data-color');
    }
});

function loadHighscores() {
    try {
        const data = localStorage.getItem('highscores');
        return data ? JSON.parse(data) : [];
    } catch (err) {
        console.error('Error loading highscores:', err);
        return [];
    }
}

function saveHighscores(highscores) {
    try {
        localStorage.setItem('highscores', JSON.stringify(highscores));
    } catch (err) {
        console.error('Error saving highscores:', err);
    }
}

function showHighscores() {
    const highscores = loadHighscores();
    const sortedHighscores = highscores.sort((a, b) => b.score - a.score);
    const top5 = sortedHighscores.slice(0, 5);

    highscoreList.innerHTML = '';

    top5.forEach((entry, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = `${index + 1}. ${entry.name}: ${entry.score}`;
        highscoreList.appendChild(listItem);
    });

    highscoreMenu.style.display = 'block';
    menu.style.display = 'none';
    gameOverMenu.style.display = 'none';
    canvas.style.display = 'none';
}

function showMenu() {
    menu.style.display = 'block';
    gameOverMenu.style.display = 'none';
    highscoreMenu.style.display = 'none';
    canvas.style.display = 'none';
}

function startGame() {
    selectedPlayer = playerSelect.value;
    menu.style.display = 'none';
    canvas.style.display = 'block';
    resetGame();
    update();
}

canvas.addEventListener('click', handleInput);
canvas.addEventListener('touchstart', handleInput);

function handleInput(e) {
    if (!gameOver && (e.type === 'mousedown' || e.type === 'touchstart')) {
        bird.velocity = bird.lift;
        flapSound.currentTime = 0;
        flapSound.play();
    }
}

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !gameOver) {
        bird.velocity = bird.lift;
        flapSound.currentTime = 0;
        flapSound.play();
    }
});

function createPowerUp() {
    let powerUpX, powerUpY;

    do {
        powerUpX = Math.random() * (canvas.width - 100) + 50;  // Power-Up nicht zu weit links oder rechts
        powerUpY = Math.random() * (canvas.height - 100) + 50; // Power-Up nicht zu weit oben oder unten
    } while (isPositionBlockedByPipes(powerUpX, powerUpY));

    powerUp = { x: powerUpX, y: powerUpY, width: 30, height: 30 };
}

function getRandomPowerUpTime() {
    // Returns a random time between 4 and 15 seconds in frames (assuming 60 FPS)
    return frameCount + Math.floor(Math.random() * 900) + 240;
}

function isPositionBlockedByPipes(xPosition, yPosition) {
    for (const pipe of pipes) {
        const topPipeBottom = pipe.y;
        const bottomPipeTop = pipe.y + pipeGap;

        // Prüfen, ob Power-Up horizontal in der Nähe der Säule liegt
        if (xPosition > pipe.x && xPosition < pipe.x + pipeWidth) {
            // Prüfen, ob Power-Up vertikal innerhalb der Lücke liegt
            if (yPosition > topPipeBottom && yPosition < bottomPipeTop) {
                return true;
            }
        }
    }
    return false;
}

function update() {
    if (gameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);

    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    if (bird.y + bird.height > canvas.height || bird.y < 0) {
        endGame();
    }

    ctx.fillStyle = selectedColor;
    ctx.fillRect(bird.x, bird.y, bird.width, bird.height);

    if (frameCount % 90 === 0) {
        const pipeHeight = Math.floor(Math.random() * (canvas.height - pipeGap));
        pipes.push({
            x: canvas.width,
            y: pipeHeight
        });
    }

    pipes.forEach((pipe, index) => {
        pipe.x -= 2;

        if (pipe.x + pipeWidth < 0) {
            pipes.splice(index, 1);
            score += powerUpActive ? 2 : 1;
        }

        ctx.fillStyle = 'green';
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.y);
        ctx.fillRect(pipe.x, pipe.y + pipeGap, pipeWidth, canvas.height - pipe.y - pipeGap);

        if (
            bird.x < pipe.x + pipeWidth &&
            bird.x + bird.width > pipe.x &&
            (bird.y < pipe.y || bird.y + bird.height > pipe.y + pipeGap)
        ) {
            endGame();
        }
    });

    if (powerUp && powerUp.x + powerUp.width > 0) {
        powerUp.x -= 2;
        ctx.drawImage(powerUpImage, powerUp.x, powerUp.y, powerUp.width, powerUp.height);

        if (
            bird.x < powerUp.x + powerUp.width &&
            bird.x + bird.width > powerUp.x &&
            bird.y < powerUp.y + powerUp.height &&
            bird.y + bird.height > powerUp.y
        ) {
            powerUp = null;
            powerUpActive = true;
            powerUpEndTime = frameCount + 300; // 5 Sekunden bei 60 FPS
        }
    } else if (frameCount >= nextPowerUpTime) {
        createPowerUp();
        nextPowerUpTime = getRandomPowerUpTime();
    }

    if (powerUpActive) {
        if (frameCount > powerUpEndTime) {
            powerUpActive = false;
        } else {
            ctx.drawImage(powerUpImage, 280, 10, 30, 30);
        }
    }

    ctx.fillStyle = 'white';
    ctx.font = 'bold 20px Arial';
    ctx.fillText(`Score: ${score}`, 10, 20);

    frameCount++;
    requestAnimationFrame(update);
}

function endGame() {
    gameOver = true;
    dieSound.currentTime = 0;
    dieSound.play();
    gameOverMenu.style.display = 'block';

    const highscores = loadHighscores();
    highscores.push({ name: selectedPlayer, score: score });
    highscores.sort((a, b) => b.score - a.score);
    highscores.splice(5);
    saveHighscores(highscores);
}

function resetGame() {
    bird.y = 150;
    bird.velocity = 0;
    pipes.length = 0;
    score = 0;
    frameCount = 0;
    gameOver = false;
    powerUp = null;
    powerUpActive = false;
    nextPowerUpTime = getRandomPowerUpTime();
    gameOverMenu.style.display = 'none';
}

function restartGame() {
    resetGame();
    update();
}

showMenu();
