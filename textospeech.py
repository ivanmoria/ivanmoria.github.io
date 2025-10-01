import tkinter as tk
from gtts import gTTS
import playsound
import tempfile

# Função para gerar e tocar o áudio com a voz escolhida
def gerar_audio():
    # Obtém o gênero da voz a partir da seleção do usuário
    genero = var_genero.get()
    
    # Obtém o idioma selecionado
    idioma = var_idioma.get()
    
    # Obtém o texto inserido na caixa de texto
    texto = entry_texto.get()

    # Se o texto estiver vazio, usará um texto padrão
    if not texto:
        texto = "Hoje é um dia maravilhoso para construir algo que as pessoas amem!"
    
    # Se o gênero for feminino, usamos o idioma padrão. Para masculino, escolheremos vozes em inglês, por exemplo.
    if genero == 'Feminino':
        voz = "pt"  # Voz feminina padrão em português
    elif genero == 'Masculino':
        voz = "en"  # Para o masculino, vamos escolher um idioma em inglês, por exemplo
    
    # Cria o objeto de fala (gTTS) com o idioma escolhido
    tts = gTTS(text=texto, lang=voz)

    # Cria um arquivo temporário para armazenar o áudio gerado
    with tempfile.NamedTemporaryFile(delete=True) as temp_audio_file:
        tts.save(temp_audio_file.name)  # Salva o áudio no arquivo temporário
        
        # Reproduza o áudio com playsound
        playsound.playsound(temp_audio_file.name)

# Criação da interface gráfica
root = tk.Tk()
root.title("Escolher Voz e Inserir Texto")

# Criação de um título na interface
titulo = tk.Label(root, text="Escolha a voz, idioma e digite o texto:", font=("Arial", 14))
titulo.pack(pady=10)

# Variável para armazenar a seleção do gênero
var_genero = tk.StringVar(value="Feminino")

# Criação de botões de opção (RadioButtons) para escolher entre as vozes
radio_feminino = tk.Radiobutton(root, text="Feminino", variable=var_genero, value="Feminino", font=("Arial", 12))
radio_feminino.pack()

radio_masculino = tk.Radiobutton(root, text="Masculino", variable=var_genero, value="Masculino", font=("Arial", 12))
radio_masculino.pack()

# Criação de uma lista suspensa (Combobox) para escolher o idioma
var_idioma = tk.StringVar(value="pt")  # Idioma padrão é português
idioma_label = tk.Label(root, text="Escolha o idioma:", font=("Arial", 12))
idioma_label.pack()

idioma_menu = tk.OptionMenu(root, var_idioma, "pt", "en", "es", "fr", "de")
idioma_menu.pack(pady=10)

# Caixa de texto para o usuário digitar o texto que será lido
entry_texto = tk.Entry(root, font=("Arial", 12), width=40)
entry_texto.pack(pady=10)

# Botão para gerar o áudio com a voz escolhida e o texto inserido
btn_gerar = tk.Button(root, text="Gerar e Ouvir", command=gerar_audio, font=("Arial", 12), bg="lightblue")
btn_gerar.pack(pady=20)

# Rodar a interface gráfica
root.mainloop()
