

// Evento de clique no botão
document.getElementById('btn').addEventListener('click', function() {
  alert('Olá! Eu ainda vou inserir algo aqui.');
});


document.getElementById('loading').style.display = 'block';
fetch(url)
    .then(response => response.text())
    .then(html => {
        document.getElementById('content').innerHTML = html;
        document.getElementById('loading').style.display = 'none';
    });

    document.addEventListener("DOMContentLoaded", function() {
      document.querySelector('body').classList.remove('page-transition'); // Removendo a classe de transição inicialmente
  
      // Adiciona um ouvinte de evento para quando um link for clicado
      document.querySelectorAll('a[href]').forEach(function(a) {
          a.addEventListener('click', function(event) {
              // Verifica se o link é para uma página do seu site
              if (this.href.indexOf(location.hostname) !== -1 || this.href.indexOf(':') === -1) {
                  event.preventDefault(); // Impede o comportamento padrão do link
                  document.querySelector('body').classList.add('fade-out'); // Adiciona a classe de fade-out à tag body
                  setTimeout(function() {
                      window.location.href = a.href; // Navega para a URL do link após a transição
                  }, 300); // Tempo de espera igual ao tempo de transição em milissegundos
              }
          });
      });
  });
  