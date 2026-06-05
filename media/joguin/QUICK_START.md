# 🎮 Pega-pega Harmônico - Quick Start

## 📋 Fluxo Completo (Do Início ao Fim)

### Passo 1: Instalar Dependências
```bash
pip install librosa numpy
```

### Passo 2: Copiar Música (Opcional)
Se sua música tem caracteres especiais ou está em outra pasta:

```bash
cd media/joguin
python copy_music.py
```

Escolhe a música na lista → Script copia com nome seguro ✅

### Passo 3: Extrair Acordes
```bash
python extract_chords.py
```

Escolhe o arquivo → Script faz tudo automaticamente:
- ✅ Detecta acordes
- ✅ Detecta beats
- ✅ Copia áudio para o jogo
- ✅ Gera CSV (acordes + inimigos)
- ✅ Gera JSON (dados completos)
- ✅ Gera Metadata (carregamento automático)

### Passo 4: Jogar
1. Abra o navegador em: `media/joguin/index.html`
2. Atualize a página (Cmd+R ou F5)
3. Sua música aparece no menu automaticamente! 🎵
4. Clique em sua música e jogue 🎮

---

## 📁 Arquivos Gerados

Depois que você extrai uma música chamada `minha_musica.mp3`:

```
media/joguin/
├── minha_musica.mp3              ← Áudio (copiado automaticamente)
├── minha_musica_layers.csv       ← Acordes + Spawns de inimigos
├── minha_musica_data.json        ← Dados completos (análise)
└── minha_musica_metadata.json    ← Info para carregar no jogo
```

---

## 🎮 O Jogo Carrega Automaticamente

Quando você abre o `index.html`:

1. **Página carrega** → Script busca `*_metadata.json`
2. **Encontra sua música** → Cria botão no menu
3. **Você clica** → Carrega áudio + CSV automaticamente ✅

**Nenhuma edição manual no HTML necessária!**

---

## 📊 Estatísticas Exibidas

Quando você executa `python extract_chords.py`:

```
✅ ANÁLISE CONCLUÍDA COM SUCESSO!

📊 Estatísticas:
   🎼 Acordes detectados: 15
   👾 Spawns de inimigos: 120
   🎵 Tempo: 95.2 BPM
   ⏱️  Duração: 215.45 segundos
   🎵 Beats: 124
```

---

## 🔄 Para Músicas Futuras

Processo rápido:

```bash
cd media/joguin
python extract_chords.py     # Escolhe arquivo → Pronto!
```

Refresh no navegador → Música aparece no jogo 🎵

---

## ❓ Troubleshooting

**"❌ Arquivo não encontrado"**
→ Use `python copy_music.py` primeiro para copiar com nome seguro

**"Música não aparece no jogo"**
→ Abra DevTools (F12) e veja se há erros
→ Certifique-se de que `*_metadata.json` foi criado

**"Inimigos não aparecem nos beats"**
→ Verifique se `*_layers.csv` foi criado
→ Procure por `enemySpawn` no arquivo CSV

---

## 💾 Dados Salvos Automaticamente

`extract_chords.py` salva:

1. **Audio**: `seu_arquivo.mp3` (cópia na pasta jogo)
2. **CSV**: `seu_arquivo_layers.csv` (acordes + inimigos)
3. **JSON Data**: `seu_arquivo_data.json` (análise completa)
4. **Metadata**: `seu_arquivo_metadata.json` (carregamento jogo)

Todos na pasta `media/joguin/` automaticamente! ✅

---

## 🎯 Pronto!

Agora seu jogo:
- ✅ Toca áudio customizado
- ✅ Inimigos aparecem nos beats reais
- ✅ Acordes mudam nos tempos corretos
- ✅ Tudo sincronizado com a música! 🎵🎮
