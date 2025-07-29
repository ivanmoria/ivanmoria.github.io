import numpy as np 
import matplotlib.pyplot as plt  
import matplotlib.gridspec as gridspec
import pandas as pd  
from scipy.io import wavfile
from scipy.stats import linregress
plt.rcParams['figure.dpi'] = 100  # Qualidade dos gráficos

# CSV do Participante
file_path = "/Users/ivanmoriaborges/Documents/GitHub/MIR-MT/takes_vestigios/Piloto/melchior/VENTOmelchior_take_1.csv"
tte_dados = pd.read_csv(file_path, sep=" ")  # tte = teste de tempo espontâneo


# Processando os dados

t = tte_dados["Tempo"].values  # Garantir que t seja um array numpy

velocity = tte_dados["Velocity"].values  # Garantir que velocity seja um array numpy

press_dur = tte_dados["Press_dur"].values #Garantir que press_dur seja um array numpy

tecla = tte_dados["Tecla"].values  # Garantir que tecla seja um array numpy

tecla_colors = {1: '#1f77b4', 2: '#ff7f0e', 3: '#2ca02c', 4: '#d62728', 5: '#9467bd', 6: '#8c564b', 7: '#e377c2', 8: '#7f7f7f'}

t_diff = np.diff(t) # Calcular o IoI

press_density = press_dur[1:] / t_diff # Calcular a densidade de pressão



# Criar uma única figura com múltiplos subplots
fig = plt.figure(figsize=(12, 8))

gs = gridspec.GridSpec(2, 2, height_ratios=[2, 1])  # Primeira linha maior

# Subplot que ocupa as duas colunas na primeira linha
ax1 = fig.add_subplot(gs[0, :])  # Ocupa duas colunas

# Outros subplots na segunda linha
ax2 = fig.add_subplot(gs[1, 0])
ax3 = fig.add_subplot(gs[1, 1])

# Adicionar um eixo y secundário ao ax1
axkey = ax1.twinx()



# Plot 1: Tempo vs Velocity
ax1.bar(t, velocity, width=100, alpha=0.8, color='black', label="Velocity", zorder=1)
#ax1.scatter(t, velocity, alpha=0.4, color='gray', label="Velocity", zorder=2)
ax1.set_ylim(0, 127)
ax1.set_xlabel("Tempo (ms)")
ax1.set_ylabel("Velocity")
ax1.set_title("Tempo vs Velocity")


# Plot 1.2: Teclas de 1 a 8 em cores e suas durações
for position, width, key in zip(t, press_dur, tecla):
    color = tecla_colors.get(key, '#000000')  
    start = position
    end = position + width
    axkey.hlines(y=key, xmin=start, xmax=end, color=color, linestyle="-", lw=5, alpha=0.8)
axkey.set_ylim(-8, 8)

# Remover marcações e labels do eixo y de ax4
axkey.set_yticks([])
axkey.set_yticklabels([])


# Plot 2: Tempo entre pressionadas
ax2.plot(t[1:], t_diff)
ax2.set_xlabel("Tempo (ms)")
ax2.set_ylabel("IoI (ms)")
ax2.set_title("Inter-Onset-Interval")

# Plot 3: Densidade temporal das pressionadas
ax3.plot(t[1:], press_density)
ax3.set_xlabel("Tempo (ms)")
ax3.set_ylabel("Densidade")
ax3.set_title("Densidade Temporal das Pressionadas")



# Ajustar layout para evitar sobreposição
plt.tight_layout()

# Mostrar todos os gráficos
plt.show()

