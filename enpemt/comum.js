// Funções compartilhadas: conexão com o Apps Script, cache local, nomes, categorias, estados (UF) e programação.
const ENPEMT = (() => {
  const CFG = window.ENPEMT_CONFIG;

  // ------------------------------------------------------------ armazenamento local
  const chaveLS = k => 'enpemt:' + k;
  function ler(k, padrao) {
    try { const v = localStorage.getItem(chaveLS(k)); return v == null ? padrao : JSON.parse(v); }
    catch { return padrao; }
  }
  function gravar(k, v) {
    try { localStorage.setItem(chaveLS(k), JSON.stringify(v)); } catch {}
  }

  // Link de configuração: pagina.html#u=<url do web app>&k=<chave>
  function capturarConfigDoLink() {
    const h = new URLSearchParams(location.hash.slice(1));
    if (h.get('u') && h.get('k')) {
      gravar('api', { url: h.get('u'), chave: h.get('k') });
      history.replaceState(null, '', location.pathname + location.search);
    }
  }
  capturarConfigDoLink();

  const conexao = () => ler('api', null);
  const definirConexao = (url, chave) => gravar('api', { url: url.trim(), chave: chave.trim() });

  // ------------------------------------------------------------ API
  async function chamarGet(acao) {
    const c = conexao();
    if (!c) throw new Error('Sistema não configurado');
    const q = new URLSearchParams({ acao, chave: c.chave });
    const r = await fetch(c.url + '?' + q, { cache: 'no-store' });
    const j = await r.json();
    if (!j.ok) throw new Error(j.erro || 'Erro no servidor');
    return j;
  }
  async function chamarPost(corpo) {
    const c = conexao();
    if (!c) throw new Error('Sistema não configurado');
    // Sem cabeçalhos extras: vai como text/plain e o navegador não faz preflight (o Apps Script não aceita).
    const r = await fetch(c.url, { method: 'POST', body: JSON.stringify({ ...corpo, chave: c.chave }) });
    const j = await r.json();
    if (!j.ok) throw new Error(j.erro || 'Erro no servidor');
    return j;
  }

  // ------------------------------------------------------------ texto e nomes
  const semAcento = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const PARTICULAS = new Set(['de', 'da', 'do', 'das', 'dos', 'e', 'di', 'del', 'van', 'von']);
  /** "EXEMPLO  DE nome " → "Exemplo de Nome" */
  function formatarNome(nome) {
    return String(nome || '').trim().replace(/\s+/g, ' ').toLocaleLowerCase('pt-BR').split(' ')
      .map((p, i) => (i > 0 && PARTICULAS.has(p)) ? p : p.replace(/(^|[-'])(\p{L})/gu, (m, a, b) => a + b.toLocaleUpperCase('pt-BR')))
      .join(' ');
  }
  /** Para o crachá: primeiro + último nome ("Exemplo de Nome Completo Filho" → "Exemplo Completo Filho") */
  function nomeCurto(nome) {
    const partes = formatarNome(nome).split(' ').filter(p => !PARTICULAS.has(p));
    if (partes.length <= 2) return partes.join(' ');
    const ult = partes.length - 1;
    const sufixo = /^(filho|filha|júnior|junior|jr\.?|neto|neta|sobrinho|segundo)$/i.test(partes[ult]);
    return sufixo ? [partes[0], partes[ult - 1], partes[ult]].join(' ') : [partes[0], partes[ult]].join(' ');
  }

  /** Vínculo do Forms → rótulo padronizado (junta "Não-Associados" e "NÃO Associados") */
  function categoria(texto) {
    const s = semAcento(texto);
    if (!s) return '';
    if (/estudante/.test(s)) return /musicoterapia/.test(s) ? 'Estudante de Musicoterapia' : 'Estudante de outras áreas';
    if (/nao.?associad/.test(s)) return 'Musicoterapeuta não associado(a)';
    if (/associad/.test(s)) return 'Musicoterapeuta associado(a) UBAM';
    if (/outr/.test(s)) return 'Outras categorias profissionais';
    return String(texto).trim();
  }

  function extrairId(texto) {
    const m = String(texto).toUpperCase().match(/([A-Z0-9]{6})\s*$/);
    return m ? m[1] : null;
  }

  function novoUid() {
    if (crypto.randomUUID) return crypto.randomUUID();
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
  }

  // ------------------------------------------------------------ estados e regiões
  const UFS = {
    AC: 'Acre', AL: 'Alagoas', AP: 'Amapá', AM: 'Amazonas', BA: 'Bahia', CE: 'Ceará', DF: 'Distrito Federal',
    ES: 'Espírito Santo', GO: 'Goiás', MA: 'Maranhão', MT: 'Mato Grosso', MS: 'Mato Grosso do Sul',
    MG: 'Minas Gerais', PA: 'Pará', PB: 'Paraíba', PR: 'Paraná', PE: 'Pernambuco', PI: 'Piauí',
    RJ: 'Rio de Janeiro', RN: 'Rio Grande do Norte', RS: 'Rio Grande do Sul', RO: 'Rondônia', RR: 'Roraima',
    SC: 'Santa Catarina', SP: 'São Paulo', SE: 'Sergipe', TO: 'Tocantins'
  };
  const REGIOES = {
    Norte: ['AC', 'AP', 'AM', 'PA', 'RO', 'RR', 'TO'],
    Nordeste: ['AL', 'BA', 'CE', 'MA', 'PB', 'PE', 'PI', 'RN', 'SE'],
    'Centro-Oeste': ['DF', 'GO', 'MT', 'MS'],
    Sudeste: ['ES', 'MG', 'RJ', 'SP'],
    Sul: ['PR', 'RS', 'SC']
  };
  const regiaoDe = uf => Object.keys(REGIOES).find(r => REGIOES[r].includes(uf)) || 'Outro / exterior';

  // Nomes por extenso, do mais longo ao mais curto ("paraná" antes de "pará").
  const NOMES_UF = Object.entries(UFS)
    .map(([sigla, nome]) => [sigla, semAcento(nome)])
    .concat([['DF', 'brasilia']])
    .sort((a, b) => b[1].length - a[1].length);

  /** "São Paulo", "sp", "Campinas - SP", "Brasília" → sigla; não reconhecido → '' */
  function normalizarUF(texto) {
    const s = semAcento(texto);
    if (!s) return '';
    if (UFS[s.toUpperCase()]) return s.toUpperCase();
    const exato = NOMES_UF.find(([, n]) => n === s);
    if (exato) return exato[0];
    const sigla = s.toUpperCase().match(/(?:^|[\s\-\/(,])([A-Z]{2})\)?$/);
    if (sigla && UFS[sigla[1]]) return sigla[1];
    const contido = NOMES_UF.find(([, n]) => s.includes(n));
    return contido ? contido[0] : '';
  }

  // ------------------------------------------------------------ leitura da planilha de inscrições
  // Mesma regra do apps-script/Codigo.gs — se mudar aqui, mude lá também.
  function detectarColunas(cab) {
    const achar = (...regras) => {
      for (const r of regras) { const i = cab.findIndex(h => r.test(h)); if (i >= 0) return i; }
      return -1;
    };
    return {
      id: cab.findIndex(h => h.trim() === 'ID ENPEMT'),
      carimbo: achar(/carimbo|timestamp/i),
      nome: achar(/nome completo/i, /^nome$/i, /^(?!.*(crach|social|institui)).*nome/i),
      nomeCracha: achar(/crach/i, /nome social/i),
      email: achar(/e-?mail/i),
      uf: achar(/estado|\buf\b/i),
      cidade: achar(/cidade|munic/i),
      categoria: achar(/categoria|v[ií]nculo|modalidade/i),
      precisaApoio: achar(/acessibilidade/i),
      apoio: achar(/descreva/i)
    };
  }
  const ehDuplicada = nome => /^\s*duplicad/i.test(nome);

  /** linhas[0] = cabeçalho. Ignora "DUPLICADA…" e junta inscrições repetidas com o mesmo nome. */
  function inscritosDaTabela(linhas) {
    const cab = linhas[0].map(h => String(h ?? '').trim());
    const c = detectarColunas(cab);
    const v = (l, i) => (i >= 0 && l[i] != null ? String(l[i] instanceof Date ? l[i].toISOString() : l[i]).trim() : '');
    const porNome = new Map();
    linhas.slice(1).forEach(l => {
      const nome = v(l, c.nome);
      if (!nome || ehDuplicada(nome) || !v(l, c.id)) return;
      const k = semAcento(nome);
      const p = {
        id: v(l, c.id),
        nome: formatarNome(nome), nomeCracha: v(l, c.nomeCracha), email: v(l, c.email),
        uf: v(l, c.uf), cidade: v(l, c.cidade), categoria: categoria(v(l, c.categoria)),
        apoio: /^sim/i.test(v(l, c.precisaApoio)) ? (v(l, c.apoio) || 'Sim') : ''
      };
      const anterior = porNome.get(k);
      if (anterior) { for (const f in p) if (!anterior[f] && p[f]) anterior[f] = p[f]; }
      else porNome.set(k, p);
    });
    return [...porNome.values()];
  }

  // ------------------------------------------------------------ programação (planilha publicada da UBAM)
  function lerCSV(texto) {
    const linhas = [];
    let linha = [], campo = '', aspas = false;
    for (let i = 0; i < texto.length; i++) {
      const ch = texto[i];
      if (aspas) {
        if (ch === '"' && texto[i + 1] === '"') { campo += '"'; i++; }
        else if (ch === '"') aspas = false;
        else campo += ch;
      } else if (ch === '"') aspas = true;
      else if (ch === ',') { linha.push(campo); campo = ''; }
      else if (ch === '\n') { linha.push(campo); linhas.push(linha); linha = []; campo = ''; }
      else if (ch !== '\r') campo += ch;
    }
    if (campo || linha.length) { linha.push(campo); linhas.push(linha); }
    const cab = linhas.shift() || [];
    return linhas.map(l => Object.fromEntries(cab.map((h, i) => [h.trim(), (l[i] || '').trim()])));
  }

  const limpo = t => String(t || '').replace(/\s+/g, ' ').trim();
  const minutos = h => { const m = /^(\d{1,2}):(\d{2})/.exec(h || ''); return m ? +m[1] * 60 + +m[2] : null; };

  /**
   * Cada sessão da programação vira uma atividade com lista de presença.
   * Workshops e Grupos de Trabalho simultâneos viram uma atividade por sala.
   */
  function montarAtividades(sessoes, trabalhos) {
    const porSessao = {};
    trabalhos.forEach(t => { if (t.sessao_id) (porSessao[t.sessao_id] = porSessao[t.sessao_id] || []).push(t); });
    const atividades = [];
    sessoes.forEach(s => {
      if (!s.id || !s.data || CFG.tiposSemPresenca.test(s.tipo)) return;
      // O id da planilha se repete às vezes (ex.: d08-07), então o horário entra no código
      const idBase = s.id + '-' + (s.inicio || '').replace(':', '');
      const itens = porSessao[s.id] || [];
      const local = itens[0]?.sala && /comunica/.test(s.tipo) ? itens[0].sala : s.sala;
      const base = {
        data: s.data, diaRotulo: s.dia, inicio: s.inicio, fim: s.fim, tipo: s.tipo, badge: s.badge,
        duracao: minutos(s.fim) != null && minutos(s.inicio) != null ? minutos(s.fim) - minutos(s.inicio) : 0
      };
      if (/curso|grupo-trabalho/.test(s.tipo) && itens.length) {
        itens.forEach(t => atividades.push({
          ...base, id: idBase + '-' + (t.ordem || atividades.length),
          titulo: limpo(t.titulo) || `${limpo(s.titulo)} — ${t.sala}`, grupo: limpo(s.titulo),
          local: /confirmar/i.test(t.sala) ? '' : t.sala
        }));
      } else {
        atividades.push({ ...base, id: idBase, titulo: limpo(s.titulo), grupo: '', local: /confirmar/i.test(local) ? '' : local });
      }
    });
    return atividades.sort((a, b) => (a.data + a.inicio).localeCompare(b.data + b.inicio));
  }

  /** Programação ao vivo → última cópia deste aparelho → cópia de reserva do site. */
  async function carregarProgramacao() {
    const P = CFG.programacao;
    try {
      const [s, t] = await Promise.all([P.sessoes, P.trabalhos].map(u => fetch(u, { cache: 'no-store' }).then(r => {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.text();
      })));
      const atividades = montarAtividades(lerCSV(s), lerCSV(t));
      if (!atividades.length) throw new Error('Programação vazia');
      gravar('programacao', { em: Date.now(), atividades });
      return { atividades, origem: 'ao vivo' };
    } catch (err) {
      const cache = ler('programacao', null);
      if (cache) return { atividades: cache.atividades, origem: 'cópia de ' + new Date(cache.em).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) };
      const r = await fetch(P.reserva);
      return { atividades: (await r.json()).atividades, origem: 'cópia de reserva (06/10)' };
    }
  }

  /** Mesmo rótulo curto em todas as telas: "Sex 9/10 · 14:00" */
  function rotuloDia(data) {
    const d = new Date(data + 'T12:00:00');
    return d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '') + ' ' + d.getDate() + '/' + (d.getMonth() + 1);
  }

  // ------------------------------------------------------------ exportação
  function baixarCSV(nomeArquivo, linhas) {
    const csv = linhas.map(l => l.map(v => {
      const t = String(v ?? '');
      return /[;"\n]/.test(t) ? '"' + t.replace(/"/g, '""') + '"' : t;
    }).join(';')).join('\n');
    // BOM + ";" para o Excel em português abrir com acentos e colunas certas
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = nomeArquivo;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  /** Uma linha da aba Presenças */
  function registroDe(pessoa, atividade, monitor, modo) {
    return {
      uid: novoUid(), ts: new Date().toISOString(),
      id: pessoa.id, nome: pessoa.nome, uf: normalizarUF(pessoa.uf) || pessoa.uf || '',
      data: atividade.data, inicio: atividade.inicio, fim: atividade.fim, local: atividade.local,
      atividade: atividade.titulo, atividadeId: atividade.id, monitor, modo
    };
  }

  /** Inscritos já limpos (sem duplicadas, nomes formatados), a partir das colunas que o Apps Script envia. */
  async function carregarInscritos() {
    const r = await chamarGet('inscritos');
    return inscritosDaTabela(r.tabela);
  }

  return {
    CFG, ler, gravar, conexao, definirConexao, chamarGet, chamarPost, carregarInscritos,
    semAcento, esc, formatarNome, nomeCurto, categoria, extrairId, novoUid,
    UFS, REGIOES, regiaoDe, normalizarUF, inscritosDaTabela, baixarCSV,
    lerCSV, montarAtividades, carregarProgramacao, rotuloDia, minutos, registroDe
  };
})();
