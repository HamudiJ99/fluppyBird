const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const menu = document.getElementById('menu');
const gameOverMenu = document.getElementById('gameOverMenu');

// Spielvariablen
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

// Hintergrundbild
const bgImage = new Image();
bgImage.src = 'fluppy_bg.jpeg';

function showMenu() {
    menu.style.display = 'block';
    gameOverMenu.style.display = 'none';
    canvas.style.display = 'none';
}

function startGame() {
    menu.style.display = 'none';
    canvas.style.display = 'block';
    resetGame();
    update();
}

// Steuerelemente
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !gameOver) {
        bird.velocity = bird.lift;
    }
});

// Spielfunktion
function update() {
    if (gameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Hintergrundbild
    ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);

    // Vogel
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    if (bird.y + bird.height > canvas.height || bird.y < 0) {
        endGame();
    }

    ctx.fillStyle = 'yellow';
    ctx.fillRect(bird.x, bird.y, bird.width, bird.height);

    // Röhren
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

        // obere Röhre
        ctx.fillStyle = 'green';
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.y);

        // untere Röhre
        ctx.fillRect(pipe.x, pipe.y + pipeGap, pipeWidth, canvas.height - pipe.y - pipeGap);

        // Kollisionserkennung
        if (
            bird.x < pipe.x + pipeWidth &&
            bird.x + bird.width > pipe.x &&
            (bird.y < pipe.y || bird.y + bird.height > pipe.y + pipeGap)
        ) {
            endGame();
        }
    });

    // Punkte
    ctx.fillStyle = 'black';
    ctx.font = '16px Arial';
    ctx.fillText(`Score: ${score}`, 10, 20);

    frameCount++;
    requestAnimationFrame(update);
}

// Spiel beenden
function endGame() {
    gameOver = true;
    gameOverMenu.style.display = 'block';
}

// Spiel zurücksetzen
function resetGame() {
    bird.y = 150;
    bird.velocity = 0;
    pipes.length = 0;
    score = 0;
    frameCount = 0;
    gameOver = false;
    gameOverMenu.style.display = 'none';
}

// Spiel neustarten
function restartGame() {
    resetGame();
    update();
}

// Initiale Anzeige des Menüs
showMenu();
