from flask import Flask, jsonify
import sys
import os



# Adicione o caminho completo da pasta onde está o mirmt.py
sys.path.append(os.path.abspath("/Users/ivanmoriaborges/Documents/GitHub/MIR-MT/MiRMt.py"))

from MiRMt import MinhaInterface  # Agora você pode importar sua interface


app = Flask(__name__)

# Instancia sua classe PyQt5, mas ela não será exibida diretamente
minha_interface = MinhaInterface()

@app.route('/api/dados')
def obter_dados():
    # Aqui você processa algo com o PyQt5, mas não mostra a interface diretamente
    resultado = minha_interface.obter_resultados()  # Exemplo de método da sua aplicação
    return jsonify(resultado)

if __name__ == '__main__':
    app.run(debug=True)
