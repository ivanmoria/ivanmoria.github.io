# 🎵 Guia de Extração de Melodia

Seu jogo agora suporta **duas formas** de extrair notas e melodias:

## 1️⃣ **Método Audio (Recomendado para Áudio)**

### Como Funciona:
- Analisa arquivo MP3/WAV/OGG
- Detecta acordes usando análise de chroma
- Extrai melodia (nota dominante) do áudio
- Gera eventos de mudança de nota em tempo real

### Comando:
```bash
python extract_chords.py
```

### Processo:
1. Escolha um arquivo de áudio
2. Script analisa a música
3. Gera 4 arquivos:
   - `musica_layers.csv` - Acordes + Melodia + Spawns
   - `musica_metadata.json` - Informações da música
   - `musica_data.json` - Dados completos
   - `musica.mp3` - Cópia do áudio

### Vantagens:
✅ Funciona com qualquer música  
✅ Detecção automática de tempo (BPM)  
✅ Análise em tempo real  
✅ Suporta MP3, WAV, OGG, FLAC, M4A  

### Desvantagens:
⚠️ Menos preciso que notação musical  
⚠️ Pode não detectar vozes secundárias  

---

## 2️⃣ **Método MuseScore (Recomendado para Precisão)**

### Como Funciona:
- Importa partitura do MuseScore (.mscz ou .mscx)
- Lê notas exatas da notação musical
- Extrai tempo e timings precisos
- Cria melodia e acordes baseado na partitura

### Comando:
```bash
python musescore_parser.py
```

### Processo:
1. Exporte sua partitura do MuseScore como .mscz
2. Coloque o arquivo na pasta `media/joguin/`
3. Execute: `python musescore_parser.py`
4. Escolha a partitura
5. Gera `partitura_from_score.json`
6. Copie os dados para o arquivo CSV do jogo

### Vantagens:
✅ Notas **100% precisas**  
✅ Timings exatos  
✅ Suporta múltiplas vozes/acordes  
✅ Perfeito para composições clássicas  
✅ Notas claramente definidas  

### Desvantagens:
⚠️ Precisa de arquivo MuseScore  
⚠️ Mais trabalho de setup  

---

## 🎯 **Qual Usar?**

| Situação | Use |
|----------|-----|
| Música normal (MP3) | **Audio** ✅ |
| Partitura escrita | **MuseScore** ✅ |
| Quer mais precisão | **MuseScore** ✅ |
| Quer facilidade | **Audio** ✅ |

---

## 📝 **Como Usar MuseScore**

### Passo 1: Criar/Abrir Partitura
1. Abra MuseScore
2. Crie ou abra uma partitura
3. Escreva as notas que quer usar

### Passo 2: Exportar
1. File → Export
2. Formato: **MuseScore 3 (.mscz)**
3. Salve em `media/joguin/`

### Passo 3: Processar
```bash
cd media/joguin
python musescore_parser.py
```

### Passo 4: Integrar
O script gera `partitura_from_score.json` com:
- Acordes (notas simultâneas)
- Melodia (sequência de notas)
- Tempos precisos

---

## 🎮 **Resultado no Jogo**

### Modo Harmonia:
- Inimigos em **todas as notas do acorde**
- Mais espaço para se mover

### Modo Melodia:
- Inimigos **APENAS na nota da melodia**
- Você segue uma nota por vez
- Muito mais desafiador!

---

## ⚙️ **Troubleshooting**

### "Melodia não está mudando"
- Tente reextrair com `python extract_chords.py`
- Verifique se o CSV tem eventos `melodyChange`

### "Notas erradas no MuseScore"
- Verifique se as notas estão na oitava correta
- Abra o arquivo .json e veja as notas extraídas

### "Arquivo MuseScore não funciona"
- Certifique-se de exportar como .mscz, não .mscx
- O arquivo precisa estar na pasta joguin/

---

## 📊 **Formato CSV**

O CSV gerado contém:
```
time,eventType,data
0.000000,enemySpawn,null
1.234567,chordChange,C Major
2.345678,melodyChange,E
3.456789,enemySpawn,null
...
```

---

## 🎵 **Pronto!**

Agora você pode:
- ✅ Usar áudio normal
- ✅ Importar partituras MuseScore
- ✅ Jogar com acordes
- ✅ Jogar seguindo melodia

Divirta-se! 🎮🎵
