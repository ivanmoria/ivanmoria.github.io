#!/usr/bin/env python3
"""
Converte JSON gerado pelo musescore_parser.py para CSV compatível com o jogo.
"""

import json
from pathlib import Path
import sys


def convert_json_to_csv(json_file, output_name=None):
    """
    Converte JSON de partitura para CSV do jogo.
    """

    if not Path(json_file).exists():
        print(f"❌ Arquivo não encontrado: {json_file}")
        return False

    try:
        with open(json_file) as f:
            data = json.load(f)

        # Determinar nome do arquivo de saída
        if output_name is None:
            base_name = Path(json_file).stem
            # Remove "_from_score" do final se existir
            if base_name.endswith('_from_score'):
                base_name = base_name.replace('_from_score', '')
            output_name = f"{base_name}_layers.csv"

        # Extrair eventos
        events = []

        # Adicionar eventos de acorde
        if 'chords' in data:
            for chord in data['chords']:
                time = float(chord['time'])
                chord_name = chord['chord']
                events.append((time, 'chordChange', chord_name))

        # Adicionar eventos de melodia
        if 'melody' in data:
            for note in data['melody']:
                time = float(note['time'])
                note_name = note['note']
                events.append((time, 'melodyChange', note_name))

        # Gerar spawns de inimigos (a cada 0.5 segundos)
        duration = data.get('duration', 0)
        spawn_interval = 0.5
        spawn_time = 0.0
        while spawn_time < duration:
            events.append((spawn_time, 'enemySpawn', 'null'))
            spawn_time += spawn_interval

        # Ordenar por tempo
        events.sort(key=lambda x: x[0])

        # Escrever CSV
        with open(output_name, 'w') as f:
            f.write('time,eventType,data\n')
            for time, event_type, data_val in events:
                f.write(f'{time:.6f},{event_type},{data_val}\n')

        print(f"\n✅ Convertido com sucesso!")
        print(f"📊 Estatísticas:")
        print(f"  Acordes: {len([e for e in events if e[1] == 'chordChange'])}")
        print(f"  Notas (Melodia): {len([e for e in events if e[1] == 'melodyChange'])}")
        print(f"  Spawns: {len([e for e in events if e[1] == 'enemySpawn'])}")
        print(f"\n💾 Salvo em: {output_name}")
        print(f"\n🎮 Próximo passo:")
        print(f"  1. Copie o arquivo de áudio para esta pasta (ou use um existente)")
        print(f"  2. Renomeie o CSV para combinar com o áudio")
        print(f"  3. Execute: python update_music_buttons.py")
        print(f"  4. Recarregue o navegador - sua música aparecerá!\n")

        return True

    except Exception as e:
        print(f"❌ Erro ao converter: {e}")
        import traceback
        traceback.print_exc()
        return False


def main():
    if len(sys.argv) < 2:
        print("Uso: python convert_json_to_csv.py arquivo.json [nome_saida.csv]")
        print("\nExemplo:")
        print("  python convert_json_to_csv.py um_from_score.json um_layers.csv")
        return

    json_file = sys.argv[1]
    output_name = sys.argv[2] if len(sys.argv) > 2 else None

    convert_json_to_csv(json_file, output_name)


if __name__ == '__main__':
    main()
