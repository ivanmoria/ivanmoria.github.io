/**
 * XXVI ENPEMT — backend de presença (Google Apps Script)
 *
 * Cole este arquivo em: Planilha de respostas do Forms → Extensões → Apps Script.
 * Passo a passo completo no LEIAME.md.
 *
 * ATENÇÃO: troque a CHAVE abaixo SOMENTE no editor do Apps Script.
 * Nunca publique a chave verdadeira no GitHub.
 */

const CHAVE = 'TROQUE-POR-UMA-SENHA-LONGA';

// Nome da aba com as respostas do Forms. Vazio = primeira aba da planilha.
const ABA_RESPOSTAS = '';
const ABA_PRESENCAS = 'Presenças';  // criada sozinha no primeiro registro
const COL_ID = 'ID ENPEMT';

// Títulos exatos das perguntas do Forms. Vazio = detectar automaticamente.
const COLUNAS = {
  nome: '',        // ex.: 'Nome completo'
  nomeCracha: '',  // ex.: 'Nome para o crachá'
  email: '',       // ex.: 'E-mail:'
  uf: '',          // ex.: 'Estado'
  cidade: '',      // ex.: 'Cidade'
  categoria: ''    // ex.: 'Vínculo'
};

const CABECALHO_PRESENCAS = ['Recebido em', 'Lido em', 'ID', 'Nome', 'UF', 'Data', 'Início', 'Fim', 'Local', 'Atividade', 'ID atividade', 'Monitor', 'Modo', 'UID'];

// ---------------------------------------------------------------- Web app

function doGet(e) {
  return responder(() => {
    const p = e.parameter || {};
    exigirChave(p.chave);
    switch (p.acao) {
      case 'ping': return { ok: true };
      case 'inscritos': return { ok: true, tabela: lerInscritos() };
      case 'presencas': return { ok: true, presencas: lerPresencas() };
      default: throw new Error('Ação desconhecida');
    }
  });
}

function doPost(e) {
  return responder(() => {
    const corpo = JSON.parse(e.postData.contents);
    exigirChave(corpo.chave);
    if (corpo.acao !== 'registrar') throw new Error('Ação desconhecida');
    return { ok: true, gravados: registrar(corpo.registros || []) };
  });
}

function responder(fn) {
  let saida;
  try { saida = fn(); } catch (err) { saida = { ok: false, erro: String(err.message || err) }; }
  return ContentService.createTextOutput(JSON.stringify(saida)).setMimeType(ContentService.MimeType.JSON);
}

function exigirChave(chave) {
  if (!chave || chave !== CHAVE) throw new Error('Chave inválida');
}

// ---------------------------------------------------------------- Inscritos

function abaRespostas() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('Script sem planilha: abra o Apps Script pela planilha (Extensões → Apps Script)');
  if (ABA_RESPOSTAS) {
    const aba = ss.getSheetByName(ABA_RESPOSTAS);
    if (!aba) throw new Error('Aba "' + ABA_RESPOSTAS + '" não encontrada');
    return aba;
  }
  // Sem nome fixo: a aba de respostas do Forms é a que tem "Carimbo de data/hora" e uma coluna de nome
  const abas = ss.getSheets();
  const ehRespostas = aba => {
    if (aba.getLastColumn() < 1) return false;
    const cab = aba.getRange(1, 1, 1, aba.getLastColumn()).getValues()[0].map(String);
    const c = detectarColunas(cab);
    return c.carimbo >= 0 && c.nome >= 0;
  };
  const aba = abas.find(a => a.getFormUrl && a.getFormUrl()) || abas.find(ehRespostas);
  if (!aba) throw new Error('Nenhuma aba de respostas encontrada. Preencha ABA_RESPOSTAS com o nome da aba.');
  return aba;
}

/** Rode para conferir em qual planilha, aba e colunas o script está trabalhando. */
function diagnostico() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) { console.log('ERRO: script sem planilha. Abra o Apps Script pela planilha (Extensões → Apps Script).'); return; }
  console.log('Planilha: ' + ss.getName());
  ss.getSheets().forEach(a => console.log('Aba "' + a.getName() + '": ' + Math.max(a.getLastRow() - 1, 0) + ' linhas, ' + a.getLastColumn() + ' colunas'));
  const aba = abaRespostas();
  const cab = aba.getRange(1, 1, 1, aba.getLastColumn()).getValues()[0].map(String);
  const c = detectarColunas(cab);
  console.log('Aba usada: "' + aba.getName() + '"');
  Object.keys(c).forEach(k => console.log('  ' + k + ': ' + (c[k] >= 0 ? 'coluna ' + (c[k] + 1) + ' "' + cab[c[k]].slice(0, 40) + '"' : 'não encontrada')));
  if (c.id >= 0) {
    const n = aba.getLastRow() - 1;
    const ids = n > 0 ? aba.getRange(2, c.id + 1, n, 1).getValues().filter(r => r[0]).length : 0;
    console.log('Códigos preenchidos: ' + ids + ' de ' + n + ' linhas');
  }
}

// Mesma regra do comum.js (detectarColunas) — se mudar aqui, mude lá também.
function detectarColunas(cab) {
  const achar = (fixo, ...regras) => {
    if (fixo) return cab.indexOf(fixo);
    for (const r of regras) {
      const i = cab.findIndex(h => r.test(h));
      if (i >= 0) return i;
    }
    return -1;
  };
  return {
    id: cab.indexOf(COL_ID),
    carimbo: achar('', /carimbo|timestamp/i),
    nome: achar(COLUNAS.nome, /nome completo/i, /^nome$/i, /^(?!.*(crach|social|institui)).*nome/i),
    nomeCracha: achar(COLUNAS.nomeCracha, /crach/i, /nome social/i),
    email: achar(COLUNAS.email, /e-?mail/i),
    uf: achar(COLUNAS.uf, /estado|\buf\b/i),
    cidade: achar(COLUNAS.cidade, /cidade|munic/i),
    categoria: achar(COLUNAS.categoria, /categoria|v[ií]nculo|modalidade/i),
    precisaApoio: achar('', /acessibilidade/i),
    apoio: achar('', /descreva/i)
  };
}

const semAcento = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
const ehDuplicada = nome => /^\s*duplicad/i.test(nome);

/**
 * Garante a coluna "ID ENPEMT" e preenche quem ainda não tem código.
 * Linhas marcadas "DUPLICADA…" ficam sem código; quem se inscreveu duas vezes
 * com o mesmo nome recebe o mesmo código nas duas linhas (um crachá só).
 */
function gerarIds() {
  const aba = abaRespostas();
  const ultimaCol = aba.getLastColumn();
  const cab = aba.getRange(1, 1, 1, ultimaCol).getValues()[0].map(String);
  let colId = cab.indexOf(COL_ID);
  if (colId < 0) {
    colId = ultimaCol;
    aba.getRange(1, colId + 1).setValue(COL_ID).setFontWeight('bold');
  }
  const n = aba.getLastRow() - 1;
  if (n < 1) return;
  const colNome = detectarColunas(cab).nome;
  if (colNome < 0) throw new Error('Coluna de nome não encontrada — preencha COLUNAS.nome');
  const nomes = aba.getRange(2, colNome + 1, n, 1).getValues().map(r => String(r[0]));
  const faixa = aba.getRange(2, colId + 1, n, 1);
  const ids = faixa.getValues().map(r => String(r[0] || ''));
  const usados = new Set(ids.filter(Boolean));
  const idPorNome = new Map();
  ids.forEach((id, i) => { if (id && !ehDuplicada(nomes[i])) idPorNome.set(semAcento(nomes[i]), id); });
  let mudou = false;
  ids.forEach((id, i) => {
    if (id || !nomes[i].trim() || ehDuplicada(nomes[i])) return;
    const k = semAcento(nomes[i]);
    let novo = idPorNome.get(k);
    if (!novo) {
      do { novo = codigoAleatorio(); } while (usados.has(novo));
      usados.add(novo);
      idPorNome.set(k, novo);
    }
    ids[i] = novo;
    mudou = true;
  });
  if (mudou) faixa.setValues(ids.map(id => [id]));
}

function codigoAleatorio() {
  const alfabeto = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sem 0/O, 1/I
  let s = '';
  for (let i = 0; i < 6; i++) s += alfabeto[Math.floor(Math.random() * alfabeto.length)];
  return s;
}

/**
 * Devolve só as colunas que o sistema usa (nunca os links de comprovantes e declarações).
 * A limpeza (nomes, categorias, duplicadas) é feita no navegador, em comum.js.
 */
function lerInscritos() {
  gerarIds();
  const valores = abaRespostas().getDataRange().getValues();
  const cab = valores[0].map(String);
  const usadas = Object.values(detectarColunas(cab)).filter(i => i >= 0);
  return valores.map((linha, r) => usadas.map(i => {
    const v = linha[i];
    return r > 0 && v instanceof Date ? v.toISOString() : String(v);
  }));
}

// ---------------------------------------------------------------- Presenças

function abaPresencas() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let aba = ss.getSheetByName(ABA_PRESENCAS);
  if (!aba) {
    aba = ss.insertSheet(ABA_PRESENCAS);
    aba.getRange(1, 1, 1, CABECALHO_PRESENCAS.length).setValues([CABECALHO_PRESENCAS]).setFontWeight('bold');
    aba.setFrozenRows(1);
  }
  return aba;
}

function registrar(registros) {
  const trava = LockService.getScriptLock();
  trava.waitLock(20000);
  try {
    const aba = abaPresencas();
    const colUid = CABECALHO_PRESENCAS.indexOf('UID') + 1;
    const n = aba.getLastRow() - 1;
    const existentes = new Set(n > 0 ? aba.getRange(2, colUid, n, 1).getValues().map(r => String(r[0])) : []);
    const agora = new Date();
    const novos = [];
    const gravados = [];
    registros.forEach(r => {
      if (!r || !r.uid) return;
      gravados.push(r.uid);
      if (existentes.has(r.uid)) return; // reenvio de algo já salvo
      existentes.add(r.uid);
      // Data e horários como texto, para a planilha não converter fuso nem formato
      novos.push([agora, new Date(r.ts), r.id, r.nome, r.uf, "'" + r.data, "'" + (r.inicio || ''), "'" + (r.fim || ''), r.local, r.atividade, r.atividadeId, r.monitor, r.modo, r.uid]);
    });
    if (novos.length) aba.getRange(aba.getLastRow() + 1, 1, novos.length, novos[0].length).setValues(novos);
    return gravados;
  } finally {
    trava.releaseLock();
  }
}

function lerPresencas() {
  const aba = abaPresencas();
  const n = aba.getLastRow() - 1;
  if (n < 1) return [];
  return aba.getRange(2, 1, n, CABECALHO_PRESENCAS.length).getValues().map(l => ({
    ts: l[1] instanceof Date ? l[1].toISOString() : String(l[1]),
    id: String(l[2]), nome: String(l[3]), uf: String(l[4]),
    data: String(l[5]), inicio: String(l[6]), fim: String(l[7]), local: String(l[8]),
    atividade: String(l[9]), atividadeId: String(l[10]),
    monitor: String(l[11]), modo: String(l[12]), uid: String(l[13])
  }));
}

// ---------------------------------------------------------------- Gatilho

/** Rode UMA vez: cada nova inscrição no Forms já ganha seu ID automaticamente. */
function instalarGatilho() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ScriptApp.getProjectTriggers()
    .filter(t => t.getHandlerFunction() === 'aoEnviarFormulario')
    .forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('aoEnviarFormulario').forSpreadsheet(ss).onFormSubmit().create();
  gerarIds();
}

function aoEnviarFormulario() {
  gerarIds();
}
