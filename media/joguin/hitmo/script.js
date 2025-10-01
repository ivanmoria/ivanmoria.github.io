let audioContext = null;
let clickAudioBuffer = null;
let userAudioBuffer = null;
let isRecording = false;
let rhythm = [];
let startTime;

const recordBtn = document.getElementById("recordBtn");
const playBtn = document.getElementById("playBtn");
const saveBtn = document.getElementById("saveBtn");
const sequenceBtn = document.getElementById("sequenceBtn");
const status = document.getElementById("status");
const detectionArea = document.getElementById("detectionArea");

function initAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
}

async function loadClickSound(soundFile) {
  if (!soundFile) {
    clickAudioBuffer = null;
    userAudioBuffer = null;
    return;
  }
  try {
    initAudioContext();
    const response = await fetch(soundFile);
    if (!response.ok) throw new Error("Erro ao carregar som");
    const arrayBuffer = await response.arrayBuffer();
    const decoded = await audioContext.decodeAudioData(arrayBuffer.slice(0));
    userAudioBuffer = decoded;
    clickAudioBuffer = await audioContext.decodeAudioData(arrayBuffer.slice(0));
  } catch (e) {
    console.warn("Erro ao carregar som:", e);
    clickAudioBuffer = null;
    userAudioBuffer = null;
  }
}

const soundRadios = document.querySelectorAll('input[name="sound"]');
soundRadios.forEach(radio => {
  radio.addEventListener('change', async () => {
    if (radio.checked) {
      await loadClickSound(radio.value);
    }
  });
});

window.addEventListener('load', () => {
  const checkedRadio = document.querySelector('input[name="sound"]:checked');
  if (checkedRadio) {
    loadClickSound(checkedRadio.value);
  }
});

function startRecording() {
  rhythm = [];
  startTime = Date.now();
  isRecording = true;
status.innerHTML = "Pressione ESPAÇO ou o botão verde para marcar batida.<br>ENTER ou o botão vermelho para parar.";
status.style.textAlign = "center";

  recordBtn.textContent = "Parar (Enter)";
  playBtn.disabled = true;
  saveBtn.disabled = true;
  sequenceBtn.disabled = true;
  detectionArea.innerHTML = "Marcar Ritmo (Espaço)";
  detectionArea.style.display = "block";
  recordBtn.classList.add("recording");
}

function stopRecording() {
  isRecording = false;
  if (rhythm.length < 2) {
    status.innerText = "Ritmo muito curto. Grave pelo menos duas batidas.";
    rhythm = [];
    playBtn.disabled = true;
    recordBtn.classList.remove("recording");
      detectionArea.style.display = "none";
    saveBtn.disabled = true;
    recordBtn.textContent = "Gravar Ritmo";
    return;
  }

  for (let i = rhythm.length - 1; i > 0; i--) {
    rhythm[i] = Math.round(rhythm[i] - rhythm[i - 1]);
  }
  rhythm.shift();

  status.innerText = `Ritmo gravado com ${rhythm.length + 1} batidas.\nPressione 'Tocar Ritmo' para ouvir.`;
  recordBtn.textContent = "Gravar Ritmo";
  playBtn.disabled = false;
  recordBtn.disabled = true;
  saveBtn.disabled = true;
  sequenceBtn.disabled = true;
  detectionArea.innerHTML = "";
  detectionArea.style.display = "none";
  recordBtn.classList.remove("recording");

}

async function registerHit() {
  if (!isRecording) return;
  initAudioContext();
  rhythm.push(Date.now() - startTime);
  status.innerText = `Batida em ${rhythm[rhythm.length - 1]} ms`;
  await playUserClick();
}

recordBtn.onclick = () => {
  initAudioContext();
  if (isRecording) {
    stopRecording();
  } else {
    startRecording();
  }
};

document.addEventListener("keydown", async (e) => {
  if (e.code === "Space") {
    e.preventDefault();
    await registerHit();
  }
  if (e.code === "Enter") {
    stopRecording();
  }
});

detectionArea.addEventListener("click", async () => {
  await registerHit();
});

playBtn.onclick = () => {
  if (!rhythm.length) return;
  initAudioContext();
  status.innerText = "Tocando seu ritmo...";
  playBtn.classList.remove("highlighted");
  playRhythmWithCallback(rhythm, null, () => {
    status.innerText = "Ritmo finalizado. Se gostou, salve. Caso contrário, grave novamente.";
    recordBtn.disabled = false;
      playBtn.disabled = false;
  
  saveBtn.disabled = false;
  sequenceBtn.disabled = true;

  });
};

saveBtn.onclick = () => {
  status.innerText = "Ritmo salvo! Pronto para gerar sequência.";
  recordBtn.disabled = true;
  playBtn.disabled = true;
  saveBtn.disabled = true;
  sequenceBtn.disabled = false;

};

sequenceBtn.onclick = () => {
  const patterns = generatePatterns(rhythm, 10);
  detectionArea.innerHTML = "";
  let currentIndex = 0;
  let userCount = 0;
  status.innerText = "Tocando sequência de ritmos...";

  async function playNextPattern() {
    if (currentIndex >= patterns.length) {
      status.innerText = `Sequência finalizada! Marque quantas vezes ouviu seu ritmo abaixo:`;
    recordBtn.style.display = "inline";
    playBtn.style.display = "inline";
    saveBtn.style.display = "inline";
    sequenceBtn.style.display =  "inline";

    detectionArea.style.display = "block";

      createMarkingArea();
      return;
    }

    status.innerText = `Tocando padrão ${currentIndex + 1} de ${patterns.length}`;
    recordBtn.style.display = "none";
    playBtn.style.display = "none";
    saveBtn.style.display = "none";
    sequenceBtn.style.display = "none";


    sequenceBtn.disabled = true;
    await new Promise(resolve => {
      playRhythmWithCallback(patterns[currentIndex], null, resolve);
    });

    await new Promise(r => setTimeout(r, 200));
    await playDeepClick();
    await new Promise(r => setTimeout(r, 200));

    currentIndex++;
    playNextPattern();
  }

  async function playDeepClick() {
    initAudioContext();
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(100, audioContext.currentTime);
    gain.gain.setValueAtTime(1, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);

    osc.connect(gain).connect(audioContext.destination);
    osc.start();
    osc.stop(audioContext.currentTime + 0.1);

    await new Promise(resolve => setTimeout(resolve, 150));
  }


  function updateStatusAndHighlight(message, button, highlightClass = "highlighted") {
  status.innerText = message;

  // Remove destaque de todos os botões
  [recordBtn, playBtn, saveBtn, sequenceBtn].forEach(btn => {
    btn.classList.remove("highlighted", "saved", "ready", "playing", "recording");
  });

  // Adiciona destaque ao botão desejado
  if (button) {
    button.classList.add(highlightClass);
  }
}

  function createMarkingArea() {
    detectionArea.innerHTML = "";
    const btn = document.createElement("button");
    btn.innerText = "Marcar Aparição";
    btn.onclick = () => {
      userCount++;
      status.innerText = `Você marcou ${userCount} vezes.`;
    };
    detectionArea.appendChild(btn);


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
        detectionArea.style.display = "none";
  }

  playNextPattern();
};

function playRhythmWithCallback(pattern, onUpdate, onComplete) {
  let accumulatedTime = 0;
  playBtn.classList.add("playing");
  playUserClick();

  pattern.forEach((interval, i) => {
    accumulatedTime += interval;
    setTimeout(() => {
      playUserClick();
      if (onUpdate) onUpdate(i + 1);
      if (i === pattern.length - 1 && onComplete) {
        setTimeout(() => {
          playBtn.classList.remove("playing");
          onComplete();
        }, 50);
      }
    }, accumulatedTime);
  });
}

async function playClick() {
  initAudioContext();
  if (!clickAudioBuffer) {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(1000, audioContext.currentTime);
    gain.gain.setValueAtTime(1, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.05);
    osc.connect(gain).connect(audioContext.destination);
    osc.start();
    osc.stop(audioContext.currentTime + 0.05);
    return;
  }

  const source = audioContext.createBufferSource();
  source.buffer = clickAudioBuffer;
  source.connect(audioContext.destination);
  source.start();
}

async function playUserClick() {
  initAudioContext();
  if (!userAudioBuffer) {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(800, audioContext.currentTime);
    gain.gain.setValueAtTime(1, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.05);
    osc.connect(gain).connect(audioContext.destination);
    osc.start();
    osc.stop(audioContext.currentTime + 0.05);
    return;
  }

  const source = audioContext.createBufferSource();
  source.buffer = userAudioBuffer;
  source.connect(audioContext.destination);
  source.start();
}

function generatePatterns(userRhythm, total = 10) {
  const minReal = 1;
  const maxReal = 3;
  const numReal = randomInRange(minReal, maxReal);

  const rest = total - numReal;
  const numSimilar = randomInRange(0, rest);
  const numDifferent = rest - numSimilar;

  const output = [];

  for (let i = 0; i < numReal; i++) {
    output.push([...userRhythm]);
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
    fake.push(reference[i] + randomInRange(30, 100));
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
    if (a[i] !== b[i]) return false;
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
