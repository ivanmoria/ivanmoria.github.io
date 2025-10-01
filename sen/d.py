from moviepy.editor import VideoFileClip

def gif_para_mp4(caminho_gif, caminho_mp4):
    clip = VideoFileClip(caminho_gif)
    clip.write_videofile(caminho_mp4, codec='libx264', audio=False)

# Exemplo de uso:
gif_para_mp4("/Users/ivanmoria/Desktop/gif/masssster.gif", "/Users/ivanmoria/Desktop/gif/masssster.mp4")
