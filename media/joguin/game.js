(() => {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const scoreDiv = document.getElementById('score');
  const gameOverOverlay = document.getElementById('gameOverOverlay');
  const audioFundo = document.getElementById('audioFundo');
  const startOverlay = document.getElementById('startOverlay');
  const startButtonContainer = document.getElementById('startButtonContainer');

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

  const ENEMY_COLORS = [
    '#FF6B6B', '#FF8E72', '#FFA07A', '#FF7675',
    '#FF5252', '#FF1744', '#D32F2F', '#C62828', '#B71C1C', '#A00000'
  ];

  // Initialize systems
  const noteMapping = new NoteMapping();
  const chordManager = new ChordManager(noteMapping);
  const animationSystem = new AnimationSystem();
  const soundEffects = new SoundEffects();
  const difficultyManager = new DifficultyManager();
  const scorePersistence = new ScorePersistence();

  // Game state
  let gameMode = null;
  let musicFile = null;
  let csvFile = null;
  let laserTimes = [];
  let chordTimeline = [];

  let playerPos = { row: 7, col: 0 };
  let dangerPositions = [];
  let targetPos = null;
  let greenPos = null;

  let score = 0;
  let lives = 0;
  let gameOver = false;
  let lastChordChangeTime = 0;

  let laserIndex = 0;
  let chordIndex = 0;
  let startTime = null;
  let damageCooldown = false;
  let pauseStartTime = null;
  let totalPausedDuration = 0;
  let gameEnded = false;
  let isPaused = false;

  function togglePause() {
    const pauseBtn = document.querySelector('button[onclick="togglePause()"]');
    isPaused = !isPaused;

    if (isPaused) {
      pauseStartTime = performance.now();
      audioFundo.pause();

      const highScore = scorePersistence.getHighScore();
      const sessionHighScore = Math.max(score, highScore);

      gameOverOverlay.innerHTML = `
        <div style="text-align:center; margin-top: -15%;color:white; font-size: 24px;">
          <strong>Jogo Pausado</strong><br>
          Maior Score: ${sessionHighScore}<br>
          Score atual: ${score}<br>
          Vidas: ${lives}<br>
          <br>
          <button id="continueBtn">Continuar (P)</button> <br>
          <button onclick="location.reload()">Voltar (Esc)</button>
        </div>`;
      gameOverOverlay.style.visibility = 'visible';

      const continueBtn = document.getElementById('continueBtn');
      if (continueBtn) {
        continueBtn.onclick = resumeGame;
      }
    } else {
      resumeGame();
    }
  }

  function resumeGame() {
    isPaused = false;
    totalPausedDuration += performance.now() - pauseStartTime;
    pauseStartTime = null;
    gameOverOverlay.style.visibility = 'hidden';
    audioFundo.play().catch(err => console.log('Erro ao tocar áudio:', err));
    requestAnimationFrame(gameLoop);
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
      startButtonContainer.innerHTML = '<button class="start-btn" onclick="startGame()">Iniciar<br> (Enter)</button>';
    }
  }

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      const startBtn = document.querySelector('.start-btn');
      if (startBtn) startBtn.click();
    }
  });

  async function loadCSV() {
    try {
      const response = await fetch(csvFile);
      if (!response.ok) throw new Error('Erro ao carregar CSV');
      const text = await response.text();
      const lines = text.trim().split('\n');

      laserTimes = [];
      chordTimeline = [];

      lines.slice(1).forEach(line => {
        const parts = line.split(',');
        const time = parseFloat(parts[0]);
        const eventType = parts[1]?.trim();
        const data = parts[2]?.trim();

        if (!isNaN(time)) {
          if (eventType === 'enemySpawn') {
            laserTimes.push(time);
          } else if (eventType === 'chordChange' && data) {
            chordTimeline.push({ time, chord: data });
          }
        }
      });

      chordManager.setChordTimeline(chordTimeline);
    } catch (e) {
      console.warn('CSV load error:', e);
      laserTimes = [1, 2.5, 4, 5.5, 7, 8.5, 10];
      chordTimeline = [{ time: 0, chord: 'C Major' }, { time: 5, chord: 'G Major' }];
    }
  }

  function drawBoard() {
    WIDTH = canvas.width;
    HEIGHT = canvas.height;
    SQUARE_SIZE = WIDTH / COLS;

    // Draw checkerboard
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        ctx.fillStyle = (r + c) % 2 === 0 ? COLORS.LIGHT_BROWN : COLORS.BROWN;
        ctx.fillRect(c * SQUARE_SIZE, r * SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE);
      }
    }

    // Draw note labels
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let c = 0; c < COLS; c++) {
      const note = noteMapping.getColNote(c);
      ctx.fillText(note, c * SQUARE_SIZE + SQUARE_SIZE / 2, 15);
    }

    for (let r = 0; r < ROWS; r++) {
      const note = noteMapping.getRowNote(r);
      ctx.fillText(note, 15, r * SQUARE_SIZE + SQUARE_SIZE / 2);
    }

    // Draw chord flash
    const flashes = animationSystem.getScreenFlashes();
    flashes.forEach(flash => {
      const progress = flash.elapsed / flash.duration;
      const alpha = (1 - progress) * 0.3;
      ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
    });
  }

  function drawElements() {
    const radius = SQUARE_SIZE / 3;

    // Draw enemies
    for (const pos of dangerPositions) {
      const centerX = pos.col * SQUARE_SIZE + SQUARE_SIZE / 2;
      const centerY = pos.row * SQUARE_SIZE + SQUARE_SIZE / 2;

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.fillStyle = pos.color || '#FF0000';
      ctx.fill();
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.closePath();
    }

    // Draw food
    if (targetPos) {
      ctx.drawImage(
        foodImage,
        targetPos.col * SQUARE_SIZE,
        targetPos.row * SQUARE_SIZE,
        SQUARE_SIZE,
        SQUARE_SIZE
      );
    }

    // Draw gift
    if (greenPos) {
      ctx.drawImage(
        giftImage,
        greenPos.col * SQUARE_SIZE,
        greenPos.row * SQUARE_SIZE,
        SQUARE_SIZE,
        SQUARE_SIZE
      );
    }

    // Draw player
    let playerColor = '#0000FF';
    if (lives > 0) {
      const colors = ['#8A2BE2', '#FFD700', '#FFFACD', '#F5F5F5', '#FFFFFF'];
      playerColor = colors[Math.min(lives - 1, colors.length - 1)];
    }

    const centerX = playerPos.col * SQUARE_SIZE + SQUARE_SIZE / 2;
    const centerY = playerPos.row * SQUARE_SIZE + SQUARE_SIZE / 2;

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fillStyle = playerColor;
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.closePath();
  }

  function spawnDangerPositions() {
    const validPositions = chordManager.getValidPositionsForCurrentChord();
    const count = difficultyManager.getEnemyCount(gameMode, score);
    const selected = validPositions.sort(() => 0.5 - Math.random()).slice(0, Math.min(count, validPositions.length));

    return selected.map((pos, i) => ({
      ...pos,
      color: ENEMY_COLORS[i % ENEMY_COLORS.length]
    }));
  }

  function spawnTarget() {
    const positions = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const occupied =
          (r === playerPos.row && c === playerPos.col) ||
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
        const occupied =
          (r === playerPos.row && c === playerPos.col) ||
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

    // Update chord
    chordManager.updateTime(elapsed);

    // Spawn enemies on trigger
    if (laserIndex < laserTimes.length && elapsed >= laserTimes[laserIndex]) {
      dangerPositions = spawnDangerPositions();
      soundEffects.playEnemySpawn();
      laserIndex++;
    }

    // Spawn target
    if (!targetPos) targetPos = spawnTarget();

    // Check collect food
    if (targetPos && playerPos.row === targetPos.row && playerPos.col === targetPos.col) {
      score++;
      targetPos = null;
      soundEffects.playCollect();
      animationSystem.addFlash('#FFD700', 150);
      updateScore();
      if (score % 10 === 0 && !greenPos) spawnGreen();
    }

    // Check collect gift
    if (greenPos && playerPos.row === greenPos.row && playerPos.col === greenPos.col) {
      score += 3;
      lives += 1;
      greenPos = null;
      soundEffects.playGift();
      animationSystem.addFlash('#00FF00', 200);
      updateScore();
    }

    // Check collision
    const hitDanger = dangerPositions.some(p => p.row === playerPos.row && p.col === playerPos.col);
    if (hitDanger && !damageCooldown) {
      soundEffects.playDamage();
      animationSystem.addFlash('#FF0000', 150);

      if (gameMode === 'normal') {
        if (lives > 0) lives--;
      } else if (gameMode === 'hardcore') {
        if (lives > 0) {
          lives--;
        } else {
          gameOver = true;
          audioFundo.pause();
          soundEffects.playGameOver();
          showGameOver();
        }
      }

      updateScore();
      damageCooldown = true;
      const cooldown = difficultyManager.getDamageCooldown(gameMode, score);
      setTimeout(() => damageCooldown = false, cooldown);
    }
  }

  function draw() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    animationSystem.update(16);
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
    const allScores = scorePersistence.getHighScores();
    const highScore = scorePersistence.getHighScore();

    scorePersistence.addScore(score, gameMode, musicFile || 'custom');

    const scoresList = allScores.map((s, i) => `<div>${i + 1}. ${s.score} pts</div>`).join('');

    gameOverOverlay.innerHTML = `
      <div style="text-align:center; margin-top: -15%; color:white; font-size: 24px;">
        <strong>Fim do Jogo!</strong><br>
        Seu Score: ${score}<br>
        Maior Score: ${highScore}<br>
        <br><strong>Top Scores:</strong><br>${scoresList || 'Nenhum score'}<br><br>
        <button id="restartBtn">Reiniciar (R)</button><br>
        <button onclick="location.reload()">Voltar (Esc)</button>
      </div>`;
    gameOverOverlay.style.visibility = 'visible';

    document.getElementById('restartBtn').onclick = resetGame;
  }

  function resetGame() {
    playerPos = { row: 7, col: 0 };
    score = 0;
    lives = 0;
    dangerPositions = [];
    targetPos = null;
    greenPos = null;
    startTime = null;
    laserIndex = 0;
    chordIndex = 0;
    gameOver = false;
    gameEnded = false;
    damageCooldown = false;
    totalPausedDuration = 0;
    updateScore();
    gameOverOverlay.style.visibility = 'hidden';
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
    if (keys[key]) movePlayer(keys[key]);
  });

  window.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      location.reload();
    }
  });

  audioFundo.addEventListener('ended', () => {
    if (!gameOver) {
      gameOver = true;
      soundEffects.playGameOver();
      showGameOver();
    }
  });

  // Load images
  const foodImage = new Image();
  foodImage.src = 'food.png';

  const giftImage = new Image();
  giftImage.src = 'gift.png';

  const enemyImage = new Image();
  enemyImage.src = 'enemy.png';

  draw();
})();
