from PyQt5.QtWidgets import QLabel, QApplication, QVBoxLayout, QWidget, QPushButton, QHBoxLayout, QFrame
from PyQt5.QtCore import QTimer, QSize
import sys

class TimerApp(QWidget):
    def __init__(self):
        super().__init__()
        self.elapsed_time = 0  # Tempo acumulado em milissegundos
        self.timer_interval = 10  # Intervalo do timer em milissegundos
        self.is_playing = False  # Estado do timer
        self.csv_creator_app = None  # Referência ao CsvCreatorApp

        self.setStyleSheet("background-color: rgba(35, 192, 192, 0);")

        # Inicializa o rótulo do tempo
        self.time_label = QLabel("0")
        self.time_label.setFixedWidth(50)

        self.timer = QTimer(self)
        self.timer.timeout.connect(self.update_elapsed_time)

        # Layout dos botões
        button_layout = QHBoxLayout()

        # Botão para play/pause
        self.play_pause_button = QPushButton("▶")
        self.play_pause_button.clicked.connect(self.toggle_timer)
        self.play_pause_button.setFixedSize(QSize(50, 30))
        button_layout.addWidget(self.play_pause_button)

        self.stop_button = QPushButton("■")
        self.stop_button.clicked.connect(self.stop_timer)
        self.stop_button.setFixedSize(QSize(50, 30))
        button_layout.addWidget(self.stop_button)

        button_layout.addSpacing(5)
        button_layout.addWidget(self.time_label)
        button_layout.setContentsMargins(0, 0, 0, 0)
        button_layout.setSpacing(0)

        # Cria um contêiner para os botões
        button_frame = QFrame()
        button_frame.setLayout(button_layout)

        # Layout principal
        main_layout = QVBoxLayout()
        main_layout.addWidget(button_frame)
        main_layout.setContentsMargins(0, 0, 0, 0)

        self.setLayout(main_layout)
        self.setFixedSize(250, 40)

        # Timer de animação (opcional)
        self.animation_timer = QTimer(self)
        self.animation_timer.timeout.connect(self.animate)  # Conecta a animação
        self.animation_timer.setInterval(1000)  # Ajusta o intervalo de animação

    def toggle_timer(self):
        """Alterna entre iniciar e pausar o timer."""
        if not self.is_playing:
            self.start_timer()
        else:
            self.pause_timer()

    def start_timer(self):
        """Inicia o timer e, opcionalmente, o timer de animação."""
        if not self.is_playing:
            self.timer.start(self.timer_interval)
            self.animation_timer.start()  # Inicia o timer de animação
            self.is_playing = True
            self.play_pause_button.setText("||")  # Muda para pause

    def pause_timer(self):
        """Pausa o timer."""
        if self.is_playing:
            self.timer.stop()
            self.animation_timer.stop()  # Para o timer de animação
            self.is_playing = False
            self.play_pause_button.setText("▶")  # Muda para play

    def stop_timer(self):
        """Para o timer e redefine o estado."""
        self.timer.stop()
        self.animation_timer.stop()  # Para o timer de animação
        self.is_playing = False

        # Limpa o destaque nas tabelas se a referência existir
        if self.csv_creator_app:  
            for table in self.csv_creator_app.tables:
                self.csv_creator_app.clear_table_highlight(table)
                if table in self.csv_creator_app.state:
                    self.csv_creator_app.state[table]['current_row'] = 0  # Redefine a linha atual

        self.elapsed_time = 0
        self.update_time_label()
        self.play_pause_button.setText("▶")

    def update_elapsed_time(self):
        """Atualiza o tempo acumulado e o rótulo do tempo."""
        self.elapsed_time += self.timer_interval
        self.update_time_label()
        if self.csv_creator_app:  
            self.csv_creator_app.update_tables_based_on_time()

    def update_time_label(self):
        """Atualiza o rótulo do tempo com o tempo acumulado formatado."""
        self.time_label.setText(f"{self.elapsed_time }")  # Convertendo para segundos

    def set_csv_creator_app(self, app):
        """Define a referência ao CsvCreatorApp."""
        self.csv_creator_app = app

    def get_current_time(self):
        """Retorna o tempo atual do timer em milissegundos."""
        return self.elapsed_time

    def animate(self):
        """Função de animação, chamada pelo timer de animação."""
        # Adicione a lógica da animação aqui


if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = TimerApp()
    window.show()
    sys.exit(app.exec_())
