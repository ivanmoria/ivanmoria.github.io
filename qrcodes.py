import qrcode

def gerar_qrcode(link, nome_arquivo="qrcode.png"):
    # Cria o QR Code
    qr = qrcode.make(link)
    
    # Salva a imagem
    qr.save(nome_arquivo)
    
    print(f"QR Code gerado e salvo como: {nome_arquivo}")

if __name__ == "__main__":
    link = input("Digite o link para gerar o QR Code: ")
    nome = input("Nome do arquivo (ex: qr.png): ") or "qrcode.png"
    
    gerar_qrcode(link, nome)