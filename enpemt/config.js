// Configuração do evento — edite à vontade (não coloque dados pessoais aqui).
window.ENPEMT_CONFIG = {
  evento: 'XXVI ENPEMT',
  subtitulo: 'Encontro Nacional de Pesquisa em Musicoterapia · 8 a 10 de outubro de 2026 · Escola de Música da UFMG',

  // A lista de atividades vem da mesma planilha publicada que alimenta a programação do site da UBAM.
  // Se ela mudar lá, o check-in passa a mostrar a versão nova sozinho.
  programacao: {
    sessoes: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSiSQFgYB0pMaO2AWFNfewMCiz9U8ijZ4rECspRPZBAwesW1nxvmtCkJs_eCQCgNoXvE4vE3ifoeXhm/pub?gid=1371690971&single=true&output=csv',
    trabalhos: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSiSQFgYB0pMaO2AWFNfewMCiz9U8ijZ4rECspRPZBAwesW1nxvmtCkJs_eCQCgNoXvE4vE3ifoeXhm/pub?gid=1347096897&single=true&output=csv',
    // Cópia salva em 06/10/2026, usada se a planilha estiver fora do ar no primeiro acesso
    reserva: 'programacao-reserva.json'
  },

  // Tipos da programação que não recebem lista de presença (almoço, coffee break)
  tiposSemPresenca: /livre/,

  // Texto gravado no QR do crachá antes do código (ex.: ENPEMT-K7F3QX)
  prefixoQR: 'ENPEMT-'
};
