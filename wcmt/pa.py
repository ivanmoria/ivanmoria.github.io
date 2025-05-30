import pandas as pd
import networkx as nx
import matplotlib.pyplot as plt
import re
from collections import Counter
from itertools import combinations

# Caminho para o seu CSV
caminho_csv = '/Users/ivanmoria/Downloads/17 - Sheet1.csv'
df = pd.read_csv(caminho_csv)

coluna_referencias = 'Referências'

# Função para extrair o(s) autor(es) antes do ano ou ponto
def extrair_autores(ref):
    match = re.match(r"^(.*?)(\(\d{4}\)|\.)", ref.strip())
    if match:
        nome = match.group(1)
        nome = re.sub(r'\bet al\b|and', '', nome, flags=re.IGNORECASE).strip()
        return nome
    return None

# Extrai as referências por artigo
referencias_por_artigo = df[coluna_referencias].fillna('').apply(lambda x: [ref.strip() for ref in str(x).split('\n') if ref.strip()])

# Coleta os autores e monta o grafo
G = nx.Graph()
todos_autores = []

for refs in referencias_por_artigo:
    autores = [extrair_autores(r) for r in refs if extrair_autores(r)]
    todos_autores.extend(autores)
    
    for a1, a2 in combinations(set(autores), 2):
        if G.has_edge(a1, a2):
            G[a1][a2]['weight'] += 1
        else:
            G.add_edge(a1, a2, weight=1)

# Contagem total por autor
contador = Counter(todos_autores)

# Filtrar por número mínimo de citações (ajuste aqui se quiser)
limite_citacoes = 2
autores_filtrados = {autor for autor, freq in contador.items() if freq >= limite_citacoes}
G_filtrado = G.subgraph(autores_filtrados).copy()

# Preparar visualização
plt.figure(figsize=(14, 10))
pos = nx.spring_layout(G_filtrado, k=0.8, seed=42)

# Tamanhos dos nós proporcionais à frequência
node_sizes = [contador[node]*150 for node in G_filtrado.nodes()]

# Cores e pesos das arestas
edge_weights = [G_filtrado[u][v]['weight'] for u, v in G_filtrado.edges()]

# Desenho
nx.draw_networkx_nodes(G_filtrado, pos, node_size=node_sizes, node_color='skyblue', alpha=0.9)
nx.draw_networkx_edges(G_filtrado, pos, width=[w*0.3 for w in edge_weights], alpha=0.5)

# Exibe apenas rótulos de autores mais citados
labels = {node: node for node in G_filtrado.nodes() if contador[node] >= 3}
nx.draw_networkx_labels(G_filtrado, pos, labels, font_size=8)

plt.title("Rede de Co-Citação entre Autores Referenciados (Filtrada)", fontsize=14)
plt.axis('off')
plt.tight_layout()
plt.show()

# Estatísticas
print("\nTop 10 autores mais referenciados:")
for autor, freq in contador.most_common(10):
    print(f"{autor}: {freq} citações")

print(f"\nTotal de autores no grafo filtrado: {G_filtrado.number_of_nodes()}")
print(f"Total de conexões (co-citações): {G_filtrado.number_of_edges()}")
