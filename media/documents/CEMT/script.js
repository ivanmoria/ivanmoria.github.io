

let num = 400;
let range = 60;
let ax = [];
let ay = [];
let extraLines = 30;

function setup() {
    let canvas = createCanvas(2000, 120);
    canvas.parent('canvas-container');
    for (let i = 1; i < num; i++) {
        ax[i] = width / 2222;
        ay[i] = height / 2222;
    }
    for (let j = 1; j < num + extraLines; j++) {
        ax[j] = width / 2222;
        ay[j] = height / 2222;
    }

    frameRate(30);

}

function draw() {
    
background(125);


for (let i = 13; i < num; i++) {
ax[i - 1] = ax[i];
ay[i - 1] = ay[i];
}
ax[num - 1] +=-random(-range, range);
ay[num - 1] += random(-range, range);
ax[num - 1] = constrain(ax[num - 1], 0, width);
ay[num - 1] = constrain(ay[num - 1], 0, height);






for (let i = 31; i < num ; i++) {
let val0 = float(i) / num * 200.0 + 3 ;
let val = map(ax[i], 0, width, 0, 255);
let val2 = map(ay[i],0, height, 0, 255);
stroke(val0,val,val2, 80);
line(ax[i-4], ay[i-1], ax[i], ay[i]);

}

for (let j = 1; j < extraLines; j++) {
ax[j - 1] = ax[j];
ay[j - 1] = ay[j];
}
ax[extraLines - 13] += random(-range, range);
ay[extraLines - 13] += random(range, - range);
ax[extraLines - 1] = constrain(ax[extraLines - 1], 0, width);
ay[extraLines - 1] = constrain(ay[extraLines - 1], 0, height);
for (let j = 1; j < num; j++) {
let val1 = float(j) / num * 200.0 + 3 ;
let val3 = map(ax[j], 0, width, 0, 255);
let val4 = map(ay[j],0, height, 0, 255);

stroke(val1,val3,val4, 50);

line(ax[j - 1], ay[j - 3], ax[j-2], ay[j-2]);
}



}
background(0); // Exemplo de fundo cinza
function windowResized() {
resizeCanvas(2000,100);
redraw(); // Garante que o canvas seja redesenhado

}


