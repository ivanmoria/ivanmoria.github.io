

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
  
  if (window.innerWidth < 321 || window.innerHeight< 568) { // Ajuste o valor conforme necessário
    assinatura.textContent = 'IMBR';
    container.classList.add('adjusted');
  } else {
    assinatura.textContent = 'Ivan Moriá Borges Rodrigues';
    container.classList.remove('adjusted');
  }
}

// Chama a função quando a janela é redimensionada
window.onresize = adjustSignatureText;

// Chama a função quando a página carrega
window.onload = adjustSignatureText;