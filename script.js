const board = document.querySelector('.board');
const resetButton = document.getElementById('reset-button');
const playAgainButton = document.getElementById('play-again');
const bombCountDisplay = document.getElementById('bomb-count');
const flagCountDisplay = document.getElementById('flag-count');
const overlay = document.getElementById('overlay');
const message = document.getElementById('message');

let size = 10;
let bombFrequency = 0.15;
let bombs = [];
let revealedTiles = 0;
let flaggedTiles = 0;
let gameOver = false;

function initializeGame() {
    revealedTiles = 0;
    flaggedTiles = 0;
    gameOver = false;
    bombs = [];
    board.innerHTML = '';
    bombCountDisplay.textContent = `Bombs: ${Math.floor(size * size * bombFrequency)}`;
    flagCountDisplay.textContent = `Flags: 0`;
    generateBoard();
    placeBombs();
    calculateNumbers();
}

function generateBoard() {
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            const tile = document.createElement('div');
            tile.dataset.tile = `${i},${j}`;
            tile.addEventListener('click', handleTileClick);
            tile.addEventListener('contextmenu', handleRightClick);
            board.appendChild(tile);
        }
    }
    board.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
}

function placeBombs() {
    const bombCount = Math.floor(size * size * bombFrequency);
    while (bombs.length < bombCount) {
        const x = Math.floor(Math.random() * size);
        const y = Math.floor(Math.random() * size);
        if (!bombs.includes(`${x},${y}`)) {
            bombs.push(`${x},${y}`);
        }
    }
}

function calculateNumbers() {
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            if (!bombs.includes(`${i},${j}`)) {
                const neighbors = getNeighbors(i, j);
                const bombCount = neighbors.filter(n => bombs.includes(n)).length;
                if (bombCount > 0) {
                    const tile = document.querySelector(`[data-tile="${i},${j}"]`);
                    tile.dataset.number = bombCount;
                }
            }
        }
    }
}

function getNeighbors(x, y) {
    const neighbors = [];
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) continue;
            const nx = x + i;
            const ny = y + j;
            if (nx >= 0 && nx < size && ny >= 0 && ny < size) {
                neighbors.push(`${nx},${ny}`);
            }
        }
    }
    return neighbors;
}

function handleTileClick(event) {
    if (gameOver) return;
    const tile = event.target;
    const [x, y] = tile.dataset.tile.split(',').map(Number);
    if (tile.classList.contains('flagged')) return;
    if (bombs.includes(`${x},${y}`)) {
        gameOver = true;
        revealAllBombs();
        message.textContent = 'Game Over!';
        overlay.classList.remove('hidden');
    } else {
        revealTile(x, y);
        if (revealedTiles === size * size - bombs.length) {
            gameOver = true;
            message.textContent = 'You Win!';
            overlay.classList.remove('hidden');
        }
    }
}

function revealTile(x, y) {
    const tile = document.querySelector(`[data-tile="${x},${y}"]`);
    if (tile.classList.contains('revealed') || tile.classList.contains('flagged')) return;
    tile.classList.add('revealed');
    revealedTiles++;
    if (tile.dataset.number) {
        tile.textContent = tile.dataset.number;
    } else {
        const neighbors = getNeighbors(x, y);
        neighbors.forEach(n => {
            const [nx, ny] = n.split(',').map(Number);
            revealTile(nx, ny);
        });
    }
}

function revealAllBombs() {
    bombs.forEach(bomb => {
        const tile = document.querySelector(`[data-tile="${bomb}"]`);
        tile.classList.add('revealed', 'bomb');
    });
}

function handleRightClick(event) {
    event.preventDefault();
    if (gameOver) return;
    const tile = event.target;
    if (tile.classList.contains('revealed')) return;
    if (tile.classList.contains('flagged')) {
        tile.classList.remove('flagged');
        flaggedTiles--;
    } else {
        tile.classList.add('flagged');
        flaggedTiles++;
    }
    flagCountDisplay.textContent = `Flags: ${flaggedTiles}`;
}

resetButton.addEventListener('click', initializeGame);
playAgainButton.addEventListener('click', () => {
    overlay.classList.add('hidden');
    initializeGame();
});

initializeGame();