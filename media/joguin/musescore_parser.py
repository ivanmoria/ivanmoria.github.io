1#!/usr/bin/env python3
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
                score_tree = None
                score_path = None

                # Try to find score file - first try container.xml
                try:
                    with zip_ref.open('META-INF/container.xml') as container:
                        container_tree = ET.parse(container)
                        container_root = container_tree.getroot()

                        # Find the root file path
                        ns = {'container': 'urn:oasis:names:tc:opendocument:xmlns:container'}
                        root_file = container_root.find('.//container:rootfile', ns)
                        if root_file is not None:
                            score_path = root_file.get('full-path')
                except:
                    pass

                # If container.xml didn't work, look for .mscx or .xml files
                if score_path is None:
                    # Try .mscx first (newer MuseScore format)
                    mscx_files = [f for f in zip_ref.namelist() if f.endswith('.mscx')]
                    if mscx_files:
                        score_path = mscx_files[0]
                    else:
                        # Fall back to any .xml file
                        xml_files = [f for f in zip_ref.namelist() if f.endswith('.xml') and 'META-INF' not in f]
                        if xml_files:
                            score_path = xml_files[0]

                # Load the score
                if score_path:
                    with zip_ref.open(score_path) as score_file:
                        score_tree = ET.parse(score_file)
                else:
                    print("⚠️  Arquivo .mscz não contém score XML válido")
                    return None

        else:
            # .mscx is just XML
            score_tree = ET.parse(mscz_path)

        if score_tree is None:
            return None

        score_root = score_tree.getroot()

        # Extract notes from all staves
        notes_data = extract_notes_from_score(score_root)

        return notes_data

    except Exception as e:
        print(f"❌ Erro ao parsear MuseScore: {e}")
        import traceback
        traceback.print_exc()
        return None


def extract_notes_from_score(score_root):
    """
    Extract notes and their timings from MuseScore XML.
    """

    note_names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

    all_notes = []
    chords = []
    melody_notes = []

    # Tentar encontrar todos as notas no score
    all_note_elements = score_root.findall('.//Note')

    if not all_note_elements:
        print("⚠️  Nenhuma nota encontrada no arquivo")
        return {
            'chords': [{'time': 0.0, 'chord': 'C'}],
            'melody': [{'time': 0.0, 'note': 'C', 'strength': 0.5}],
            'duration': 0.0,
            'tempo': 120.0
        }

    tempo_bpm = 120.0  # Default
    divisions_per_quarter = 480  # Default MuseScore divisions

    # Try to find tempo
    try:
        tempo_elem = score_root.find('.//Tempo')
        if tempo_elem is not None:
            if tempo_elem.text:
                tempo_bpm = float(tempo_elem.text)
    except:
        pass

    # Time per quarter note in seconds
    time_per_quarter = 60.0 / tempo_bpm

    print(f"🎵 Tempo: {tempo_bpm:.1f} BPM")

    current_time = 0.0
    current_chords = {}

    # Processar todas as notas
    for note_elem in all_note_elements:
        pitch_elem = note_elem.find('pitch')
        duration_elem = note_elem.find('duration')
        rest_elem = note_elem.find('rest')

        if rest_elem is not None:
            # Incrementar tempo pelo rest
            if duration_elem is not None:
                try:
                    duration = int(duration_elem.text)
                    current_time += (duration / divisions_per_quarter) * time_per_quarter
                except:
                    pass
            continue

        if pitch_elem is not None:
            try:
                pitch_value = int(pitch_elem.text)
                duration = 480  # Default if not found

                if duration_elem is not None:
                    try:
                        duration = int(duration_elem.text)
                    except:
                        pass

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

                # Track current chord
                if note_name not in current_chords:
                    current_chords[note_name] = note_data

                # Update time
                current_time += note_duration

            except Exception as e:
                continue

    # Extract melody (respeitar durações das notas)
    melody_notes = []
    last_note_data = None

    for note in all_notes:
        # Se é a primeira nota ou a nota é diferente E a nota anterior já terminou
        if len(melody_notes) == 0:
            melody_notes.append({
                'time': note['time'],
                'note': note['note'],
                'strength': 1.0
            })
            last_note_data = note
        elif note['note'] != melody_notes[-1]['note']:
            # Só adicionar nota nova se a anterior terminou
            if last_note_data and (note['time'] >= last_note_data['time'] + last_note_data['duration'] - 0.01):
                melody_notes.append({
                    'time': note['time'],
                    'note': note['note'],
                    'strength': 1.0
                })
                last_note_data = note
        else:
            # Mesma nota continua, atualizar last_note_data
            last_note_data = note

    # Create simple chords (notas que soam juntas)
    chords = []
    if all_notes:
        # Agrupar notas por tempo
        notes_by_time = {}
        for note in all_notes:
            time_key = round(note['time'], 3)
            if time_key not in notes_by_time:
                notes_by_time[time_key] = []
            notes_by_time[time_key].append(note['note'])

        # Criar acordes
        for time_key in sorted(notes_by_time.keys()):
            notes = sorted(set(notes_by_time[time_key]))
            if notes:
                chord_name = ' + '.join(notes)
                chords.append({
                    'time': time_key,
                    'chord': chord_name
                })

    print(f"✅ Encontrados {len(all_notes)} notas")
    print(f"✅ {len(chords)} acordes/eventos")
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
    import sys

    print("\n" + "="*60)
    print("🎼 ANALISADOR DE PARTITURAS MUSESCORE")
    print("="*60 + "\n")

    # Se arquivo foi passado como argumento, usar direto
    if len(sys.argv) > 1:
        mscz_file = sys.argv[1]
        if Path(mscz_file).exists():
            result = parse_musescore_file(mscz_file)
            if result:
                base_name = Path(mscz_file).stem
                json_file = f"{base_name}_from_score.json"
                with open(json_file, 'w') as f:
                    json.dump(result, f, indent=2)
                print(f"\n💾 Salvo em: {json_file}")
                print("\n" + "="*60 + "\n")
            return
        else:
            print(f"❌ Arquivo não encontrado: {mscz_file}")
            return

    # Find MuseScore files no diretório atual
    mscz_files = list(Path('.').glob('*.mscz')) + list(Path('.').glob('*.mscx'))

    # Se não encontrar, procurar em joguin/
    if not mscz_files:
        joguin_path = Path('media/joguin')
        if joguin_path.exists():
            mscz_files = list(joguin_path.glob('*.mscz')) + list(joguin_path.glob('*.mscx'))

    if not mscz_files:
        print("❌ Nenhum arquivo .mscz ou .mscx encontrado")
        print("📍 Use: python musescore_parser.py caminho/para/partitura.mscz")
        print("   Ou coloque a partitura nesta pasta ou em media/joguin/")
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
