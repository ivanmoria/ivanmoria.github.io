// Impede o scroll
document.body.style.overflow = 'hidden';

// Remove qualquer evento `beforeunload` registrado previamente
window.onbeforeunload = null;

// Bloqueia o menu de contexto
document.addEventListener("contextmenu", function(e) {
    e.preventDefault();
});

// Bloqueia a ação de copiar
document.addEventListener("copy", function(e) {
    e.preventDefault();
});

// Impede a seleção de texto
document.addEventListener("selectstart", function(e) {
    e.preventDefault();
});

// Impede o uso de teclas de rolagem (como setas ou PageDown)
document.addEventListener("keydown", function(e) {
    const forbiddenKeys = ["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "];
    if (forbiddenKeys.includes(e.key)) {
        e.preventDefault();
    }
});

// Impede rolagem via mouse
document.addEventListener("wheel", function(e) {
    e.preventDefault();
}, { passive: false });

// Impede a manipulação direta do scrollbar
document.documentElement.style.overflow = 'hidden'; // Para todo o documento
document.documentElement.style.userSelect = 'none'; // Impede seleção de texto via CSS
document.body.style.userSelect = 'none'; // Complementa para o body




                    // Função para impedir o recarregamento por pull-to-refresh
      function preventPullToRefresh(element) {
        let prevent = false;

        element.addEventListener('touchstart', function(e) {
            if (e.touches.length !== 1) return;
            const scrollY = window.pageYOffset || document.body.scrollTop || document.documentElement.scrollTop;
            prevent = (scrollY === 0);
        });

        element.addEventListener('touchmove', function(e) {
            if (prevent) {
                prevent = false;
                e.preventDefault();
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function() {
        preventPullToRefresh(document);
    });

    let num = 30;
    let range = 6;
    let ax = [];
    let ay = [];
    let ax2 = [];
    let ay2 = [];
    let ax3 = [];
    let ay3 = [];
    let ax4 = [];
    let ay4 = [];
    let ax5 = [];
    let ay5 = [];
    let ax6 = [];
    let ay6 = [];
    let explosion = false;
    let explosionStrength = 8; // Reduzido para acalmar a explosão
    let isDarkMode = false; // Definir o modo padrão como claro
    function toggleTheme() {
        isDarkMode = !isDarkMode; // Alterna o estado do tema
      }
      
    function setup() {
        let canvas = createCanvas(windowWidth, windowHeight);
        canvas.parent('canvas-container');
        initializePositions(); // Função para inicializar as posições dos elementos
        }
        function initializePositions() {
        for (let i = 10; i < num; i++) {
       
            ay[i] = height * 2;
            ax2[i] = width * 2;
            ay2[i] = height * 2;

            ay3[i] = height * 2;
            ax4[i] = width * 2;
            ay4[i] = height * 2;
            ax5[i] = width * 2;
            ay5[i] = height * 2;
            ax6[i] = width * 2;
            ay6[i] = height * 2;
        }
        frameRate(60); // Ajustado para um valor mais comum


        
    }
    function windowResized() {
        resizeCanvas(windowWidth, windowHeight); // Atualiza o tamanho do canvas
        initializePositions(); // Reposiciona elementos ao redimensionar
    }
    function draw() {
        if (isDarkMode) {
            background(183);  // Cor de fundo escura (modo escuro)
            fill(0);  // Cor do texto clara (modo escuro)
            // Desenha as linhas com cor branca no modo escuro
            let lineColor = color(255, 255, 255);  // Cor branca sem opacidade
            drawLines(ax, ay, lineColor);
            drawLines(ax2, ay2, lineColor);
            drawLines(ax3, ay3, lineColor);
            drawLines(ax4, ay4, lineColor);
            drawLines(ax5, ay5, lineColor);
            drawLines(ax6, ay6, lineColor);
        } else {
            background(50);  // Cor de fundo clara (modo claro)
            fill(255);  // Cor do texto escura (modo claro)
            // Desenha as linhas com cor escura no modo claro
            let lineColor = color(10, 10, 10);  // Cor escura sem opacidade
            drawLines(ax, ay, lineColor);
            drawLines(ax2, ay2, lineColor);
            drawLines(ax3, ay3, lineColor);
            drawLines(ax4, ay4, lineColor);
            drawLines(ax5, ay5, lineColor);
            drawLines(ax6, ay6, lineColor);
        }
        
        // Atualiza as posições
        updatePositions();
        
        // Mistura o movimento aleatório com a posição do mouse
        updateWithMouse(ax, ay);
        updateWithMouse(ax2, ay2);
        updateWithMouse(ax3, ay3);
        updateWithMouse(ax4, ay4);
        updateWithMouse(ax5, ay5);
        updateWithMouse(ax6, ay6);
    
        // Constrange as posições
        constrainPositions();
    
        // Se uma explosão estiver ativa
        if (explosion) {
            explodeLines();
        }
    }
    

    function updatePositions() {
        for (let i = 0; i < num; i++) {
            ax[i - 1] = ax[i];
            ay[i - 1] = ay[i];
            ax2[i - 1] = ax2[i];
            ay2[i - 1] = ay2[i];
            ax3[i - 1] = ax3[i];
            ay3[i - 1] = ay3[i];
            ax4[i - 1] = ax4[i];
            ay4[i - 1] = ay4[i];
            ax5[i - 1] = ax5[i];
            ay5[i - 1] = ay5[i];
            ax6[i - 1] = ax6[i];
            ay6[i - 1] = ay6[i];
        }
    }
    function updateWithMouse(ax, ay) {
      // Aplique um fator de suavização entre o mouse e as linhas.
      ax[num - 1] += (random(-range, range) + (mouseX - ax[num - 1]) * 0.105);  // Ajuste para 0.05
      ay[num - 1] += (random(-range, range) + (mouseY - ay[num - 1]) * 0.05);  // Ajuste para 0.05
      
      ax2[num - 1] += (random(-range, range) + (mouseX - ax2[num - 1]) * 0.105);  // Ajuste para 0.05
      ay2[num - 1] += (random(-range, range) + (mouseY - ay2[num - 1]) * 0.05);  // Ajuste para 0.05
  
      ax3[num - 1] += (random(-range, range) + (mouseX - ax3[num - 1]) * 0.05);  // Ajuste para 0.05
      ay3[num - 1] += (random(-range, range) + (mouseY - ay3[num - 1]) * 0.05);  // Ajuste para 0.05
  
      ax4[num - 1] += (random(-range, range) + (mouseX - ax4[num - 1]) * 0.05);  // Ajuste para 0.05
      ay4[num - 1] += (random(-range, range) + (mouseY - ay4[num - 1]) * 0.05);  // Ajuste para 0.05
  
      ax5[num - 1] += (random(-range, range) + (mouseX - ax5[num - 1]) * 0.05);  // Ajuste para 0.05
      ay5[num - 1] += (random(-range, range) + (mouseY - ay5[num - 1]) * 0.05);  // Ajuste para 0.05
  
      ax6[num - 1] += (random(-range, range) + (mouseX - ax6[num - 1]) * 0.05);  // Ajuste para 0.05
      ay6[num - 1] += (random(-range, range) + (mouseY - ay6[num - 1]) * 0.05);  // Ajuste para 0.05
  }
  

    function constrainPositions() {
        for (let i = 0; i < num; i++) {
            ax[i] = constrain(ax[i], 20, width);
            ay[i] = constrain(ay[i], 20, height);
            ax2[i] = constrain(ax2[i], 0, width);
            ay2[i] = constrain(ay2[i], 0, height);
            ax3[i] = constrain(ax3[i], 20, width);
            ay3[i] = constrain(ay3[i], 0, height);
            ax4[i] = constrain(ax4[i], 20, width);
            ay4[i] = constrain(ay4[i], 0, height);
            ax5[i] = constrain(ax5[i], 20, width);
            ay5[i] = constrain(ay5[i], 0, height);
            ax6[i] = constrain(ax6[i], 0, width);
            ay6[i] = constrain(ay6[i], 0, height);
        }
    }

    function drawLines(ax, ay, lineColor) {
        for (let i = 1; i < num; i++) {
            // Ajuste a opacidade da linha com base no valor alpha da cor passada
            stroke(lineColor);  // Usando diretamente a cor fornecida
            line(ax[i - 1], ay[i - 1], ax[i], ay[i]);
        }
      }
      
  

    function explodeLines() {
        for (let i = 0; i < num; i++) {
            let angle = atan2(ay[i] - mouseY, ax[i] - mouseX);
            ax[i] += 2*cos(angle) * explosionStrength * 0.5; // Reduzido
            ay[i] += 2*sin(angle) * explosionStrength * 0.5; // Reduzido

            let angle2 = atan2(ay2[i] - mouseY, ax2[i] - mouseX);
            ax2[i] += 2 * cos(angle2) * explosionStrength * 0.5; // Reduzido
            ay2[i] += 2 * sin(angle2) * explosionStrength * 0.5; // Reduzido

            let angle3 = atan2(ay3[i] - mouseY, ax3[i] - mouseX);
            ax3[i] += 1 * cos(angle3) * explosionStrength * 0.5; // Reduzido
            ay3[i] += 1 * sin(angle3) * explosionStrength * 0.5; // Reduzido

            let angle4 = atan2(ay5[i] - mouseY, ax5[i] - mouseX);
            ax5[i] += 1 * cos(angle4) * explosionStrength * 0.5; // Reduzido
            ay5[i] += 1 * sin(angle4) * explosionStrength * 0.5; // Reduzido

            let angle5 = atan2(ay6[i] - mouseY, ax6[i] - mouseX);
            ax6[i] += 1 * cos(angle5) * explosionStrength * 0.5; // Reduzido
            ay6[i] += 1 * sin(angle5) * explosionStrength * 0.5; // Reduzido;
        }

        // Redefine a explosão após um tempo
        if (frameCount % 10 === 0) {
            explosionStrength *= 0.89; // Diminui a força da explosão ao longo do tempo
        }

        // Para a explosão após um tempo
        if (explosionStrength < 0.1) {
            explosion = false;
            explosionStrength = 2; // Reseta a força para o próximo clique
        }
    }

    function mousePressed() {
        explosion = true; // Ativa a explosão
    }

    document.getElementById("theme-checkbox").addEventListener("click", function() {
        toggleTheme();  // Alterna o tema quando o botão é clicado
      });
      