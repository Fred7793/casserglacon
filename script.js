let score = 0;
let isSmashing = false;
let gameOver = false;
let record = localStorage.getItem('record') ? parseInt(localStorage.getItem('record')) : 0;
let iceIntervalTime = 2000; 
const minSpeed = 1.3; // Vitesse minimale fixée à 1.3
const maxSpeed = 1.5; // Vitesse maximale fixée à 1.5
let currentSpeedIce1 = 0; // Vitesse actuelle de ice1
let currentSpeedIce2 = 0; // Vitesse actuelle de ice2

// Récupérer les éléments du DOM
const smashButton = document.getElementById('smashButton');
const scoreDisplay = document.getElementById('score');
const recordDisplay = document.getElementById('record');
const ice1 = document.getElementById('ice1');
const ice2 = document.getElementById('ice2'); 
const character = document.querySelector('.character');
const gameOverMessage = document.createElement('div'); 
const smashSound = new Audio('smash.mp3'); 

// Initialisation de l'affichage du record
recordDisplay.textContent = `Record : ${record}`;

gameOverMessage.style.position = 'absolute';
gameOverMessage.style.top = '40%';
gameOverMessage.style.left = '50%';
gameOverMessage.style.transform = 'translate(-50%, -50%)';
gameOverMessage.style.fontSize = '24px';
gameOverMessage.style.fontWeight = 'bold';
gameOverMessage.style.color = 'red';
gameOverMessage.style.display = 'none';
document.body.appendChild(gameOverMessage);

// Fonction pour démarrer le jeu
function startGame() {
    resetIce(ice1);
    resetIce(ice2);
    gameOver = false;
    score = 0;
    updateScore();
    setNewSpeed(); // Définit la vitesse initiale des glaçons
    ice1.style.display = 'block';
    ice2.style.display = 'none'; 
    moveIce(ice1, currentSpeedIce1);
}

// Fonction pour réinitialiser la position d'un glaçon
function resetIce(ice) {
    ice.style.left = '-30px';
    ice.style.display = 'block';
}

// Fonction pour déplacer un glaçon avec une vitesse spécifique
function moveIce(ice, iceSpeed) {
    if (gameOver) return;

    function animate() {
        if (gameOver) return;

        let currentPosition = parseFloat(ice.style.left) || 0;
        currentPosition += iceSpeed;
        ice.style.left = `${currentPosition}px`;

        const containerRect = document.querySelector('.game-container').getBoundingClientRect();
        const iceRect = ice.getBoundingClientRect();

        // Déclencher Game Over uniquement si le glaçon est entièrement sorti du comptoir
        if (iceRect.right > containerRect.right) {
            triggerGameOver();
            return;
        }

        requestAnimationFrame(animate);
    }
    animate();
}

// Fonction pour obtenir une nouvelle vitesse aléatoire entre 1.3 et 1.5
function setNewSpeed() {
    currentSpeedIce1 = Math.random() * (maxSpeed - minSpeed) + minSpeed; // Définir une vitesse aléatoire pour ice1
    currentSpeedIce2 = Math.random() * (maxSpeed - minSpeed) + minSpeed; // Définir une vitesse aléatoire pour ice2
}

// Fonction pour générer un nouveau glaçon
function generateIce(ice) {
    if (gameOver) return;

    resetIce(ice);
    moveIce(ice, ice === ice1 ? currentSpeedIce1 : currentSpeedIce2);

    // Si le score atteint 15, lancer le deuxième glaçon
    if (score >= 15 && ice2.style.display === 'none') {
        ice2.style.display = 'block';
        moveIce(ice2, currentSpeedIce2);
    }
}

// Fonction déclenchée lors de la tentative de casser un glaçon
function smash() {
    if (isSmashing || gameOver) return;

    isSmashing = true;
    character.classList.add('smashing');
    smashSound.currentTime = 0;
    smashSound.play();

    setTimeout(() => {
        const charRect = character.getBoundingClientRect();
        let smashed = false;

        [ice1, ice2].forEach(ice => {
            const iceRect = ice.getBoundingClientRect();
            if (ice.style.display !== 'none' && iceRect.left < charRect.right && iceRect.right > charRect.left) {
                score++;
                updateScore();
                resetIce(ice);
                setNewSpeed(); // Redéfinit les vitesses des glaçons après chaque cassage
                moveIce(ice, ice === ice1 ? currentSpeedIce1 : currentSpeedIce2);
                smashed = true;
            }
        });

        character.classList.remove('smashing');
        isSmashing = false;
    }, 100); 
}

// Fonction pour mettre à jour le score
function updateScore() {
    scoreDisplay.textContent = `Score : ${score}`;

    if (score > record) {
        record = score;
        localStorage.setItem('record', record);
        recordDisplay.textContent = `Record : ${record}`;
    }

    iceIntervalTime = Math.max(500, 2000 - score * 50); 
}

// Fonction pour gérer le "Game Over"
function triggerGameOver() {
    gameOver = true;
    gameOverMessage.textContent = 'Game Over! Cliquez pour recommencer.';
    gameOverMessage.style.display = 'block';
    smashButton.disabled = true;
    ice1.style.display = 'none';
    ice2.style.display = 'none';
}

// Fonction pour redémarrer le jeu
function restartGame() {
    gameOverMessage.style.display = 'none';
    smashButton.disabled = false;
    startGame();
}

// Écouteurs d'événements
smashButton.addEventListener('click', smash);
gameOverMessage.addEventListener('click', restartGame);

document.addEventListener('keydown', function(event) {
    if (event.code === 'Space' && !gameOver) {
        smash();
    }
});

// Démarrer le jeu
startGame();
