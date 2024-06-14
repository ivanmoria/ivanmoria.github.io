let num = 200;
let range = 20;
let ax = [];
let ay = [];
let currentAudio = null;

function setup() {
    let canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('canvas-container');
    for (let i = 0; i < num; i++) {
        ax[i] = width / 2;
        ay[i] = height / 2;
    }
    frameRate(20);
}

function draw() {
    background(43);
    for (let i =1; i < num; i++) {
        ax[i - 1] = ax[i];
        ay[i - 1] = ay[i];
    }
    ax[num - 1] += random(-range, range);
    ay[num - 1] += random(-range, range);
    ax[num - 1] = constrain(ax[num - 1], 0, width);
    ay[num - 1] = constrain(ay[num - 1], 0, height);
    for (let i = 1; i < num; i++) {
        let val = float(i) / num * 100.0 + 3;
        stroke(val);
        line(ax[i - 1], ay[i - 1], ax[i], ay[i]);
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function goToIndex() {
    window.location.href = "index.html";
}

document.addEventListener('DOMContentLoaded', function() {
    var wavesurfer1 = WaveSurfer.create({
        container: '#waveform1',
        waveColor: 'violet',
        progressColor: 'purple',
        backend: 'MediaElement'
    });
    wavesurfer1.load('media/Dino pintando o sete.mp3');

    var wavesurfer2 = WaveSurfer.create({
        container: '#waveform2',
        waveColor: 'violet',
        progressColor: 'purple',
        backend: 'MediaElement'
    });
    wavesurfer2.load('media/Perigoso.mp3');

    var audio1 = document.getElementById('audio1');
    var audio2 = document.getElementById('audio2');

    audio1.addEventListener('play', function() {
        if (currentAudio && currentAudio !== audio1) {
            currentAudio.pause();
            document.getElementById('playPauseBtn1').textContent = 'II'; // Pause Icon
        }
        currentAudio = audio1;
        wavesurfer1.play();
    });

    audio1.addEventListener('pause', function() {
        wavesurfer1.pause();
    });

    audio2.addEventListener('play', function() {
        if (currentAudio && currentAudio !== audio2) {
            currentAudio.pause();
            document.getElementById('playPauseBtn2').textContent = 'II'; // Pause Icon
        }
        currentAudio = audio2;
        wavesurfer2.play();
    });

    audio2.addEventListener('pause', function() {
        wavesurfer2.pause();
    });

    // Add event listeners to waveforms for seeking
    document.getElementById('waveform1').addEventListener('click', function(event) {
        var x = event.offsetX / this.offsetWidth;
        audio1.currentTime = x * audio1.duration;
        wavesurfer1.seekTo(x);
    });

    document.getElementById('waveform2').addEventListener('click', function(event) {
        var x = event.offsetX / this.offsetWidth;
        audio2.currentTime = x * audio2.duration;
        wavesurfer2.seekTo(x);
    });

    document.getElementById('playPauseBtn1').addEventListener('click', function() {
        togglePlayPause('audio1');
    });

    document.getElementById('playPauseBtn2').addEventListener('click', function() {
        togglePlayPause('audio2');
    });
});

function togglePlayPause(audioId) {
    var audio = document.getElementById(audioId);
    var playPauseBtn = document.getElementById('playPauseBtn' + audioId.slice(-1));
    if (audio.paused) {
        audio.play();
        playPauseBtn.textContent = 'II'; // Pause Icon
    } else {
        audio.pause();
        playPauseBtn.textContent = '\u25B6'; // Play Icon
    }
}

function formatTime(seconds) {
    var min = Math.floor(seconds / 60);
    var sec = Math.floor(seconds % 60);
    return (min < 10 ? '0' : '') + min + ':' + (sec < 10 ? '0' : '') + sec;
}

setInterval(function() {
    var audio1 = document.getElementById('audio1');
    var audio2 = document.getElementById('audio2');
    var playPauseBtn1 = document.getElementById('playPauseBtn1');
    var playPauseBtn2 = document.getElementById('playPauseBtn2');
    var currentTimeDisplay1 = document.getElementById('currentTime1');
    var currentTimeDisplay2 = document.getElementById('currentTime2');
    var durationDisplay1 = document.getElementById('duration1');
    var durationDisplay2 = document.getElementById('duration2');

    if (!audio1.paused) {
        currentTimeDisplay1.textContent = formatTime(audio1.currentTime);
        durationDisplay1.textContent = formatTime(audio1.duration);
    }

    if (!audio2.paused) {
        currentTimeDisplay2.textContent = formatTime(audio2.currentTime);
        durationDisplay2.textContent = formatTime(audio2.duration);
    }

    // Verificando o estado de reprodução dos áudios e atualizando os ícones
    if (!audio1.paused) {
        playPauseBtn1.textContent = 'II'; // Pause Icon
    } else {
        playPauseBtn1.textContent = '\u25B6'; // Play Icon
    }

    if (!audio2.paused) {
        playPauseBtn2.textContent = 'II'; // Pause Icon
    } else {
        playPauseBtn2.textContent = '\u25B6'; // Play Icon
    }

    // Se ambos os áudios estiverem tocando, pausa o outro
    if (!audio1.paused && !audio2.paused && audio1 !== audio2) {
        audio2.pause();
    }

    if (!audio2.paused && !audio1.paused && audio2 !== audio1) {
        audio1.pause();
    }
}, 1000);

