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
const pipeGap = 120; // Kleinerer Abstand zwischen den Röhren
let frameCount = 0;
let score = 0;
let gameOver = false;

const bgImage = new Image();
bgImage.src = 'fluppy_bg.jpeg';

const flapSound = new Audio('sfx_wing.mp3');
const dieSound = new Audio('sfx_die.mp3');

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
    if (!gameOver && (e.type === 'click' || e.type === 'touchstart') && bird.velocity >= 0) {
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
            score++;
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
    gameOverMenu.style.display = 'none';
}

function restartGame() {
    resetGame();
    update();
}

showMenu();
