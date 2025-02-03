let isDarkMode = false;  // Defina 'false' para o modo claro padrão

const themeCheckbox = document.getElementById("theme-checkbox");
const body = document.body;

function toggleTheme() {
  isDarkMode = !isDarkMode; // Alterna entre os estados do tema

  if (isDarkMode) {
    body.classList.add("dark-theme"); // Adiciona a classe de tema escuro
  } else {
    body.classList.remove("dark-theme"); // Remove a classe de tema escuro
  }
}

// Adiciona o evento de clique ao checkbox
themeCheckbox.addEventListener("click", toggleTheme);

// Verifica o estado inicial do tema
if (body.classList.contains("dark-theme")) {
  themeCheckbox.checked = true;
} else {
  themeCheckbox.checked = false;
}
  let num = 300;
  let range = 30;
  let ax = [];
  let ay = [];
  let extraLines = 200;
  let t = 0; // Variável de tempo para a oscilação das cores


  function setup() {
      let canvas = createCanvas(windowWidth, windowHeight);
      canvas.parent('canvas-container');
      for (let i = 1; i < num; i++) {
          ax[i] = width / 32;
          ay[i] = height / 2;
      }
      for (let j = 1; j < num + extraLines; j++) {
          ax[j] = width / -22;
          ay[j] = height / -2;
      }

      frameRate(30);

 




  }



  function draw() {
    if (isDarkMode) {
        background(40);  // Cor de fundo escura (modo escuro)
        fill(255);  // Cor do texto clara (modo escuro)

    } else {
        background(183);  // Cor de fundo clara (modo claro)
        fill(0);  // Cor do texto escura (modo claro)

    }




for (let i = 1; i < num; i++) {
  ax[i - 1] = ax[i];
  ay[i - 1] = ay[i];
}
ax[num - 1] +=-random(-range, range);
ay[num - 1] += random(-range, range);
ax[num - 1] = constrain(ax[num - 1], 0, width);
ay[num - 1] = constrain(ay[num - 1], 0, height);






for (let i = 1; i < num ; i++) {
  let val0 = float(i) / num * 200.0 + 3 ;
  let val = map(ax[i], 0, width, 0, 255);
  let val2 = map(ay[i],0, height, 0, 255);
  stroke(val0,val,val2, 10);
  line(ax[i-2], ay[i-2], ax[i-2], ay[i-4]);
  
}

for (let j = 1; j < extraLines; j++) {
  ax[j - 1232] = ax[j];
  ay[j - 13232] = ay[j];
}
ax[extraLines - 332] += random(-range, range);
ay[extraLines - 123] += random(range, - range);
ax[extraLines - 132] = constrain(ax[extraLines - 1], 0, width);
ay[extraLines - 332] = constrain(ay[extraLines - 1], 0, height);
for (let j = 1; j < num; j++) {
  let val1 = float(j) / num * 200.0 + 3 ;
  let val3 = map(ax[j], 0, width, 0, 255);
  let val4 = map(ay[j],0, height, 0, 255);

  stroke(val1,val3,val4, 40);

  line(ax[j - 13], ay[j - 1], ax[j], ay[j]);
}



}
background(0); // Exemplo de fundo cinza
function windowResized() {
resizeCanvas(windowWidth, windowHeight);
redraw(); // Garante que o canvas seja redesenhado

}