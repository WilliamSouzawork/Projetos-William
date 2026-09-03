import math
import os

import requests
from dotenv import load_dotenv
from flask import Flask, render_template, request

load_dotenv()

ORS_API_KEY = os.environ.get("ORS_API_KEY")
ORS_DIRECTIONS_URL = "https://api.openrouteservice.org/v2/directions/driving-car"

# Bounding box aproximado do território brasileiro, usado para detectar
# coordenadas fora do país (ex.: latitude/longitude invertidas por engano).
BRASIL_LAT_MIN, BRASIL_LAT_MAX = -34.0, 5.5
BRASIL_LON_MIN, BRASIL_LON_MAX = -74.0, -32.0

app = Flask(__name__)


def distancia_linha_reta_km(lat1, lon1, lat2, lon2):
    raio_terra_km = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2
    )
    c = 2 * math.asin(math.sqrt(a))
    return raio_terra_km * c


def coordenada_dentro_do_brasil(lat, lon):
    return BRASIL_LAT_MIN <= lat <= BRASIL_LAT_MAX and BRASIL_LON_MIN <= lon <= BRASIL_LON_MAX


def formatar_tempo(segundos):
    horas = int(segundos // 3600)
    minutos = int((segundos % 3600) // 60)
    if horas > 0:
        return f"{horas}h{minutos:02d}min"
    return f"{minutos}min"


def consultar_rota(origem_lat, origem_lon, destino_lat, destino_lon):
    if not ORS_API_KEY:
        return None, "Chave da API não configurada. Verifique o arquivo .env."

    headers = {
        "Authorization": ORS_API_KEY,
        "Content-Type": "application/json",
        "Accept": "application/json, application/geo+json",
    }
    # ORS espera as coordenadas como [longitude, latitude] — ordem invertida
    # em relação a como as pessoas normalmente informam (latitude, longitude).
    corpo = {
        "coordinates": [
            [origem_lon, origem_lat],
            [destino_lon, destino_lat],
        ]
    }

    try:
        resposta = requests.post(ORS_DIRECTIONS_URL, json=corpo, headers=headers, timeout=20)
    except requests.exceptions.RequestException:
        return None, "Não foi possível conectar ao serviço de rotas. Verifique sua internet e tente novamente."

    if resposta.status_code == 401:
        return None, "Chave da API inválida ou expirada."
    if resposta.status_code == 403:
        return None, "Acesso negado pelo serviço de rotas (verifique o limite diário gratuito)."
    if resposta.status_code == 429:
        return None, "Limite de requisições do dia foi atingido. Tente novamente amanhã."
    if resposta.status_code == 404:
        return None, "Não foi encontrada uma rota rodoviária entre os pontos informados."
    if resposta.status_code != 200:
        return None, f"O serviço de rotas retornou um erro inesperado (código {resposta.status_code})."

    dados = resposta.json()

    try:
        if "routes" in dados:
            resumo = dados["routes"][0]["summary"]
        else:
            resumo = dados["features"][0]["properties"]["summary"]
        distancia_km = resumo["distance"] / 1000.0
        duracao_seg = resumo["duration"]
    except (KeyError, IndexError):
        return None, "Não foi possível interpretar a resposta do serviço de rotas."

    return {"distancia_km": distancia_km, "duracao_seg": duracao_seg}, None


@app.route("/", methods=["GET"])
def index():
    return render_template("index.html")


@app.route("/calcular", methods=["POST"])
def calcular():
    avisos = []
    erro = None
    resultado = None

    try:
        origem_lat = float(request.form["origem_lat"].replace(",", "."))
        origem_lon = float(request.form["origem_lon"].replace(",", "."))
        destino_lat = float(request.form["destino_lat"].replace(",", "."))
        destino_lon = float(request.form["destino_lon"].replace(",", "."))
    except (ValueError, KeyError):
        return render_template(
            "index.html",
            erro="Coordenadas inválidas. Use números como -19,8449028.",
        )

    if not (-90 <= origem_lat <= 90) or not (-90 <= destino_lat <= 90):
        return render_template(
            "index.html",
            erro="Latitude inválida — o valor deve estar entre -90 e 90. Confira se latitude e longitude não foram trocadas.",
        )
    if not (-180 <= origem_lon <= 180) or not (-180 <= destino_lon <= 180):
        return render_template(
            "index.html",
            erro="Longitude inválida — o valor deve estar entre -180 e 180. Confira se latitude e longitude não foram trocadas.",
        )

    if not coordenada_dentro_do_brasil(origem_lat, origem_lon):
        avisos.append("⚠️ A origem parece estar fora do Brasil. Confira se latitude e longitude não foram invertidas.")
    if not coordenada_dentro_do_brasil(destino_lat, destino_lon):
        avisos.append("⚠️ O destino parece estar fora do Brasil. Confira se latitude e longitude não foram invertidas.")

    linha_reta_km = distancia_linha_reta_km(origem_lat, origem_lon, destino_lat, destino_lon)

    dados_rota, erro = consultar_rota(origem_lat, origem_lon, destino_lat, destino_lon)

    if erro:
        return render_template("index.html", erro=erro, avisos=avisos)

    razao = dados_rota["distancia_km"] / linha_reta_km if linha_reta_km > 0 else 0
    if razao > 3:
        avisos.append(
            "⚠️ A distância pela rota está muito maior que a distância em linha reta. "
            "Revise as coordenadas antes de usar o resultado."
        )

    resultado = {
        "origem_lat": origem_lat,
        "origem_lon": origem_lon,
        "destino_lat": destino_lat,
        "destino_lon": destino_lon,
        "distancia_rota_km": round(dados_rota["distancia_km"], 1),
        "distancia_linha_reta_km": round(linha_reta_km, 1),
        "tempo_estimado": formatar_tempo(dados_rota["duracao_seg"]),
    }

    return render_template("index.html", resultado=resultado, avisos=avisos)


if __name__ == "__main__":
    app.run(debug=True)
