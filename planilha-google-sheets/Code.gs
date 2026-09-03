// Calculadora de Distância de Rotas — versão Google Sheets
// Fase 1 (adaptada): origem e destino por coordenadas, direto na planilha.

var ORS_DIRECTIONS_URL = 'https://api.openrouteservice.org/v2/directions/driving-car';
var PROPRIEDADE_CHAVE_API = 'ORS_API_KEY';

// Bounding box aproximado do território brasileiro.
var BRASIL_LAT_MIN = -34.0, BRASIL_LAT_MAX = 5.5;
var BRASIL_LON_MIN = -74.0, BRASIL_LON_MAX = -32.0;

var COL_ROTA = 1;         // A (etiqueta livre, ex: "Rota 1" — só para leitura, não afeta o cálculo)
var COL_ORIGEM_LAT = 2;   // B
var COL_ORIGEM_LON = 3;   // C
var COL_DESTINO_LAT = 4;  // D
var COL_DESTINO_LON = 5;  // E
var COL_DISTANCIA_ROTA = 6;    // F
var COL_DISTANCIA_LINHA_RETA = 7; // G
var COL_TEMPO_ESTIMADO = 8;    // H
var COL_SUBIDA = 9;            // I
var COL_DESCIDA = 10;          // J
var COL_STATUS = 11;           // K
var COL_MAPA = 12;             // L

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

  // --- Passo 1: ler todas as linhas e resolver a origem de cada uma ---
  // Se a célula de origem estiver em branco, reaproveita a última origem
  // preenchida acima (permite "uma origem, vários destinos" sem repetir).
  var ultimaOrigemLat = NaN;
  var ultimaOrigemLon = NaN;
  var infoLinhas = [];

  for (var linha = 2; linha <= ultimaLinha; linha++) {
    var rotaLabel = String(planilha.getRange(linha, COL_ROTA).getValue()).trim();
    var origemLatCelula = parseCoordenada(planilha.getRange(linha, COL_ORIGEM_LAT).getValue());
    var origemLonCelula = parseCoordenada(planilha.getRange(linha, COL_ORIGEM_LON).getValue());

    var origemLat, origemLon;
    if (!isNaN(origemLatCelula) && !isNaN(origemLonCelula)) {
      origemLat = origemLatCelula;
      origemLon = origemLonCelula;
      ultimaOrigemLat = origemLat;
      ultimaOrigemLon = origemLon;
    } else {
      origemLat = ultimaOrigemLat;
      origemLon = ultimaOrigemLon;
    }

    var destinoLat = parseCoordenada(planilha.getRange(linha, COL_DESTINO_LAT).getValue());
    var destinoLon = parseCoordenada(planilha.getRange(linha, COL_DESTINO_LON).getValue());

    infoLinhas.push({
      linha: linha,
      rotaLabel: rotaLabel,
      origemLat: origemLat,
      origemLon: origemLon,
      destinoLat: destinoLat,
      destinoLon: destinoLon
    });
  }

  // --- Passo 2: agrupar pelo texto da coluna "Rota" ---
  // Linhas sem rótulo viram cada uma seu próprio grupo (não são agrupadas
  // entre si, para não misturar rotas que o usuário não identificou).
  var gruposPorChave = {};
  var ordemChaves = [];

  infoLinhas.forEach(function(info) {
    var chave = info.rotaLabel !== '' ? ('rota:' + info.rotaLabel) : ('linha:' + info.linha);
    if (!gruposPorChave[chave]) {
      gruposPorChave[chave] = [];
      ordemChaves.push(chave);
    }
    gruposPorChave[chave].push(info);
  });

  // --- Passo 3: calcular cada grupo ---
  ordemChaves.forEach(function(chaveGrupo) {
    var linhasDoGrupo = gruposPorChave[chaveGrupo];

    // Todas as origens preenchidas/resolvidas no grupo precisam ser a mesma.
    var origensDoGrupo = linhasDoGrupo
      .filter(function(info) { return !isNaN(info.origemLat) && !isNaN(info.origemLon); })
      .map(function(info) { return info.origemLat.toFixed(6) + ',' + info.origemLon.toFixed(6); });
    var origensUnicas = origensDoGrupo.filter(function(v, i, arr) { return arr.indexOf(v) === i; });

    if (origensUnicas.length > 1) {
      linhasDoGrupo.forEach(function(info) {
        planilha.getRange(info.linha, COL_STATUS).setValue('Erro: a rota não pode ter mais de uma origem');
        planilha.getRange(info.linha, COL_MAPA).setValue('');
      });
      return;
    }

    var origemGrupo = null;
    var membrosMapa = [];

    linhasDoGrupo.forEach(function(info) {
      var linha = info.linha, origemLat = info.origemLat, origemLon = info.origemLon,
        destinoLat = info.destinoLat, destinoLon = info.destinoLon;

      if (isNaN(destinoLat) || isNaN(destinoLon)) {
        return; // linha em branco — ignora
      }

      if (isNaN(origemLat) || isNaN(origemLon)) {
        planilha.getRange(linha, COL_STATUS).setValue('Erro: nenhuma origem informada (preencha a origem nesta linha ou em uma linha anterior)');
        return;
      }

      if (!coordenadaValida(origemLat, origemLon) || !coordenadaValida(destinoLat, destinoLon)) {
        planilha.getRange(linha, COL_STATUS).setValue('Erro: latitude/longitude fora do intervalo permitido (lat -90..90, lon -180..180)');
        return;
      }

      origemGrupo = { lat: origemLat, lon: origemLon };
      membrosMapa.push({ linha: linha, destinoLat: destinoLat, destinoLon: destinoLon });

      var statusAtual = planilha.getRange(linha, COL_STATUS).getValue();
      if (statusAtual === 'OK') {
        return; // já calculado antes — evita gastar a cota gratuita de novo
      }

      var avisoFora = '';
      if (!dentroDoBrasil(origemLat, origemLon) || !dentroDoBrasil(destinoLat, destinoLon)) {
        avisoFora = ' — aviso: coordenada fora do Brasil, confira se lat/lon não foram invertidas';
      }

      var linhaReta = distanciaLinhaRetaKm(origemLat, origemLon, destinoLat, destinoLon);
      var resultado = consultarRota(chave, origemLat, origemLon, destinoLat, destinoLon);

      if (resultado.erro) {
        planilha.getRange(linha, COL_STATUS).setValue('Erro: ' + resultado.erro);
        return;
      }

      var razao = linhaReta > 0 ? resultado.distanciaKm / linhaReta : 0;
      var avisoRazao = razao > 3 ? ' — aviso: rota muito maior que linha reta, revise as coordenadas' : '';

      planilha.getRange(linha, COL_DISTANCIA_ROTA).setValue(Math.round(resultado.distanciaKm * 10) / 10);
      planilha.getRange(linha, COL_DISTANCIA_LINHA_RETA).setValue(Math.round(linhaReta * 10) / 10);
      planilha.getRange(linha, COL_TEMPO_ESTIMADO).setValue(formatarTempo(resultado.duracaoSeg));
      planilha.getRange(linha, COL_SUBIDA).setValue(resultado.subidaM != null ? Math.round(resultado.subidaM) : 'não disponível');
      planilha.getRange(linha, COL_DESCIDA).setValue(resultado.descidaM != null ? Math.round(resultado.descidaM) : 'não disponível');
      planilha.getRange(linha, COL_STATUS).setValue('OK' + avisoFora + avisoRazao);

      // Respeita o limite de requisições por minuto do plano gratuito do ORS.
      Utilities.sleep(1500);
    });

    if (origemGrupo && membrosMapa.length > 0) {
      var destinos = membrosMapa.map(function(m) {
        return { lat: m.destinoLat, lon: m.destinoLon };
      });
      var link = linkGoogleMapsMultiplo(origemGrupo.lat, origemGrupo.lon, destinos);
      membrosMapa.forEach(function(m) {
        planilha.getRange(m.linha, COL_MAPA).setValue(link);
      });
    }
  });

  SpreadsheetApp.getUi().alert('Cálculo concluído.');
}

function consultarRota(chave, origemLat, origemLon, destinoLat, destinoLon) {
  var corpo = {
    coordinates: [
      [origemLon, origemLat],
      [destinoLon, destinoLat]
    ],
    elevation: true
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

  return {
    distanciaKm: resumo.distance / 1000,
    duracaoSeg: resumo.duration,
    // Nem sempre o serviço devolve subida/descida (depende da rota) —
    // por isso tratamos como "não disponível" em vez de dar erro.
    subidaM: (typeof resumo.ascent === 'number') ? resumo.ascent : null,
    descidaM: (typeof resumo.descent === 'number') ? resumo.descent : null
  };
}

function linkGoogleMapsMultiplo(origemLat, origemLon, destinos) {
  // Link público do Google Maps, sem precisar de chave de API — abre a
  // origem e todos os destinos do grupo juntos no mapa (útil para
  // conferência visual; pode não ser idêntica à rota calculada pelo
  // OpenRouteService, que é quem gera os números de distância/tempo).
  //
  // O Google Maps aceita no máximo 25 pontos numa mesma URL (origem +
  // destino final + até 23 paradas no meio). Se houver mais destinos que
  // isso, usamos só os 24 primeiros para não gerar um link quebrado.
  var limitados = destinos.slice(0, 24);
  var ultimo = limitados[limitados.length - 1];
  var paradas = limitados.slice(0, -1);

  var url = 'https://www.google.com/maps/dir/?api=1' +
    '&origin=' + origemLat + ',' + origemLon +
    '&destination=' + ultimo.lat + ',' + ultimo.lon;

  if (paradas.length > 0) {
    var pontos = paradas.map(function(p) { return p.lat + ',' + p.lon; }).join('|');
    url += '&waypoints=' + encodeURIComponent(pontos);
  }

  return url + '&travelmode=driving';
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
