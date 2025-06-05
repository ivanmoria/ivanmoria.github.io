import numpy as np
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation
from matplotlib.widgets import Slider, CheckButtons

fig, ax = plt.subplots(figsize=(12, 6))
plt.subplots_adjust(left=0.1, bottom=0.38, right=0.9)  # espaço para controles

escala = 1.5
sample_rate = 20000

colors = ['#ff7f7f', '#7fff7f', '#7f7fff', '#ffff7f', '#000000']  # cores para 4 freq + soma
alphas = [0.4, 0.4, 0.4, 0.4, 1.0]

lines = []
for i in range(5):
    line, = ax.plot([], [], color=colors[i], lw=2, alpha=alphas[i])
    lines.append(line)

# Inicial
freqs = [294, 392, 494, 588]
visibles = [True] * 4

# Inicializa tempo
t_total = None
x = None

def atualizar_dominio_tempo():
    global t_total, x
    menor_freq = min(freqs) * escala
    periodo_min = 1 / menor_freq
    t_total = 3 * periodo_min
    x = np.linspace(0, t_total, int(sample_rate * t_total))

    ax.set_xlim(0, t_total)
    ax.set_xticks(np.linspace(0, t_total, 7))
    ax.set_xticklabels([f'{int(1000*t)} ms' for t in np.linspace(0, t_total, 7)])

# Setup tempo
atualizar_dominio_tempo()
ax.set_ylim(-5, 5)

# Sliders
slider_axes = [
    plt.axes([0.15, 0.30, 0.65, 0.03]),
    plt.axes([0.15, 0.25, 0.65, 0.03]),
    plt.axes([0.15, 0.20, 0.65, 0.03]),
    plt.axes([0.15, 0.15, 0.65, 0.03]),
]
slider_labels = ['Freq 1', 'Freq 2', 'Freq 3', 'Freq 4']
slider_objs = [
    Slider(ax, label, 100, 1000, valinit=freqs[i], valstep=1)
    for i, (ax, label) in enumerate(zip(slider_axes, slider_labels))
]

# Checkbuttons
rax = plt.axes([0.02, 0.5, 0.1, 0.15])
check = CheckButtons(rax, slider_labels, visibles)

def update(frame):
    shift = (frame / sample_rate) % t_total
    x_shifted = (x + shift) % t_total

    y = []
    for i, f in enumerate(freqs):
        y_i = np.sin(2 * np.pi * f * escala * x_shifted) if visibles[i] else np.zeros_like(x_shifted)
        y.append(y_i)

    y_sum = np.sum(y, axis=0)

    for i, y_i in enumerate([*y, y_sum]):
        lines[i].set_data(x, y_i)

    return lines

def on_slider_change(val):
    global freqs
    freqs = [slider.val for slider in slider_objs]
    atualizar_dominio_tempo()
    fig.canvas.draw_idle()

for slider in slider_objs:
    slider.on_changed(on_slider_change)

def on_check(label):
    index = slider_labels.index(label)
    visibles[index] = not visibles[index]

check.on_clicked(on_check)

# Inicia animação
anim = FuncAnimation(fig, update, frames=None, interval=20, blit=True, repeat=True)

plt.show()
