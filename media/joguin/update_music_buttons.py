#!/usr/bin/env python3
"""
Atualiza o index.html para adicionar botões de músicas customizadas encontradas.
Execute após extract_chords.py para adicionar nova música ao menu do jogo.
"""

import json
import re
from pathlib import Path


def find_custom_music():
    """Find all custom music metadata files."""
    music_files = []

    for metadata_file in Path('.').glob('*_metadata.json'):
        try:
            with open(metadata_file) as f:
                metadata = json.load(f)

            # Verify audio file exists
            audio_file = metadata.get('audio')
            if audio_file and Path(audio_file).exists():
                music_files.append({
                    'name': metadata.get('name', audio_file),
                    'audio': audio_file,
                    'csv': metadata.get('csv'),
                    'tempo': metadata.get('tempo', 0),
                    'id': metadata.get('id')
                })
        except Exception as e:
            print(f"⚠️  Erro ao ler {metadata_file}: {e}")

    return music_files


def update_html(music_files):
    """Update index.html with custom music buttons."""
    html_file = Path('index.html')

    if not html_file.exists():
        print("❌ index.html não encontrado")
        return False

    with open(html_file, 'r', encoding='utf-8') as f:
        html_content = f.read()

    # Find the customMusicList div
    pattern = r'(<div id="customMusicList"[^>]*>)(.*?)(</div>)'

    # Build buttons HTML
    buttons_html = '<!-- Músicas detectadas automaticamente -->\n      '

    for music in music_files:
        tempo_str = f"{music['tempo']:.0f}" if isinstance(music['tempo'], (int, float)) else "?"
        button = f'''<button class="music-select" onclick="setMusic('{music['audio']}', '{music['csv']}');" style="background-color: #FF9800;">🎵 {music['name']} ({tempo_str} BPM)</button>
      '''
        buttons_html += button

    # Replace the content
    new_html = re.sub(
        pattern,
        rf'\1{buttons_html}\3',
        html_content,
        flags=re.DOTALL
    )

    if new_html == html_content:
        print("⚠️  Não consegui atualizar o HTML")
        return False

    with open(html_file, 'w', encoding='utf-8') as f:
        f.write(new_html)

    return True


def main():
    print("\n" + "="*60)
    print("🎵 ATUALIZAR MÚSICAS CUSTOMIZADAS NO MENU DO JOGO")
    print("="*60 + "\n")

    music_files = find_custom_music()

    if not music_files:
        print("❌ Nenhuma música customizada encontrada")
        print("\nExecute primeiro: python extract_chords.py")
        return

    print(f"📁 {len(music_files)} música(s) encontrada(s):\n")
    for music in music_files:
        print(f"  🎵 {music['name']} ({music['tempo']:.0f} BPM)")
        print(f"     📂 {music['audio']}")

    if update_html(music_files):
        print(f"\n✅ HTML atualizado com sucesso!")
        print(f"   Agora abra index.html no navegador e as músicas vão aparecer no menu")
    else:
        print(f"\n❌ Erro ao atualizar HTML")

    print("\n" + "="*60 + "\n")


if __name__ == '__main__':
    main()
