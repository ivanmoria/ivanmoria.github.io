#!/usr/bin/env python3
"""
Helper script to copy music files from common locations
and rename them to avoid special character issues.
"""

import os
import shutil
from pathlib import Path


def main():
    print("\n" + "="*60)
    print("🎵 COPIAR MÚSICA - Helper para evitar caracteres especiais")
    print("="*60 + "\n")

    # Search for music files
    common_dirs = [
        ('~/Music', 'Pasta Music'),
        ('~/Downloads', 'Downloads'),
        ('~/Music/Spotify', 'Spotify'),
        ('~/Desktop', 'Desktop'),
    ]

    all_files = {}

    for dir_path, label in common_dirs:
        expanded_dir = os.path.expanduser(dir_path)
        if os.path.isdir(expanded_dir):
            try:
                audio_extensions = ('.mp3', '.wav', '.flac', '.ogg', '.m4a')
                files = [f for f in os.listdir(expanded_dir) if f.lower().endswith(audio_extensions)]

                for file in files:
                    full_path = os.path.join(expanded_dir, file)
                    all_files[file] = (full_path, label)
            except PermissionError:
                continue

    if not all_files:
        print("❌ Nenhuma música encontrada nas pastas comuns")
        print("\nTente manualmente:")
        print("  cp '/seu/caminho/musica.mp3' .")
        return

    print(f"📁 {len(all_files)} músicas encontradas:\n")

    files_list = list(all_files.items())
    for i, (filename, (full_path, location)) in enumerate(files_list, 1):
        size_mb = os.path.getsize(full_path) / (1024*1024)
        # Truncate long names
        display_name = filename if len(filename) <= 40 else filename[:37] + "..."
        print(f"  {i:2d}. {display_name}")
        print(f"      📂 {location} ({size_mb:.1f} MB)\n")

    print("Opções:")
    print("  0. Cancelar")
    print()

    while True:
        try:
            choice = input("Escolha o número (ou 0): ").strip()

            if choice == '0':
                print("❌ Cancelado")
                return

            choice_num = int(choice)
            if 1 <= choice_num <= len(files_list):
                selected_file, (full_path, location) = files_list[choice_num - 1]
                break
            else:
                print(f"❌ Digite um número entre 0 e {len(files_list)}")
        except ValueError:
            print("❌ Digite um número válido")

    # Ask for new name
    print(f"\n📝 Nome atual: {selected_file}")

    # Suggest a simpler name
    extension = Path(selected_file).suffix
    base_name = Path(selected_file).stem

    # Remove special characters from suggested name
    safe_name = "".join(c for c in base_name if c.isalnum() or c in (' ', '-', '_')).strip()
    if not safe_name:
        safe_name = "musica"

    suggested_name = safe_name + extension

    print(f"💡 Sugestão: {suggested_name}")
    new_name = input(f"Digite novo nome (ou Enter para: {suggested_name}): ").strip()

    if not new_name:
        new_name = suggested_name

    # Ensure extension
    if not new_name.lower().endswith(extension.lower()):
        new_name += extension

    # Copy file
    try:
        print(f"\n📋 Copiando {selected_file}...")
        print(f"   de: {full_path}")
        print(f"   para: {new_name}")

        shutil.copy2(full_path, new_name)

        print(f"\n✅ Sucesso! Arquivo copiado como: {new_name}")
        print(f"\n🎵 Agora execute:")
        print(f"   python extract_chords.py {new_name}")

    except Exception as e:
        print(f"\n❌ Erro ao copiar: {e}")


if __name__ == '__main__':
    main()
