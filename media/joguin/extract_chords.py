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
    try:
        # Try newer librosa API first
        tempo, beats = librosa.beat.beat_track(y=y, sr=sr)
    except TypeError:
        # Fallback for older versions
        onset_env = librosa.onset.onset_strength(y=y, sr=sr)
        tempo, beats = librosa.beat.beat_track(onset_strength=onset_env, sr=sr)

    beat_times = librosa.frames_to_time(beats, sr=sr)

    # Ensure tempo is a scalar (not an array)
    tempo_value = float(tempo[0]) if isinstance(tempo, np.ndarray) else float(tempo)
    print(f"🎼 Tempo: {tempo_value:.1f} BPM")

    # Detect chord changes using chroma features
    print("🎹 Detectando acordes...")
    chords = detect_chords_from_chroma(chroma, sr, y)

    # Extract melody (dominant pitch) from audio
    print("🎵 Extraindo melodia...")
    melody = extract_melody_from_chroma(chroma, sr)

    # Generate enemy spawn times (on beats)
    print("👾 Gerando tempos de spawn de inimigos...")
    enemy_spawns = generate_enemy_spawns(beat_times, duration)

    return {
        'duration': float(duration),
        'tempo': tempo_value,
        'chords': chords,
        'melody': melody,
        'enemy_spawns': enemy_spawns,
        'beat_times': [float(t) for t in beat_times]
    }


def detect_chords_from_chroma(chroma, sr, y):
    """
    Detect chord changes from chroma features.
    Analyzes which notes are present and matches to known chords.
    """
    try:
        # Note names (chromatic scale starting from C)
        note_names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

        # Known chord patterns (intervals from root)
        chord_patterns = {
            'Major': [0, 4, 7],      # Root, Major 3rd, Perfect 5th
            'Minor': [0, 3, 7],      # Root, Minor 3rd, Perfect 5th
            'Dominant': [0, 4, 7, 10],  # Major 7th
        }

        # Normalize chroma for better analysis
        chroma_norm = chroma / (np.linalg.norm(chroma, axis=0, keepdims=True) + 1e-10)

        # Aggregate chroma over time windows (every 2 seconds)
        window_size = int(2 * sr / 512)  # 2 second windows
        chords = []

        print("🎼 Analisando acordes em tempo real...")

        for i in range(0, chroma_norm.shape[1], window_size):
            window_end = min(i + window_size, chroma_norm.shape[1])
            window_chroma = chroma_norm[:, i:window_end]

            # Average chroma in window
            avg_chroma = np.mean(window_chroma, axis=1)

            # Find the strongest notes (peaks in chroma)
            threshold = np.mean(avg_chroma) + 0.5 * np.std(avg_chroma)
            strong_notes = np.where(avg_chroma > threshold)[0]

            if len(strong_notes) >= 2:  # Need at least 2 notes for a chord
                # Get time for this window
                time = librosa.frames_to_time(i, sr=sr)

                # Find the best matching chord
                best_chord = identify_chord(strong_notes, note_names, chord_patterns)

                # Add if different from last chord
                if not chords or chords[-1]['chord'] != best_chord:
                    chords.append({
                        'time': float(time),
                        'chord': best_chord
                    })

                if len(chords) > 0 and len(chords) % 5 == 0:
                    print(f"  ✓ {len(chords)} acordes detectados...")

        if not chords:
            print("⚠️  Nenhum acorde detectado, usando padrão")
            return [{'time': 0.0, 'chord': 'C Major'}]

        print(f"✅ Total de acordes detectados: {len(chords)}")
        return chords

    except Exception as e:
        print(f"⚠️  Erro na detecção: {e}")
        return [{'time': 0.0, 'chord': 'C Major'}]


def extract_melody_from_chroma(chroma, sr):
    """
    Extract melody (dominant pitch) from chroma features.
    Returns times and notes of the melody.
    """
    try:
        note_names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
        melody_notes = []

        # Normalize chroma
        chroma_norm = chroma / (np.linalg.norm(chroma, axis=0, keepdims=True) + 1e-10)

        # For each frame, find the note with highest energy (dominant pitch)
        for frame_idx in range(chroma_norm.shape[1]):
            frame_chroma = chroma_norm[:, frame_idx]
            # Find note with highest energy
            dominant_note_idx = np.argmax(frame_chroma)
            dominant_note = note_names[dominant_note_idx]

            # Get time for this frame
            time = librosa.frames_to_time(frame_idx, sr=sr)
            melody_notes.append({
                'time': float(time),
                'note': dominant_note,
                'strength': float(frame_chroma[dominant_note_idx])
            })

        # Smooth out rapid note changes (take every Nth frame to reduce noise)
        # Sample every 512 frames (~1 frame per ~50ms at sr=22050)
        smoothed_melody = []
        for i in range(0, len(melody_notes), 512):
            if melody_notes[i]['strength'] > 0.1:  # Only if note is strong enough
                # Check if different from last added note
                if not smoothed_melody or smoothed_melody[-1]['note'] != melody_notes[i]['note']:
                    smoothed_melody.append(melody_notes[i])

        return smoothed_melody if smoothed_melody else [{'time': 0.0, 'note': 'C', 'strength': 0.5}]

    except Exception as e:
        print(f"⚠️  Erro na extração de melodia: {e}")
        return [{'time': 0.0, 'note': 'C', 'strength': 0.5}]


def identify_chord(note_indices, note_names, chord_patterns):
    """
    Identify chord from set of note indices.
    """
    if len(note_indices) < 2:
        return 'C Major'

    # Get the lowest note as potential root
    root_idx = note_indices[0] % 12

    # Calculate intervals from root
    intervals = [(note % 12 - root_idx) % 12 for note in note_indices]
    intervals.sort()

    # Try to match to known chord patterns
    best_match = 'Major'
    best_score = 0

    for chord_type, pattern in chord_patterns.items():
        # Check how many pattern notes are present
        matches = sum(1 for p in pattern if p in intervals)
        score = matches / len(pattern)

        if score > best_score:
            best_score = score
            best_match = chord_type

    root_note = note_names[root_idx]
    return f"{root_note} {best_match}"


def generate_enemy_spawns(beat_times, duration, spawn_probability=0.6):
    """
    Generate enemy spawn times based on beats.
    """
    spawns = []

    for beat_time in beat_times:
        # Ensure beat_time is float
        bt = float(beat_time) if hasattr(beat_time, '__float__') else beat_time
        if bt < duration:
            # Add some randomness but keep most beats
            if np.random.random() < spawn_probability or bt < 2:
                spawns.append(bt)

    # Ensure first spawn happens early
    if not spawns or spawns[0] > 1.0:
        spawns.insert(0, 0.5)

    return sorted(list(set(spawns)))  # Remove duplicates and sort


def generate_csv(chords, melody, enemy_spawns):
    """
    Generate CSV format compatible with game.
    """
    lines = ['time,eventType,data']

    # Add events
    events = []
    for chord in chords:
        events.append((chord['time'], 'chordChange', chord['chord']))

    for melody_note in melody:
        events.append((melody_note['time'], 'melodyChange', melody_note['note']))

    for spawn_time in enemy_spawns:
        events.append((spawn_time, 'enemySpawn', 'null'))

    # Sort by time
    events.sort(key=lambda x: x[0])

    # Write CSV
    for time, event_type, data in events:
        # Convert numpy types to Python native types
        time_float = float(time)
        lines.append(f'{time_float:.6f},{event_type},{data}')

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
    csv_content = generate_csv(data['chords'], data['melody'], data['enemy_spawns'])
    with open(csv_file, 'w') as f:
        f.write(csv_content)

    # Copy audio file to game folder
    audio_filename = Path(audio_file).name
    game_audio_path = audio_filename
    print(f"📋 Copiando áudio para pasta do jogo: {game_audio_path}")
    try:
        import shutil
        shutil.copy2(audio_file, game_audio_path)
    except Exception as e:
        print(f"⚠️  Não consegui copiar áudio: {e}")

    # Create music metadata file for the game
    music_metadata = {
        'id': Path(audio_file).stem,
        'name': Path(audio_file).stem.replace('_', ' ').replace('-', ' ').title(),
        'audio': audio_filename,
        'csv': Path(csv_file).name,
        'tempo': data['tempo'],
        'duration': data['duration'],
        'chords_count': len(data['chords']),
        'spawns_count': len(data['enemy_spawns'])
    }

    metadata_file = Path(audio_file).stem + '_metadata.json'
    print(f"💾 Salvando metadados em: {metadata_file}")
    with open(metadata_file, 'w') as f:
        json.dump(music_metadata, f, indent=2)

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
    print(f"   1. {audio_filename} (áudio - COPIADO para o jogo ✅)")
    print(f"   2. {Path(output_file).name} (dados JSON)")
    print(f"   3. {Path(csv_file).name} (formato jogo)")
    print(f"   4. {metadata_file} (metadados para o jogo)")

    print(f"\n🎮 Agora você pode:")
    print(f"   ✅ O arquivo de áudio está na pasta do jogo")
    print(f"   ✅ O CSV de inimigos/acordes foi criado")
    print(f"   ✅ Metadados foram salvos")
    print(f"\n   No navegador, clique em 'Carregar MP3' e selecione:")
    print(f"   {audio_filename}")

    print("\n" + "="*60 + "\n")


if __name__ == '__main__':
    main()
