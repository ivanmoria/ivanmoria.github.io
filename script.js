// Código de Processing
function setup() {
    var canvas = createCanvas(windowWidth, windowHeight); // Defina o tamanho do canvas como a largura e altura da janela do navegador
    canvas.parent('canvas'); // Define o elemento pai do canvas
    noFill(); // Sem preenchimento nos retângulos
    stroke(255); // Cor da linha (branca)
    rectMode(CENTER); // Centro dos retângulos
}
  
function draw() {
    background(0); // Cor de fundo preta
  
    // Variáveis para o sketch de Brownian motion
    var num = 2000;
    var range = 6;
    var ax = new Array(num);
    var ay = new Array(num);

    // Inicialização dos arrays
    for(var i = 0; i < num; i++) {
        ax[i] = width/2;
        ay[i] = height/2;
    }

    // Shift all elements 1 place to the left
    for(var i = 1; i < num; i++) {
        ax[i-1] = ax[i];
        ay[i-1] = ay[i];
    }

    // Put a new value at the end of the array
    ax[num-1] += random(-range, range);
    ay[num-1] += random(-range, range);

    // Constrain all points to the screen
    ax[num-1] = constrain(ax[num-1], 0, width);
    ay[num-1] = constrain(ay[num-1], 0, height);

    // Draw a line connecting the points
    for(var i=1; i<num; i++) {    
        stroke(255); // Cor da linha (branca)
        line(ax[i-1], ay[i-1], ax[i], ay[i]);
    }
}

// Evento de clique no botão
document.getElementById('btn').addEventListener('click', function() {
    alert('Olá! Você clicou no botão.');
});
