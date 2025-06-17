let isRecording = false;
let rhythm = [];
let startTime;
let audioContext = new (window.AudioContext || window.webkitAudioContext)();
let clickAudioBuffer = null; // Para padrões
let userAudioBuffer = null;  // Para o ritmo do usuário

const recordBtn = document.getElementById("recordBtn");
const playBtn = document.getElementById("playBtn");
const saveBtn = document.getElementById("saveBtn");
const sequenceBtn = document.getElementById("sequenceBtn");
const status = document.getElementById("status");
const detectionArea = document.getElementById("detectionArea");

async function loadClickSound(soundFile) {
  if (!soundFile) {
    clickAudioBuffer = null;
    userAudioBuffer = null;
    return;
  }
  try {
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
  status.innerText = "Pressione ESPAÇO ou o botão verde para marcar batida, ENTER para parar.";
  recordBtn.textContent = "Parar (Enter)";
  playBtn.disabled = true;
  saveBtn.disabled = true;
  sequenceBtn.disabled = true;
  detectionArea.innerHTML = "";

  recordBtn.classList.add("recording"); // adiciona a classe
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
  // Convertendo tempos para intervalos inteiros em ms
  for (let i = rhythm.length - 1; i > 0; i--) {
    rhythm[i] = Math.round(rhythm[i] - rhythm[i - 1]);
  }
  rhythm.shift();

  status.innerText = `Ritmo gravado com ${rhythm.length + 1} batidas.\nPressione 'Tocar Ritmo' para ouvir.`;
  recordBtn.textContent = "Gravar Ritmo";
  playBtn.disabled = false;
  saveBtn.disabled = false;
  sequenceBtn.disabled = true;
  detectionArea.innerHTML = "";
  recordBtn.classList.remove("recording"); // remove classe após 
  playBtn.classList.add("highlighted");
}
async function registerHit() {
  if (!isRecording) return;
  rhythm.push(Date.now() - startTime);
  status.innerText = `Batida em ${rhythm[rhythm.length - 1]} ms`;
  await playUserClick();
}

recordBtn.onclick = () => {
  if (isRecording) {
    stopRecording();
  } else {
    startRecording();
  }
};

document.addEventListener("keydown", async (e) => {
  if (isRecording && e.code === "Space") {
    e.preventDefault();
    await registerHit();
  }
  if (isRecording && e.code === "Enter") {
    stopRecording();
  }
});

detectionArea.addEventListener("click", async () => {
  await registerHit();
});

playBtn.onclick = () => {
  if (!rhythm.length) return;
  status.innerText = "Tocando seu ritmo...";
  playBtn.classList.remove("highlighted");  // remove a cor ao tocar
  playRhythmWithCallback(rhythm, null, () => {
    status.innerText = "Ritmo finalizado. Se gostou, salve.";
    saveBtn.classList.add("highlighted"); // destaque para salvar
  });
};



saveBtn.onclick = () => {
  status.innerText = "Ritmo salvo! Pronto para gerar sequência.";
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
    createMarkingArea();
    return;
  }

  status.innerText = `Tocando padrão ${currentIndex + 1} de ${patterns.length}`;

  // Tocar o ritmo atual e aguardar terminar
  await new Promise(resolve => {
    playRhythmWithCallback(patterns[currentIndex], null, resolve);
  });

  // Espera 200 ms
  await new Promise(r => setTimeout(r, 200));

  // Toca o som declick grave
  await playDeepClick();

  // Espera mais 200 ms antes do próximo padrão
  await new Promise(r => setTimeout(r, 200));

  currentIndex++;
  playNextPattern();
}

// Função para tocar som grave declick
async function playDeepClick() {
  if (audioContext.state === "suspended") {
    await audioContext.resume();
  }

  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(100, audioContext.currentTime);  // frequência grave
  gain.gain.setValueAtTime(1, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1); // duração curta

  osc.connect(gain).connect(audioContext.destination);
  osc.start();
  osc.stop(audioContext.currentTime + 0.1);

  // Aguarda o fim do som
  await new Promise(resolve => setTimeout(resolve, 150));
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

  playNextPattern();
};

function playRhythm(pattern) {
  let accumulatedTime = 0;
  playUserClick();
  pattern.forEach((interval) => {
    accumulatedTime += interval;
    setTimeout(() => playUserClick(), accumulatedTime);
  });
}
function playRhythmWithCallback(pattern, onUpdate, onComplete) {
  let accumulatedTime = 0;
  playBtn.classList.add("playing"); // COMEÇA a cor amarela

  playUserClick(); // toca a primeira batida do ritmo

  pattern.forEach((interval, i) => {
    accumulatedTime += interval;
    setTimeout(() => {
      playUserClick(); // toca as batidas seguintes
      if (onUpdate) onUpdate?.(i + 1);
      if (i === pattern.length - 1 && onComplete) {
        setTimeout(() => {
          playBtn.classList.remove("playing"); // REMOVE a cor amarela no fim
          onComplete();
        }, 50);
      }
    }, accumulatedTime);
  });
}


async function playClick() {
  if (audioContext.state === "suspended") {
    await audioContext.resume();
  }

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
  if (audioContext.state === "suspended") {
    await audioContext.resume();
  }

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

async function playDifferentClick() {
  if (audioContext.state === "suspended") {
    await audioContext.resume();
  }

  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(1500, audioContext.currentTime);
  gain.gain.setValueAtTime(1, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.07);
  osc.connect(gain).connect(audioContext.destination);
  osc.start();
  osc.stop(audioContext.currentTime + 0.07);
}

function generatePatterns(userRhythm, total = 10) {
  // Gera entre 1 e 3 ritmos idênticos ao seu (sem variação)
  const minReal = 1;
  const maxReal = 3;
  const numReal = randomInRange(minReal, maxReal);

  const rest = total - numReal;

  const numSimilar = randomInRange(0, rest);
  const numDifferent = rest - numSimilar;

  const output = [];

  // Ritmos EXATOS, sem alterações
  for (let i = 0; i < numReal; i++) {
    output.push([...userRhythm]); // cópia idêntica
  }

  // Ritmos similares, variações maiores, mas NUNCA iguais ao seu
  for (let i = 0; i < numSimilar; i++) {
    output.push(generateFakeSimilar(userRhythm));
  }

  // Ritmos diferentes totalmente aleatórios
  for (let i = 0; i < numDifferent; i++) {
    output.push(generateFakeDifferent(userRhythm));
  }

  return shuffleArray(output);
}

function generateFakeSimilar(reference) {
  const fake = [];
  for (let i = 0; i < reference.length; i++) {
    // variação entre 30 e 100 ms para garantir que nunca fique igual
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
    if (a[i] !== b[i]) return false;  // Exigência de igualdade EXATA
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
