// Evento de clique no botão
document.getElementById('btn').addEventListener('click', function() {
  alert('Olá! Eu ainda vou inserir algo aqui.');
});

document.getElementById('loading').style.display = 'block';

function loadContent(url) {
  fetch(url)
      .then(response => response.text())
      .then(html => {
          document.getElementById('content').innerHTML = html;
          document.getElementById('loading').style.display = 'none';
          // Adicionando a classe 'loaded' após o conteúdo carregar completamente
          setTimeout(function() {
              document.getElementById('content').classList.add('loaded');
          }, 50); // Tempo de espera em milissegundos (50ms)
      });
}

// Função para carregar o conteúdo com uma transição suave
function transitionPage(url) {
  document.getElementById('content').classList.remove('loaded');
  document.getElementById('loading').style.display = 'block';
  setTimeout(function() {
      loadContent(url);
  }, 700); // Tempo de espera em milissegundos (200ms)
}

// Exemplo de uso para carregar uma nova página
transitionPage('projects.html');
