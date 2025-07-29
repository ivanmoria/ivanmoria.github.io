
import os
import csv
import numpy as np
import pandas as pd
from dass_calculo import calcular_dass
from PyQt5.QtWidgets import QGridLayout, QLabel, QTableWidget, QPushButton, QMessageBox, QSizePolicy, QTableWidgetItem
from PyQt5.QtCore import Qt

def process_selected_files(self, selected_files):
    grid_layout = QGridLayout()
    self.scroll_layout.addLayout(grid_layout)

    for index, file_name in enumerate(selected_files):
        if os.path.getsize(file_name) == 0:
            QMessageBox.warning(self, "Aviso", f"O arquivo {file_name} está vazio e será ignorado.")
            continue

        file_name_label = QLabel(os.path.basename(file_name))
        file_name_label.setStyleSheet("font-weight: bold;")
        info_label = QLabel()
        info_label.setWordWrap(True)

        new_table = QTableWidget()
        new_table.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Expanding)
        new_table.setStyleSheet("border: none;")
        self.tables.append(new_table)
        self.set_alternating_row_colors(new_table)

        remove_button = QPushButton("X")
        remove_button.setFixedSize(30, 30)
        remove_button.clicked.connect(lambda: remove_table_and_layout(grid_layout, new_table, file_name_label, info_label))


        def remove_table_and_layout(layout, table, file_name_label, info_label):
            # Remover a tabela
            if table in self.tables:
                self.tables.remove(table)

            # Remover a tabela e a legenda associada
            for i in range(layout.count()):
                item = layout.itemAt(i)
                if item is not None:
                    widget = item.widget()
                    # Se o widget for a tabela, remova-o
                    if widget == table:
                        layout.removeWidget(widget)
                        widget.deleteLater()
                    # Remova também o nome do arquivo e a info_label associados
                    elif widget == file_name_label or widget == info_label:
                        layout.removeWidget(widget)
                        widget.deleteLater()

            self.adjust_window_size()
            self.scroll_layout.update()




        with open(file_name, 'r') as f:
            reader = csv.reader(f, delimiter=' ')
            header = next(reader)

            if header == ["Tempo", "Tecla", "Velocity", "Press_dur"]:
                new_table.setColumnCount(4)
                new_table.setHorizontalHeaderLabels(header)
                velocities = []
                key_counts = set()
                tempos = []

                for row_data in reader:
                    if len(row_data) == 4:
                        self.populate_table(new_table, row_data)
                        velocities.append(float(row_data[2]))
                        key_counts.add(row_data[1])
                        tempos.append(float(row_data[0]))  # Captura os tempos

                if velocities:
                    avg_velocity = sum(velocities) / len(velocities)
                    num_unique_keys = len(key_counts)

                    # Calcular a variação percentual aproximada
                    variation_percentage = num_unique_keys

                    # Calcular o BPM
                    if len(tempos) > 1:
                        time_diffs = np.diff(tempos)  # Diferenças de tempo consecutivas
                        avg_time_diff = np.mean(time_diffs)
                        bpm = 60 / avg_time_diff if avg_time_diff > 0 else 0  # Batidas por minuto
                    else:
                        bpm = 0  # Não há dados suficientes para calcular o BPM

                    info_label.setText(f"Velocity: {avg_velocity:.2f}, Variação: {variation_percentage}, BPM: {bpm:.2f}")

            elif header == ["Pergunta", "Resposta"]:
                new_table.setColumnCount(1)
                new_table.setHorizontalHeaderLabels(["Resposta"])
                for row_data in reader:
                    if len(row_data) == 2:
                        new_table.insertRow(new_table.rowCount())
                        new_table.setItem(new_table.rowCount() - 1, 0, QTableWidgetItem(row_data[1]))

                # Crie um DataFrame a partir do QTableWidget
                respostas = []
                for row in range(new_table.rowCount()):
                    item = new_table.item(row, 0)
                    respostas.append(int(item.text()) if item else 0)

                # Crie o DataFrame
                df = pd.DataFrame(respostas, columns=["Resposta"])

                # Calcule DASS aqui
                dass_scores = calcular_dass(df)
                info_label.setText(
                    f"Depressão: {dass_scores['depressao']} ({dass_scores['class_depressao']}), "
                    f"Ansiedade: {dass_scores['ansiedade']} ({dass_scores['class_ansiedade']}), "
                    f"Estresse: {dass_scores['estresse']} ({dass_scores['class_estresse']})"
                )

            self.state[new_table] = {'current_row': 0}
            new_table.setRowCount(new_table.rowCount())

            new_table.setVerticalScrollBarPolicy(Qt.ScrollBarAlwaysOff)
            new_table.resizeRowsToContents()


            # Adicione os widgets ao grid_layout
            row = index // 3
            col = index % 3
            grid_layout.addWidget(remove_button, row * 2, col * 2)  # botão
            grid_layout.addWidget(file_name_label, row * 2, col * 2 + 1)  # nome do arquivo
            grid_layout.addWidget(info_label, row * 2 + 1, col * 2, 1, 2)  # info_label (ocupa 2 colunas)
            grid_layout.addWidget(new_table, row * 2 + 2, col * 2, 1, 2)  # tabela (também ocupa 2 colunas)

        self.adjust_window_size()
