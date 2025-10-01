import cv2

# Carregar imagem
imagem = cv2.imread("media/ivan1.JPG")

# Converter para escala de cinza
cinza = cv2.cvtColor(imagem, cv2.COLOR_BGR2GRAY)

# Aplicar efeito de desfoque
desfocada = cv2.GaussianBlur(cinza, (21, 21), sigmaX=0, sigmaY=0)

# Criar efeito de desenho invertido
desenho = cv2.divide(cinza, desfocada, scale=256)

# Salvar resultado
cv2.imwrite("desenho_ivan.jpg", desenho)

# Mostrar imagem
cv2.imshow("Desenho", desenho)
cv2.waitKey(0)
cv2.destroyAllWindows()
