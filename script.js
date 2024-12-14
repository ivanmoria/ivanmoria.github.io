// script.js

// Aguardar o carregamento completo da página e recursos
window.addEventListener('load', function() {
  // Remover o overlay após o carregamento completo da página
  document.getElementById('overlay').style.display = 'none';  
  
  // Exibir o conteúdo da página
  document.getElementById('content').style.display = 'block';  
});



function downloadFile(fileUrl, fileName) {
  var a = document.createElement("a");
  a.href = fileUrl;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
function adjustSignatureText() {
  var assinatura = document.getElementById('texto-animado');
  var container = document.querySelector('.assinatura-container');
  
  if (window.innerWidth > window.innerHeight) {
    if (window.innerHeight == 568) {
      assinatura.textContent = 'Ivan ';
      container.style.bottom = '51%';
      assinatura.style.fontSize = '20px';
    } else if (window.innerHeight == 320) {
      assinatura.textContent = 'ivan';
      container.style.bottom = '72%';
      assinatura.style.fontSize = '14px';
    } else if (window.innerHeight == 375) {
      assinatura.textContent = 'Ivan Moriá';
      container.style.bottom = '60%';
      assinatura.style.fontSize = '15px';
    } else if (window.innerHeight == 667) {
      assinatura.textContent = 'IMBR';
      container.style.bottom = '50%';
      assinatura.style.fontSize = '18px';
    } else if (window.innerHeight == 414) {
      assinatura.textContent = 'Ivan Moriá';
      container.style.bottom = '52%';
      assinatura.style.fontSize = '20px';
      
    } else {
      assinatura.textContent = 'Ivan Moriá Borges  ';
      container.style.bottom = '32%'; 
      assinatura.style.fontSize = '20px';
    }
  } else {
    assinatura.textContent = 'Ivan Moriá Borges ';
    container.style.bottom = '41%'; // Ajuste o valor conforme necessário
    assinatura.style.fontSize = '14px';
  }
}

window.onresize = adjustSignatureText;
window.onload = adjustSignatureText;




 

document.addEventListener('DOMContentLoaded', function () {
  // Inicializa o Wavesurfer
  var wavesurfer = WaveSurfer.create({
    container: '#waveform',
    waveColor: '#808080',
    progressColor: '#556B2F',
    cursorWidth: 3,
height: 40,

barWidth: 0.04,
});

var playBtn = document.getElementById('playBtn');
var audioPlayer = document.getElementById('audioPlayer');
var trackName = document.getElementById('trackName');

var playlistItems = document.querySelectorAll('.playlist-item');
var currentTrackIndex = -1;

function loadTrack(index) {
  if (index >= 0 && index < playlistItems.length) {
    var item = playlistItems[index];
    var src = item.getAttribute('data-src');
    var name = item.textContent;
    
    
    // Carrega a faixa selecionada no Wavesurfer
    wavesurfer.load(src);
    
    // Atualiza o nome da faixa e exibe o player
    trackName.textContent = name;
    audioPlayer.style.display = 'block';
    
    // Reseta o ícone do botão de reprodução
    playBtn.textContent = '►';
    currentTrackIndex = index;
  }
}

playBtn.addEventListener('click', function () {
  wavesurfer.playPause();
  playBtn.textContent = wavesurfer.isPlaying() ? 'll' : '►';
});

playlistItems.forEach(function(item, index) {
  item.addEventListener('click', function() {
    loadTrack(index);
  });
});

// Carrega a próxima faixa automaticamente quando a reprodução atual terminar
wavesurfer.on('finish', function() {
  if (currentTrackIndex + 1 < playlistItems.length) {
    loadTrack(currentTrackIndex + 1);
  } else {
    playBtn.textContent = '►'; // Reseta o ícone do botão de reprodução
  }
});

// Reproduz automaticamente quando a faixa é carregada
wavesurfer.on('ready', function() {
  wavesurfer.play();
  playBtn.textContent = 'll';
});

       // Carrega e reproduz o primeiro áudio da playlist
       loadTrack(0);
      });


      document.addEventListener('DOMContentLoaded', function () {
        var playlistItems = document.querySelectorAll('.playlist-item');
        var videoPlayer = document.getElementById('video-player');
        var videoSource = videoPlayer.querySelector('source');

        playlistItems.forEach(function (item) {
            item.addEventListener('click', function () {
                var src = this.getAttribute('data-src');
                videoSource.setAttribute('src', src);
                videoPlayer.load();
                videoPlayer.play();
            });
        });
    });



    async function sendVisitDataToServer() {
      const visitData = await getVisitData();
      
      // Enviar os dados ao servidor (use fetch, AJAX ou outro método)
      fetch('/save-visit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(visitData)
      }).then(response => response.json())
        .then(data => console.log('Visita registrada:', data))
        .catch(error => console.error('Erro ao enviar dados:', error));
    }
    
    sendVisitDataToServer();
    


    function showPDFPreview(previewId) {
      document.getElementById(previewId).style.display = 'block';
  }
  
  function hidePDFPreview(previewId) {
      document.getElementById(previewId).style.display = 'none';
  }
  



  const label = document.querySelector('.sub-circle label');

label.addEventListener('mousemove', (e) => {
  const { clientX, clientY } = e;
  const x = Math.round((clientX / window.innerWidth) * 255);
  const y = Math.round((clientY / window.innerHeight) * 255);
  
  label.style.backgroundColor = `rgba(${x}, ${y}, 159, 0.664)`; // Ajuste os valores conforme necessário
});

label.addEventListener('mouseleave', () => {
  label.style.backgroundColor = ''; // Reseta a cor quando o mouse sai
});



    // Exibe publicações de um ano específico
    function showPublications(year) {
      document.querySelectorAll('.publications').forEach(pub => {
          pub.style.display = 'none';  // Esconde todas as publicações
      });
      
      // Exibe as publicações do ano selecionado
      let publications = document.querySelectorAll(`[data-year="${year}"]`);
      publications.forEach(pub => {
          pub.style.display = 'block';  // Exibe a publicação do ano selecionado
      });
  }

  // Exibe todas as publicações
  function showAllPublications() {
      document.querySelectorAll('.publications').forEach(pub => {
          pub.style.display = 'block';  // Exibe todas as publicações
      });
  }

  // Ao carregar a página, exibe todas as publicações
  window.onload = function() {
      showAllPublications();  // Exibe todas as publicações ao carregar
  };
  document.addEventListener('DOMContentLoaded', function() {
    showAllPublications();  // Exibe todas as publicações ao carregar
});

// script.js


