#!/usr/bin/env python3
"""
Extract chords and beat times from audio file using librosa.
Generates a JSON file compatible with the Pega-pega harmônico game.

Usage:
    python extract_chords.py <audio_file> <output_file>

Example:
    python extract_chords.py musica.mp3 musica_data.json
"""

import json
import numpy as np
import librosa
import sys
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
    print(f"Loading audio: {audio_path}")
    y, sr = librosa.load(audio_path, sr=sr)
    duration = librosa.get_duration(y=y, sr=sr)
    print(f"Duration: {duration:.2f} seconds")

    # Extract chroma features (pitch content)
    print("Extracting chroma features...")
    S = librosa.feature.melspectrogram(y=y, sr=sr)
    S_db = librosa.power_to_db(S, ref=np.max)
    chroma = librosa.feature.chroma_cqt(y=y, sr=sr)

    # Get beat frames and times
    print("Detecting beats...")
    onset_env = librosa.onset.onset_strength(y=y, sr=sr)
    tempo, beats = librosa.beat.beat_track(y=y, sr=sr, onset_strength=onset_env)
    beat_times = librosa.frames_to_time(beats, sr=sr)
    print(f"Tempo: {tempo:.1f} BPM")

    # Detect chord changes using chroma features
    print("Detecting chords...")
    chords = detect_chords_from_chroma(chroma, sr, y)

    # Generate enemy spawn times (on beats)
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


def main():
    if len(sys.argv) < 2:
        print("Usage: python extract_chords.py <audio_file> [output_file]")
        print("Example: python extract_chords.py song.mp3 song_data.json")
        sys.exit(1)

    audio_file = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else Path(audio_file).stem + '_data.json'
    csv_file = Path(audio_file).stem + '_layers.csv'

    if not Path(audio_file).exists():
        print(f"Error: File not found: {audio_file}")
        sys.exit(1)

    # Extract chords and beats
    try:
        data = extract_chords_and_beats(audio_file)
    except Exception as e:
        print(f"Error extracting chords: {e}")
        sys.exit(1)

    # Save JSON
    print(f"\nSaving data to: {output_file}")
    with open(output_file, 'w') as f:
        json.dump(data, f, indent=2)

    # Save CSV
    print(f"Saving CSV to: {csv_file}")
    csv_content = generate_csv(data['chords'], data['enemy_spawns'])
    with open(csv_file, 'w') as f:
        f.write(csv_content)

    print(f"\n✅ Done!")
    print(f"Detected {len(data['chords'])} chord changes")
    print(f"Generated {len(data['enemy_spawns'])} enemy spawn points")
    print(f"Tempo: {data['tempo']:.1f} BPM")
    print(f"\nUse the following files in the game:")
    print(f"  - Audio: {audio_file}")
    print(f"  - Data: {output_file}")
    print(f"  - CSV: {csv_file}")


if __name__ == '__main__':
    main()
