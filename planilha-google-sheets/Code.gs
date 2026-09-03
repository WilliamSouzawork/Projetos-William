// Calculadora de Distância de Rotas — versão Google Sheets
// Fase 1 (adaptada): origem e destino por coordenadas, direto na planilha.

var ORS_DIRECTIONS_URL = 'https://api.openrouteservice.org/v2/directions/driving-car';
var PROPRIEDADE_CHAVE_API = 'ORS_API_KEY';

// Bounding box aproximado do território brasileiro.
var BRASIL_LAT_MIN = -34.0, BRASIL_LAT_MAX = 5.5;
var BRASIL_LON_MIN = -74.0, BRASIL_LON_MAX = -32.0;

var COL_ORIGEM_LAT = 1;   // A
var COL_ORIGEM_LON = 2;   // B
var COL_DESTINO_LAT = 3;  // C
var COL_DESTINO_LON = 4;  // D
var COL_DISTANCIA_ROTA = 5;    // E
var COL_DISTANCIA_LINHA_RETA = 6; // F
var COL_TEMPO_ESTIMADO = 7;    // G
var COL_STATUS = 8;            // H

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Calculadora de Rotas')
    .addItem('Configurar chave da API', 'configurarChaveApi')
    .addItem('Calcular todas as linhas', 'calcularTodasAsLinhas')
    .addToUi();
}

function configurarChaveApi() {
  var ui = SpreadsheetApp.getUi();
  var resposta = ui.prompt(
    'Chave da API do OpenRouteService',
    'Cole aqui a chave gratuita que você gerou em openrouteservice.org:',
    ui.ButtonSet.OK_CANCEL
  );
  if (resposta.getSelectedButton() == ui.Button.OK) {
    var chave = resposta.getResponseText().trim();
    if (chave) {
      PropertiesService.getScriptProperties().setProperty(PROPRIEDADE_CHAVE_API, chave);
      ui.alert('Chave salva com sucesso.');
    }
  }
}

function calcularTodasAsLinhas() {
  var chave = PropertiesService.getScriptProperties().getProperty(PROPRIEDADE_CHAVE_API);
  if (!chave) {
    SpreadsheetApp.getUi().alert('Configure a chave da API primeiro (menu "Calculadora de Rotas" > "Configurar chave da API").');
    return;
  }

  var planilha = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var ultimaLinha = planilha.getLastRow();

  // Guarda a última origem preenchida, para permitir "uma origem, vários
  // destinos": basta deixar as células de origem em branco nas linhas
  // seguintes que elas reaproveitam a origem informada na linha anterior.
  var ultimaOrigemLat = NaN;
  var ultimaOrigemLon = NaN;

  for (var linha = 2; linha <= ultimaLinha; linha++) {
    var statusAtual = planilha.getRange(linha, COL_STATUS).getValue();
    if (statusAtual === 'OK') {
      // Ainda assim atualiza a "última origem" para as linhas seguintes,
      // caso essa linha tenha uma origem preenchida.
      var olat = parseCoordenada(planilha.getRange(linha, COL_ORIGEM_LAT).getValue());
      var olon = parseCoordenada(planilha.getRange(linha, COL_ORIGEM_LON).getValue());
      if (!isNaN(olat) && !isNaN(olon)) {
        ultimaOrigemLat = olat;
        ultimaOrigemLon = olon;
      }
      continue; // já calculado antes — evita gastar a cota gratuita de novo
    }

    var origemLatCelula = parseCoordenada(planilha.getRange(linha, COL_ORIGEM_LAT).getValue());
    var origemLonCelula = parseCoordenada(planilha.getRange(linha, COL_ORIGEM_LON).getValue());

    var origemLat, origemLon;
    if (!isNaN(origemLatCelula) && !isNaN(origemLonCelula)) {
      // Origem preenchida nesta linha: passa a valer para esta e as próximas.
      origemLat = origemLatCelula;
      origemLon = origemLonCelula;
      ultimaOrigemLat = origemLat;
      ultimaOrigemLon = origemLon;
    } else {
      // Origem em branco: reaproveita a última origem preenchida acima.
      origemLat = ultimaOrigemLat;
      origemLon = ultimaOrigemLon;
    }

    var destinoLat = parseCoordenada(planilha.getRange(linha, COL_DESTINO_LAT).getValue());
    var destinoLon = parseCoordenada(planilha.getRange(linha, COL_DESTINO_LON).getValue());

    if (isNaN(destinoLat) || isNaN(destinoLon)) {
      // Linha sem destino preenchido — ignora silenciosamente (pode ser linha em branco no fim da planilha).
      continue;
    }

    if (isNaN(origemLat) || isNaN(origemLon)) {
      planilha.getRange(linha, COL_STATUS).setValue('Erro: nenhuma origem informada (preencha a origem nesta linha ou em uma linha anterior)');
      continue;
    }

    if (!coordenadaValida(origemLat, origemLon) || !coordenadaValida(destinoLat, destinoLon)) {
      planilha.getRange(linha, COL_STATUS).setValue('Erro: latitude/longitude fora do intervalo permitido (lat -90..90, lon -180..180)');
      continue;
    }

    var avisoFora = '';
    if (!dentroDoBrasil(origemLat, origemLon) || !dentroDoBrasil(destinoLat, destinoLon)) {
      avisoFora = ' — aviso: coordenada fora do Brasil, confira se lat/lon não foram invertidas';
    }

    var linhaReta = distanciaLinhaRetaKm(origemLat, origemLon, destinoLat, destinoLon);

    var resultado = consultarRota(chave, origemLat, origemLon, destinoLat, destinoLon);

    if (resultado.erro) {
      planilha.getRange(linha, COL_STATUS).setValue('Erro: ' + resultado.erro);
      continue;
    }

    var razao = linhaReta > 0 ? resultado.distanciaKm / linhaReta : 0;
    var avisoRazao = razao > 3 ? ' — aviso: rota muito maior que linha reta, revise as coordenadas' : '';

    planilha.getRange(linha, COL_DISTANCIA_ROTA).setValue(Math.round(resultado.distanciaKm * 10) / 10);
    planilha.getRange(linha, COL_DISTANCIA_LINHA_RETA).setValue(Math.round(linhaReta * 10) / 10);
    planilha.getRange(linha, COL_TEMPO_ESTIMADO).setValue(formatarTempo(resultado.duracaoSeg));
    planilha.getRange(linha, COL_STATUS).setValue('OK' + avisoFora + avisoRazao);

    // Respeita o limite de requisições por minuto do plano gratuito do ORS.
    Utilities.sleep(1500);
  }

  SpreadsheetApp.getUi().alert('Cálculo concluído.');
}

function consultarRota(chave, origemLat, origemLon, destinoLat, destinoLon) {
  var corpo = {
    coordinates: [
      [origemLon, origemLat],
      [destinoLon, destinoLat]
    ]
  };

  var opcoes = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'Authorization': chave,
      'Accept': 'application/json, application/geo+json'
    },
    payload: JSON.stringify(corpo),
    muteHttpExceptions: true
  };

  var resposta;
  try {
    resposta = UrlFetchApp.fetch(ORS_DIRECTIONS_URL, opcoes);
  } catch (e) {
    return { erro: 'falha de conexão com o serviço de rotas' };
  }

  var codigo = resposta.getResponseCode();
  if (codigo === 401) return { erro: 'chave da API inválida ou expirada' };
  if (codigo === 403) return { erro: 'acesso negado (verifique o limite diário gratuito)' };
  if (codigo === 429) return { erro: 'limite diário de requisições atingido' };
  if (codigo === 404) return { erro: 'nenhuma rota rodoviária encontrada entre os pontos' };
  if (codigo !== 200) return { erro: 'o serviço de rotas retornou o código ' + codigo };

  var dados;
  try {
    dados = JSON.parse(resposta.getContentText());
  } catch (e) {
    return { erro: 'resposta do serviço de rotas não pôde ser interpretada' };
  }

  var resumo;
  if (dados.routes) {
    resumo = dados.routes[0].summary;
  } else if (dados.features) {
    resumo = dados.features[0].properties.summary;
  } else {
    return { erro: 'formato de resposta inesperado' };
  }

  return { distanciaKm: resumo.distance / 1000, duracaoSeg: resumo.duration };
}

function parseCoordenada(valor) {
  if (typeof valor === 'number') return valor;
  if (typeof valor === 'string') return parseFloat(valor.replace(',', '.'));
  return NaN;
}

function coordenadaValida(lat, lon) {
  return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
}

function dentroDoBrasil(lat, lon) {
  return lat >= BRASIL_LAT_MIN && lat <= BRASIL_LAT_MAX && lon >= BRASIL_LON_MIN && lon <= BRASIL_LON_MAX;
}

function distanciaLinhaRetaKm(lat1, lon1, lat2, lon2) {
  var raioTerraKm = 6371.0;
  var dLat = (lat2 - lat1) * Math.PI / 180;
  var dLon = (lon2 - lon1) * Math.PI / 180;
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.asin(Math.sqrt(a));
  return raioTerraKm * c;
}

function formatarTempo(segundos) {
  var horas = Math.floor(segundos / 3600);
  var minutos = Math.floor((segundos % 3600) / 60);
  if (horas > 0) {
    return horas + 'h' + (minutos < 10 ? '0' : '') + minutos + 'min';
  }
  return minutos + 'min';
}
