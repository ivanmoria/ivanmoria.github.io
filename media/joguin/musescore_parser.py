#!/usr/bin/env python3
"""
Parse MuseScore files (.mscz, .mscx) to extract notes and timings.
Converts musical notation to game-compatible note sequences.
"""

import xml.etree.ElementTree as ET
import zipfile
import json
from pathlib import Path
from collections import defaultdict


def parse_musescore_file(mscz_path):
    """
    Parse a MuseScore file and extract notes with their timings.

    Args:
        mscz_path: Path to .mscz or .mscx file

    Returns:
        dict with chords and melody
    """

    print(f"\n🎼 Analisando partitura MuseScore: {Path(mscz_path).name}")

    try:
        # Extract XML from MSCZ (which is a ZIP file)
        if str(mscz_path).endswith('.mscz'):
            with zipfile.ZipFile(mscz_path, 'r') as zip_ref:
                # MuseScore stores the score in META-INF/container.xml
                # which points to the actual score file
                with zip_ref.open('META-INF/container.xml') as container:
                    container_tree = ET.parse(container)
                    container_root = container_tree.getroot()

                # Find the root file path
                ns = {'container': 'urn:oasis:names:tc:opendocument:xmlns:container'}
                root_file = container_root.find('.//container:rootfile', ns)
                score_path = root_file.get('full-path')

                # Extract the score file
                with zip_ref.open(score_path) as score_file:
                    score_tree = ET.parse(score_file)
        else:
            # .mscx is just XML
            score_tree = ET.parse(mscz_path)

        score_root = score_tree.getroot()

        # Extract notes from all staves
        notes_data = extract_notes_from_score(score_root)

        return notes_data

    except Exception as e:
        print(f"❌ Erro ao parsear MuseScore: {e}")
        return None


def extract_notes_from_score(score_root):
    """
    Extract notes and their timings from MuseScore XML.
    """

    note_names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

    all_notes = []
    chords = []
    melody_notes = []

    # Find all measures
    measures = score_root.findall('.//Measure')

    current_time = 0.0
    tempo_bpm = 120.0  # Default
    divisions_per_quarter = 480  # Default MuseScore divisions

    # Try to find tempo
    tempo_elem = score_root.find('.//Tempo')
    if tempo_elem is not None and 'tempo' in tempo_elem.attrib:
        try:
            tempo_bpm = float(tempo_elem.attrib['tempo'])
        except:
            pass

    # Time per quarter note in seconds
    time_per_quarter = 60.0 / tempo_bpm

    print(f"🎵 Tempo: {tempo_bpm:.1f} BPM")

    for measure in measures:
        # Find all notes in this measure
        notes = measure.findall('.//Note')
        chords_in_measure = []

        for note_elem in notes:
            pitch_elem = note_elem.find('pitch')
            duration_elem = note_elem.find('duration')
            rest_elem = note_elem.find('rest')

            if rest_elem is not None:
                # This is a rest, skip it
                continue

            if pitch_elem is not None and duration_elem is not None:
                try:
                    pitch_value = int(pitch_elem.text)
                    duration = int(duration_elem.text)

                    # Convert MIDI pitch to note name
                    note_name = get_note_name_from_midi(pitch_value, note_names)

                    # Calculate duration in seconds
                    note_duration = (duration / divisions_per_quarter) * time_per_quarter

                    note_data = {
                        'time': current_time,
                        'note': note_name,
                        'duration': note_duration,
                        'midi': pitch_value
                    }

                    all_notes.append(note_data)
                    chords_in_measure.append(note_name)

                except:
                    continue

        # Create chord from notes that start at same time
        if chords_in_measure:
            chord_name = ' + '.join(sorted(set(chords_in_measure)))
            chords.append({
                'time': current_time,
                'chord': chord_name
            })

        # Update time for next measure
        # Find the longest duration in this measure
        max_duration = 0
        for note_elem in measure.findall('.//Note'):
            duration_elem = note_elem.find('duration')
            if duration_elem is not None:
                try:
                    duration = int(duration_elem.text)
                    if duration > max_duration:
                        max_duration = duration
                except:
                    pass

        if max_duration > 0:
            current_time += (max_duration / divisions_per_quarter) * time_per_quarter

    # Extract melody (first staff, lowest octave notes)
    melody_notes = []
    for note in all_notes:
        if len(melody_notes) == 0 or note['note'] != melody_notes[-1]['note']:
            melody_notes.append({
                'time': note['time'],
                'note': note['note'],
                'strength': 1.0
            })

    print(f"✅ Encontrados {len(all_notes)} notas")
    print(f"✅ {len(chords)} acordes")
    print(f"✅ {len(melody_notes)} mudanças de melodia")

    return {
        'chords': chords if chords else [{'time': 0.0, 'chord': 'C'}],
        'melody': melody_notes if melody_notes else [{'time': 0.0, 'note': 'C', 'strength': 0.5}],
        'duration': current_time,
        'tempo': tempo_bpm
    }


def get_note_name_from_midi(midi_pitch, note_names):
    """
    Convert MIDI pitch number to note name.
    MIDI 60 = C4 (middle C)
    """
    # Get note within octave
    note_within_octave = midi_pitch % 12
    return note_names[note_within_octave]


def main():
    from pathlib import Path
    import os

    print("\n" + "="*60)
    print("🎼 ANALISADOR DE PARTITURAS MUSESCORE")
    print("="*60 + "\n")

    # Find MuseScore files
    mscz_files = list(Path('.').glob('*.mscz')) + list(Path('.').glob('*.mscx'))

    if not mscz_files:
        print("❌ Nenhum arquivo .mscz ou .mscx encontrado")
        print("📍 Coloque uma partitura MuseScore nesta pasta")
        return

    print(f"📁 {len(mscz_files)} partitura(s) encontrada(s):\n")
    for i, f in enumerate(mscz_files, 1):
        print(f"  {i}. {f.name}")

    print("\nOpções:")
    print("  0. Inserir caminho manual")
    print()

    choice = input("Escolha o número (ou 0): ").strip()

    if choice == '0':
        mscz_file = input("Digite o caminho da partitura: ").strip()
    else:
        try:
            idx = int(choice) - 1
            if 0 <= idx < len(mscz_files):
                mscz_file = str(mscz_files[idx])
            else:
                print("❌ Escolha inválida")
                return
        except:
            print("❌ Entrada inválida")
            return

    # Parse the file
    result = parse_musescore_file(mscz_file)

    if not result:
        print("❌ Erro ao processar partitura")
        return

    # Save as JSON
    base_name = Path(mscz_file).stem
    json_file = f"{base_name}_from_score.json"

    with open(json_file, 'w') as f:
        json.dump(result, f, indent=2)

    print(f"\n💾 Salvo em: {json_file}")
    print("\n" + "="*60 + "\n")


if __name__ == '__main__':
    main()
