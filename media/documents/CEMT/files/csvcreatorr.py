import os
import sys
import csv
import numpy as np
import pandas as pd
from scipy.interpolate import interp1d
from dass_calculo import calcular_dass
from calculos import *
from timer import TimerApp
from PyQt5.QtCore import Qt, QTimer, QSize
from PyQt5.QtGui import QColor
from PyQt5.QtWidgets import (QApplication, QMainWindow, QVBoxLayout,
                             QWidget, QTableWidget, QTableWidgetItem,
                             QMessageBox, QSizePolicy, QScrollArea,
                             QLabel, QFileDialog, QGridLayout, QHBoxLayout, QPushButton)

import matplotlib.pyplot as plt
from matplotlib.backends.backend_qt5agg import FigureCanvasQTAgg as FigureCanvas


class CsvCreatorApp(QMainWindow):
    def __init__(self):
        super().__init__()

        self.setWindowTitle("CSV Creator")
        self.setGeometry(30, 30, 800, 800)

        self.inactivity_timer = QTimer(self)  # Inicializa inactivity_timer como um QTimer
        self.inactivity_timer.timeout.connect(self.handle_inactivity)
        self.timer_app = TimerApp()
        self.timer_app.set_csv_creator_app(self)  # Define a referência
        
 


        
        self.state = {}  # Inicializa o atributo state como um dicionário
        self.central_widget = QWidget()
        self.setCentralWidget(self.central_widget)

        self.main_layout = QVBoxLayout(self.central_widget)
        self.main_layout.setContentsMargins(0, 0, 0, 0)
        self.main_layout.setSpacing(0)

        self.scroll_area = QScrollArea()
        self.scroll_area.setWidgetResizable(True)

        self.scroll_widget = QWidget()
        self.scroll_layout = QVBoxLayout(self.scroll_widget)  
        self.scroll_layout.setContentsMargins(0, 0, 0, 0)
        self.scroll_layout.setSpacing(20)

        self.scroll_area.setWidget(self.scroll_widget)

        self.tables = []
        self.table_count = 0

        # Criação do Timer
        self.timer = TimerApp()
        self.timer.set_csv_creator_app(self)
        self.timer.setFixedSize(230, 40)
        self.timer.setSizePolicy(QSizePolicy.Fixed, QSizePolicy.Preferred)

        self.timer_layout = QHBoxLayout()
        self.timer_layout.addWidget(self.timer)

        self.interpolate_button = QPushButton("Interpolar Dados")
        self.interpolate_button.setFixedSize(150, 40)
        self.interpolate_button.clicked.connect(self.toggle_interpolation)
        self.timer_layout.addWidget(self.interpolate_button)



        self.main_layout.addLayout(self.timer_layout)
        self.main_layout.addWidget(self.scroll_area)



        # Adicionando o canvas para a animação
        self.figure = plt.figure(figsize=(5, 5))  # Ajuste o tamanho conforme necessário
        self.canvas = FigureCanvas(self.figure)
        self.main_layout.addWidget(self.canvas)




        self.update_timer = QTimer(self)
        self.update_timer.timeout.connect(self.update_tables_based_on_time)
        self.update_timer.start(10)

        # Inicia a animação
        self.animating = False
        self.paused = False

    def collect_data(self):
        all_times = []
        all_velocities = []

        for table in self.tables:
            if table.rowCount() > 0:
                for row in range(table.rowCount()):
                    tempo_item = table.item(row, 0)
                    velocity_item = table.item(row, 2)
                    if tempo_item and velocity_item:
                        all_times.append(float(tempo_item.text()))
                        all_velocities.append(float(velocity_item.text()))

        return all_times, all_velocities

    def calculate_avg_velocities(self, all_times, all_velocities, unique_times):
        avg_velocities = []
        for t in unique_times:
            # Filtra as velocidades para o tempo atual
            velocities_at_t = [v for t_, v in zip(all_times, all_velocities) if t_ == t]
            avg_velocities.append(np.mean(velocities_at_t) if velocities_at_t else 0)
        return avg_velocities
    def handle_inactivity(self):
            # Lógica a ser executada quando o timer expira
            print("Inatividade detectada.")



    def interpolate_data(self):
        # Desativar o timer
        self.timer.stop()

        all_times = []
        all_velocities = []

        try:
            for table in self.tables:
                if table.rowCount() > 0:
                    first_time_value = int(table.item(0, 0).text()) if table.item(0, 0) else 0
                    for row in range(table.rowCount()):
                        item = table.item(row, 0)
                        if item:
                            current_time_value = int(item.text())
                            new_time_value = current_time_value - first_time_value
                            item.setText(str(new_time_value))

            unique_times = sorted(set(all_times))

            if not unique_times:
                QMessageBox.critical(self, "Erro", "A lista de tempos únicos está vazia. Não é possível interpolar.")
                print("Warning: unique_times is empty. Cannot interpolate.")
                return

            # Calcule a média de velocidades
            avg_velocities = self.calculate_avg_velocities(all_times, all_velocities, unique_times)

            # Interpolação
            f_interp = interp1d(unique_times, avg_velocities, kind='linear', fill_value='extrapolate')
            new_times = np.linspace(min(unique_times), max(unique_times), num=100)  # 100 novos pontos
            new_velocities = f_interp(new_times)

            print("Interpolando dados...")
            print("Novos tempos:", new_times)
            print("Novas velocidades:", new_velocities)

            # Inicia a animação com os dados interpolados
            self.start_animation(new_times, new_velocities)

        except Exception as e:
            QMessageBox.critical(self, "Erro", f"Ocorreu um erro ao acessar os arquivos: {str(e)}")

        finally:
            # Reativar o timer após a interpolação
            self.timer.start()

    

    def play_animation(self):
        if not self.timer_app.is_playing:  # Verifica se o timer não está tocando
            self.timer_app.start_timer()  # Inicia o timer
            self.animating = True
            self.paused = False
            self.start_animation()

    def pause_animation(self):
        self.timer_app.pause_timer()  # Pausa o timer
        if self.animating and not self.paused:
            self.paused = True

    def stop_animation(self):
        self.animating = False
        self.timer_app.stop_timer()  # Para o timer
        if hasattr(self, 'animation_timer'):
            self.animation_timer.stop()  # Para o timer de animação
        self.frame = 0  # Reinicia o quadro
        ax = self.figure.gca()  # Obtém o eixo atual
        ax.cla()  # Limpa o eixo atual



    def start_animation(self, new_times=None, new_velocities=None):
        # Limpa o canvas antes de iniciar a animação
        self.figure.clear()
        ax = self.figure.add_subplot(111)
        line, = ax.plot([], [], lw=2)

        # Definições para os eixos
        ax.set_title("Velocity Mean of Pressed Notes")
        ax.set_xlabel("Time (s)")
        ax.set_ylabel("Velocity Mean")
        
        # Ajusta limites fixos para o eixo Y


        # Coleta dados de todas as tabelas
        if new_times is None or new_velocities is None:
            all_times, all_velocities = self.collect_data()
            unique_times = sorted(set(all_times))
            avg_velocities = self.calculate_avg_velocities(all_times, all_velocities, unique_times)

            # Ajusta os limites dos eixos com os dados coletados
            ax.set_xlim(min(unique_times), max(unique_times))
            ax.set_ylim(0, 127)  # Ajuste os limites conforme necessário
          #  ax.set_ylim(min(avg_velocities), max(avg_velocities))

            # Inicializa os dados da linha
            times_to_use = unique_times
            velocities_to_use = avg_velocities
        else:
            # Usar valores fornecidos
            ax.set_xlim(min(new_times), max(new_times))
            ax.set_ylim(0, 127)  # Ajuste os limites conforme necessário
         #   ax.set_ylim(min(new_velocities), max(new_velocities))
            times_to_use = new_times
            velocities_to_use = new_velocities

        # Inicializa o frame atual e o tempo inicial
        self.current_frame = 0
        self.start_time = self.timer.elapsed_time  # Assume que o timer possui o método elapsed_time

        # Função de atualização que será chamada em intervalos
        def update():
            elapsed_time = self.timer.elapsed_time - self.start_time  # Tempo decorrido desde o início da animação

            # Calcula o índice do frame baseado no tempo decorrido
            if elapsed_time >= 0:
                current_index = np.searchsorted(times_to_use, elapsed_time)  # Encontra o índice mais próximo

                if current_index < len(times_to_use):
                    x = times_to_use[:current_index + 1]
                    y = velocities_to_use[:current_index + 1]
                    line.set_data(x, y)
                    ax.relim()  # Atualiza os limites dos eixos se necessário
                    ax.autoscale_view()  # Ajusta a visualização automaticamente
                    self.canvas.draw()  # Atualiza o canvas

        # Criação de um QTimer para chamar a função de atualização periodicamente
        self.animation_timer = QTimer(self)
        self.animation_timer.timeout.connect(update)
        self.animation_timer.start(500)  # Atualiza a cada 100 ms

        # Desenho inicial do canvas
        self.canvas.draw()  # Desenha o canvas inicialmente


    def toggle_interpolation(self):
        if self.interpolate_button.text() == "Interpolar Dados":
            self.interpolate_data()
            self.interpolate_button.setText("Reverter")
        else:
            # Implementar a lógica para reverter os dados se necessário
            self.interpolate_button.setText("Interpolar Dados")

    def update_tables_based_on_time(self):
        # Implementar a lógica para atualizar as tabelas baseado no tempo
        pass




    def store_original_values(self):
        for table in self.tables:
            original_data = []
            for row in range(table.rowCount()):
                row_data = []
                for col in range(table.columnCount()):
                    item = table.item(row, col)
                    row_data.append(item.text() if item else "")
                original_data.append(row_data)
            self.original_values[table] = original_data

    def revert_data(self):
        for table, original_data in self.original_values.items():
            for row in range(len(original_data)):
                for col in range(len(original_data[row])):
                    item = table.item(row, col)
                    if item:
                        item.setText(original_data[row][col])

    def start_visualization(self):
        self.update_timer.start(1000)

    def center_scrollbar_on_row(self, table, row):
        if table.rowCount() == 0:
            return
        row_height = table.rowHeight(row)
        if row_height == 0:
            return
        table.scrollToBottom()
        scroll_position = table.verticalScrollBar().value()
        visible_rows = table.viewport().height() // row_height
        center_row = max(0, row - visible_rows // 2)
        table.scrollToItem(table.item(center_row, 0))

    def stop_timer(self):
        self.timer.stop_timer()
        self.clear_all_highlights()

    def update_tables_based_on_time(self):
        elapsed_time = self.timer.elapsed_time

        for table in self.tables:
            if table and table.isVisible():
                current_row = self.state[table]['current_row']
                if current_row < table.rowCount():
                    item = table.item(current_row, 0)
                    press_time = int(item.text()) if item else 0

                    if elapsed_time >= press_time:
                        self.state[table]['current_row'] += 1
                        self.highlight_row(table)

        if all(self.state[table]['current_row'] >= table.rowCount() for table in self.tables if table in self.state):
            self.stop_timer()
        else:
            self.inactivity_timer.start(1000)
            self.inactivity_timer.stop()

    def clear_all_highlights(self):
        for table in self.tables:
            self.clear_table_highlight(table)

    def highlight_row(self, table):
        current_row = self.state[table]['current_row'] - 1
        if 0 <= current_row < table.rowCount():
            self.clear_table_highlight(table)
            for col in range(table.columnCount()):
                item = table.item(current_row, col)
                if item:
                    item.setBackground(Qt.yellow)
                    item.setForeground(Qt.black)

            self.center_scrollbar_on_row(table, current_row)

    def clear_table_highlight(self, table):
        for row in range(table.rowCount()):
            for col in range(table.columnCount()):
                item = table.item(row, col)
                if item:
                    if row % 2 == 0:
                        item.setBackground(QColor(240, 240, 240))
                    else:
                        item.setBackground(QColor(255, 255, 255))

    def adjust_window_size(self):
        self.setMinimumSize(600, 650)
        self.resize(600, 650)

    def open_file_dialog(self):
        options = QFileDialog.Options()
        files, _ = QFileDialog.getOpenFileNames(self, "Selecionar Arquivos CSV", "", 
                                                 "CSV Files (*.csv);;All Files (*)", options=options)
        if files:
            self.process_selected_files(files)

    def remove_table_and_layout(self, layout, table, remove_button, file_name_label, info_label):
        if table in self.tables:
            self.tables.remove(table)

        # Hide the widgets instead of deleting
        remove_button.hide()
        file_name_label.hide()
        info_label.hide()
        table.hide()

        # Chama a função para ajustar o layout após a remoção
        self.adjust_layout()

    def reorganize_layout(self):
        layout = self.scroll_widget.layout()  # Obtém o layout do scroll_widget
        if layout is None:
            return

        # Coleta todos os widgets visíveis
        items = [layout.itemAt(i).widget() for i in range(layout.count())]

        # Remove todos os widgets do layout
        for widget in items:
            if widget is not None:
                layout.removeWidget(widget)

        # Reorganiza os widgets no layout
        new_row = 0
        new_col = 0
        for widget in items:
            if widget is not None:  # Verifica se o widget existe
                layout.addWidget(widget, new_row, new_col)
                new_col += 1
                if new_col >= 2:  # Limite de 2 colunas
                    new_col = 0
                    new_row += 1
                    if new_row >= 2:  # Limite de 2 linhas
                        break  # Para de adicionar widgets se atingiu o limite

        # Ajustar a posição e o tamanho do scroll widget
        self.scroll_widget.adjustSize()
        self.scroll_area.setWidget(self.scroll_widget)
        self.scroll_area.repaint()
        self.adjust_window_size()



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

            info_label.setContentsMargins(0, 0, 0, 0)
            info_label.setStyleSheet("margin-top: 0;")

            new_table = QTableWidget()
            new_table.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Expanding)
            new_table.setVerticalScrollBarPolicy(Qt.ScrollBarAsNeeded)
            self.tables.append(new_table)
            self.set_alternating_row_colors(new_table)

            remove_button = QPushButton("x")
            remove_button.setFixedSize(30, 27)

            remove_button.clicked.connect(
                lambda _, tbl=new_table, btn=remove_button, name_label=file_name_label, info_lbl=info_label: 
                self.remove_table_and_layout(grid_layout, tbl, btn, name_label, info_lbl)
            )

            with open(file_name, 'r') as f:
                reader = csv.reader(f, delimiter=' ')
                header = next(reader)

                if header == ["Tempo", "Tecla", "Velocity", "Press_dur"]:
                    new_table.setColumnCount(5)
                    new_table.setHorizontalHeaderLabels(header + ["Resultados"])

                    velocities = []
                    key_counts = set()
                    tempos = []
                    press_dur = []
                    teclas = []

                    for row_data in reader:
                        if len(row_data) == 4:
                            self.populate_table(new_table, row_data)
                            velocities.append(float(row_data[2]))
                            key_counts.add(row_data[1])
                            tempos.append(float(row_data[0]))
                            press_dur.append(float(row_data[3]))
                            teclas.append(int(row_data[1]))

                    # Cálculos de estatísticas
                    estatisticas = calcular_estatisticas(teclas, velocities, press_dur, tempos)

                
               


                    # Adicionando resultados em cada linha da nova coluna
                    resultados = [
                    
                        f"BPM: {int(estatisticas['bpm'])}",
                        f"Densidade das Teclas: {int(estatisticas['densidade_teclas'])}",  
                        f"Variação Percentual: {estatisticas['variacao_percentual']:.2f}%",
                        f"Frequências de Teclas: {', '.join(f'Tecla {t}: {c}' for t, c in estatisticas['frequencia_teclas'].items())}",
                        f"Total de teclas: {estatisticas['max_teclas_apertadas']}",
                        f"Média Velocity:  ({int(estatisticas['media_velocity'])})",    
                        f"Média Velocity por Tecla: {' - '.join(f'{tecla}: {vel:.2f}' for tecla, vel in estatisticas['media_velocity_por_tecla'].items())}",
                        f"Desvio Padrão Velocity: {int(estatisticas['desvio_padrao_velocity'])}",
                        f"Velocity Máxima: {int(estatisticas['velocity_maxima'])}",
                        f"Velocity Mínima: {int(estatisticas['velocity_minima'])}",
                        f"Tempo Total: {int(estatisticas['tempo_total_pressao'])}",
                        f"Mediana: {int(estatisticas['mediana'])}",
                        f"Média do Press_dur: {int(estatisticas['media_press_dur'])}",        
                        f"p-value: {estatisticas['p_value']:.2f}",
   f"BPM dividido por total de teclas: {estatisticas['bpm_por_tecla']:.2f}"

]
                    for row in range(new_table.rowCount()):
                        if row < len(resultados):
                            new_table.setItem(row, 4, QTableWidgetItem(resultados[row]))
                        else:
                            new_table.setItem(row, 4, QTableWidgetItem(""))  # Linhas vazias se não houver mais resultados

                elif header == ["Pergunta", "Resposta"]:
                    new_table.setColumnCount(2)
                    new_table.setHorizontalHeaderLabels(["Resposta", "Resultados DASS"])

                    for row_data in reader:
                        if len(row_data) == 2:
                            new_table.insertRow(new_table.rowCount())
                            new_table.setItem(new_table.rowCount() - 1, 0, QTableWidgetItem(row_data[1]))

                    respostas = []
                    for row in range(new_table.rowCount()):
                        item = new_table.item(row, 0)
                        if item and item.text().isdigit():
                            respostas.append(int(item.text()))
                        else:
                            respostas.append(0)

                    df = pd.DataFrame(respostas, columns=["Resposta"])
                    dass_scores = calcular_dass(df)

                    for row in range(new_table.rowCount()):
                        if row == 0:
                            new_table.setItem(row, 1, QTableWidgetItem(f"Depressão: {dass_scores['depressao']} ({dass_scores['class_depressao']})"))
                        elif row == 1:
                            new_table.setItem(row, 1, QTableWidgetItem(f"Ansiedade: {dass_scores['ansiedade']} ({dass_scores['class_ansiedade']})"))
                        elif row == 2:
                            new_table.setItem(row, 1, QTableWidgetItem(f"Estresse: {dass_scores['estresse']} ({dass_scores['class_estresse']})"))
                        else:
                            new_table.setItem(row, 1, QTableWidgetItem(""))

            self.state[new_table] = {'current_row': 0}
            new_table.setRowCount(new_table.rowCount())
            new_table.resizeRowsToContents()

            row = index // 3
            col = index % 3

            h_layout = QHBoxLayout()
            h_layout.addWidget(remove_button)
            h_layout.addWidget(file_name_label)
            h_layout.setSpacing(20)

            v_layout = QVBoxLayout()
            v_layout.addLayout(h_layout)
            v_layout.addWidget(info_label)
            v_layout.setContentsMargins(0, 0, 0, 0)
            v_layout.setSpacing(0)

            grid_layout.addLayout(v_layout, row * 3, col)
            grid_layout.addWidget(new_table, row * 3 + 2, col)

            self.adjust_layout()

        self.adjust_window_size()



    def adjust_layout(self):
        self.scroll_layout.invalidate()  # Invalidate the layout to ensure it recalculates
        self.scroll_layout.update()
        self.scroll_widget.adjustSize()  # Adjust the size of the scroll widget
        self.scroll_area.setWidget(self.scroll_widget)  # Readjust the scroll widget
        self.adjust_window_size()  # Adjust the main window size



    def populate_table(self, table, row_data):
        row_position = table.rowCount()
        table.insertRow(row_position)
        for col, data in enumerate(row_data):
            table.setItem(row_position, col, QTableWidgetItem(data))

    def set_alternating_row_colors(self, table):
        for row in range(table.rowCount()):
            if row % 2 == 0:
                for col in range(table.columnCount()):
                    item = QTableWidgetItem()
                    item.setBackground(QColor(240, 240, 240))
                    table.setItem(row, col, item)




    def get_current_time(self):
        return self.elapsed_time  # ou outra lógica para calcular o tempo

    def calculate_avg_velocities(self, all_times, all_velocities, unique_times):
        avg_velocities = []
        for t in unique_times:
            # Filtra as velocidades para o tempo atual
            velocities_at_t = [v for t_, v in zip(all_times, all_velocities) if t_ == t]
            avg_velocities.append(np.mean(velocities_at_t) if velocities_at_t else 0)
        return avg_velocities

    def interpolate_data(self):
        all_times = []
        all_velocities = []

        for table in self.tables:
            if table.rowCount() > 0:
                for row in range(table.rowCount()):
                    tempo_item = table.item(row, 0)
                    velocity_item = table.item(row, 2)
                    if tempo_item and velocity_item:
                        all_times.append(float(tempo_item.text()))
                        all_velocities.append(float(velocity_item.text()))

        unique_times = sorted(set(all_times))

        if not unique_times:
            print("Warning: unique_times is empty. Cannot interpolate.")
            return

        # Calcule a média de velocidades
        avg_velocities = self.calculate_avg_velocities(all_times, all_velocities, unique_times)

        # Interpolação
        f_interp = interp1d(unique_times, avg_velocities, kind='linear', fill_value='extrapolate')
        new_times = np.linspace(min(unique_times), max(unique_times), num=100)  # 100 novos pontos
        new_velocities = f_interp(new_times)

        print("Interpolando dados...")
        print("Novos tempos:", new_times)
        print("Novas velocidades:", new_velocities)

        # Inicia a animação com os dados interpolados
        self.start_animation(new_times, new_velocities)

    def store_original_values(self):
        for table in self.tables:
            original_data = []
            for row in range(table.rowCount()):
                row_data = []
                for col in range(table.columnCount()):
                    item = table.item(row, col)
                    row_data.append(item.text() if item else "")
                original_data.append(row_data)
            self.original_values[table] = original_data

    def revert_data(self):
        for table, original_data in self.original_values.items():
            for row in range(len(original_data)):
                for col in range(len(original_data[row])):
                    item = table.item(row, col)
                    if item:
                        item.setText(original_data[row][col])

    def start_visualization(self):
        self.update_timer.start(1000)

    def center_scrollbar_on_row(self, table, row):
        if table.rowCount() == 0:
            return
        row_height = table.rowHeight(row)
        if row_height == 0:
            return
        table.scrollToBottom()
        scroll_position = table.verticalScrollBar().value()
        visible_rows = table.viewport().height() // row_height
        center_row = max(0, row - visible_rows // 2)
        table.scrollToItem(table.item(center_row, 0))

    def stop_timer(self):
        self.timer.stop_timer()
        self.clear_all_highlights()

    def update_tables_based_on_time(self):
        elapsed_time = self.timer.elapsed_time

        for table in self.tables:
            if table and table.isVisible():
                current_row = self.state[table]['current_row']
                if current_row < table.rowCount():
                    item = table.item(current_row, 0)
                    press_time = int(item.text()) if item else 0

                    if elapsed_time >= press_time:
                        self.state[table]['current_row'] += 1
                        self.highlight_row(table)

        if all(self.state[table]['current_row'] >= table.rowCount() for table in self.tables if table in self.state):
            self.stop_timer()
        else:
            self.inactivity_timer.start(1000)
            self.inactivity_timer.stop()

    def clear_all_highlights(self):
        for table in self.tables:
            self.clear_table_highlight(table)

    def highlight_row(self, table):
        current_row = self.state[table]['current_row'] - 1
        if 0 <= current_row < table.rowCount():
            self.clear_table_highlight(table)
            for col in range(table.columnCount()):
                item = table.item(current_row, col)
                if item:
                    item.setBackground(Qt.yellow)
                    item.setForeground(Qt.black)

            self.center_scrollbar_on_row(table, current_row)

    def clear_table_highlight(self, table):
        for row in range(table.rowCount()):
            for col in range(table.columnCount()):
                item = table.item(row, col)
                if item:
                    if row % 2 == 0:
                        item.setBackground(QColor(240, 240, 240))
                    else:
                        item.setBackground(QColor(255, 255, 255))

    def adjust_window_size(self):
        self.setMinimumSize(600, 650)
        self.resize(600, 650)

    def open_file_dialog(self):
        options = QFileDialog.Options()
        files, _ = QFileDialog.getOpenFileNames(self, "Selecionar Arquivos CSV", "", 
                                                 "CSV Files (*.csv);;All Files (*)", options=options)
        if files:
            self.process_selected_files(files)

    def remove_table_and_layout(self, layout, table, remove_button, file_name_label, info_label):
        if table in self.tables:
            self.tables.remove(table)

        # Hide the widgets instead of deleting
        remove_button.hide()
        file_name_label.hide()
        info_label.hide()
        table.hide()

        # Chama a função para ajustar o layout após a remoção
        self.adjust_layout()

    def reorganize_layout(self):
        layout = self.scroll_widget.layout()  # Obtém o layout do scroll_widget
        if layout is None:
            return

        # Coleta todos os widgets visíveis
        items = [layout.itemAt(i).widget() for i in range(layout.count())]

        # Remove todos os widgets do layout
        for widget in items:
            if widget is not None:
                layout.removeWidget(widget)

        # Reorganiza os widgets no layout
        new_row = 0
        new_col = 0
        for widget in items:
            if widget is not None:  # Verifica se o widget existe
                layout.addWidget(widget, new_row, new_col)
                new_col += 1
                if new_col >= 2:  # Limite de 2 colunas
                    new_col = 0
                    new_row += 1
                    if new_row >= 2:  # Limite de 2 linhas
                        break  # Para de adicionar widgets se atingiu o limite

        # Ajustar a posição e o tamanho do scroll widget
        self.scroll_widget.adjustSize()
        self.scroll_area.setWidget(self.scroll_widget)
        self.scroll_area.repaint()
        self.adjust_window_size()

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

            info_label.setContentsMargins(0, 0, 0, 0)
            info_label.setStyleSheet("margin-top: 0;")

            new_table = QTableWidget()
            new_table.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Expanding)
            new_table.setVerticalScrollBarPolicy(Qt.ScrollBarAsNeeded)
            self.tables.append(new_table)
            self.set_alternating_row_colors(new_table)

            remove_button = QPushButton("x")
            remove_button.setFixedSize(30, 27)

            remove_button.clicked.connect(
                lambda _, tbl=new_table, btn=remove_button, name_label=file_name_label, info_lbl=info_label: 
                self.remove_table_and_layout(grid_layout, tbl, btn, name_label, info_lbl)
            )

            with open(file_name, 'r') as f:
                reader = csv.reader(f, delimiter=' ')
                header = next(reader)

                if header == ["Tempo", "Tecla", "Velocity", "Press_dur"]:
                    new_table.setColumnCount(5)
                    new_table.setHorizontalHeaderLabels(header + ["Resultados"])

                    velocities = []
                    key_counts = set()
                    tempos = []
                    press_dur = []
                    teclas = []

                    for row_data in reader:
                        if len(row_data) == 4:
                            self.populate_table(new_table, row_data)
                            velocities.append(float(row_data[2]))
                            key_counts.add(row_data[1])
                            tempos.append(float(row_data[0]))
                            press_dur.append(float(row_data[3]))
                            teclas.append(int(row_data[1]))

                    # Cálculos de estatísticas
                    estatisticas = calcular_estatisticas(teclas, velocities, press_dur, tempos)

                
               


                    # Adicionando resultados em cada linha da nova coluna
                    resultados = [
                    
                        f"BPM: {int(estatisticas['bpm'])}",
                        f"Densidade das Teclas: {int(estatisticas['densidade_teclas'])}",  
                        f"Variação Percentual: {estatisticas['variacao_percentual']:.2f}%",
                        f"Frequências de Teclas: {', '.join(f'Tecla {t}: {c}' for t, c in estatisticas['frequencia_teclas'].items())}",
                        f"Total de teclas: {estatisticas['max_teclas_apertadas']}",
                        f"Média Velocity:  ({int(estatisticas['media_velocity'])})",    
                        f"Média Velocity por Tecla: {' - '.join(f'{tecla}: {vel:.2f}' for tecla, vel in estatisticas['media_velocity_por_tecla'].items())}",
                        f"Desvio Padrão Velocity: {int(estatisticas['desvio_padrao_velocity'])}",
                        f"Velocity Máxima: {int(estatisticas['velocity_maxima'])}",
                        f"Velocity Mínima: {int(estatisticas['velocity_minima'])}",
                        f"Tempo Total: {int(estatisticas['tempo_total_pressao'])}",
                        f"Mediana: {int(estatisticas['mediana'])}",
                        f"Média do Press_dur: {int(estatisticas['media_press_dur'])}",        
                        f"p-value: {estatisticas['p_value']:.2f}",
   f"BPM dividido por total de teclas: {estatisticas['bpm_por_tecla']:.2f}"

]
                    for row in range(new_table.rowCount()):
                        if row < len(resultados):
                            new_table.setItem(row, 4, QTableWidgetItem(resultados[row]))
                        else:
                            new_table.setItem(row, 4, QTableWidgetItem(""))  # Linhas vazias se não houver mais resultados

                elif header == ["Pergunta", "Resposta"]:
                    new_table.setColumnCount(2)
                    new_table.setHorizontalHeaderLabels(["Resposta", "Resultados DASS"])

                    for row_data in reader:
                        if len(row_data) == 2:
                            new_table.insertRow(new_table.rowCount())
                            new_table.setItem(new_table.rowCount() - 1, 0, QTableWidgetItem(row_data[1]))

                    respostas = []
                    for row in range(new_table.rowCount()):
                        item = new_table.item(row, 0)
                        if item and item.text().isdigit():
                            respostas.append(int(item.text()))
                        else:
                            respostas.append(0)

                    df = pd.DataFrame(respostas, columns=["Resposta"])
                    dass_scores = calcular_dass(df)

                    for row in range(new_table.rowCount()):
                        if row == 0:
                            new_table.setItem(row, 1, QTableWidgetItem(f"Depressão: {dass_scores['depressao']} ({dass_scores['class_depressao']})"))
                        elif row == 1:
                            new_table.setItem(row, 1, QTableWidgetItem(f"Ansiedade: {dass_scores['ansiedade']} ({dass_scores['class_ansiedade']})"))
                        elif row == 2:
                            new_table.setItem(row, 1, QTableWidgetItem(f"Estresse: {dass_scores['estresse']} ({dass_scores['class_estresse']})"))
                        else:
                            new_table.setItem(row, 1, QTableWidgetItem(""))

            self.state[new_table] = {'current_row': 0}
            new_table.setRowCount(new_table.rowCount())
            new_table.resizeRowsToContents()

            row = index // 3
            col = index % 3

            h_layout = QHBoxLayout()
            h_layout.addWidget(remove_button)
            h_layout.addWidget(file_name_label)
            h_layout.setSpacing(20)

            v_layout = QVBoxLayout()
            v_layout.addLayout(h_layout)
            v_layout.addWidget(info_label)
            v_layout.setContentsMargins(0, 0, 0, 0)
            v_layout.setSpacing(0)

            grid_layout.addLayout(v_layout, row * 3, col)
            grid_layout.addWidget(new_table, row * 3 + 2, col)

            self.adjust_layout()

        self.adjust_window_size()

    def adjust_layout(self):
        self.scroll_layout.invalidate()  # Invalidate the layout to ensure it recalculates
        self.scroll_layout.update()
        self.scroll_widget.adjustSize()  # Adjust the size of the scroll widget
        self.scroll_area.setWidget(self.scroll_widget)  # Readjust the scroll widget
        self.adjust_window_size()  # Adjust the main window size

    def populate_table(self, table, row_data):
        row_position = table.rowCount()
        table.insertRow(row_position)
        for col, data in enumerate(row_data):
            table.setItem(row_position, col, QTableWidgetItem(data))

    def set_alternating_row_colors(self, table):
        for row in range(table.rowCount()):
            if row % 2 == 0:
                for col in range(table.columnCount()):
                    item = QTableWidgetItem()
                    item.setBackground(QColor(240, 240, 240))
                    table.setItem(row, col, item)


if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = CsvCreatorApp()
    window.show()
    sys.exit(app.exec_())
