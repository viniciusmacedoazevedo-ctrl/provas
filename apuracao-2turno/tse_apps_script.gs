/**
 * Conector ao vivo TSE -> Google Sheets (apuração do 2º turno)
 *
 * Lê o arquivo EA20 "resultado unificado" (…-u.json) publicado pelo TSE e grava:
 *   - aba "Dados"     : resumo (A:B) e candidatos (E:K)
 *   - aba "Histórico" : uma linha nova a cada totalização (data/hora diferentes)
 *
 * Como usar:
 *   1. Importe apuracao_2turno.xlsx no Google Drive e abra como Planilha Google.
 *   2. Extensões > Apps Script, cole este arquivo inteiro e salve.
 *   3. Recarregue a planilha: aparece o menu "TSE ao vivo".
 *   4. "Atualizar agora" para testar; "Iniciar ao vivo (1 min)" para acompanhar.
 */

var ABA_CONFIG = 'Config';
var ABA_DADOS = 'Dados';
var ABA_HIST = 'Histórico';
var CELULA_URL = 'B12'; // URL final montada na aba Config
var CABECALHO_HIST = ['Data', 'Hora', 'Secoes', 'SecoesTot', 'Eleitorado', 'EleitTot', 'EleitInst',
                      'Comparec', 'VotosTotais', 'VotosValidos', 'VotosCand1', 'VotosCand2'];

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('TSE ao vivo')
    .addItem('Atualizar agora', 'atualizarTSE')
    .addItem('Iniciar ao vivo (1 min)', 'iniciarAoVivo')
    .addItem('Parar ao vivo', 'pararAoVivo')
    .addSeparator()
    .addItem('Limpar histórico', 'limparHistorico')
    .addToUi();
}

function iniciarAoVivo() {
  pararAoVivo();
  ScriptApp.newTrigger('atualizarTSE').timeBased().everyMinutes(1).create();
  atualizarTSE();
  SpreadsheetApp.getActive().toast('Atualização automática a cada 1 minuto.', 'TSE ao vivo');
}

function pararAoVivo() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'atualizarTSE') ScriptApp.deleteTrigger(t);
  });
}

function limparHistorico() {
  var sh = SpreadsheetApp.getActive().getSheetByName(ABA_HIST);
  var ultima = sh.getLastRow();
  if (ultima > 1) sh.getRange(2, 1, ultima - 1, 12).clearContent();
}

function atualizarTSE() {
  var ss = SpreadsheetApp.getActive();
  var url = String(ss.getSheetByName(ABA_CONFIG).getRange(CELULA_URL).getValue()).trim();
  var resp = UrlFetchApp.fetch(url, { muteHttpExceptions: true, headers: { 'Cache-Control': 'no-cache' } });
  if (resp.getResponseCode() !== 200) {
    ss.toast('HTTP ' + resp.getResponseCode() + ' em ' + url, 'TSE ao vivo - erro');
    return;
  }
  var dados = parseEA20(JSON.parse(resp.getContentText('UTF-8')));

  var shDados = ss.getSheetByName(ABA_DADOS);
  shDados.getRange('A2:B40').clearContent();
  shDados.getRange('E2:K20').clearContent();
  shDados.getRange(2, 1, dados.resumo.length, 2).setValues(dados.resumo);
  if (dados.candidatos.length) {
    shDados.getRange(2, 5, dados.candidatos.length, 7).setValues(dados.candidatos);
  }

  // Histórico: só acrescenta quando a totalização mudou (dt + ht)
  var shHist = ss.getSheetByName(ABA_HIST);
  if (shHist.getRange('A1').getValue() === '') {
    shHist.getRange(1, 1, 1, CABECALHO_HIST.length).setValues([CABECALHO_HIST]);
  }
  var ultima = shHist.getLastRow();
  var linha = dados.historico;
  if (ultima >= 2) {
    var ant = shHist.getRange(ultima, 1, 1, 2).getDisplayValues()[0];
    if (ant[0] === linha[0] && ant[1] === linha[1]) return;
  }
  shHist.getRange(Math.max(ultima, 1) + 1, 1, 1, linha.length).setValues([linha]);
}

/**
 * Converte o JSON EA20 nas linhas da planilha. Função pura (testável fora do Google).
 * Os números do TSE chegam como texto; percentuais são recalculados na planilha
 * a partir das quantidades, evitando problemas de vírgula/ponto decimal.
 */
function parseEA20(j) {
  function num(x) {
    if (x === undefined || x === null || x === '') return 0;
    return Number(String(x).replace(/\./g, '').replace(',', '.')) || 0;
  }
  var s = j.s || {}, e = j.e || {}, v = j.v || {};

  var candidatos = [];
  var cargo = (j.carg && j.carg[0]) || { agr: [] };
  (cargo.agr || []).forEach(function (agr) {
    (agr.par || []).forEach(function (par) {
      (par.cand || []).forEach(function (c) {
        candidatos.push([
          num(c.n), c.nmu || c.nm || '', par.sg || '', num(c.vap),
          c.e || '', c.st || '', num(c.seq)
        ]);
      });
    });
  });
  // Ordem fixa pelo número de urna: "seq" muda conforme a votação e trocaria as séries do histórico
  candidatos.sort(function (a, b) { return a[0] - b[0]; });

  var resumo = [
    ['ele', j.ele || ''], ['t', j.t || ''], ['tpabr', j.tpabr || ''], ['cdabr', j.cdabr || ''],
    ['cargo', cargo.nmn || ''], ['dt', j.dt || ''], ['ht', j.ht || ''],
    ['and', j.and || ''], ['md', j.md || ''], ['tf', j.tf || ''], ['dv', j.dv || ''],
    ['ts', num(s.ts)], ['st', num(s.st)], ['te', num(e.te)], ['est', num(e.est)],
    ['esi', num(e.esi)], ['c', num(e.c)], ['a', num(e.a)],
    ['tv', num(v.tv)], ['vv', num(v.vv)], ['vb', num(v.vb)], ['tvn', num(v.tvn)],
    ['van', num(v.van)], ['vansj', num(v.vansj)]
  ];

  var vA = candidatos[0] ? candidatos[0][3] : 0;
  var vB = candidatos[1] ? candidatos[1][3] : 0;
  var historico = [
    j.dt || '', j.ht || '', num(s.ts), num(s.st), num(e.te), num(e.est),
    num(e.esi), num(e.c), num(v.tv), num(v.vv), vA, vB
  ];
  return { resumo: resumo, candidatos: candidatos, historico: historico };
}

if (typeof module !== 'undefined') module.exports = { parseEA20: parseEA20 };
