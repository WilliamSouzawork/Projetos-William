# Projetos-William
Projetos do Claude

## Calculadora de Distância de Rotas

Duas versões da Fase 1, calculando distância pela estrada (não linha reta)
entre origem e destino informados por latitude/longitude, usando a API
gratuita do [OpenRouteService](https://openrouteservice.org).

### Versão ativa: Google Planilhas (sem instalar nada)

Veja o passo a passo completo em [`planilha-google-sheets/README.md`](planilha-google-sheets/README.md).
Você preenche as coordenadas direto numa planilha do Google e clica num
botão do menu para calcular tudo — funciona só no navegador.

### Versão alternativa: aplicativo web local (Python)

Fica guardada para quando fizer sentido rodar isso como um site de verdade
(fases mais avançadas do projeto). Exige instalar Python.

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
