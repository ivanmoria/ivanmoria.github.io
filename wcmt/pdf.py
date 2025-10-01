import fitz  # PyMuPDF
import pandas as pd
import re

def extrair_info(titulo_raw):
    # Número e Título
    principal_match = re.match(r"^([\d\.]+)?\s*([^@!+]+)", titulo_raw)
    numero = principal_match.group(1).strip() if principal_match and principal_match.group(1) else ""
    titulo = principal_match.group(2).strip() if principal_match else titulo_raw.strip()
    tipo = "Seção" if numero else "Região"

    # Autores
    autores = re.findall(r"@(?:\d*)\s*([^@!+]+)", titulo_raw)
    autores_limpos = "; ".join([a.strip() for a in autores])

    # Afiliações
    afiliacoes = re.findall(r"!(?:\d*)\s*([^@!+]+)", titulo_raw)
    afil_limpo = "; ".join([a.strip() for a in afiliacoes])

    # Referências
    referencias = re.findall(r"\+\d*\s*([^\+@!]+)", titulo_raw)
    refs_limpo = "; ".join([r.strip() for r in referencias])
    num_refs = len(referencias)

    return numero, titulo, autores_limpos, afil_limpo, refs_limpo, num_refs, tipo

def extrair_para_excel(pdf_path, excel_path):
    doc = fitz.open(pdf_path)
    toc = doc.get_toc()
    dados = []
    regiao_atual = None

    for _, titulo_completo, _ in toc:
        numero, titulo, autores, afiliacao, referencias, qtd_refs, tipo = extrair_info(titulo_completo)
        if tipo == "Região":
            regiao_atual = titulo
        elif regiao_atual:
            dados.append([regiao_atual, numero, titulo, autores, afiliacao, referencias, qtd_refs])

    df = pd.DataFrame(dados, columns=[
        "Região", "Número", "Título", "Autores", "Afiliação", "Referências", "Nº de Referências"
    ])
    df.to_excel(excel_path, index=False)
    print(f"✅ Arquivo Excel salvo em: {excel_path}")

# --- USO ---
# Altere o caminho conforme o local do seu arquivo PDF
extrair_para_excel("wcmt/17th.pdf", "bookmarks_resultado.xlsx")
