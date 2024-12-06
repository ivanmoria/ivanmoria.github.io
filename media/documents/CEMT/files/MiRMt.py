import os
import sys
import subprocess
import colorsys
import librosa
import base64
import io
import numpy as np
import pandas as pd
import seaborn as sns
from timer import TimerApp
from functools import partial
import matplotlib.pyplot as plt
import matplotlib.gridspec as gridspec
from csvcreatorr import CsvCreatorApp  # Importa a classe do módulo
from scipy import stats
from scipy.io import wavfile
from IPython.display import Audio
from scipy.stats import linregress
from collections import defaultdict
from matplotlib.patches import Rectangle
from matplotlib.ticker import MaxNLocator



from matplotlib.animation import FuncAnimation  
from PyQt5.QtCore import Qt
from PyQt5.QtWidgets import (QApplication, QMainWindow, QLabel, QPushButton,
                             QColorDialog, QSpacerItem,  QMessageBox, QVBoxLayout,
                             QHBoxLayout, QWidget, QCheckBox, QSizePolicy, QLineEdit,
                             QComboBox, QFileDialog, QScrollArea, QTabWidget,QLayout,
                             QGridLayout, QInputDialog, QGroupBox)

class PlotarGrafico(QMainWindow):
    
    def abrir_pasta(self, event):
        diretorio = self.lineedit_dir.text()
        if sys.platform == "win32":
            os.startfile(diretorio)
        elif sys.platform == "darwin":
            subprocess.call(["open", diretorio])
        else:
            subprocess.call(["xdg-open", diretorio])
   
    def __init__(self):
        super().__init__()
        
        self.setWindowTitle("Extração e Processamento de Informações Musicais em Musicoterapia")

        self.default_directory = "takes_vestigios/Piloto/Henrico"
        self.default_GRID_directory = "takes_vestigios/audio/"
        self.default_WAV_directory = "takes_vestigios/audio/"

        screen_size = QApplication.primaryScreen().size()
        screen_width = screen_size.width()
        screen_height = screen_size.height()

        self.setGeometry(100, 100, 640,900)
        self.main_layout = QVBoxLayout()
    
        self.checkboxes_arquivos = {} 
        self.takes_checkboxes = {}
        self.figsize_options = {  "Tamanho Único de Coluna (80 mm)": (3.15, 2.36), "Tamanho Duplo de Coluna (170 mm)": (6.69, 5.51),
        "Tamanho de Página Inteira (210 mm)": (8.27, 5.83),
        "Customizado (254mm)": (10, 8)  }

        self.main_layout.setContentsMargins(5,5,5,5)  # Remove margins around the main layout


        dir_layout = QHBoxLayout()
        group_box = QGroupBox("Selecionar Diretório")
        group_layout = QHBoxLayout()
        group_box.setLayout(group_layout)
        dir_layout.addWidget(group_box)
        self.lineedit_dir = QLineEdit(self.default_directory)
        self.lineedit_dir.setReadOnly(True)
        self.lineedit_dir.setMinimumSize(60, 0)
        
        self.lineedit_dir.setStyleSheet("text-align: left;")
        

        self.lineedit_dir.setFrame(False)
        self.lineedit_dir.setCursor(Qt.DragLinkCursor)
        self.lineedit_dir.mousePressEvent = self.abrir_pasta  
        self.btn_select_dir = QPushButton("Abrir")



        # Botão para selecionar diretório (renomeado para select_GRID_button)
        self.select_GRID_button = QPushButton("GRID")
        self.select_GRID_button.clicked.connect(self.select_GRID_directory)
        self.select_GRID_button.setCursor(Qt.OpenHandCursor)
        self.select_GRID_button.setMinimumSize(60, 0)

        # ComboBox para listar arquivos CSV
        self.csv_combo_box = QComboBox()
        self.csv_combo_box.currentIndexChanged.connect(self.load_csv_values)
        self.csv_combo_box.setCursor(Qt.ClosedHandCursor)
 
        self.csv_directory = self.default_GRID_directory
        self.update_combo_box()

        # Botão para selecionar diretório WAV
        self.select_WAV_button = QPushButton("WAV")
        self.select_WAV_button.clicked.connect(self.select_WAV_directory)
        self.select_WAV_button.setCursor(Qt.OpenHandCursor)

        # ComboBox para listar arquivos WAV
        self.WAV_combo_box = QComboBox()
        self.WAV_combo_box.currentIndexChanged.connect(self.load_WAV_values)
        self.WAV_combo_box.setCursor(Qt.ClosedHandCursor)
 
        self.WAV_combo_box.setMinimumSize(60, 0)


        self.WAV_directory = self.default_WAV_directory
        self.update_WAV_combo_box()


        self.WAV_checkbox = QCheckBox("Plotar WAV")
        self.WAV_checkbox.setChecked(False)


     
        self.btn_select_dir.clicked.connect(self.selecionar_pasta)
        self.btn_select_dir.setCursor(Qt.WhatsThisCursor)
        group_layout.addWidget(self.btn_select_dir)
        group_layout.addWidget(self.lineedit_dir)
        group_layout.addWidget(self.select_GRID_button)
        group_layout.addWidget(self.csv_combo_box)
        group_layout.addWidget(self.select_WAV_button)
        group_layout.addWidget(self.WAV_combo_box)



        group_box.setMinimumWidth(450)  
        btn_box = QGroupBox("Configurações de Paleta")
        btn_layout = QVBoxLayout()
        btn_box.setMinimumWidth(150)  
        btn_box.setMaximumWidth(250)       
  
        
        
        self.btn_change_palette = QPushButton("Paleta: pastel")
        self.btn_change_palette.clicked.connect(self.change_palette)
        self.btn_reset_colors = QPushButton("Restaurar")
        self.btn_reset_colors.clicked.connect(self.reset_colors)
        self.btn_change_palette.setCursor(Qt.OpenHandCursor)
        self.btn_reset_colors.setCursor(Qt.ClosedHandCursor)
        btn_layout.addWidget(self.btn_change_palette)
        btn_layout.addWidget(self.btn_reset_colors)
        btn_box.setLayout(btn_layout)
        btn_layout.setSpacing(2) 
        btn_layout.setContentsMargins(5,5,5,5)  

        self.btn_change_palette.setStyleSheet(""" QPushButton { border: 2px solid #8f8f91; border-radius: 10px; background-color: transparent;color: black; padding: 5px;}QPushButton:hover {   background-color: #3c8dbc;} QPushButton:pressed { background-color: #1c5c9c;}""")
        self.btn_reset_colors.setStyleSheet("""  QPushButton {    border: 2px solid #8f8f91;     border-radius: 10px;        background-color: transparent;        color: black;           padding: 1px;         }    QPushButton:hover {        background-color: #2E8B57;   }   QPushButton:pressed {         background-color: #32CD32;      } """)


        
        file_layout = QVBoxLayout()
        file_layout.setSizeConstraint(QLayout.SetFixedSize) 
        scroll_widget_file = QWidget()
        scroll_layout_file = QVBoxLayout(scroll_widget_file)
        scroll_area_file = QScrollArea()
        self.grid_layout = QGridLayout()
        scroll_layout_file.addLayout(self.grid_layout)
        scroll_widget_file.setLayout(scroll_layout_file)
        scroll_area_file.setWidget(scroll_widget_file)
        scroll_area_file.setWidget(scroll_widget_file)
        scroll_area_file.setWidgetResizable(True)
        scroll_area_file.setMaximumSize(1500, 1300)
        scroll_area_file.setMinimumSize(150, 130)
        file_layout.addWidget(scroll_area_file)
    
    
        take_layout = QHBoxLayout()
        take_layout.setSizeConstraint(QLayout.SetFixedSize) 
        scroll_widget_take = QWidget()
        scroll_layout_take = QHBoxLayout(scroll_widget_take)
        self.take_layout = QHBoxLayout()
        scroll_layout_take.addLayout(self.take_layout)
        scroll_widget_take.setLayout( scroll_layout_take)
        take_layout.addWidget(scroll_widget_take)
        scroll_widget_take.setMaximumSize(1500, 100)
        scroll_widget_take.setMinimumSize(150, 130)

     
     
        plt_layout = QHBoxLayout()
        plot_box = QGroupBox("Opções de Plotagem")
        plot_layout = QVBoxLayout()
        plot2_layout = QVBoxLayout()
        plot3_layout = QHBoxLayout()
        plot4_layout = QHBoxLayout()
        plot_box.setLayout(plot3_layout)
        plt_layout.addWidget(btn_box)
        plt_layout.addWidget(plot_box)
        plot_box.setCursor(Qt.WhatsThisCursor)
        self.regression_checkbox = QCheckBox("Plotar regressão linear")
        self.regression_checkbox.setChecked(False)
        self.media_checkbox = QCheckBox("Plotar Média")
        self.media_checkbox.setChecked(False)
        plot_box.setMinimumWidth(400)    
        plot_box.setMaximumWidth(400)       


        self.desvio_checkbox = QCheckBox("Desvio Padrão")
        self.desvio_checkbox.setChecked(False)


        self.IOI = QCheckBox("Plotar IoI")
        self.IOI.setChecked(True)

        self.velocity_checkbox = QCheckBox("Plotar Velocity")
        self.velocity_checkbox.setChecked(True)

        self.teclas_checkbox = QCheckBox("Plotar Teclas")
        self.teclas_checkbox.setChecked(True)

        self.legendas_checkbox = QCheckBox("Plotar Legendas")
        self.legendas_checkbox.setChecked(False)

        self.grid_checkbox = QCheckBox("Plotar GRID")
        self.grid_checkbox.setChecked(False)

        self.press_density_checkbox = QCheckBox("Plotar Densidade")
        self.press_density_checkbox.setChecked(True)

        self.open_csv_creator_button = QPushButton("Abrir CSV Creator")
        self.open_csv_creator_button.clicked.connect(self.open_csv_creator)
        self.open_csv_creator_button.setStyleSheet(""" QPushButton { border: 2px solid #8f8f91; border-radius: 10px; background-color: transparent;color: black; padding: 5px;}QPushButton:hover {   background-color: #3c8dbc;} QPushButton:pressed { background-color: #1c5c9c;}""")
        self.open_csv_creator_button.setCursor(Qt.OpenHandCursor)
        btn_layout.addWidget(self.open_csv_creator_button)



        plot_layout.addWidget(self.regression_checkbox)
        plot_layout.addWidget(self.media_checkbox)
        plot_layout.addWidget(self.desvio_checkbox)
        plot_layout.addWidget(self.velocity_checkbox)
        plot2_layout.addWidget(self.teclas_checkbox)
        plot2_layout.addWidget(self.legendas_checkbox)
        plot2_layout.addWidget(self.IOI)
        plot2_layout.addWidget(self.press_density_checkbox)
        
        
  





        plot3_layout.addLayout(plot_layout)
        plot3_layout.addLayout(plot2_layout)
        plot_layout.addLayout(plot4_layout)


       
   
        fig_box = QGroupBox("Opções da Figura")
        img_layout = QVBoxLayout()
        fig_layout = QHBoxLayout()
        fig_box.setLayout(img_layout)
        
        fig_box.setMaximumWidth(300) 
        
 
        

        fig_box.setCursor(Qt.WhatsThisCursor)
        size_dpi_layout = QHBoxLayout()
        size_label = QLabel("Dimensão:")
        self.figsize_combobox = QComboBox()
        self.figsize_combobox.setFixedWidth(206) 
        
        self.figsize_combobox.addItems([   "Tamanho Único de Coluna (80 mm)",    "Tamanho Duplo de Coluna (170 mm)",    "Tamanho de Página Inteira (210 mm)",    "Customizado (254mm)"])
        self.figsize_combobox.setCurrentText("Customizado (254mm)")
        self.figsize_combobox.setMaximumWidth(200) 
        self.figsize_combobox.currentIndexChanged.connect(self.handle_combobox_change)
        dpi_label = QLabel("DPI:")
        self.dpi_combobox = QComboBox()
                
        dpi_label.setFixedWidth(23) 
        
        self.dpi_combobox.setFixedWidth(70) 
        
        self.dpi_combobox.addItems(["100", "150", "200", "300", "600"])
        resolution_label = QLabel("Resolução:")
        self.resolution_combobox = QComboBox()
                        
        resolution_label.setFixedWidth(80) 
        
        self.resolution_combobox.setFixedWidth(90) 
        
        self.resolution_combobox.addItems(["480p", "720p", "1080p", "4K"])
        self.resolution_combobox.setCurrentText("1080p")
        size_dpi_layout.addWidget(size_label)
        size_dpi_layout.addWidget(self.figsize_combobox)
        size_dpi_layout.addWidget(QLabel(" "))  




        self.single_figure_checkbox = QCheckBox("Plotar junto")
        self.single_figure_checkbox.setChecked(True)


        fig_layout.addWidget(dpi_label)
        fig_layout.addWidget(self.dpi_combobox)
        fig_layout.addWidget(resolution_label)
        fig_layout.addWidget(self.resolution_combobox)

        plots_checks_layout = QHBoxLayout()
        
        plots_checks_layout.addWidget(self.single_figure_checkbox)
        plots_checks_layout.addWidget(self.grid_checkbox)
        plots_checks_layout.addWidget(self.WAV_checkbox)

        
  
        img_layout.addLayout(size_dpi_layout)
        img_layout.addLayout(fig_layout)
        img_layout.addLayout(plots_checks_layout)
        
        
        
       
        
        
        
        plt_layout.addWidget(fig_box)

      
        button_layout = QHBoxLayout()
        self.btn_plotar = QPushButton("Plotar Gráfico")
        button_layout.addWidget(self.btn_plotar)
        font = self.btn_plotar.font()
        font.setPointSize(16)
        font.setFamily("Arial")
        font.setBold(True)
        self.btn_plotar.setFont(font)
        self.btn_plotar.setStyleSheet("""        QPushButton {       border: 2px solid #8f8f91;         border-radius: 10px;       background-color: transparent;           color: black;         padding: 5px;    }     QPushButton:hover {         background-color: #3c8dbc;       }   QPushButton:pressed {      background-color: #1c5c9c;     } """)
        largura = 250
        altura = 50
        self.btn_plotar.setFixedSize(largura, altura)
        self.main_layout.addLayout(dir_layout)
        
        self.main_layout.addLayout(plt_layout)
        self.main_layout.addLayout(take_layout)
        self.main_layout.addLayout(file_layout)
    #    self.main_layout.addLayout(button_layout)
        img_layout.addLayout(button_layout)
        
 
        central_widget = QWidget()
        central_widget.setLayout(self.main_layout)
        
        self.setCentralWidget(central_widget)
        self.default_colors = sns.color_palette("pastel", 12).as_hex()
        self.carregar_nomes_arquivos()
        self.btn_plotar.clicked.connect(self.plotar_grafico)
        self.ajustar_geometria_janela()
        self.cores_selecionadas = {} 
        self.reset_colors()
  
    def open_csv_creator(self):
                """Método para abrir a aplicação CsvCreatorApp com arquivos selecionados."""
                diretorio = self.lineedit_dir.text()  # Obtém o diretório
                print("Diretório selecionado:", diretorio)  # Log para depuração
                selected_items = []

                # Coleta arquivos selecionados
                try:
                    for nome, checkbox in self.checkboxes_arquivos.items():
                        if checkbox.isChecked():
                        
                            arquivos_takes = [
                                int(arquivo.split("_")[-1].split(".")[0]) for arquivo in os.listdir(diretorio)
                                if arquivo.startswith(f"{nome}_take_") and arquivo.endswith(".csv")
                            ]
                        
                            for take in arquivos_takes:
                                selected_items.append(os.path.join(diretorio, f"{nome}_take_{take}.csv"))
                except Exception as e:
                    QMessageBox.critical(self, "Erro", f"Ocorreu um erro ao acessar os arquivos: {str(e)}")
                    return

                # Verifica se algum arquivo foi selecionado
                if not selected_items:
                    message_box = QMessageBox()
                    message_box.setWindowTitle("Erro")
                    message_box.setText("Por favor, selecione pelo menos um nome de arquivo.")
                    message_box.setIcon(QMessageBox.Warning)

                    open_button = message_box.addButton("Escolher outra pasta", QMessageBox.ActionRole)
                    ok_button = message_box.addButton("Voltar", QMessageBox.AcceptRole)
                    message_box.setDefaultButton(ok_button)
                    message_box.exec()

                    if message_box.clickedButton() == open_button:
                        self.selecionar_pasta()  # Abre um seletor de pasta

                    return

                # Se houver arquivos selecionados, abre a aplicação CsvCreatorApp
                if not hasattr(self, 'csv_creator_window') or not self.csv_creator_window.isVisible():
                    self.csv_creator_window = CsvCreatorApp()  # Cria a janela
                    self.csv_creator_window.process_selected_files(selected_items)  # Carrega os arquivos na tabela
                    self.csv_creator_window.show()  # Exibe a janela
                else:
                    self.csv_creator_window.process_selected_files(selected_items)  # Atualiza a tabela se a janela já estiver aberta
                    
                  
                  
    def handle_combobox_change(self, index):
        MM_TO_INCHES = 0.0393701  # Fator de conversão de milímetros para polegadas
        MAX_SIZE_MM = 65536 * 0.0393701  # Convertendo o limite máximo de pixels para milímetros (cerca de 2499.78 mm)
        INITIAL_SIZE_MM = 254

        if self.figsize_combobox.itemText(index).startswith("Customizado"):
            while True:
                text, ok = QInputDialog.getText(self, 'Tamanho Personalizado',                   '<center>Digite o tamanho da figura em mm</center>'   '<i>Fator de conversão de milímetros para polegadas: </i><font color="red">0.0393701</font>')
                if ok:
                    try:
                        if text.strip():  # Se o campo de texto não estiver vazio
                            size_mm = int(text)
                            if size_mm <= 0:
                                raise ValueError("O valor deve ser maior que zero.")
                            if size_mm > MAX_SIZE_MM:
                                raise ValueError(f"O valor não pode exceder {int(MAX_SIZE_MM)} mm.")
                            size_inches = size_mm * MM_TO_INCHES
                            self.figsize_options["Customizado"] = (size_inches, size_inches)
                            custom_size_text = f"Customizado ({size_mm} mm)"
                            self.figsize_combobox.setItemText(index, custom_size_text)
                        else:
                            # Se o campo de texto estiver vazio, restaura para o valor inicial
                            size_inches = INITIAL_SIZE_MM * MM_TO_INCHES
                            self.figsize_options["Customizado"] = (size_inches, size_inches)
                            custom_size_text = f"Customizado ({INITIAL_SIZE_MM} mm)"
                            self.figsize_combobox.setItemText(index, custom_size_text)
                        break  # Sai do loop se um valor válido for inserido
                    except ValueError as e:
                        message_box = QMessageBox()
                        message_box.setWindowTitle("Erro")
                        message_box.setText(f"'{text}' não é um número.")
                        message_box.setInformativeText("Tente outra vez!")
                        message_box.setIcon(QMessageBox.Question)
                        message_box.exec_()
                else:
                    # Se o usuário clicar em Cancelar, sai do loop sem fazer alterações
                    break    
              
    def select_GRID_directory(self):
        # Abre um diálogo para selecionar um novo diretório
        directory = QFileDialog.getExistingDirectory(self, "")
        if directory:
            self.csv_directory = directory
            self.update_combo_box()

    def update_combo_box(self):
        # Limpa e atualiza o ComboBox com arquivos CSV do diretório selecionado
        self.csv_combo_box.clear()
        if self.csv_directory and os.path.isdir(self.csv_directory):
            csv_files = [f for f in os.listdir(self.csv_directory) if f.endswith(".csv")]
            self.csv_combo_box.addItems(csv_files)
            if not csv_files:
                self.show_message("Nenhum arquivo CSV encontrado.", "Aviso")
        else:
            self.show_message("Nenhum diretório válido selecionado.", "Erro")

    def load_csv_values(self):
        # Carrega o CSV selecionado e processa a coluna 'GRID'
        selected_file = self.csv_combo_box.currentText()
        if selected_file:
            file_path = os.path.join(self.csv_directory, selected_file)
            if os.path.isfile(file_path):
                try:
                    # Lê o arquivo CSV e obtém os valores da coluna 'GRID'
                    df = pd.read_csv(file_path)
                    if 'GRID' in df.columns:
                        # Converte a coluna 'GRID' para uma lista e multiplica por 1000
                        grid_values = df['GRID'].tolist()
                        self.grid_ms = [value * 1000 for value in grid_values]
                
                    else:
                        self.grid_ms = []  # Se a coluna não for encontrada, esvazia a lista
                        self.show_message("Coluna 'GRID' não encontrada no arquivo.", "Aviso")
                except Exception as e:
                    self.show_message(f"Erro ao ler o arquivo CSV: {str(e)}", "Erro")
            else:
                self.show_message("Arquivo selecionado não encontrado.", "Erro")
  
    def show_message(self, message, title):
        msg_box = QMessageBox()
        msg_box.setText(message)
        msg_box.setWindowTitle(title)
        if title == "Erro":
            msg_box.setIcon(QMessageBox.Critical)
        else:
            msg_box.setIcon(QMessageBox.Warning)
        msg_box.exec_()

    def select_WAV_directory(self):
        # Abre um diálogo para selecionar um novo diretório
        directory = QFileDialog.getExistingDirectory(self, "")
        if directory:
            self.WAV_directory = directory
            self.update_WAV_combo_box()

    def update_WAV_combo_box(self):
        # Limpa e atualiza o ComboBox com arquivos CSV do diretório selecionado
        self.WAV_combo_box.clear()
        if self.WAV_directory and os.path.isdir(self.WAV_directory):
            WAV_files = [f for f in os.listdir(self.WAV_directory) if f.endswith(".wav")]
            self.WAV_combo_box.addItems(WAV_files)
            if not WAV_files:
                self.show_message("Nenhum arquivo WAV encontrado.", "Aviso")
        else:
            self.show_message("Nenhum diretório válido selecionado.", "Erro")

    def load_WAV_values(self):
            # Carrega o WAV selecionado e processa a coluna 'GRID'
            selected_file = self.WAV_combo_box.currentText()
            if selected_file:
                self.file_WAV_path = os.path.join(self.WAV_directory, selected_file)
                if os.path.isfile(self.file_WAV_path):
               
                        # Lê o arquivo CSV e obtém os valores da coluna 'GRID'
                        sample_rate, audio_signal = wavfile.read(self.file_WAV_path)

                        # Normalizar o sinal de áudio para estar entre -1 e 1
                        audio_signal = audio_signal / np.max(np.abs(audio_signal))

                        # Ajustar o tempo do áudio para o mesmo intervalo de tempo dos dados
                        audio_time = np.linspace(0, len(audio_signal) / sample_rate, len(audio_signal)) * 1000  # Converter para ms
      
    def ajustar_geometria_janela(self):
        desktop = QApplication.desktop()
        screen_rect = desktop.screenGeometry()
        min_height = screen_rect.height() 
            
    def selecionar_pasta(self):
        pasta = QFileDialog.getExistingDirectory(self, "Selecione o Diretório", self.lineedit_dir.text())
        if pasta:
                self.lineedit_dir.setText(pasta)
                self.carregar_nomes_arquivos()
                self.atualizar_interface()
        
    def selecionar_cor(self, checkbox):
            cor_inicial = QColorDialog.getColor()
            if cor_inicial.isValid():
                for nome_arquivo, checkbox_arquivo in self.checkboxes_arquivos.items():
                    if checkbox_arquivo == checkbox:
                        checkbox_style = f"""QCheckBox::indicator {{ width: 20px; height: 20px; border-radius: 10px; border: 2px solid #2d2d2d; background-color: {cor_inicial.name()}; }} QCheckBox::indicator:checked {{ background-color: {cor_inicial.name()}; }} QCheckBox::indicator:unchecked {{ background-color: transparent; }}"""
                        checkbox_arquivo.setStyleSheet(checkbox_style)
                        self.cores_selecionadas[nome_arquivo] = cor_inicial.name()
                        break

    def carregar_takes(self, nome_arquivo):
        diretorio = self.lineedit_dir.text()
        arquivos = os.listdir(diretorio)
        takes = sorted(set([int(arquivo.split("_")[-1].split(".")[0]) for arquivo in arquivos if arquivo.startswith(nome_arquivo + "_take_") and arquivo.endswith(".csv")]))
        return takes
        
    def carregar_nomes_arquivos(self):
        diretorio = self.lineedit_dir.text()
        arquivos = os.listdir(diretorio)
        nomes_arquivos = sorted(list(set([arquivo.split("_")[0] for arquivo in arquivos if arquivo.endswith(".csv")])))

        self.list_cor_arquivo = {}
        self.checkboxes_arquivos = {}
        self.takes_checkboxes = {}
        self.take_group_checkboxes = []

        # Preenche o dicionário de takes_por_arquivo e calcula o número máximo de takes por arquivo
        takes_por_arquivo = {}
        max_takes_por_arquivo = {}

        for nome_arquivo in nomes_arquivos:
            takes_por_arquivo[nome_arquivo] = self.carregar_takes(nome_arquivo)
            max_takes_por_arquivo[nome_arquivo] = max(takes_por_arquivo[nome_arquivo], default=0)

        # Calcula o máximo número de takes entre todos os arquivos
        max_takes = max(max_takes_por_arquivo.values(), default=0)
    
        checkbox_style = """QCheckBox::indicator { width: 20px; height: 20px; border-radius: 10px; } QCheckBox::indicator:unchecked { background-color:; border: 2px solid #2d2d2d; } QCheckBox::indicator:checked { border: 2px solid #2d2d2d; }"""

        # Remove todos os widgets atuais do layout
        for i in reversed(range(self.grid_layout.count())): 
            widget_to_remove = self.grid_layout.itemAt(i).widget()
            self.grid_layout.removeWidget(widget_to_remove)
            widget_to_remove.setParent(None)

        for i in reversed(range(self.take_layout.count())): 
                widget_to_remove = self.take_layout.itemAt(i).widget()
                self.take_layout.removeWidget(widget_to_remove)
                widget_to_remove.setParent(None)

        # Cria a primeira linha com os cabeçalhos
        nome_box = QGroupBox("Selecionar Arquivos")
        nomes_layout = QVBoxLayout()
        nome_box.setLayout(nomes_layout)
        self.label_nome_arquivo = QLabel("<i><font family='Arial' size='1'>nome_take_0</font></i>")
        self.label_nome_arquivo.setAlignment(Qt.AlignRight)

        self.checkbox_select_all = QCheckBox("Marcar todos")
        self.checkbox_select_all.stateChanged.connect(self.selecionar_todos_nomes)

        nomes_layout.addWidget(self.checkbox_select_all)
        nomes_layout.addWidget(self.label_nome_arquivo)
        self.checkbox_select_all.setCursor(Qt.WhatsThisCursor)
        nome_box.setFixedWidth(100)
        self.checkbox_select_all.setFixedWidth(100)
        nomes_layout.setSpacing(2)
        nomes_layout.setContentsMargins(0, 6, 0, 0)
        nome_box.setFixedHeight(67)

        checkbox_box = QGroupBox()
        checkbox_layout = QHBoxLayout()
        checkbox_box.setLayout(checkbox_layout)
        checkbox_box.setFixedHeight(45)
        nome_box.setFixedWidth(160)  # Defina a largura mínima desejada
        nome_box.setSizePolicy(QSizePolicy.Fixed, QSizePolicy.Preferred)  # Ajuste a política de tamanho
        nome_box.setAlignment(Qt.AlignCenter)  # Alinha o texto no centro

        for take in range(1, max_takes + 1):
            take_group_checkbox = QCheckBox(f" {take}")
            take_group_checkbox.clicked.connect(lambda state, t=take: self.selecionar_todos_takes_nomes(t, state))
            checkbox_layout.addWidget(take_group_checkbox)
            self.take_group_checkboxes.append(take_group_checkbox)

        checkbox_box.setCursor(Qt.DragMoveCursor)
        take_group_layout = QHBoxLayout()
        checkbox_layout.setSpacing(30)
        
        take_group_layout.addWidget(nome_box)
        take_group_layout.addWidget(checkbox_box)

        take_group_layout.setContentsMargins(0, 0, 0, 0)
        takess_scroll_widget = QWidget()
        takess_scroll_widget.setLayout(take_group_layout)
        takess_scroll_area = QScrollArea()
        takess_scroll_area.setWidgetResizable(True)
        takess_scroll_area.setWidget(takess_scroll_widget)
        takess_scroll_area.setMinimumSize(200, 64)
        takess_scroll_widget.setCursor(Qt.DragMoveCursor)
    
        self.take_layout.addWidget(nome_box, 0 )
        self.take_layout.addWidget(takess_scroll_area, 2)


        for idx, nome_arquivo in enumerate(nomes_arquivos):
            checkbox_arquivo = QCheckBox()
            nomes_label = QLabel(nome_arquivo)
            checkbox_arquivo.clicked.connect(lambda state, nome=nome_arquivo: self.selecionar_todos_takes(nome, state))

            cor_padrao = self.default_colors[idx % len(self.default_colors)]
            checkbox_arquivo.setStyleSheet(checkbox_style + f"QCheckBox::indicator:checked {{ background-color: {cor_padrao}; }}")

            checkbox_arquivo.setCursor(Qt.WhatsThisCursor)
            nomes_label.setCursor(Qt.ForbiddenCursor)
            nomes_label.setMinimumWidth(130)  # Defina a largura mínima desejada
 
            nomes_label.setSizePolicy(QSizePolicy.Fixed, QSizePolicy.Preferred)  # Ajuste a política de tamanho
            nomes_label.setAlignment(Qt.AlignCenter)  # Alinha o texto no centro
            
            self.checkboxes_arquivos[nome_arquivo] = checkbox_arquivo

            nomes_label.mousePressEvent = lambda event, cb=checkbox_arquivo: self.selecionar_cor(cb)

            takes_layout = QHBoxLayout()
            takes_layout.setContentsMargins(0, 0, 0, 0)
            takes_layout.setSpacing(10)
   
            takes_scroll_widget = QWidget()
            takes_scroll_widget.setLayout(takes_layout)

            takes_scroll_area = QScrollArea()
            takes_scroll_area.setWidgetResizable(True)
            takes_scroll_area.setMinimumWidth(13)
            takes_scroll_area.setWidget(takes_scroll_widget)

            takes_scroll_area.setMinimumSize(750, 50)
            takes_scroll_widget.setCursor(Qt.DragMoveCursor)

            
            self.grid_layout.addWidget(nomes_label, idx, 1, 1, 1)  # (widget, row, column, rowSpan, columnSpan)
            self.grid_layout.addWidget(checkbox_arquivo,idx, 0 )
            self.grid_layout.addWidget(takes_scroll_area,  idx, 2)


            for take in range(1, max_takes + 1):
                take_checkbox = QCheckBox(f"Take {take}")
                if take in takes_por_arquivo[nome_arquivo]:
                    take_checkbox.setChecked(False)
                else:
                    take_checkbox.setChecked(False)
                    take_checkbox.setEnabled(False)
                takes_layout.addWidget(take_checkbox)
                self.takes_checkboxes[(nome_arquivo, take)] = take_checkbox

        for (nome_arquivo, take), checkbox in self.takes_checkboxes.items():
            checkbox.clicked.connect(lambda state, nome=nome_arquivo: self.selecionar_nome_arquivo(nome, state)) 

    def selecionar_nome_arquivo(self, nome_arquivo, state):
        if state:
            self.checkboxes_arquivos[nome_arquivo].setChecked(True)
        at_least_one_take_checked = any(checkbox.isChecked() for (n, t), checkbox in self.takes_checkboxes.items() if n == nome_arquivo)
        self.checkboxes_arquivos[nome_arquivo].setChecked(at_least_one_take_checked)
   
    def selecionar_todos_takes(self,  nome_arquivo, state):
        for (nome, t), checkbox in self.takes_checkboxes.items():
            if nome == nome_arquivo and checkbox.isEnabled():  # Verifica se o checkbox está ativado
                checkbox.setChecked(state)
             
    def selecionar_todos_takes_nomes(self, take, state):
        for (nome_arquivo, t), checkbox in self.takes_checkboxes.items():
            if t == take and checkbox.isEnabled():
                checkbox.setChecked(state)
                
        # Verificar se pelo menos um "take" está marcado para cada arquivo e atualizar o checkbox do arquivo
        for nome_arquivo in self.checkboxes_arquivos:
            at_least_one_take_checked = any(checkbox.isChecked() for (n, t), checkbox in self.takes_checkboxes.items() if n == nome_arquivo)
            self.checkboxes_arquivos[nome_arquivo].setChecked(at_least_one_take_checked)

    def selecionar_todos_nomes(self, state):
        # Marca todos os checkboxes de arquivos
        for checkbox_arquivo in self.checkboxes_arquivos.values():
            checkbox_arquivo.setChecked(state == Qt.Checked)

        # Marca todos os checkboxes de "takes" fora do grupo
        for (n, t), take_checkbox in self.takes_checkboxes.items(): 
            if take_checkbox.isEnabled():
                take_checkbox.setChecked(state == Qt.Checked)

        # Marca todos os checkboxes dentro do grupo take_group_layout
        for take_group_checkbox in self.take_group_checkboxes:
            take_group_checkbox.setChecked(state == Qt.Checked)

    def reset_colors(self):
        for nome_arquivo, btn_cor in self.list_cor_arquivo.items():
            cor_padrao = self.default_colors[list(self.list_cor_arquivo.keys()).index(nome_arquivo) % len(self.default_colors)]
            btn_cor.setStyleSheet(f"background-color: {cor_padrao}; border-radius: 10px")
            
        for nome_arquivo, checkbox_arquivo in self.checkboxes_arquivos.items():
            cor_padrao = self.default_colors[list(self.checkboxes_arquivos.keys()).index(nome_arquivo) % len(self.default_colors)]
                      
            checkbox_style = """QCheckBox::indicator { width: 20px; height: 20px; border-radius: 10px; } QCheckBox::indicator:unchecked { background-color:; border: 2px solid #2d2d2d; } QCheckBox::indicator:checked { border: 2px solid #2d2d2d; }"""
            checkbox_arquivo.setStyleSheet(checkbox_style + f"QCheckBox::indicator:checked {{ background-color: {cor_padrao}; }}")
            self.cores_selecionadas[nome_arquivo] = cor_padrao
        
        self.btn_change_palette.setText("Paleta: pastel")     # Atualizar o texto do botão de alterar paleta para refletir a paleta padrão
        self.btn_change_palette.setStyleSheet(f"""QPushButton {{ border: 2px solid #8f8f91;border-radius: 10px; background-color: transparent;  color: black;  padding: 5px; }}QPushButton:hover {{  background-color: {self.default_colors[1]}; }}QPushButton:pressed {{ background-color: {self.default_colors[2]}; }}""")
        self.btn_reset_colors.setStyleSheet(f"""QPushButton {{border: 2px solid #8f8f91; border-radius: 10px;background-color: transparent;color: black;padding: 5px;}}QPushButton:hover {{background-color: {self.default_colors[3]};}}QPushButton:pressed {{background-color: {self.default_colors[4]};}}""")
        self.btn_plotar.setStyleSheet(f"""QPushButton {{border: 2px solid #8f8f91;border-radius: 10px; background-color: transparent;color: black; padding: 5px; }}QPushButton:hover {{background-color: {self.default_colors[5]}; }}QPushButton:pressed {{ background-color: {self.default_colors[8]};}}""")
        self.btn_select_dir.setStyleSheet(f"""QPushButton {{ border: 2px solid #8f8f91; border-radius: 10px; background-color: transparent; color: black; padding: 5px;}}QPushButton:hover {{background-color: {self.default_colors[10]};}}QPushButton:pressed {{background-color: {self.default_colors[9]};}}""")
        self.select_GRID_button.setStyleSheet(f"""QPushButton {{ border: 2px solid #8f8f91; border-radius: 10px; background-color: transparent; color: black; padding: 5px;}}QPushButton:hover {{background-color: {self.default_colors[6]};}}QPushButton:pressed {{background-color: {self.default_colors[10]};}}""")
        self.select_WAV_button.setStyleSheet(f"""QPushButton {{ border: 2px solid #8f8f91; border-radius: 10px; background-color: transparent; color: black; padding: 5px;}}QPushButton:hover {{background-color: {self.default_colors[4]};}}QPushButton:pressed {{background-color: {self.default_colors[5]};}}""")

    def change_palette(self):
        # Abrir um diálogo de seleção de paleta
        paleta, aceito = QInputDialog.getItem(self, "Selecionar Paleta", "Escolha a paleta:", ["deep", "muted", "bright", "pastel", "dark", "colorblind", "viridis", "plasma", "inferno", "magma", "cividis", "RdYlBu", "PiYG", "PRGn", "RdYlGn", "BrBG", "RdGy", "PuOr", "Set2", "Set3", "tab10", "tab20", "tab20b", "tab20c"], 0, False)
        if aceito: 
            cores_palette = sns.color_palette(paleta, 12).as_hex()             # Definir a paleta selecionada

            # Atualizar as cores dos botões na interface
            for nome_arquivo, btn_cor in self.list_cor_arquivo.items():
                cor_palette = cores_palette[list(self.list_cor_arquivo.keys()).index(nome_arquivo) % len(cores_palette)]
                btn_cor.setStyleSheet(f"background-color: {cor_palette}; border-radius: 10px")
                
              # Atualizar as cores das caixas de seleção na interface
            for nome_arquivo, checkbox_arquivo in self.checkboxes_arquivos.items():
                cor_palette = cores_palette[list(self.checkboxes_arquivos.keys()).index(nome_arquivo) % len(cores_palette)]
                checkbox_style = """QCheckBox::indicator { width: 20px; height: 20px; border-radius: 10px; } QCheckBox::indicator:unchecked { background-color:; border: 2px solid #2d2d2d; } QCheckBox::indicator:checked { border: 2px solid #2d2d2d; }"""
                checkbox_arquivo.setStyleSheet(checkbox_style + f"QCheckBox::indicator:checked {{ background-color: {cor_palette}; }}")
                self.cores_selecionadas[nome_arquivo] = cor_palette

            # Atualizar o texto do botão para refletir a paleta selecionada
            self.btn_change_palette.setText(f"Paleta: {paleta}")
            self.btn_change_palette.setStyleSheet(f""" QPushButton {{border: 2px solid #8f8f91;border-radius: 10px;background-color: transparent;color: black;padding: 5px;}} QPushButton:hover {{ background-color: {cores_palette[1]}; }}QPushButton:pressed {{background-color: {cores_palette[2]}; }}""")
            self.btn_reset_colors.setStyleSheet(f"""QPushButton {{ border: 2px solid #8f8f91; border-radius: 10px; background-color: transparent; color: black;padding: 5px;}} QPushButton:hover {{ background-color: {cores_palette[3]};}} QPushButton:pressed {{ background-color: {cores_palette[4]};}}""")
            self.btn_plotar.setStyleSheet(f"""QPushButton {{ border: 2px solid #8f8f91;border-radius: 10px;background-color: transparent;color: black;padding: 5px;}}QPushButton:hover {{ background-color: {cores_palette[5]}; }}QPushButton:pressed {{background-color: {cores_palette[8]}; }}""")
            self.btn_select_dir.setStyleSheet(f"""QPushButton {{border: 2px solid #8f8f91; border-radius: 10px;background-color: transparent; color: black; padding: 5px; }}QPushButton:hover {{ background-color: {self.default_colors[10]}; }} QPushButton:pressed {{ background-color: {self.default_colors[9]};}}""")

    def atualizar_interface(self):
        self.plotar_grafico()
        
    def adjust_color(self, base_color, factor):
            """ Adjusts the color by modifying its lightness. """
            r, g, b = base_color
            h, l, s = colorsys.rgb_to_hls(r, g, b)
            l = max(0, min(1, l * factor))
            return colorsys.hls_to_rgb(h, l, s)


    def plotar_grafico(self):
       
        
        selected_items = [nome for nome, checkbox in self.checkboxes_arquivos.items() if checkbox.isChecked()]
        if not selected_items:
            message_box = QMessageBox()
            message_box.setWindowTitle("Erro")
            message_box.setText("Por favor, selecione pelo menos um nome de arquivo. <i> Quem sabe não muda a pasta?</i>")
            message_box.setIcon(QMessageBox.Warning)
            open_button = message_box.addButton("Escolher outra pasta", QMessageBox.ActionRole)
            ok_button = message_box.addButton("Voltar", QMessageBox.AcceptRole)
            message_box.setDefaultButton(ok_button)
            message_box.exec()
            if message_box.clickedButton() == open_button:
                self.selecionar_pasta()
            return

        # Definindo o tamanho da figura baseado no combobox
        figsize_options = { 
            "Tamanho Único de Coluna (80 mm)": (3.15, 2.36), 
            "Tamanho Duplo de Coluna (170 mm)": (6.69, 5.51), 
            "Tamanho de Página Inteira (210 mm)": (8.27, 5.83)
        }
        selected_size = self.figsize_combobox.currentText()
        figsize = figsize_options.get(selected_size, (10, 8)) 

        # Definindo DPI
        dpi_items = {"100": 100, "150": 150, "200": 200, "300": 300, "600": 600}
        selected_dpi_text = self.dpi_combobox.currentText()
        dpi = dpi_items.get(selected_dpi_text, 100)

        # Coletando opções do usuário para plotagens específicas
        plotar_mesma_figura = self.single_figure_checkbox.isChecked()
        grid_selected = self.grid_checkbox.isChecked()
        plotar_regressao_linear = self.regression_checkbox.isChecked()
        plotar_media = self.media_checkbox.isChecked()
        plotar_desvio = self.desvio_checkbox.isChecked()
        plotar_press_density = self.press_density_checkbox.isChecked()
        plotar_velocity = self.velocity_checkbox.isChecked()
        plotar_teclas = self.teclas_checkbox.isChecked()
        plotar_WAV = self.WAV_checkbox.isChecked()
        plotar_IOI = self.IOI.isChecked()

        fig1, fig2, fig3, fig0, fig4 = None, None, None, None , None 

        if plotar_mesma_figura:
            fig = plt.figure(figsize=figsize, dpi=dpi)
            gs = gridspec.GridSpec(3, 5, height_ratios=[0.7, 1, 1.3])

            ax1 = fig.add_subplot(gs[2, :])  # Ocupa duas colunas
            ax2 = fig.add_subplot(gs[0, 0])
            axio = fig.add_subplot(gs[0, 4])
            ax3 = fig.add_subplot(gs[1, :])
            ax0 = fig.add_subplot(gs[0, 1:4])
            axkey = ax0.twinx()  
            axhey = ax1.twinx()

            fig0, fig1, fig2, fig3, fig4 = fig, fig, fig, fig, fig
        else:
            fig1, ax1 = plt.subplots(figsize=figsize, dpi=dpi)
            fig0, axkey = plt.subplots(figsize=figsize, dpi=dpi)
            axhey = ax1.twinx()
            fig2, ax2 = plt.subplots(figsize=figsize, dpi=dpi)
            fig3, ax3 = plt.subplots(figsize=figsize, dpi=dpi)
            fig4, axio = plt.subplots(figsize=figsize, dpi=dpi)

        if grid_selected and self.grid_ms:
            for gv in self.grid_ms:
                ax1.axvline(x=gv, color='gray', linestyle='-', linewidth=1, alpha=0.3, zorder=0)
                axkey.axvline(x=gv, color='gray', linestyle='-', linewidth=1, alpha=0.3, zorder=0)

        for idx, nome_inicial_arquivo in enumerate(selected_items):
            base_color = self.cores_selecionadas.get(nome_inicial_arquivo, plt.get_cmap('tab10')(idx % 10)[:3])
            base_color_rgb = tuple(int(base_color.lstrip('#')[i:i+2], 16) / 255.0 for i in (0, 2, 4)) if isinstance(base_color, str) else base_color

            diretorio = self.lineedit_dir.text()
            arquivos = os.listdir(diretorio)
            arquivos_takes = [
                int(arquivo.split("_")[-1].split(".")[0]) for arquivo in arquivos
                if arquivo.startswith(nome_inicial_arquivo + "_take_") and
                arquivo.endswith(".csv") and
                self.takes_checkboxes[(nome_inicial_arquivo, int(arquivo.split("_")[-1].split(".")[0]))].isChecked()
            ]

            boxplot_data = []
            boxplot_labels = []
            colors = []
            position_counter = 0

            for take_idx, num_take in enumerate(arquivos_takes):
                file_path = os.path.join(diretorio, f"{nome_inicial_arquivo}_take_{num_take}.csv")
                if os.path.isfile(file_path):
                    try:
                        tte_dados = pd.read_csv(file_path, sep=" ")
                    except pd.errors.EmptyDataError:
                        QMessageBox.critical(self, "Erro", f"O arquivo {file_path} está vazio.")
                        return

                    if "Tempo" not in tte_dados.columns or "Velocity" not in tte_dados.columns:
                        QMessageBox.critical(self, "Erro", f"O arquivo {file_path} não possui os dados necessários.")
                        return

                    # Processar dados
                    t = tte_dados["Tempo"].values
                    t_diff = np.diff(t)
                    boxplot_data.append(t_diff)
                    boxplot_labels.append(f"{nome_inicial_arquivo}_take_{num_take}")
                    position_counter += 1
                    velocity = tte_dados["Velocity"].values
                    tecla = tte_dados["Tecla"].values
                    color_name = self.adjust_color(base_color_rgb, 1 - 0.2 * take_idx)
                    colors.append(color_name)
                    press_dur = tte_dados["Press_dur"].values
                    press_density = press_dur[1:] / t_diff

                    all_line_styles = ["-", (0, (1, 1, 1)), "-.", (0, (1, 10, 1)), (0, (3, 1, 1, 1)), (0, (5, 5))]
                    linestyle = all_line_styles[take_idx % len(all_line_styles)]

                    if plotar_velocity:
                        axhey.set_ylim(-360, 147)
                        axhey.set_yticks([0,40,80,120])
                        axhey.plot(t, velocity, color=color_name, alpha=0.8, linestyle='-')
                        ax1.bar(t, velocity, width=100, alpha=0.5, color=color_name, lw=5, linestyle='-', zorder=1)
                        ax1.set_ylim(0, 127)
                        ax1.set_yticks([0,20,40,60, 80,100, 120])
                        ax1.set_xlabel("Time (ms)")
                        ax1.set_ylabel("Velocity")
                        ax1.set_title("Time vs Velocity")

                    if plotar_WAV:
                        sample_rate, audio_signal = wavfile.read(self.file_WAV_path)
                        audio_signal = audio_signal / np.max(np.abs(audio_signal))
                        audio_time = np.linspace(0, len(audio_signal) / sample_rate, len(audio_signal)) * 1000
                        audio_offset = 0
                        audio_scaling_factor = 50
                        ax1.plot(audio_time, audio_signal * audio_scaling_factor + audio_offset, color='yellow', alpha=0.042, zorder=0)

                    if plotar_IOI:
                        bp = ax2.boxplot(boxplot_data, patch_artist=True)
                        for patch, color in zip(bp['boxes'], colors):
                            patch.set_facecolor(color)
                        ax2.set_ylabel("IoI (ms)")
                        ax2.set_title("Inter-Onset-Interval")
                        plt.tight_layout()

                    if plotar_press_density:
                        ax3.plot(t[1:], press_density, color=color_name)
                        ax3.set_ylabel("Density")
                        ax3.set_title("Temporal Density of Pressed Notes")
                        ax3.yaxis.set_label_position('right')
                        ax3.yaxis.tick_right()

                    if plotar_media:
                        velocity_media = velocity.mean()
                        ax1.axhline(y=velocity_media, color='b', linestyle=':', alpha=0.2, label=f'Média: {velocity_media:.2f}', zorder=4)
                        ax1.text(x=ax1.get_xlim()[1] * 1, y=velocity_media, s=f'{velocity_media:.2f}', alpha=0.4, color='black', va='top', ha='right', fontsize=10, zorder=7)
                        axhey.axhline(y=velocity_media, color='b', linestyle=':', alpha=0.2, label=f'Média: {velocity_media:.2f}', zorder=4)
                        axhey.text(x=ax1.get_xlim()[1] * 1, y=velocity_media, s=f'{velocity_media:.2f}', alpha=0.4, color='black', va='top', ha='right', fontsize=10, zorder=7)
                        
                        
                        press_density_media = press_density.mean()
                        ax3.axhline(y=press_density_media, color='b', linestyle=':', alpha=0.2, label=f'Média: {press_density_media:.2f}', zorder=4)
                        ax3.text(x=ax3.get_xlim()[1] * 1, y=press_density_media, s=f'{press_density_media:.2f}', alpha=0.4, color='black', va='top', ha='right', fontsize=10, zorder=5)

                    if plotar_teclas:
                        # Plotting the bar chart for keys
                       #axkey.bar(t, tecla, width=3, linewidth=0.7, linestyle=linestyle, color=color_name)
                        axkey.set_ylim(-1, 10)  # Set the y-limit consistently
               
                        axkey.set_title("Keys")
                        axkey.yaxis.set_label_position('right')
                        axkey.yaxis.tick_right()
                        axkey.yaxis.set_major_locator(MaxNLocator(integer=True))
                        axkey.set_yticks(range(1, 9))  # Exibir apenas 1 a 8
                        ax0.set_yticks([])  # Remove os ticks do eixo y
       

                        # Plot horizontal lines to represent key durations with colors
                        for position, width, key in zip(t, press_dur, tecla):
                            color = color_name  
                            start = position
                            end = position + width
                            axkey.hlines(y=key, xmin=start, xmax=end, color=color, linestyle="-", lw=5, alpha=0.8)

    
        
                    if plotar_IOI:
                        axio.set_yticks([])  # Remove os ticks do eixo y
                        axio.set_xticks([])  # Remove os ticks do eixo y
                        

                    if plotar_regressao_linear:
                        poly_coefs = np.polyfit(t, velocity, deg=1)
                        poly_line = np.poly1d(poly_coefs)
                        axhey.plot(t, poly_line(t), color='gray', linestyle='-.', lw=1.8, alpha=0.7)
                        print(f"Regressão linear de Velocity: {poly_line}")

        #if plotar_mesma_figura:
     #       fig0.legend(selected_items, loc="upper right")
      #  else:
       #     for fig in [fig0, fig1, fig2, fig3]:
        #        fig.tight_layout()

        plt.show()


                    
if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = PlotarGrafico()
    window.show()

    sys.exit(app.exec_())
