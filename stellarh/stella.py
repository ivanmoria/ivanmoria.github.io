import geopandas as gpd


# Caminho para o arquivo shapefile baixado
shapefile_path = '/Users/ivanmoriaborges/Documents/GitHub/ivanmoria.github.io/stellarh/countries/ne_110m_admin_0_countries.shp'  # Substitua pelo caminho correto

# Carrega o conjunto de dados de países a partir do shapefile local
world = gpd.read_file(shapefile_path)

# Cria uma lista com o nome do país e seu centroide
countries_centroids = []

for country in world.iterrows():
    # Substitua 'name' por 'SOVEREIGNT' para acessar o nome do país
    country_name = country[1]['SOVEREIGNT']
    centroid = country[1]['geometry'].centroid
    countries_centroids.append([country_name, centroid.x, centroid.y])

