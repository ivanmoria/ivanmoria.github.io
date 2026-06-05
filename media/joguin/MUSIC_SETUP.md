# 🎵 Pega-pega Harmônico - Setup de Músicas Customizadas

## Instalação de Dependências

O script `extract_chords.py` usa librosa para análise de áudio. Instale com:

```bash
pip install librosa numpy
```

## Como Usar

### 1. Extrair Acordes e Tempos de Inimigos

```bash
python extract_chords.py seu_arquivo.mp3
```

Isso gera dois arquivos:
- `seu_arquivo_data.json` - Dados com acordes e tempos
- `seu_arquivo_layers.csv` - Arquivo CSV compatível com o jogo

### 2. Carregar no Jogo

1. Na tela inicial do jogo, clique em "Carregar MP3"
2. Selecione seu arquivo de áudio (seu_arquivo.mp3)
3. O jogo vai:
   - Tocar o áudio
   - Usar o CSV (`seu_arquivo_layers.csv`) para:
     - Fazer inimigos aparecerem nos **beats da música**
     - Mudar acordes automaticamente (detectados do áudio)

## Exemplo Completo

```bash
# Seu arquivo de música
cp ~/Downloads/minha_musica.mp3 .

# Extrair dados
python extract_chords.py minha_musica.mp3

# Agora você tem:
# - minha_musica.mp3 (áudio original)
# - minha_musica_data.json (acordes e beats)
# - minha_musica_layers.csv (formato jogo)

# Copiar para o jogo
cp minha_musica_layers.csv /seu/caminho/media/joguin/
```

## O Que o Script Faz

1. **Carrega o áudio** com librosa
2. **Extrai características de chroma** (pitch content) para detectar acordes
3. **Detecta beats** usando onset detection
4. **Gera eventos de inimigos** nos beats da música
5. **Cria acordes musicais** baseado nas mudanças de pitch
6. **Exporta em CSV** compatível com o jogo

## Arquivos Gerados

### `.json` (Dados completos)
```json
{
  "duration": 180.5,
  "tempo": 120.0,
  "chords": [
    {"time": 0.0, "chord": "C Major"},
    {"time": 10.2, "chord": "F Major"},
    {"time": 20.5, "chord": "G Major"}
  ],
  "enemy_spawns": [0.5, 1.2, 2.1, 3.0, ...],
  "beat_times": [0.5, 1.0, 1.5, 2.0, ...]
}
```

### `.csv` (Formato jogo)
```
time,eventType,data
0.000000,chordChange,C Major
0.500000,enemySpawn,null
1.200000,enemySpawn,null
10.200000,chordChange,F Major
...
```

## Personalização

Você pode editar o `_data.json` manualmente se precisar:
- Ajustar tempos de acordes
- Adicionar/remover spawns de inimigos
- Depois re-gerar o CSV

## Troubleshooting

**"ModuleNotFoundError: No module named 'librosa'"**
→ Execute: `pip install librosa`

**Acordes não mudam**
→ Verifique se o arquivo `.csv` está sendo usado pelo jogo

**Muitos/poucos inimigos**
→ Edite `spawn_probability` no script (linha ~95) para ajustar frequência

## Formato de Acordes Suportados

- C Major, D Minor, E Minor, F Major, G Major
- A Minor, C Major, F Major, G Major, D Minor
- E Minor, (e mais combinações)

## Dicas

1. **Musicas mais simples funciona melhor** - Menos sobreposição de notas = detecção melhor
2. **Teste com uma música conhecida** - Compare os acordes gerados com a música real
3. **Use o JSON para fine-tuning** - Edite manualmente se necessário
