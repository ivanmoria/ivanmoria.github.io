#!/usr/bin/env python3
"""
Sintetiza áudio a partir de um arquivo JSON de partitura MuseScore.
Cria um arquivo MP3/WAV com os sons das notas.
"""

import json
import numpy as np
import sys
from pathlib import Path

try:
    import wave
except ImportError:
    wave = None


def midi_to_frequency(midi_note):
    """Converte número MIDI para frequência em Hz."""
    return 440 * (2 ** ((midi_note - 69) / 12))


def generate_note(frequency, duration, sample_rate=44100, volume=0.3):
    """Gera uma nota senoidal."""
    # Suavizar início e fim (envelope ADSR simplificado)
    attack_time = min(0.01, duration * 0.1)
    release_time = min(0.1, duration * 0.3)

    attack_samples = int(attack_time * sample_rate)
    release_samples = int(release_time * sample_rate)
    total_samples = int(duration * sample_rate)

    # Gerar onda senoidal
    t = np.arange(total_samples) / sample_rate
    wave_data = np.sin(2 * np.pi * frequency * t)

    # Aplicar envelope
    envelope = np.ones(total_samples)

    # Attack
    if attack_samples > 0:
        envelope[:attack_samples] = np.linspace(0, 1, attack_samples)

    # Release
    if release_samples > 0:
        envelope[-release_samples:] = np.linspace(1, 0, release_samples)

    # Aplicar volume e envelope
    wave_data = wave_data * envelope * volume

    return wave_data


def synthesize_from_json(json_file, output_file=None):
    """Sintetiza áudio a partir de JSON de partitura."""

    if not Path(json_file).exists():
        print(f"❌ Arquivo não encontrado: {json_file}")
        return False

    try:
        with open(json_file) as f:
            data = json.load(f)

        if output_file is None:
            base_name = Path(json_file).stem
            if base_name.endswith('_from_score'):
                base_name = base_name.replace('_from_score', '')
            output_file = f"{base_name}.wav"

        print(f"\n🎵 Sintetizando áudio...")

        sample_rate = 44100
        all_audio = np.array([])

        # Extrair notas do JSON
        if 'melody' not in data:
            print("⚠️  Nenhuma melodia encontrada no JSON")
            return False

        melody = data['melody']
        tempo = data.get('tempo', 120.0)

        # Mapear nota para MIDI
        note_to_midi = {
            'C': 60, 'C#': 61, 'D': 62, 'D#': 63, 'E': 64,
            'F': 65, 'F#': 66, 'G': 67, 'G#': 68, 'A': 69,
            'A#': 70, 'B': 71
        }

        # Converter notas em áudio
        current_time = 0.0
        for i, note_data in enumerate(melody):
            note_time = note_data['time']
            note_name = note_data['note']

            # Calcular duração até próxima nota
            if i < len(melody) - 1:
                next_time = melody[i + 1]['time']
                duration = next_time - note_time
            else:
                # Última nota: 0.5 segundos
                duration = 0.5

            # Garantir duração mínima
            duration = max(duration, 0.1)

            # Silence até a próxima nota
            silence_duration = note_time - current_time
            if silence_duration > 0:
                silence = np.zeros(int(silence_duration * sample_rate))
                all_audio = np.concatenate([all_audio, silence])

            # Gerar nota
            midi_note = note_to_midi.get(note_name, 60)
            frequency = midi_to_frequency(midi_note)
            note_audio = generate_note(frequency, duration, sample_rate)

            all_audio = np.concatenate([all_audio, note_audio])
            current_time = note_time + duration

            print(f"  ✓ {note_name} ({frequency:.1f} Hz) - {duration:.2f}s")

        # Normalizar áudio
        max_amplitude = np.max(np.abs(all_audio))
        if max_amplitude > 0:
            all_audio = all_audio / max_amplitude * 0.95

        # Converter para int16
        audio_int16 = (all_audio * 32767).astype(np.int16)

        # Salvar como WAV
        if wave:
            with wave.open(output_file, 'w') as wav_file:
                wav_file.setnchannels(1)  # Mono
                wav_file.setsampwidth(2)  # 16-bit
                wav_file.setframerate(sample_rate)
                wav_file.writeframes(audio_int16.tobytes())

            print(f"\n✅ Áudio sintetizado com sucesso!")
            print(f"💾 Salvo em: {output_file}")
            print(f"⏱️  Duração: {len(all_audio) / sample_rate:.2f} segundos")
            return True
        else:
            print("⚠️  Módulo wave não disponível")
            return False

    except Exception as e:
        print(f"❌ Erro ao sintetizar: {e}")
        import traceback
        traceback.print_exc()
        return False


def main():
    if len(sys.argv) < 2:
        print("Uso: python synthesize_audio.py arquivo.json [saida.wav]")
        print("\nExemplo:")
        print("  python synthesize_audio.py um_from_score.json um.wav")
        return

    json_file = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else None

    synthesize_from_json(json_file, output_file)


if __name__ == '__main__':
    main()
