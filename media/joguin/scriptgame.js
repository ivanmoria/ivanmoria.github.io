

  const modeToggle = document.getElementById('modeToggle');
  const modeLabel = document.getElementById('modeLabel');

  modeToggle.addEventListener('change', function () {
    if (this.checked) {
      setMode('hardcore');
      modeLabel.textContent = 'Hardcore';
    } else {
      setMode('normal');
      modeLabel.textContent = 'Normal';
    }
  });

  document.addEventListener('keydown', function(e) {
    if (e.key.toLowerCase() === 'm') {
      // Inverte o estado do toggle
      modeToggle.checked = !modeToggle.checked;
      // Dispara manualmente o evento change para aplicar as mudanças
      modeToggle.dispatchEvent(new Event('change'));
    }
  });





   document.addEventListener('DOMContentLoaded', function() {
    setMusic('musica1.mp3', 'layers1.csv');

    // Marca o botão 'Música 1' como ativo (se quiser destacar visualmente)
    const musicBtn = document.querySelector("button.music-select[onclick=\"setMusic('musica1.mp3', 'layers1.csv')\"]");
    if (musicBtn) {
      musicBtn.classList.add('active'); // classe para estilo ativo, se tiver
    }
  });

  document.addEventListener('keydown', function(e) {
  if (['1', '2', '3', '4'].includes(e.key)) {
    const index = parseInt(e.key, 10) - 1; // 0-based
    const musicButtons = document.querySelectorAll('.music-select');
    if (musicButtons[index]) {
      musicButtons[index].click();
    }
  }
});








  document.addEventListener('DOMContentLoaded', function() {
    setMode('normal');

    // Marca o botão 'Modo Normal' como ativo (se houver estilo para isso)
    const normalBtn = document.querySelector("button.mode-select[onclick=\"setMode('normal')\"]");
    if (normalBtn) {
      normalBtn.classList.add('active'); // supondo que a classe 'active' destaca o botão
    }
  });