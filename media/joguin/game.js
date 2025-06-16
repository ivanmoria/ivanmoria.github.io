
(() => {
  const canvas = document.getElementById('gameCanvas');


const foodImage = new Image();
foodImage.src = 'food.png';

const giftImage = new Image();
giftImage.src = 'gift.png';


const enemyImage = new Image();
enemyImage.src = 'enemy.png';

const ENEMY_COLORS = [
  '#000000', '#000000', '#000000', '#000000', '#000000',
  '#000000', '#000000', '#000000', '#000000', '#000000'
];



  const ctx = canvas.getContext('2d');

  const ROWS = 8, COLS = 8;
  let WIDTH = canvas.width, HEIGHT = canvas.height;
  let SQUARE_SIZE = WIDTH / COLS;

  const COLORS = {
    YELLOW: '#FFFF00',
    RED: '#FF0000',
    BLUE: '#0000FF',
    GREEN: '#00FF00',
    LIGHT_BROWN: '#DEB887',
    BROWN: '#8B4513'
  };

  let gameMode = null;
  let musicFile = null;
  let csvFile = null;
  let laserTimes = [];

  let playerPos = { row: 7, col: 0 };
  let dangerPositions = [];
  let targetPos = null;
  let greenPos = null;

  let score = 0;
  let lives = 0;
  let gameOver = false;
  let highScores = [];

  let lastScoreBeforeReset = null;

  let laserIndex = 0;
  let startTime = null;
  let damageCooldown = false;
  let pauseStartTime = null;
  let totalPausedDuration = 0;

  let isPaused = false;
  const scoreDiv = document.getElementById('score');
  const gameOverOverlay = document.getElementById('gameOverOverlay');
  const audioFundo = document.getElementById('audioFundo');
  const startOverlay = document.getElementById('startOverlay');
  const startButtonContainer = document.getElementById('startButtonContainer');
  let gameEnded = false;

function togglePause() {
  const pauseBtn = document.querySelector('button[onclick="togglePause()"]');

  isPaused = !isPaused;

  if (isPaused) {
    pauseStartTime = performance.now();
    audioFundo.pause();
    if (pauseBtn) pauseBtn.textContent = "Pause (P)";
    
    // Exibe overlay com scores (tipo tela de game over, mas com "Continuar")
    const sessionHighScore = Math.max(
      lastScoreBeforeReset || 0,
      highScores.length ? Math.max(...highScores) : 0
    );
    const highList = highScores.map((s, i) => `<div>${i + 1}ª tentativa: ${s}</div>`).join('');

    gameOverOverlay.innerHTML = `
      <div style="text-align:center; margin-top: -15%;color:white; font-size: 24px;">
        <strong>Jogo Pausado</strong><br>
        Maior Score nesta sessão: ${sessionHighScore}<br>
        Score atual: ${score}<br>
        <br>
        <strong>Scores anteriores:</strong><br>
        ${highList || '<div>Nenhuma tentativa anterior</div>'}<br><br>
        <button id="continueBtn">Continuar (P)</button> <br>
           <button onclick="location.reload()">Voltar (Esc)</button>
      </div>`;
    gameOverOverlay.style.visibility = 'visible';

    // Liga botão continuar
    const continueBtn = document.getElementById('continueBtn');
    if (continueBtn) {
      continueBtn.onclick = () => {
        isPaused = false;
        totalPausedDuration += performance.now() - pauseStartTime;
        pauseStartTime = null;
        gameOverOverlay.style.visibility = 'hidden';
        if (pauseBtn) pauseBtn.textContent = "Pause (P)";
        audioFundo.play().catch(err => console.log('Erro ao tocar áudio:', err));
        requestAnimationFrame(gameLoop);
      };
    }

  } else {
   // Continuar (se chamado por tecla P)
    isPaused = false;
    totalPausedDuration += performance.now() - pauseStartTime;
    pauseStartTime = null;
    gameOverOverlay.style.visibility = 'hidden';
    if (pauseBtn) pauseBtn.textContent = "Pause (P)";
    audioFundo.play().catch(err => console.log('Erro ao tocar áudio:', err));
    requestAnimationFrame(gameLoop);
  }

  }


window.togglePause = togglePause;

  window.setMode = function(mode) {
    gameMode = mode;
    document.querySelectorAll('#startOverlay button.mode-select').forEach(btn => {
      btn.classList.toggle('selected', btn.textContent.toLowerCase().includes(mode.toLowerCase()));
    });
    checkStartReady();
  };

  window.setMusic = function(audioSrc, csvSrc) {
    musicFile = audioSrc;
    csvFile = csvSrc;
    document.querySelectorAll('#startOverlay button.music-select').forEach(btn => {
      const match =
        (audioSrc.includes('musica1') && btn.textContent.includes('Música 1')) ||
        (audioSrc.includes('musica2') && btn.textContent.includes('Música 2')) ||
        (audioSrc.includes('musica3') && btn.textContent.includes('Música 3')) ||
        (audioSrc.includes('musica4') && btn.textContent.includes('Música 4'));
      btn.classList.toggle('music-selected', match);
    });
    checkStartReady();
  };

  function checkStartReady() {
    if (gameMode && musicFile && csvFile) {
      startButtonContainer.innerHTML = '<button  class="start-btn" onclick="startGame()">Iniciar<br> (Enter)</button>';
    }
  }
document.addEventListener('keydown', function(e) {
  if (e.key === 'Enter') {
    const startBtn = document.querySelector('.start-btn');
    if (startBtn) {
      startBtn.click();
    }
  }
});


  async function loadCSV() {
    try {
      const response = await fetch(csvFile);
      if (!response.ok) throw new Error('Erro ao carregar CSV');
      const text = await response.text();
      const lines = text.trim().split('\n');
      laserTimes = lines.slice(1).map(line => parseFloat(line.split(',')[0])).filter(t => !isNaN(t));
    } catch {
      laserTimes = [2, 5, 8, 12, 15];
    }
  }

  function drawBoard() {
    WIDTH = canvas.width;
    HEIGHT = canvas.height;
    SQUARE_SIZE = WIDTH / COLS;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        ctx.fillStyle = (r + c) % 2 === 0 ? COLORS.LIGHT_BROWN : COLORS.BROWN;
        ctx.fillRect(c * SQUARE_SIZE, r * SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE);
      }
    }
  }


function drawElements() {
  const radius = SQUARE_SIZE / 3;

// Desenhar inimigos como círculos coloridos
for (const pos of dangerPositions) {
  const centerX = pos.col * SQUARE_SIZE + SQUARE_SIZE / 2;
  const centerY = pos.row * SQUARE_SIZE + SQUARE_SIZE / 2;
  const radius = SQUARE_SIZE / 3;

  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  ctx.fillStyle = pos.color || '#FF0000'; // cor padrão caso não tenha
  ctx.fill();
  ctx.closePath();
}


  if (targetPos) {
    ctx.drawImage(
      foodImage,
      targetPos.col * SQUARE_SIZE,
      targetPos.row * SQUARE_SIZE,
      SQUARE_SIZE,
      SQUARE_SIZE
    );
  }
  if (greenPos) {
    ctx.drawImage(
      giftImage,
      greenPos.col * SQUARE_SIZE,
      greenPos.row * SQUARE_SIZE,
      SQUARE_SIZE,
      SQUARE_SIZE
    );
  }

  // Desenha o player como uma bolinha azul que fica mais clara conforme o número de vidas
let playerColor;
if (lives > 0) {
  // Degradê de cores baseado em vidas
  if (lives === 1) {
    playerColor = '#8A2BE2'; // Vibrante: BlueViolet
  } else if (lives === 2) {
    playerColor = '#FFD700'; // Dourado vibrante
  } else if (lives === 3) {
    playerColor = '#FFFACD'; // LemonChiffon (amarelo claro)
  } else if (lives === 4) {
    playerColor = '#F5F5F5'; // WhiteSmoke (quase branco)
  } else {
    playerColor = '#FFFFFF'; // Branco puro
  }
} else {
playerColor = score < 3 ? '#2F2F2F' : '#696969'; // Cinza quase preto → Cinza escuro
}

  const centerX = playerPos.col * SQUARE_SIZE + SQUARE_SIZE / 2;
  const centerY = playerPos.row * SQUARE_SIZE + SQUARE_SIZE / 2;

  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  ctx.fillStyle = playerColor;
  ctx.fill();
  ctx.closePath();
}
  function spawnDangerPositions() {
  const positions = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const isOccupied =
        (r === playerPos.row && c === playerPos.col) ||
        (targetPos && r === targetPos.row && c === targetPos.col) ||
        (greenPos && r === greenPos.row && c === greenPos.col);
      if (!isOccupied) positions.push({ row: r, col: c });
    }
  }

  const selected = positions.sort(() => 0.5 - Math.random()).slice(0, 10);
  return selected.map((pos, i) => ({
    ...pos,
    color: ENEMY_COLORS[i % ENEMY_COLORS.length]
  }));
}

  function spawnTarget() {
    const positions = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const occupied = (r === playerPos.row && c === playerPos.col) ||
          dangerPositions.some(p => p.row === r && p.col === c) ||
          (greenPos && r === greenPos.row && c === greenPos.col);
        if (!occupied) positions.push({ row: r, col: c });
      }
    }
    return positions.length ? positions[Math.floor(Math.random() * positions.length)] : null;
  }

  function spawnGreen() {
    const positions = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const occupied = (r === playerPos.row && c === playerPos.col) ||
          (targetPos && r === targetPos.row && c === targetPos.col) ||
          dangerPositions.some(p => p.row === r && p.col === c);
        if (!occupied) positions.push({ row: r, col: c });
      }
    }
    greenPos = positions.length ? positions[Math.floor(Math.random() * positions.length)] : null;
  }

  function updateScore() {
    scoreDiv.textContent = `Score: ${score} | Vidas: ${lives}`;
  }

  function update() {
    if (!startTime) startTime = performance.now();
    const elapsed = (performance.now() - startTime - totalPausedDuration) / 1000;

    if (laserIndex < laserTimes.length && elapsed >= laserTimes[laserIndex]) {
      dangerPositions = spawnDangerPositions();
      laserIndex++;
    }

    if (!targetPos) targetPos = spawnTarget();

    if (targetPos && playerPos.row === targetPos.row && playerPos.col === targetPos.col) {
      score++;
      targetPos = null;
      updateScore();
      if (score % 10 === 0 && !greenPos) spawnGreen();
    }

    if (greenPos && playerPos.row === greenPos.row && playerPos.col === greenPos.col) {
      score += 3;
      lives += 1;
      greenPos = null;
      updateScore();
    }

    const hitDanger = dangerPositions.some(p => p.row === playerPos.row && p.col === playerPos.col);
    if (hitDanger && !damageCooldown) {
      lastScoreBeforeReset = score;
      if (gameMode === 'normal') {
        lives > 0 ? lives-- : score = 0;
      } else if (gameMode === 'hardcore') {
        score = 0;
        if (lives > 0) {
          lives--;
        } else {
          gameOver = true;
          audioFundo.pause();
          showGameOver();
          if (!highScores.includes(lastScoreBeforeReset)) highScores.push(lastScoreBeforeReset);
        }
      }
      updateScore();
      damageCooldown = true;
      setTimeout(() => damageCooldown = false, 1000);
    }
  }

  function draw() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    drawBoard();
    drawElements();
  }

  function gameLoop() {
    if (isPaused || gameOver) return;
    update();
    draw();
    requestAnimationFrame(gameLoop);
  }

function showGameOver() {
  const sessionHighScore = Math.max(lastScoreBeforeReset || 0, ...highScores);
  const highList = highScores.map((s, i) => `<div>${i + 1}ª tentativa: ${s}</div>`).join('');
  gameOverOverlay.innerHTML = `
    <div style="text-align:center; margin-top: -15%; color:white; font-size: 24px;">
      Fim do Jogo!<br>
      Maior Score nesta sessão: ${sessionHighScore}<br>
      ${lastScoreBeforeReset !== null ? `Último score antes de morrer: ${lastScoreBeforeReset}<br>` : ''}
      <br><strong>Scores anteriores:</strong><br>${highList || 'Nenhuma tentativa anterior'}<br><br>
      <button id="restartBtn">Reiniciar (R)</button><br>
      <button onclick="location.reload()">Voltar (Esc)</button>
    </div>`;
  gameOverOverlay.style.visibility = 'visible';

  document.getElementById('restartBtn').onclick = resetGame;
}

  function hideGameOver() {
    gameOverOverlay.style.visibility = 'hidden';
  }

  document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    location.reload(); // Volta à configuração recarregando a página
  }
});


  function resetGame() {
    playerPos = { row: 7, col: 0 };
    score = 0;
    lives = 0;
    dangerPositions = [];
    targetPos = null;
    greenPos = null;
    startTime = null;
    laserIndex = 0;
    gameOver = false;
    gameEnded = false;
    damageCooldown = false;
    lastScoreBeforeReset = null;
    totalPausedDuration = 0;
    updateScore();
    hideGameOver();
    audioFundo.currentTime = 0;
    audioFundo.play().catch(err => console.log('Erro ao tocar áudio:', err));
    gameLoop();
  }

  window.movePlayer = function(dir) {
    if (gameOver) return;
    let { row, col } = playerPos;
    if (dir === 'up' && row > 0) row--;
    if (dir === 'down' && row < ROWS - 1) row++;
    if (dir === 'left' && col > 0) col--;
    if (dir === 'right' && col < COLS - 1) col++;
    playerPos = { row, col };
    update();
    draw();
  };

  window.startGame = function() {
    loadCSV().then(() => {
      startOverlay.style.display = 'none';
      audioFundo.src = musicFile;
      audioFundo.currentTime = 0;
      audioFundo.play().catch(err => console.log('Erro ao tocar áudio:', err));
      resetGame();
    });
  };

    window.addEventListener('keydown', e => {
    if (gameOver && e.code === 'KeyR') return document.getElementById('restartBtn')?.click();

    const key = e.key.toLowerCase();

    if (key === 'p') {
      togglePause();
      return;
    }

   
    const keys = { w: 'up', a: 'left', s: 'down', d: 'right' };
    if (keys[e.key.toLowerCase()]) movePlayer(keys[e.key.toLowerCase()]);
  });

  audioFundo.addEventListener('ended', () => {
    if (!gameOver) {
      gameOver = true;
      if (score > 0 && !highScores.includes(score)) highScores.push(score);
      showGameOver();
    }
  });

  draw(); // desenha tabuleiro inicial
})();