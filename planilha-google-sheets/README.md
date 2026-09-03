# Calculadora de Distância de Rotas — Google Planilhas

Nada para instalar. Tudo roda dentro do Google Sheets, no navegador.

## Passo a passo

### 1. Crie a planilha
1. Acesse **sheets.google.com** (entre com sua conta Google normal, a mesma do Gmail).
2. Clique em **Planilha em branco**.
3. Na primeira linha (linha 1), digite estes títulos, uma coluna por célula:

   | A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P | Q |
   |---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
   | Rota | Origem Lat | Origem Lon | Destino Lat | Destino Lon | Distância Rota (km) | Distância Linha Reta (km) | Tempo Estimado | Subida (m) | Descida (m) | Status | Ver no Mapa | Distância Total Rota (km) | Distância Total Linha Reta (km) | Tempo Total Estimado | Subida Total (m) | Descida Total (m) |

4. Nas linhas seguintes (2, 3, 4...), preencha as coordenadas de origem e destino que você quer calcular. A coluna **Rota** é o que define o agrupamento: todas as linhas com o mesmo texto nessa coluna (ex.: "Rota 1") são tratadas como a mesma rota.

### Uma origem, vários destinos — agrupados pela coluna "Rota"

Todas as linhas que tiverem **o mesmo texto na coluna Rota** são agrupadas.
Você pode repetir a origem em toda linha do grupo (mais simples de digitar
numa planilha) **ou** preencher só na primeira linha e deixar em branco nas
seguintes — o script reaproveita a última origem preenchida. Os dois jeitos
funcionam. Exemplo com dois grupos:

   | Rota | Origem Lat | Origem Lon | Destino Lat | Destino Lon |
   |---|---|---|---|---|
   | Rota 1 | -19,8449028 | -44,0754105 | -19,9000000 | -44,1000000 |
   | Rota 1 | -19,8449028 | -44,0754105 | -20,0000000 | -44,2000000 |
   | Rota 2 | -22,9068 | -43,1729 | -23,5505 | -46,6333 |
   | Rota 2 |  |  | -22,0000 | -43,5000 |

As colunas F a J (Distância Rota, Distância Linha Reta, Tempo, Subida,
Descida) mostram sempre a perna individual **daquela linha** (A→B, A→C,
A→D, cada uma separada). Já as colunas M a Q (Distância Total Rota, etc.)
mostram o **trajeto único da rota inteira**: origem → destino 1 → destino 2
→ ... → destino N, na ordem em que os destinos aparecem na planilha,
calculado pelo OpenRouteService como uma única viagem contínua — como se
alguém saísse da origem e visitasse os destinos naquela sequência, sem
voltar à origem entre um e outro. É o mesmo valor repetido em todas as
linhas do grupo, já que se trata do total da rota, não de cada perna.

Se a rota tiver só 1 destino, as colunas de total ficam iguais às da perna
(não faz sentido gastar outra consulta à API só para repetir o mesmo
número).

**Importante:** dentro de um mesmo grupo (mesmo texto na coluna Rota), todas
as linhas precisam ter a mesma origem. Se você preencher origens diferentes
com a mesma etiqueta de rota — por exemplo, por engano — o script marca
`Erro: a rota não pode ter mais de uma origem` em todas as linhas daquele
grupo, e não calcula nem gera o link do mapa até você corrigir.

Linhas sem nada na coluna Rota continuam funcionando, mas cada uma vira um
grupo individual (não são agrupadas com outras linhas em branco).

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
3. As colunas de resultado (F a Q) vão sendo preenchidas automaticamente.

## O que aparece nos resultados

**Por perna (cada linha, separadamente):**
- **Distância Rota (km)** — distância real pela estrada daquele trecho.
- **Distância Linha Reta (km)** — distância "em régua" daquele trecho, para comparação.
- **Tempo Estimado** — tempo estimado daquele trecho.
- **Subida (m)** / **Descida (m)** — ganho/perda de elevação daquele trecho.

**Da rota inteira (mesmo valor em todas as linhas do grupo):**
- **Distância Total Rota (km)** — distância pela estrada do trajeto único passando por todos os destinos do grupo, na ordem da planilha.
- **Distância Total Linha Reta (km)** — soma das distâncias em linha reta entre um ponto e o próximo, na mesma ordem.
- **Tempo Total Estimado** — tempo estimado da viagem inteira.
- **Subida Total (m)** / **Descida Total (m)** — ganho/perda de elevação da viagem inteira.

**Comuns:**
- **Status** — `OK` quando deu certo (com avisos ao lado se alguma coordenada parecer suspeita), ou uma mensagem de erro explicando o que aconteceu.
- **Ver no Mapa** — link que abre o Google Maps mostrando a origem e **todos
  os destinos daquele grupo/rota juntos** (não só o destino daquela linha
  específica). Todas as linhas de uma mesma rota levam ao mesmo link. Clique
  direto na célula.

Nem toda rota retorna subida/descida (depende do trecho) — quando isso
acontece, a célula mostra "não disponível" em vez de dar erro.

⚠️ O link do "Ver no Mapa" mostra o trajeto calculado pelo **Google Maps**
passando pelos pontos na ordem em que aparecem na planilha — não é a mesma
rota que o OpenRouteService calculou para preencher as outras colunas (são
dois serviços diferentes, como expliquei lá no início do projeto) e também
não representa "a melhor sequência de visita" — é só uma forma prática de
ver todos os pontos no mapa de uma vez. Use para conferir visualmente se as
coordenadas fazem sentido, não para comparar o número exato de km.
(Limite: até 24 destinos por grupo, por causa de uma restrição do próprio
Google Maps — mais que isso raramente acontece no uso manual.)

## Rodar de novo

Se você adicionar novas linhas depois, pode rodar **Calcular todas as linhas** de novo — linhas que já têm status `OK` são puladas automaticamente, para não gastar a cota gratuita repetindo cálculos que já deram certo.
