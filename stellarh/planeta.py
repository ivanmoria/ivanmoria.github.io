import pandas as pd

# Carregar os arquivos CSV
roles_df = pd.read_csv('/Users/ivanmoriaborges/Documents/GitHub/ivanmoria.github.io/stellarh/roles.csv')
countries_df = pd.read_csv('/Users/ivanmoriaborges/Documents/GitHub/ivanmoria.github.io/stellarh/countries.csv')

# Função para obter latitude e longitude com base no país
def get_lat_lon(country):
    # Verificar se o nome do país está presente no arquivo countries.csv
    match = countries_df[countries_df['Country'].str.contains(country, case=False, na=False)]
    if not match.empty:
        return match.iloc[0]['Latitude'], match.iloc[0]['Longitude']
    else:
        return None, None

# Adicionar as colunas de latitude e longitude ao dataframe roles_df
roles_df[['latitude', 'longitude']] = roles_df['localizacao'].apply(lambda loc: pd.Series(get_lat_lon(loc.split()[0])))

# Salvar o dataframe atualizado em um novo arquivo CSV
roles_df.to_csv('updated_roles.csv', index=False)

print("Arquivo atualizado com sucesso!")
