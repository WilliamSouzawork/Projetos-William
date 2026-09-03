# Projetos-William
Projetos do Claude

## Calculadora de Distância de Rotas — Fase 1

Aplicativo web simples que calcula a distância pela estrada entre uma origem
e um destino informados por latitude/longitude, usando a API gratuita do
[OpenRouteService](https://openrouteservice.org).

### Como rodar no seu computador

1. Instale o [Python](https://www.python.org/downloads/) (versão 3.9 ou mais recente).
2. Baixe/clone este repositório no seu computador.
3. Abra um terminal na pasta do projeto e instale as dependências:
   ```
   pip install -r requirements.txt
   ```
4. Crie um arquivo chamado `.env` na pasta do projeto (copie o `.env.example`
   e renomeie) e cole sua chave gratuita do OpenRouteService:
   ```
   ORS_API_KEY=sua_chave_aqui
   ```
5. Rode o aplicativo:
   ```
   python app.py
   ```
6. Abra o navegador em `http://127.0.0.1:5000`.

O arquivo `.env` nunca é enviado ao Git — ele fica só no seu computador.
