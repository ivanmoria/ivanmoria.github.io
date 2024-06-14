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
