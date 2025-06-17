 let isRecording = false;
  let rhythm = [];
  let startTime;
  let audioContext = new (window.AudioContext || window.webkitAudioContext)();

  const recordBtn = document.getElementById("recordBtn");
  const playBtn = document.getElementById("playBtn");
  const saveBtn = document.getElementById("saveBtn");
  const sequenceBtn = document.getElementById("sequenceBtn");
  const status = document.getElementById("status");
  const detectionArea = document.getElementById("detectionArea");

  let patterns = [];

  function startRecording() {
    rhythm = [];
    startTime = Date.now();
    isRecording = true;
    status.innerText = "Gravando... Pressione ESPAÇO para marcar batida.\nClique novamente ou pressione ENTER para parar.";
    playBtn.disabled = true;
    saveBtn.disabled = true;
    sequenceBtn.disabled = true;
    detectionArea.innerHTML = "";
    recordBtn.textContent = "Parar Gravação (Enter)";
  }

  function stopRecording() {
    isRecording = false;
    if (rhythm.length < 2) {
      status.innerText = "Ritmo muito curto. Grave pelo menos duas batidas.";
      rhythm = [];
      playBtn.disabled = true;
      saveBtn.disabled = true;
      recordBtn.textContent = "Gravar Ritmo";
      return;
    }

    let converted = [];
    for (let i = 1; i < rhythm.length; i++) {
      converted.push(rhythm[i] - rhythm[i - 1]);
    }
    rhythm = converted;

    status.innerText = `Ritmo gravado com ${rhythm.length + 1} batidas.\nPressione 'Tocar Ritmo' para ouvir.`;
    playBtn.disabled = false;
    saveBtn.disabled = false;
    sequenceBtn.disabled = true;
    detectionArea.innerHTML = "";
    recordBtn.textContent = "Gravar Ritmo";
  }

  recordBtn.onclick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  document.addEventListener("keydown", (e) => {
    if (isRecording && e.code === "Space") {
      const time = Date.now() - startTime;
      rhythm.push(time);
      status.innerText = `Batida em ${time}ms`;
    }

    if (isRecording && e.code === "Enter") {
      stopRecording();
    }
  });

  playBtn.onclick = () => {
    if (!rhythm.length) return;
    status.innerText = "Tocando seu ritmo...";
    playRhythm(rhythm);
  };

  saveBtn.onclick = () => {
    status.innerText = "Ritmo salvo! Pronto para gerar sequência.";
    sequenceBtn.disabled = false;
  };

  sequenceBtn.onclick = () => {
    patterns = generatePatterns(rhythm, 10);

    detectionArea.innerHTML = "";
    let currentIndex = 0;
    let userCount = 0;

    status.innerText = "Tocando sequência de ritmos...";

    function playNextPattern() {
      if (currentIndex >= patterns.length) {
        status.innerText = `Sequência finalizada! Marque quantas vezes ouviu seu ritmo abaixo:`;
        createMarkingArea();
        return;
      }

      status.innerText = `Tocando padrão ${currentIndex + 1} de ${patterns.length}`;
      playRhythmWithCallback(patterns[currentIndex], null, () => {
        setTimeout(() => {
          currentIndex++;
          playNextPattern();
        }, 300);
      });
    }

    playNextPattern();

    function createMarkingArea() {
      detectionArea.innerHTML = "";
      const btn = document.createElement("button");
      btn.innerText = "Marcar Aparição";
      btn.onclick = () => {
        userCount++;
        status.innerText = `Você marcou ${userCount} vezes.`;
      };
      detectionArea.appendChild(btn);

      const submit = document.createElement("button");
      submit.innerText = "Enviar Resultado";
      submit.onclick = () => showResult(userCount);
      detectionArea.appendChild(document.createElement("br"));
      detectionArea.appendChild(submit);
    }

    function showResult(userCount) {
      let realCount = 0;
      patterns.forEach((pat) => {
        if (compareRhythms(pat, rhythm)) realCount++;
      });

      status.innerText = `Fim!\nSeu ritmo apareceu ${realCount} vezes.\nVocê marcou ${userCount} vezes.\nAcertos: ${Math.min(userCount, realCount)}\nErros: ${Math.max(0, userCount - realCount)}`;
      detectionArea.innerHTML = "";
    }
  };

  function playRhythm(pattern) {
    let accumulatedTime = 0;
    playClick();
    pattern.forEach((interval) => {
      accumulatedTime += interval;
      setTimeout(() => playClick(), accumulatedTime);
    });
  }

  function playRhythmWithCallback(pattern, onUpdate, onComplete) {
    let accumulatedTime = 0;
    playClick();
    if (onUpdate) onUpdate();

    pattern.forEach((interval, i) => {
      accumulatedTime += interval;
      setTimeout(() => {
        playClick();
        if (onUpdate) onUpdate(i + 1);
        if (i === pattern.length - 1 && onComplete) {
          setTimeout(onComplete, 100);
        }
      }, accumulatedTime);
    });
  }

  function playClick() {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(1000, audioContext.currentTime);
    gain.gain.setValueAtTime(1, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.05);
    osc.connect(gain).connect(audioContext.destination);
    osc.start();
    osc.stop(audioContext.currentTime + 0.05);
  }
function generatePatterns(userRhythm, total) {
  const numReal = Math.floor(Math.random() * (total - 2)) + 1; // entre 1 e total-2
  const rest = total - numReal;

  // dividir o restante entre similar e diferente aleatoriamente
  const numSimilar = Math.floor(Math.random() * rest);
  const numDifferent = rest - numSimilar;

  const output = [];

  for (let i = 0; i < numReal; i++) {
    output.push(userRhythm.map(v => v + randomInRange(-10, 10)));
  }

  for (let i = 0; i < numSimilar; i++) {
    output.push(generateFakeSimilar(userRhythm));
  }

  for (let i = 0; i < numDifferent; i++) {
    output.push(generateFakeDifferent(userRhythm));
  }

  return shuffleArray(output);
}


  function generateFakeSimilar(reference) {
    const fake = [];
    for (let i = 0; i < reference.length; i++) {
      fake.push(reference[i] + randomInRange(-40, 40));
    }
    return fake;
  }

  function generateFakeDifferent(reference) {
    const len = reference.length + randomInRange(-2, 2);
    const fake = [];
    for (let i = 0; i < Math.max(2, len); i++) {
      fake.push(randomInRange(100, 600));
    }
    return fake;
  }

  function randomInRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function compareRhythms(a, b) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (Math.abs(a[i] - b[i]) > 25) return false;
    }
    return true;
  }

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }