from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
import json
import time

# Configurar o Selenium com Chrome
chrome_options = Options()
chrome_options.add_argument("--headless")  # Executar em modo headless (sem abrir o navegador)
chrome_options.add_argument("--disable-gpu")
chrome_options.add_argument("--no-sandbox")

service = Service("caminho_para_seu_chromedriver")  # Defina o caminho do chromedriver
driver = webdriver.Chrome(service=service, options=chrome_options)

# URL do Linktree da Stellarh Global
url = "https://linktr.ee/stellarhglobal"

# Acessar a página
driver.get(url)

# Aguardar alguns segundos para garantir que o JavaScript carregue os elementos
time.sleep(5)

# Capturar todos os links visíveis na página
links = driver.find_elements(By.TAG_NAME, "a")

vagas = []
for link in links:
    vaga_nome = link.text.strip()
    vaga_url = link.get_attribute("href")

    # Filtrar links relevantes
    if vaga_url and ("linkedin.com" in vaga_url or "jobs" in vaga_url.lower()):
        # Acessar o link da vaga para extrair mais informações
        driver.get(vaga_url)
        time.sleep(5)  # Aguardar o carregamento da página

        try:
            # Tentar pegar informações de nome da vaga, localização e salário
            vaga_nome = driver.find_element(By.CLASS_NAME, "vaga-nome-class").text.strip()
            vaga_localizacao = driver.find_element(By.CLASS_NAME, "vaga-localizacao-class").text.strip()
            vaga_salario = driver.find_element(By.CLASS_NAME, "vaga-salario-class").text.strip()
        except Exception as e:
            vaga_localizacao = "Não disponível"
            vaga_salario = "Não informado"
        
        vagas.append({
            "nome": vaga_nome,
            "localizacao": vaga_localizacao,
            "salario": vaga_salario,
            "link": vaga_url,
   

        "latitude": 0,
        "longitude": 0
             })
# Fechar o navegador
driver.quit()

# Salvar os dados em um arquivo JSON
with open("vagas.json", "w", encoding="utf-8") as f:
    json.dump(vagas, f, indent=4, ensure_ascii=False)

print(f"Vagas extraídas com sucesso! Total: {len(vagas)}")
