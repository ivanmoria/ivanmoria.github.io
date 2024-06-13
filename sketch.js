// Código de Processing
function setup() {
    var canvas = createCanvas(400, 400); // Defina o tamanho do canvas
    canvas.parent("canvas"); // Define o pai do canvas como o elemento com id "canvas"
    noStroke(); // Sem contorno nos retângulos
    rectMode(CENTER); // Centro dos retângulos
}
  
function draw() {
    background(51); // Cor de fundo
  
    fill(0); // Cor dos retângulos
  
    // Retângulo que segue o mouse horizontalmente
    rect(mouseX, height/2, mouseY/2+10, mouseY/2+10);
  
    // Retângulo que segue o mouse invertido horizontalmente
    var inverseX = width-mouseX;
    var inverseY = height-mouseY;
    rect(inverseX, height/2, (inverseY/2)+10, (inverseY/2)+10);
}
