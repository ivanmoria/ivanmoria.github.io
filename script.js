

// Evento de clique no botão
document.getElementById('btn').addEventListener('click', function() {
  alert('Olá! Eu ainda vou inserir algo aqui.');
});
document.addEventListener('DOMContentLoaded', function () {
  const themeSwitch = document.getElementById('dark-mode-switch');

  themeSwitch.addEventListener('change', function () {
      document.body.classList.toggle('dark-theme', themeSwitch.checked);
  });
});
