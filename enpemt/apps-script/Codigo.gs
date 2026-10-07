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

// Colunas das abas de presença: [título, valor]. Data e horários vão como texto ('…) para a planilha não converter.
// As colunas são achadas pelo título, então dá para reordenar ou acrescentar colunas na planilha sem quebrar nada.
const CAMPOS_PRESENCA = {
  'Recebido em': (r, agora) => agora,
  'Lido em': r => new Date(r.ts),
  'ID': r => r.id,
  'Nome': r => r.nome,
  'E-mail': r => r.email || '',
  'UF': r => r.uf,
  'Data': r => "'" + r.data,
  'Início': r => "'" + (r.inicio || ''),
  'Fim': r => "'" + (r.fim || ''),
  'Local': r => r.local,
  'Atividade': r => r.atividade,
  'ID atividade': r => r.atividadeId,
  'Monitor': r => r.monitor,
  'Modo': r => r.modo,
  'Alerta': r => r.alerta || '',
  'Situação': () => '',
  'UID': r => r.uid
};
const COLUNAS_GERAL = Object.keys(CAMPOS_PRESENCA);
// Abas por atividade: uma linha por pessoa, para conferência sala a sala
const COLUNAS_ATIVIDADE = ['Lido em', 'Nome', 'E-mail', 'UF', 'ID', 'Monitor', 'Modo', 'Alerta', 'UID'];
const COR_ALERTA = '#fde2c4';   // laranja claro: mesma pessoa em atividades no mesmo horário
const COR_REMOVIDO = '#9e9e9e'; // texto cinza riscado: leitura desfeita pelo monitor

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
    if (corpo.acao === 'registrar') return { ok: true, ...registrar(corpo.registros || []) };
    if (corpo.acao === 'remover') return { ok: true, removidos: remover(corpo.remocoes || []) };
    throw new Error('Ação desconhecida');
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
  // Lista pronta guardada por 5 min: evita reler a planilha a cada celular que abre o app.
  // Uma inscrição nova (gatilho) limpa o cache na hora.
  const cache = CacheService.getScriptCache();
  const guardada = cache.get('inscritos');
  if (guardada) return JSON.parse(guardada);
  gerarIds();
  const valores = abaRespostas().getDataRange().getValues();
  const cab = valores[0].map(String);
  const usadas = Object.values(detectarColunas(cab)).filter(i => i >= 0);
  const tabela = valores.map((linha, r) => usadas.map(i => {
    const v = linha[i];
    return r > 0 && v instanceof Date ? v.toISOString() : String(v);
  }));
  try { cache.put('inscritos', JSON.stringify(tabela), 300); } catch (e) {} // acima de 100 KB o cache recusa; segue sem
  return tabela;
}

// ---------------------------------------------------------------- Presenças

/** Garante os títulos na linha 1 (colunas que faltam entram ao lado da anterior) e devolve título → coluna (1, 2, …). */
function prepararAba(aba, titulos) {
  const lerCab = () => aba.getLastColumn() ? aba.getRange(1, 1, 1, aba.getLastColumn()).getValues()[0].map(String) : [];
  let cab = lerCab();
  titulos.forEach((t, i) => {
    if (cab.indexOf(t) >= 0) return;
    const anterior = i > 0 ? cab.indexOf(titulos[i - 1]) : -1;
    if (anterior >= 0 && anterior < cab.length - 1) {
      aba.insertColumnAfter(anterior + 1);
      aba.getRange(1, anterior + 2).setValue(t);
    } else {
      aba.getRange(1, cab.length + 1).setValue(t);
    }
    cab = lerCab();
  });
  aba.getRange(1, 1, 1, cab.length).setFontWeight('bold');
  if (aba.getFrozenRows() < 1) aba.setFrozenRows(1);
  const mapa = {};
  cab.forEach((t, i) => { if (t) mapa[t] = i + 1; });
  return mapa;
}

function abaPresencas() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(ABA_PRESENCAS) || ss.insertSheet(ABA_PRESENCAS);
}

/** "10-10 14h00 Sala 004 · Comunicações Orais — …" (o Sheets não aceita alguns caracteres e limita o tamanho) */
function nomeAbaAtividade(r) {
  const d = String(r.data).split('-');
  const quando = (d.length === 3 ? d[2] + '-' + d[1] : r.data) + (r.inicio ? ' ' + String(r.inicio).replace(':', 'h') : '');
  const nome = [quando, r.local, r.atividade].filter(Boolean).join(' · ');
  return nome.replace(/[\[\]*?\/\\:']/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 90);
}

/** Escreve linhas na ordem das colunas da aba; devolve o número da primeira linha escrita */
function anexar(aba, mapa, linhas) {
  if (!linhas.length) return 0;
  const largura = Math.max(...Object.values(mapa));
  const valores = linhas.map(campos => {
    const l = new Array(largura).fill('');
    Object.keys(campos).forEach(t => { if (mapa[t]) l[mapa[t] - 1] = campos[t]; });
    return l;
  });
  const primeira = aba.getLastRow() + 1;
  aba.getRange(primeira, 1, valores.length, largura).setValues(valores);
  return primeira;
}

const chavePessoa = (id, nome) => String(id) === 'MANUAL' ? 'MANUAL:' + semAcento(nome) : String(id);
const minutosDe = h => { const m = /^'?(\d{1,2}):(\d{2})/.exec(String(h || '')); return m ? +m[1] * 60 + +m[2] : null; };

/** Duas atividades diferentes no mesmo dia com horários que se cruzam */
function mesmoHorario(a, b) {
  const data = x => String(x.data || '').replace(/^'/, '');
  if (!data(a) || data(a) !== data(b) || a.atividadeId === b.atividadeId) return false;
  const ai = minutosDe(a.inicio), bi = minutosDe(b.inicio);
  if (ai == null || bi == null) return false;
  const af = minutosDe(a.fim) ?? ai + 60, bf = minutosDe(b.fim) ?? bi + 60;
  return ai < bf && bi < af;
}

const horaCurta = ts => Utilities.formatDate(new Date(ts), Session.getScriptTimeZone(), 'HH:mm');
const descreverConflito = o => 'Também em ' + (o.local || o.atividade) + ' (' + horaCurta(o.ts) + ', monitor ' + o.monitor + ')';

/** Todas as linhas da aba geral como objetos, com o número da linha */
function lerLinhasGerais(aba, mapa) {
  const n = aba.getLastRow() - 1;
  if (n < 1) return [];
  const largura = aba.getLastColumn();
  const texto = v => v instanceof Date ? v.toISOString() : String(v).replace(/^'/, '');
  return aba.getRange(2, 1, n, largura).getValues().map((l, i) => {
    const o = { linha: i + 2 };
    Object.keys(PROPS_PRESENCA).forEach(t => { o[PROPS_PRESENCA[t]] = mapa[t] ? texto(l[mapa[t] - 1]) : ''; });
    return o;
  });
}

const PROPS_PRESENCA = { 'Lido em': 'ts', 'ID': 'id', 'Nome': 'nome', 'E-mail': 'email', 'UF': 'uf', 'Data': 'data', 'Início': 'inicio', 'Fim': 'fim',
  'Local': 'local', 'Atividade': 'atividade', 'ID atividade': 'atividadeId', 'Monitor': 'monitor', 'Modo': 'modo', 'Alerta': 'alerta', 'Situação': 'situacao', 'UID': 'uid' };
const removida = o => /^removid/i.test(o.situacao || '');

const colunaComoLista = (aba, col) => {
  const n = aba.getLastRow() - 1;
  return n > 0 && col ? aba.getRange(2, col, n, 1).getValues().map(r => String(r[0])) : [];
};

function registrar(registros) {
  const trava = LockService.getScriptLock();
  trava.waitLock(30000);
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const geral = abaPresencas();
    const mapaGeral = prepararAba(geral, COLUNAS_GERAL);
    const anteriores = lerLinhasGerais(geral, mapaGeral);
    const existentes = new Set(anteriores.map(o => o.uid));
    const agora = new Date();
    const novos = [];
    const gravados = [];
    registros.forEach(r => {
      if (!r || !r.uid) return;
      gravados.push(r.uid);
      if (existentes.has(r.uid)) return; // reenvio de algo já salvo
      existentes.add(r.uid);
      novos.push(r);
    });

    // Mesma pessoa em outra atividade no mesmo horário (qualquer aparelho): registra, mas avisa
    const alertas = {};
    const marcarAnteriores = [];
    const ativos = anteriores.filter(o => !removida(o));
    novos.forEach((r, i) => {
      const k = chavePessoa(r.id, r.nome);
      const outros = ativos.concat(novos.slice(0, i)).filter(o => chavePessoa(o.id, o.nome) === k && mesmoHorario(o, r));
      if (!outros.length) return;
      r.alerta = outros.map(descreverConflito).join('; ');
      alertas[r.uid] = r.alerta;
      outros.forEach(o => {
        const texto = descreverConflito(r);
        if (o.linha) { marcarAnteriores.push({ o, texto }); return; }
        // o outro registro veio no mesmo envio e ainda não foi escrito
        o.alerta = o.alerta ? o.alerta + '; ' + texto : texto;
        alertas[o.uid] = o.alerta;
      });
    });

    const campos = r => {
      const o = {};
      COLUNAS_GERAL.forEach(t => { o[t] = CAMPOS_PRESENCA[t](r, agora); });
      return o;
    };
    const primeira = anexar(geral, mapaGeral, novos.map(campos));
    const largura = geral.getLastColumn();
    novos.forEach((r, i) => { if (r.alerta) geral.getRange(primeira + i, 1, 1, largura).setBackground(COR_ALERTA); });
    marcarAnteriores.forEach(({ o, texto }) => {
      const atual = String(geral.getRange(o.linha, mapaGeral['Alerta']).getValue() || '');
      if (atual.indexOf(texto) < 0) geral.getRange(o.linha, mapaGeral['Alerta']).setValue(atual ? atual + '; ' + texto : texto);
      geral.getRange(o.linha, 1, 1, largura).setBackground(COR_ALERTA);
      alertas[o.uid] = (alertas[o.uid] ? alertas[o.uid] + '; ' : '') + texto;
    });

    // Uma aba por atividade, sem repetir pessoa
    const porAba = {};
    novos.forEach(r => (porAba[nomeAbaAtividade(r)] = porAba[nomeAbaAtividade(r)] || []).push(r));
    Object.keys(porAba).forEach(nome => {
      const aba = ss.getSheetByName(nome) || ss.insertSheet(nome);
      const mapa = prepararAba(aba, COLUNAS_ATIVIDADE);
      const ids = colunaComoLista(aba, mapa['ID']);
      const nomes = colunaComoLista(aba, mapa['Nome']);
      const ja = new Set(ids.map((id, i) => chavePessoa(id, nomes[i])));
      const linhas = [];
      porAba[nome].forEach(r => {
        const k = chavePessoa(r.id, r.nome);
        if (ja.has(k)) return;
        ja.add(k);
        linhas.push(r);
      });
      const p1 = anexar(aba, mapa, linhas.map(campos));
      linhas.forEach((r, i) => { if (r.alerta) aba.getRange(p1 + i, 1, 1, aba.getLastColumn()).setBackground(COR_ALERTA); });
    });
    // Conflitos com registros anteriores também ficam laranja na aba da atividade deles
    marcarAnteriores.forEach(({ o, texto }) => {
      const aba = ss.getSheetByName(nomeAbaAtividade(o));
      if (!aba) return;
      const mapa = prepararAba(aba, COLUNAS_ATIVIDADE);
      const i = colunaComoLista(aba, mapa['UID']).indexOf(o.uid);
      if (i < 0) return;
      const cel = aba.getRange(i + 2, mapa['Alerta']);
      const atual = String(cel.getValue() || '');
      if (atual.indexOf(texto) < 0) cel.setValue(atual ? atual + '; ' + texto : texto);
      aba.getRange(i + 2, 1, 1, aba.getLastColumn()).setBackground(COR_ALERTA);
    });
    return { gravados, alertas };
  } finally {
    trava.releaseLock();
  }
}

/**
 * Leitura feita sem querer: na aba geral a linha fica riscada e marcada "Removido…" (histórico preservado);
 * na aba da atividade a linha sai. remocoes = [{uid, monitor, ts}]
 */
function remover(remocoes) {
  const trava = LockService.getScriptLock();
  trava.waitLock(30000);
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const geral = abaPresencas();
    const mapaGeral = prepararAba(geral, COLUNAS_GERAL);
    const linhas = lerLinhasGerais(geral, mapaGeral);
    const largura = geral.getLastColumn();
    const removidos = [];
    remocoes.forEach(rem => {
      const o = linhas.find(x => x.uid === rem.uid);
      removidos.push(rem.uid); // não achou = nunca chegou à planilha; nada a fazer
      if (!o || removida(o)) return;
      o.situacao = 'Removido às ' + horaCurta(rem.ts || new Date()) + ' por ' + (rem.monitor || 'monitor');
      geral.getRange(o.linha, mapaGeral['Situação']).setValue(o.situacao);
      geral.getRange(o.linha, 1, 1, largura).setFontLine('line-through').setFontColor(COR_REMOVIDO).setBackground(null);
      const aba = ss.getSheetByName(nomeAbaAtividade(o));
      if (!aba) return;
      const mapa = prepararAba(aba, COLUNAS_ATIVIDADE);
      const i = colunaComoLista(aba, mapa['UID']).indexOf(o.uid);
      if (i >= 0) aba.deleteRow(i + 2);
      // Se a mesma pessoa tinha outra leitura válida nesta atividade (de outro aparelho), ela volta para a aba
      const outra = linhas.find(x => x.uid !== o.uid && !removida(x) && x.atividadeId === o.atividadeId && chavePessoa(x.id, x.nome) === chavePessoa(o.id, o.nome));
      if (outra && colunaComoLista(aba, mapa['UID']).indexOf(outra.uid) < 0) {
        const campos = {};
        COLUNAS_ATIVIDADE.forEach(t => { campos[t] = outra[PROPS_PRESENCA[t]] || ''; });
        anexar(aba, mapa, [campos]);
      }
    });
    // Com a leitura desfeita, o conflito pode ter acabado: recalcula o alerta das outras leituras da pessoa
    const pessoas = new Set(remocoes.map(rem => linhas.find(x => x.uid === rem.uid)).filter(Boolean).map(o => chavePessoa(o.id, o.nome)));
    pessoas.forEach(k => {
      const ativas = linhas.filter(x => !removida(x) && chavePessoa(x.id, x.nome) === k);
      ativas.forEach(x => {
        const texto = ativas.filter(o => o.uid !== x.uid && mesmoHorario(o, x)).map(descreverConflito).join('; ');
        if (texto === (x.alerta || '')) return;
        x.alerta = texto;
        geral.getRange(x.linha, mapaGeral['Alerta']).setValue(texto);
        geral.getRange(x.linha, 1, 1, largura).setBackground(texto ? COR_ALERTA : null);
        const aba = ss.getSheetByName(nomeAbaAtividade(x));
        if (!aba) return;
        const mapa = prepararAba(aba, COLUNAS_ATIVIDADE);
        const i = colunaComoLista(aba, mapa['UID']).indexOf(x.uid);
        if (i < 0) return;
        aba.getRange(i + 2, mapa['Alerta']).setValue(texto);
        aba.getRange(i + 2, 1, 1, aba.getLastColumn()).setBackground(texto ? COR_ALERTA : null);
      });
    });
    return removidos;
  } finally {
    trava.releaseLock();
  }
}

function lerPresencas() {
  const aba = abaPresencas();
  const mapa = prepararAba(aba, COLUNAS_GERAL);
  return lerLinhasGerais(aba, mapa).filter(o => !removida(o)).map(o => { delete o.linha; return o; });
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
  CacheService.getScriptCache().remove('inscritos');
}
