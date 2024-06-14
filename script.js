

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

  
  