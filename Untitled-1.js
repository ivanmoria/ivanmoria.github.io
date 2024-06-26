                // Calcula a direção e a velocidade para cada ponto em direção ao centro da tela
                for (let i = 0; i < num; i++) {
                    let x = ax[i];
                    let y = ay[i];
                    let dx = targetCenterX - x;
                    let dy = targetCenterY - y;
                    let angle = atan2(dy, dx);
                    let speed = map(i, 0, num, 0, 52);
                    ax[i-1] += cos(angle) * speed;
                    ay[i-1] += sin(angle) * speed;
                }
                // Ativa a explosão das linhas após atingir o centro
                autoClick();