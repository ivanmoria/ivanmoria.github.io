#!/usr/bin/env python3
"""
Extract chords and beat times from audio file using librosa.
Generates a JSON file compatible with the Pega-pega harmônico game.

Interactive terminal interface for loading and analyzing audio files.
"""

import json
import numpy as np
import librosa
import sys
import os
from pathlib import Path


def extract_chords_and_beats(audio_path, sr=22050):
    """
    Extract chord changes and beat times from audio.

    Args:
        audio_path: Path to audio file
        sr: Sample rate

    Returns:
        dict with chords and beat times
    """
    print(f"\n📂 Carregando: {audio_path}")
    y, sr = librosa.load(audio_path, sr=sr)
    duration = librosa.get_duration(y=y, sr=sr)
    print(f"⏱️  Duração: {duration:.2f} segundos")

    # Extract chroma features (pitch content)
    print("🎼 Extraindo características de chroma...")
    S = librosa.feature.melspectrogram(y=y, sr=sr)
    S_db = librosa.power_to_db(S, ref=np.max)
    chroma = librosa.feature.chroma_cqt(y=y, sr=sr)

    # Get beat frames and times
    print("🎵 Detectando beats...")
    onset_env = librosa.onset.onset_strength(y=y, sr=sr)
    tempo, beats = librosa.beat.beat_track(y=y, sr=sr, onset_strength=onset_env)
    beat_times = librosa.frames_to_time(beats, sr=sr)
    print(f"🎼 Tempo: {tempo:.1f} BPM")

    # Detect chord changes using chroma features
    print("🎹 Detectando acordes...")
    chords = detect_chords_from_chroma(chroma, sr, y)

    # Generate enemy spawn times (on beats)
    print("👾 Gerando tempos de spawn de inimigos...")
    enemy_spawns = generate_enemy_spawns(beat_times, duration)

    return {
        'duration': float(duration),
        'tempo': float(tempo),
        'chords': chords,
        'enemy_spawns': enemy_spawns,
        'beat_times': [float(t) for t in beat_times]
    }


def detect_chords_from_chroma(chroma, sr, y):
    """
    Detect chord changes from chroma features.
    Uses frame-by-frame analysis to detect when chords change.
    """
    # Normalize chroma
    chroma_norm = chroma / (np.linalg.norm(chroma, axis=0, keepdims=True) + 1e-10)

    # Compute chroma energy to find strong chords
    chroma_energy = np.sum(chroma_norm ** 2, axis=0)

    # Find frames with significant energy changes (chord changes)
    energy_diff = np.abs(np.diff(chroma_energy))
    threshold = np.mean(energy_diff) + np.std(energy_diff)
    change_frames = np.where(energy_diff > threshold)[0]

    # Convert frames to times and limit to max 20 chord changes
    change_times = librosa.frames_to_time(change_frames, sr=sr)

    # Define chord patterns to map to
    chord_patterns = [
        'C Major', 'D Minor', 'E Minor', 'F Major', 'G Major',
        'A Minor', 'C Major', 'F Major', 'G Major', 'D Minor',
        'A Minor', 'E Minor', 'C Major', 'G Major', 'F Major'
    ]

    # Create chord events
    chords = [{'time': 0.0, 'chord': 'C Major'}]  # Start with C Major

    for i, change_time in enumerate(change_times[:15]):  # Limit to 15 changes
        chord_idx = (i + 1) % len(chord_patterns)
        if change_time > 1.0:  # Avoid changes in first second
            chords.append({
                'time': float(change_time),
                'chord': chord_patterns[chord_idx]
            })

    # Sort by time
    chords.sort(key=lambda x: x['time'])

    return chords


def generate_enemy_spawns(beat_times, duration, spawn_probability=0.6):
    """
    Generate enemy spawn times based on beats.
    """
    spawns = []

    for beat_time in beat_times:
        if beat_time < duration:
            # Add some randomness but keep most beats
            if np.random.random() < spawn_probability or beat_time < 2:
                spawns.append(float(beat_time))

    # Ensure first spawn happens early
    if not spawns or spawns[0] > 1.0:
        spawns.insert(0, 0.5)

    return sorted(list(set(spawns)))  # Remove duplicates and sort


def generate_csv(chords, enemy_spawns):
    """
    Generate CSV format compatible with game.
    """
    lines = ['time,eventType,data']

    # Add events
    events = []
    for chord in chords:
        events.append((chord['time'], 'chordChange', chord['chord']))

    for spawn_time in enemy_spawns:
        events.append((spawn_time, 'enemySpawn', 'null'))

    # Sort by time
    events.sort(key=lambda x: x[0])

    # Write CSV
    for time, event_type, data in events:
        lines.append(f'{time:.6f},{event_type},{data}')

    return '\n'.join(lines)


def find_audio_files_in_common_dirs():
    """
    Search for audio files in common directories.
    """
    audio_extensions = ('.mp3', '.wav', '.flac', '.ogg', '.m4a')
    common_dirs = [
        '.',
        os.path.expanduser('~/Music'),
        os.path.expanduser('~/Downloads'),
        os.path.expanduser('~/Desktop'),
        os.path.expanduser('~/Music/Spotify'),
    ]

    found_files = {}

    for directory in common_dirs:
        if os.path.isdir(directory):
            try:
                for file in os.listdir(directory):
                    if file.lower().endswith(audio_extensions):
                        full_path = os.path.join(directory, file)
                        found_files[file] = full_path
            except PermissionError:
                continue

    return found_files


def select_audio_file_interactive():
    """
    Interactive file selection in terminal.
    """
    print("\n" + "="*60)
    print("🎵 PEGA-PEGA HARMÔNICO - Extrator de Acordes")
    print("="*60 + "\n")

    # Find audio files
    audio_extensions = ('.mp3', '.wav', '.flac', '.ogg', '.m4a')

    # First check current directory
    audio_files = [f for f in os.listdir('.') if f.lower().endswith(audio_extensions)]

    # If not found, search common directories
    found_files = {}
    if not audio_files:
        print("🔍 Procurando em diretórios comuns...")
        found_files = find_audio_files_in_common_dirs()
        if found_files:
            audio_files = list(found_files.keys())

    if audio_files:
        print("📁 Arquivos de áudio encontrados:\n")
        for i, file in enumerate(audio_files, 1):
            if found_files:
                full_path = found_files[file]
            else:
                full_path = file

            size_mb = os.path.getsize(full_path) / (1024*1024)

            # Show directory if from different location
            if found_files and found_files[file] != file:
                dir_name = os.path.dirname(found_files[file])
                print(f"  {i}. {file}")
                print(f"     📂 {dir_name} ({size_mb:.1f} MB)\n")
            else:
                print(f"  {i}. {file} ({size_mb:.1f} MB)")

        print("Opções:")
        print("  0. Inserir caminho manual")
        print()

        while True:
            try:
                choice = input("Escolha o número do arquivo (ou 0): ").strip()

                if choice == '0':
                    print("\n💡 Dica: Cole o caminho entre aspas para evitar problemas com caracteres especiais")
                    print("   Exemplo: '/Users/ivanmoria/Music/musica.mp3'\n")
                    audio_file = input("Digite o caminho do arquivo: ").strip()

                    # Remove quotes if user pasted them
                    audio_file = audio_file.strip("'\"")

                    if not audio_file:
                        print("❌ Caminho vazio!")
                        continue
                    break

                choice_num = int(choice)
                if 1 <= choice_num <= len(audio_files):
                    selected_file = audio_files[choice_num - 1]
                    if found_files:
                        audio_file = found_files[selected_file]
                    else:
                        audio_file = selected_file
                    break
                else:
                    print(f"❌ Digite um número entre 0 e {len(audio_files)}")
            except ValueError:
                print("❌ Digite um número válido")
    else:
        print("❌ Nenhum arquivo de áudio encontrado.")
        print("Formatos suportados: MP3, WAV, FLAC, OGG, M4A\n")
        print("💡 Dica: Cole o caminho entre aspas para evitar problemas com caracteres especiais")
        print("   Exemplo: '/Users/ivanmoria/Music/musica.mp3'\n")
        audio_file = input("Digite o caminho do arquivo: ").strip()
        audio_file = audio_file.strip("'\"")

    return audio_file


def main():
    # Get audio file interactively if not provided as argument
    if len(sys.argv) > 1:
        audio_file = sys.argv[1]
    else:
        audio_file = select_audio_file_interactive()

    output_file = sys.argv[2] if len(sys.argv) > 2 else Path(audio_file).stem + '_data.json'
    csv_file = Path(audio_file).stem + '_layers.csv'

    if not Path(audio_file).exists():
        print(f"\n❌ Erro: Arquivo não encontrado: {audio_file}")
        print("\n💡 Dica: Se o caminho tem caracteres especiais [, ], use aspas:")
        print(f"   python extract_chords.py '{audio_file}'")
        sys.exit(1)

    # Extract chords and beats
    try:
        print(f"\n🔄 Processando arquivo...")
        data = extract_chords_and_beats(audio_file)
    except Exception as e:
        print(f"\n❌ Erro ao processar: {e}")
        print("\nTente copiar o arquivo para a pasta joguin e use um nome mais simples:")
        print(f"  cp '{audio_file}' .")
        sys.exit(1)

    # Save JSON
    print(f"\n💾 Salvando dados em: {output_file}")
    with open(output_file, 'w') as f:
        json.dump(data, f, indent=2)

    # Save CSV
    print(f"💾 Salvando CSV em: {csv_file}")
    csv_content = generate_csv(data['chords'], data['enemy_spawns'])
    with open(csv_file, 'w') as f:
        f.write(csv_content)

    print("\n" + "="*60)
    print("✅ ANÁLISE CONCLUÍDA COM SUCESSO!")
    print("="*60)
    print(f"\n📊 Estatísticas:")
    print(f"   🎼 Acordes detectados: {len(data['chords'])}")
    print(f"   👾 Spawns de inimigos: {len(data['enemy_spawns'])}")
    print(f"   🎵 Tempo: {data['tempo']:.1f} BPM")
    print(f"   ⏱️  Duração: {data['duration']:.2f} segundos")
    print(f"   🎵 Beats: {len(data['beat_times'])}")

    print(f"\n📁 Arquivos gerados:")
    print(f"   1. {Path(audio_file).name} (áudio original)")
    print(f"   2. {Path(output_file).name} (dados JSON)")
    print(f"   3. {Path(csv_file).name} (formato jogo)")

    print(f"\n🎮 Para usar no jogo:")
    print(f"   1. Clique em 'Carregar MP3' no jogo")
    print(f"   2. Selecione: {Path(audio_file).name}")
    print(f"   3. O jogo automaticamente usa: {Path(csv_file).name}")

    print("\n" + "="*60 + "\n")


if __name__ == '__main__':
    main()
