import numpy as np
from scipy import stats  # Importa a biblioteca necessária para o cálculo do p-value

def calcular_media_velocity(velocities):
    """Calcula a média das velocidades."""
    if velocities:
        return sum(velocities) / len(velocities)
    return 0

def calcular_media_press_dur(press_dur):
    """Calcula a média da duração das pressões das teclas."""
    if press_dur:
        return sum(press_dur) / len(press_dur)
    return 0

def calcular_desvio_padrao_velocity(velocities):
    """Calcula o desvio padrão das velocidades."""
    return np.std(velocities) if velocities else 0

def calcular_variacao_percentual(teclas):
    """Calcula a variação percentual de teclas pressionadas."""
    unique_keys = len(set(teclas))
    total_keys = len(teclas)
    return (unique_keys / total_keys) * 100 if total_keys > 0 else 0

def calcular_bpm(tempos):
    """Calcula as batidas por minuto com base nos tempos."""
    if len(tempos) > 1:
        time_diffs = np.diff(tempos)
        avg_time_diff = np.mean(time_diffs)
        return 60000 / avg_time_diff if avg_time_diff > 0 else 0
    return 0

def calcular_frequencia_teclas(teclas):
    """Calcula a frequência de cada tecla pressionada."""
    return {k: teclas.count(k) for k in set(teclas)}  # Contagem de cada tecla pressionada

def calcular_media_velocity_por_tecla(teclas, velocities):
    """Calcula a média da velocity por tecla pressionada."""
    media_velocity_por_tecla = {}
    for tecla in set(teclas):
        media_velocity_por_tecla[tecla] = np.mean([v for t, v in zip(teclas, velocities) if t == tecla])
    return media_velocity_por_tecla

def calcular_tempo_total_pressao(press_dur):
    """Calcula o tempo total de pressão das teclas."""
    return sum(press_dur) if press_dur else 0

def calcular_velocity_maxima(velocities):
    """Encontra a velocity máxima."""
    return max(velocities) if velocities else 0

def calcular_velocity_minima(velocities):
    """Encontra a velocity mínima."""
    return min(velocities) if velocities else 0

def calcular_mediana(velocities):
    """Calcula a mediana das velocidades."""
    return np.median(velocities) if velocities else 0

def calcular_p_value(velocities):
    """Calcula o p-value usando um teste t de Student."""
    if len(velocities) > 1:
        t_stat, p_value = stats.ttest_1samp(velocities, popmean=np.mean(velocities))
        return p_value
    return None

def calcular_porcentagem_permanencia(frequencias_teclas):
    """Calcula a porcentagem de permanência em cada tecla pressionada."""
    total_pressures = sum(frequencias_teclas.values())
    porcentagens = {tecla: (count / total_pressures * 100) if total_pressures > 0 else 0 
                    for tecla, count in frequencias_teclas.items()}
    return porcentagens

def calcular_intervalo_entre_presses(tempos):
    """Calcula o intervalo entre pressões consecutivas."""
    if len(tempos) > 1:
        return np.diff(tempos)
    return []

def calcular_densidade_teclas(tempos):
    """Calcula a densidade de teclas pressionadas por unidade de tempo."""
    if len(tempos) > 1:
        duration = tempos[-1] - tempos[0]
        return len(tempos) / duration if duration > 0 else 0
    return 0

def calcular_estatisticas(teclas, velocities, press_dur, tempos):
    """Calcula e retorna todas as estatísticas em um dicionário."""
    frequencias_teclas = calcular_frequencia_teclas(teclas)
    porcentagens_permanencia = calcular_porcentagem_permanencia(frequencias_teclas)
    
def calcular_max_teclas_apertadas(teclas):
    """Calcula o máximo de teclas apertadas, considerando os valores de 1 a 8."""
    unique_keys = set(teclas)  # Obtem as teclas únicas
    return len(unique_keys) if unique_keys else 0
    
def calcular_estatisticas(teclas, velocities, press_dur, tempos):
    """Calcula e retorna todas as estatísticas em um dicionário."""
    frequencias_teclas = calcular_frequencia_teclas(teclas)
    porcentagens_permanencia = calcular_porcentagem_permanencia(frequencias_teclas)
    
    return {
        "media_velocity": calcular_media_velocity(velocities),
        "media_press_dur": calcular_media_press_dur(press_dur),
        "desvio_padrao_velocity": calcular_desvio_padrao_velocity(velocities),
        "mediana": calcular_mediana(velocities),
        "p_value": calcular_p_value(velocities),
        "frequencia_teclas": frequencias_teclas,
        "porcentagem_permanencia": porcentagens_permanencia,
        "variacao_percentual": calcular_variacao_percentual(teclas),
        "bpm": calcular_bpm(tempos),
        "media_velocity_por_tecla": calcular_media_velocity_por_tecla(teclas, velocities),
        "tempo_total_pressao": calcular_tempo_total_pressao(press_dur),
        "velocity_maxima": calcular_velocity_maxima(velocities),
        "velocity_minima": calcular_velocity_minima(velocities),
        "intervalo_entre_presses": calcular_intervalo_entre_presses(tempos),
        "densidade_teclas": calcular_densidade_teclas(tempos),
        "max_teclas_apertadas": calcular_max_teclas_apertadas(teclas),  # Adiciona a nova estatística
    'bpm_por_tecla': calcular_bpm( tempos) / len(teclas) if len(teclas) > 0 else 0  # BPM dividido pelo total de teclas
    
    }
