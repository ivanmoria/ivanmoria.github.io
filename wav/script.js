document.addEventListener('DOMContentLoaded', () => {
    const audioPlayer = document.getElementById('audioPlayer');
    const visualizerPlaceholder = document.querySelector('.visualizer-placeholder');

    if (audioPlayer) {
        console.log('Audio player element found.');

        audioPlayer.addEventListener('play', () => {
            console.log('Audio playback started.');
            if (visualizerPlaceholder) {
                visualizerPlaceholder.textContent = 'Reproduzindo...';
                visualizerPlaceholder.style.fontStyle = 'normal';
                visualizerPlaceholder.style.color = '#2c3e50';
            }
        });

        audioPlayer.addEventListener('pause', () => {
            console.log('Audio playback paused.');
            if (visualizerPlaceholder) {
                visualizerPlaceholder.textContent = 'Pausado';
                visualizerPlaceholder.style.fontStyle = 'italic';
                visualizerPlaceholder.style.color = '#aaa';
            }
        });

        audioPlayer.addEventListener('ended', () => {
            console.log('Audio playback finished.');
            if (visualizerPlaceholder) {
                visualizerPlaceholder.textContent = 'Visualização de Áudio (em breve)';
                visualizerPlaceholder.style.fontStyle = 'italic';
                visualizerPlaceholder.style.color = '#aaa';
            }
        });

        // Initial state for placeholder
        if (visualizerPlaceholder) {
             visualizerPlaceholder.textContent = 'Pronto para tocar';
             visualizerPlaceholder.style.fontStyle = 'italic';
             visualizerPlaceholder.style.color = '#aaa';
        }

    } else {
        console.error('Audio player element not found.');
    }

    // Note: Actual audio visualization using Web Audio API is complex 
    // and would require significantly more code.
    // This script provides basic feedback via the placeholder div.
});
