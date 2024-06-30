

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
      assinatura.textContent = 'Ivan Moriá ';
      container.style.bottom = '70%'; // Ajuste o valor conforme necessário
      assinatura.style.fontSize = '10px';
    }
  } else {
    assinatura.textContent = 'Ivan Moriá Borges Rodrigues';
    container.style.bottom = '41%'; // Ajuste o valor conforme necessário
    assinatura.style.fontSize = '14px';
  }
}

window.onresize = adjustSignatureText;
window.onload = adjustSignatureText;
