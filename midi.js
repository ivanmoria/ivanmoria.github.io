let midiAccess;
let startTime = null;
let noteData = {};
let playStarted = false;
let noteOnCounter = 0;
const requiredNoteOns = 3; // Número de notas ON necessárias antes de iniciar o timer
let firstEntry = true; // Controla se é a primeira linha da tabela
let lastNoteTime = null; // Armazena o tempo da última nota ON para calcular o IOI
let updateInterval = 100;  // Intervalo de atualização do gráfico em milissegundos
let maxPoints = 200;       // Limita o número de pontos no gráfico
let iois = [];             // Array para armazenar os IOIs
let times = [];            // Array para armazenar os tempos dos eventos

function updateGraph() {
    // Limitar o número de pontos para evitar travamento
    if (iois.length > maxPoints) {
        iois.shift();  // Remove o primeiro item (mais antigo) para manter o gráfico com número fixo de pontos
        times.shift();
    }

    const trace = {
        x: times,
        y: iois,
        mode: 'lines+markers',
        type: 'scatter',
        name: 'IoI',
        line: { shape: 'spline' }
    };

    const layout = {
        title: 'Gráfico IoI (Inter-Onset Interval)',
        xaxis: { title: 'Tempo (ms)' },
        yaxis: {
            title: 'IoI (ms)',
            rangemode: 'tozero', // Garante que o valor mínimo no eixo Y seja zero
            autorange: true,     // Permite que o eixo Y se ajuste automaticamente
            tickmode: 'array',
            tickvals: getTickValues(iois),
            ticktext: getTickText(iois),
        },
    };

    // Usar Plotly.react para atualizar o gráfico de forma eficiente
    Plotly.react('graph', [trace], layout);
}

// Função para gerar valores de ticks
function getTickValues(iois) {
    const maxIoI = Math.max(...iois);
    const minIoI = Math.min(...iois);
    const step = (maxIoI - minIoI) / 5; // Dividir em 5 intervalos

    const tickValues = [];
    for (let i = minIoI; i <= maxIoI; i += step) {
        tickValues.push(Math.round(i));
    }

    return tickValues;
}

// Função para gerar os textos dos ticks
function getTickText(iois) {
    const tickValues = getTickValues(iois);
    return tickValues.map(value => `${value} ms`);
}

// Função de atualização periódica do gráfico
function startGraphUpdate() {
    if (playStarted) {
        updateGraph();
        setTimeout(startGraphUpdate, updateInterval);  // Atualiza o gráfico a cada 'updateInterval' milissegundos
    }
}


async function initMIDI() {
    if (!navigator.requestMIDIAccess) {
        alert("A API Web MIDI não é suportada neste navegador.");
        return;
    }

    try {
        midiAccess = await navigator.requestMIDIAccess();
        updateDevices();
        midiAccess.onstatechange = updateDevices;
    } catch (err) {
        console.error("Erro ao acessar MIDI:", err);
    }
}

function updateDevices() {
    const devicesList = document.getElementById("devices");
    const inputs = Array.from(midiAccess.inputs.values());

    devicesList.innerHTML = inputs.length ? "" : "Nenhum dispositivo encontrado.";

    inputs.forEach(input => {
        const listItem = document.createElement("li");
        listItem.textContent = `${input.name} - (${input.manufacturer || "Desconhecido"})`;
        devicesList.appendChild(listItem);

        input.onmidimessage = handleMIDIMessage;
    });
}

function handleMIDIMessage(event) {
    const [status, note, velocity] = event.data;

    if (status >= 144 && status < 160 && velocity > 0) { // Note ON
        noteOnCounter++;

        if (noteOnCounter === requiredNoteOns + 1) {
            startTime = performance.now(); // Inicia o timer na 4ª nota ON
            console.log("Timer iniciado!");
        }

        if (startTime && noteOnCounter > requiredNoteOns) { // Apenas registra após a 4ª nota
            let timeElapsed = Math.round(performance.now() - startTime);
            if (firstEntry) {
                timeElapsed = 0; // A primeira linha sempre será t = 0
                firstEntry = false;
            }

            if (lastNoteTime !== null) {
                let ioI = timeElapsed - lastNoteTime; // Calculando o IOI
                iois.push(ioI);  // Adiciona o IOI ao gráfico
                times.push(timeElapsed);  // Adiciona o tempo correspondente
            }
            lastNoteTime = timeElapsed;  // Atualiza o tempo da última nota

            noteData[note] = { startTime: performance.now(), velocity: velocity };
        }
    }

    if (startTime && noteOnCounter > requiredNoteOns) { // Apenas registra após a 4ª nota
        if ((status >= 128 && status < 144) || (status >= 144 && status < 160 && velocity === 0)) { // Nota Desligada (OFF)
            if (note in noteData) {
                let pressDuration = Math.round(performance.now() - noteData[note].startTime);
                let savedVelocity = noteData[note].velocity;
                addToTable(timeElapsed, getNoteName(note), savedVelocity, pressDuration);
                delete noteData[note];
            }
        }
    }
}

function getNoteName(noteNumber) {
    const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    const octave = Math.floor(noteNumber / 12) - 1;
    return `${notes[noteNumber % 12]}${octave}`;
}

function addToTable(time, note, velocity, pressDur) {
    const tableBody = document.getElementById("logTableBody");

    let row = document.createElement("tr");
    row.innerHTML = `
        <td>${time}</td>
        <td>${note}</td>
        <td>${velocity}</td>
        <td>${pressDur}</td>
    `;

    tableBody.prepend(row);

    while (tableBody.rows.length > 100) {
        tableBody.deleteRow(100);
    }
}

document.getElementById("playButton").addEventListener("click", () => {
    startTime = null;
    lastNoteTime = null;  // Reseta o tempo da última nota
    document.getElementById("logTableBody").innerHTML = "";
    playStarted = true;
    noteOnCounter = 0;
    firstEntry = true; // Reset para garantir que a primeira nota tenha t = 0
    console.log("Play pressionado. Toque 4 notas para iniciar o timer e o registro.");
    startGraphUpdate();  // Inicia a atualização do gráfico
});

initMIDI();
