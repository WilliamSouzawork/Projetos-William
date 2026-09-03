# Calculadora de Distância de Rotas — Google Planilhas

Nada para instalar. Tudo roda dentro do Google Sheets, no navegador.

## Passo a passo

### 1. Crie a planilha
1. Acesse **sheets.google.com** (entre com sua conta Google normal, a mesma do Gmail).
2. Clique em **Planilha em branco**.
3. Na primeira linha (linha 1), digite estes títulos, uma coluna por célula:

   | A | B | C | D | E | F | G | H | I | J | K | L |
   |---|---|---|---|---|---|---|---|---|---|---|---|
   | Rota | Origem Lat | Origem Lon | Destino Lat | Destino Lon | Distância Rota (km) | Distância Linha Reta (km) | Tempo Estimado | Subida (m) | Descida (m) | Status | Ver no Mapa |

4. Nas linhas seguintes (2, 3, 4...), preencha as coordenadas de origem e destino que você quer calcular. A coluna **Rota** é livre — só uma etiqueta para você identificar cada grupo (ex.: "Rota 1", "Rota 2"), não influencia o cálculo.

### Uma origem, vários destinos — e várias "rotas" separadas

Você **não precisa repetir a origem em toda linha**. Preencha a origem só na
primeira linha de cada grupo e deixe as células de origem em branco nas
linhas seguintes — o script reaproveita automaticamente a última origem
preenchida acima. Isso vale também para o que você chamou de "Rota 1",
"Rota 2": cada uma é só um novo grupo, que começa quando você preenche uma
origem nova. Exemplo com dois grupos:

   | Rota | Origem Lat | Origem Lon | Destino Lat | Destino Lon |
   |---|---|---|---|---|
   | Rota 1 | -19,8449028 | -44,0754105 | -19,9000000 | -44,1000000 |
   | Rota 1 |  |  | -20,0000000 | -44,2000000 |
   | Rota 2 | -22,9068 | -43,1729 | -23,5505 | -46,6333 |
   | Rota 2 |  |  | -22,0000 | -43,5000 |

Isso calcula, para cada grupo, a distância de **cada destino separadamente a
partir da mesma origem** (A→B, A→C) — não é a rota que passa por todos em
sequência (essa é outra funcionalidade, para uma fase futura). A "Rota 2"
troca de origem porque a linha 4 tem uma origem nova preenchida; a partir
dali, as linhas seguintes reaproveitam essa nova origem, até você trocar de
novo.

### 2. Cole o código do sistema
1. No menu da planilha, clique em **Extensões** → **Apps Script**. Vai abrir uma nova aba.
2. Vai aparecer um editor de código com um arquivo `Code.gs` já aberto, com um texto padrão (`function myFunction() {}`). **Apague todo esse conteúdo.**
3. Abra o arquivo [`Code.gs`](Code.gs) deste repositório, copie todo o conteúdo dele, e cole no editor do Apps Script (onde você apagou o texto padrão).
4. Clique no ícone de **disquete (Salvar)** no topo do editor, ou aperte `Ctrl+S`.
5. Feche essa aba e volte para a aba da sua planilha.

### 3. Autorize o script (só na primeira vez)
1. **Feche e abra a planilha de novo** (recarregue a página). Vai aparecer um novo item no menu chamado **"Calculadora de Rotas"**.
2. Clique em **Calculadora de Rotas** → **Calcular todas as linhas**.
3. O Google vai pedir autorização (porque o script precisa acessar a internet para consultar as rotas). Clique em **Continuar**, escolha sua conta, e depois em **Avançado** → **Acessar [nome do projeto] (não seguro)** → **Permitir**.
   - Essa tela de aviso aparece porque o script não foi verificado pelo Google (é normal para scripts pessoais). Como você mesmo colou o código e sabe o que ele faz, pode autorizar sem problema.

### 4. Configure sua chave da API
1. Clique em **Calculadora de Rotas** → **Configurar chave da API**.
2. Cole a chave gratuita que você gerou em openrouteservice.org e clique em OK.
   Isso só precisa ser feito uma vez — a chave fica salva no script, não numa célula visível da planilha.

### 5. Calcule
1. Clique em **Calculadora de Rotas** → **Calcular todas as linhas**.
2. Aguarde — o script consulta uma linha por vez (com uma pequena pausa entre cada uma, para respeitar o limite gratuito do serviço).
3. As colunas de resultado (F a L) vão sendo preenchidas automaticamente.

## O que aparece nos resultados

- **Distância Rota (km)** — distância real pela estrada.
- **Distância Linha Reta (km)** — distância "em régua", para comparação.
- **Tempo Estimado** — tempo estimado de viagem.
- **Subida (m)** — soma de toda a subida ao longo da rota (ganho de elevação total).
- **Descida (m)** — soma de toda a descida ao longo da rota.
- **Status** — `OK` quando deu certo (com avisos ao lado se alguma coordenada parecer suspeita), ou uma mensagem de erro explicando o que aconteceu.
- **Ver no Mapa** — link que abre o Google Maps com a rota entre a origem e o destino daquela linha. Clique direto na célula.

Nem toda rota retorna subida/descida (depende do trecho) — quando isso
acontece, a célula mostra "não disponível" em vez de dar erro.

⚠️ O link do "Ver no Mapa" abre a rota calculada pelo **Google Maps**, não a
mesma rota que o OpenRouteService calculou para preencher as outras colunas
— são dois serviços diferentes (como expliquei lá no início do projeto, isso
é normal e pode gerar pequenas diferenças). Use o link para conferir
visualmente se origem e destino fazem sentido, não para comparar o número
exato de km.

## Rodar de novo

Se você adicionar novas linhas depois, pode rodar **Calcular todas as linhas** de novo — linhas que já têm status `OK` são puladas automaticamente, para não gastar a cota gratuita repetindo cálculos que já deram certo.
