import fitz
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import unicodedata

def normalize_text(text):
    # Remove acentos, deixa tudo minúsculo, tira espaços extras
    text = text.lower().strip()
    text = ''.join(
        c for c in unicodedata.normalize('NFD', text)
        if unicodedata.category(c) != 'Mn'
    )
    return text

def extrair_linhas(pdf_path):
    doc = fitz.open(pdf_path)
    linhas = []

    for page_num in range(len(doc)):
        page = doc.load_page(page_num)
        blocks = page.get_text("dict")["blocks"]

        for b in blocks:
            if b["type"] != 0:
                continue
            for line in b["lines"]:
                text = " ".join([span["text"] for span in line["spans"]]).strip()
                if not text:
                    continue
                span = line["spans"][0]
                tamanho_fonte = span["size"]
                pagina = page_num + 1

                linhas.append({
                    "texto": text,
                    "texto_norm": normalize_text(text),
                    "tamanho_fonte": tamanho_fonte,
                    "pagina": pagina
                })

    return linhas

def buscar_titulos_similares(linhas, titulo_exemplo, limiar_similaridade=0.5):
    titulo_exemplo_norm = normalize_text(titulo_exemplo)
    textos_norm = [l["texto_norm"] for l in linhas]

    vectorizer = TfidfVectorizer().fit(textos_norm + [titulo_exemplo_norm])
    tfidf_matrix = vectorizer.transform(textos_norm + [titulo_exemplo_norm])
    similaridade = cosine_similarity(tfidf_matrix[-1], tfidf_matrix[:-1])[0]

    resultados = []
    for i, sim in enumerate(similaridade):
        if sim >= limiar_similaridade:
            resultados.append((linhas[i], sim))

    return resultados

if __name__ == "__main__":
    pdf_path = "wcmt/17th.pdf"
    linhas = extrair_linhas(pdf_path)

    titulo_exemplo = """
    THE EfficacY Of BONNY METHOD Of GUiDED iMaGErY
    aND MUSic Of BUrNOUT
    """

    similares = buscar_titulos_similares(linhas, titulo_exemplo, limiar_similaridade=0.5)

    for linha, sim in similares:
        print(f"Página {linha['pagina']} - Similaridade {sim:.2f}: {linha['texto']}")
