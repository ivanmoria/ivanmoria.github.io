import pandas as pd
import os

file_path = '//Users/ivanmoriaborges/Documents/DASSmelchior_take_2.csv'

if os.path.exists(file_path):
    df = pd.read_csv(file_path, sep=' ')  # Ajuste aqui se necessário
else:
    print(f"O arquivo não foi encontrado: {file_path}")
    exit()


def calcular_dass(df):
    df['Resposta'] = df['Resposta'].astype(int)

    depressao_indices = [2, 4, 9, 12, 15, 16, 20]  
    ansiedade_indices = [1, 3, 6, 8, 14, 18, 19]  
    estresse_indices = [0, 5, 7, 10, 11, 13, 17] 
    
    max_index = len(df) - 1
    depressao_indices = [i for i in depressao_indices if i <= max_index]
    ansiedade_indices = [i for i in ansiedade_indices if i <= max_index]
    estresse_indices = [i for i in estresse_indices if i <= max_index]

    depressao = df['Resposta'].iloc[depressao_indices].sum() * 2
    ansiedade = df['Resposta'].iloc[ansiedade_indices].sum() * 2
    estresse = df['Resposta'].iloc[estresse_indices].sum() * 2

    resultado = {
        'depressao': depressao,
        'class_depressao': classificar_depressao(depressao),
        'ansiedade': ansiedade,
        'class_ansiedade': classificar_ansiedade(ansiedade),
        'estresse': estresse,
        'class_estresse': classificar_estresse(estresse)
    }

    return resultado

def classificar_depressao(pontuacao):
    if pontuacao < 10:
        return 'N'
    elif 10 <= pontuacao <= 13:
        return 'L'
    elif 14 <= pontuacao <= 20:
        return 'M'
    elif 21 <= pontuacao <= 27:
        return 'S'
    else:
        return 'ES'

def classificar_ansiedade(pontuacao):
    if pontuacao < 8:
        return 'N'
    elif 8 <= pontuacao <= 9:
        return 'L'
    elif 10 <= pontuacao <= 14:
        return 'M'
    elif 15 <= pontuacao <= 19:
        return 'S'
    else:
        return 'ES'

def classificar_estresse(pontuacao):
    if pontuacao < 15:
        return 'N'
    elif 15 <= pontuacao <= 18:
        return 'L'
    elif 19 <= pontuacao <= 25:
        return 'M'
    elif 26 <= pontuacao <= 33:
        return 'S'
    else:
        return 'ES'

# Chamar a função para calcular DASS
resultados = calcular_dass(df)

# Exibir os resultados
print(f'Teste DASS-21')
print(f'Legenda: Normal, Leve, Moderado, Severo, Extremamente Severo')
print(f'Depressão: {resultados["depressao"]} -  {resultados["class_depressao"]}; Ansiedade: {resultados["ansiedade"]} -  {resultados["class_ansiedade"]};Estresse: {resultados["estresse"]} - {resultados["class_estresse"]}; ')
