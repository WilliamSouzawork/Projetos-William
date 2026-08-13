# Architecture Analysis

**Analysis Date:** 2026-08-13

## Visão Geral do Padrão

O padrão típico para dashboards de BI de pequeno/médio porte alimentados por planilha é conhecido informalmente como **"Spreadsheet-as-Source, Star Schema-in-BI"** (ou, em ambientes Power BI, "planilha padronizada + modelo estrela + camada DAX"). É a arquitetura dominante para operações que:

- Não têm banco de dados transacional acessível como fonte confiável;
- Têm volume de dados baixo/médio (dezenas de milhares de linhas, não milhões);
- Precisam de um caminho rápido entre "dado bruto" e "decisão", sem equipe de engenharia de dados dedicada;
- São mantidas por uma pessoa ou um pequeno grupo (não uma equipe de TI/BI formal).

Características principais:

1. **Separação de responsabilidades por camada**: a planilha é responsável por *captura e input* de dado bruto; o BI é responsável por *modelagem, cálculo e apresentação*. Essa fronteira é a decisão arquitetural mais importante do padrão — violá-la (ex.: fazer cálculos complexos na planilha, ou tentar "limpar dado sujo" dentro do DAX) é a causa mais comum de dashboards frágeis.
2. **Planilha como "banco de dados de entrada" estruturado, não como relatório**: a planilha de origem não deve conter fórmulas de agregação, células mescladas, cabeçalhos duplicados ou abas de "resumo" — ela deve se parecer com uma tabela de banco de dados (uma linha = um evento/registro, colunas fixas, tipos consistentes).
3. **Modelo estrela (star schema) dentro do Power BI**: tabelas fato (viagens, ocorrências, abastecimentos, manutenções) ligadas a tabelas dimensão (veículo, motorista, rota/cliente, calendário/data). Isso é o que permite que os indicadores sejam calculados de forma consistente e que o dashboard escale para novas perguntas sem redesenho.
4. **Camada de medidas (DAX) desacoplada da visualização**: os indicadores (KPIs) são definidos como medidas centralizadas, não como cálculos "soltos" em cada visual. Isso garante que o mesmo indicador (ex.: "SLA de entrega") tenha exatamente uma definição, usada em todos os painéis.
5. **Atualização por lote (batch), não em tempo real**: como a fonte é manual, o padrão assume ciclos de atualização periódicos (diário/semanal), não streaming. Isso é uma decisão consciente, não uma limitação a esconder — deve ser comunicada no dashboard (ex.: "dados atualizados até DD/MM").
6. **Crescimento incremental por indicador**: dado que a origem é manual e sujeita a erro, o padrão de sucesso é validar um indicador de ponta a ponta (planilha → modelo → medida → visual) antes de escalar para os demais, em vez de construir toda a estrutura de dados de uma vez e só depois testar os cálculos.

Esse padrão é essencialmente uma versão "leve" de um pipeline de ETL/BI corporativo (Extract-Transform-Load → Modelagem Dimensional → Semantic Layer → Visualização), comprimido para caber em uma única ferramenta (Power BI, via Power Query + modelo tabular + DAX) e uma fonte de entrada manual.

---

## Camadas

### Camada 1 — Planilhas de Entrada (Captura de Dado Bruto)

- **Propósito**: registrar o evento operacional no momento em que ele acontece (uma viagem concluída, um abastecimento, uma ocorrência, uma manutenção), da forma mais simples e menos ambígua possível.
- **Onde vive**: Excel ou Google Sheets, controlado pela operação (quem já preenche essas planilhas hoje).
- **Do que depende**: do processo humano de preenchimento — disciplina de digitação, padronização de nomes (mesmo veículo/motorista sempre escrito da mesma forma), e frequência de atualização definida.
- **Quem usa**: a equipe operacional que já alimenta as planilhas hoje (não o gestor final). O gestor não interage com esta camada.
- **Regra de design chave**: cada planilha/aba deve representar uma **tabela fato** ou **tabela dimensão** em formato "longo" (uma linha por evento), nunca um "relatório" pré-formatado. Evitar: células mescladas, múltiplos cabeçalhos, totais no meio da tabela, abas com resumos manuais. Cada coluna deve ter um tipo de dado único e consistente (texto ou número ou data — nunca misturado).
- **Recomendação prática**: usar uma pasta de trabalho (ou pasta de arquivos) por tipo de dado — ex.: `viagens.xlsx`, `abastecimentos.xlsx`, `ocorrencias.xlsx`, `manutencoes.xlsx` — com uma tabela nomeada (Excel Table) em cada uma, e uma aba separada de "dimensões" (cadastro de veículos, motoristas, rotas/clientes) que muda pouco.

### Camada 2 — Ingestão e Transformação (Power Query)

- **Propósito**: conectar às planilhas de origem, limpar, padronizar tipos, tratar duplicidades/erros de digitação, e transformar o dado bruto em tabelas prontas para modelagem — sem alterar a planilha original.
- **Onde vive**: dentro do próprio arquivo Power BI (.pbix), na camada Power Query (Editor de Consultas / "Transformar Dados").
- **Do que depende**: da Camada 1 (estrutura estável das planilhas de entrada). Qualquer mudança de layout na planilha de origem pode quebrar essa camada — por isso a padronização da Camada 1 é crítica.
- **Quem usa**: exclusivamente quem constrói/mantém o modelo (o próprio Willian ou quem herdar a manutenção). O gestor final não vê esta camada.
- **Responsabilidades típicas desta camada**: remover linhas em branco, corrigir tipos de dados (datas, números), padronizar texto (maiúsculas/minúsculas, espaços), criar colunas calculadas simples (ex.: duração = hora_chegada − hora_saída), unpivot de tabelas que vieram "largas", e — importante — **não** fazer aqui cálculos de indicador de negócio (isso fica na camada de medidas).

### Camada 3 — Modelo de Dados (Esquema Estrela)

- **Propósito**: organizar as tabelas transformadas em um modelo relacional que permita cruzar qualquer fato com qualquer dimensão de forma consistente (ex.: "custo por km" filtrado por veículo, por mês, por cliente, simultaneamente).
- **Onde vive**: na aba "Modelo" do Power BI, definindo relacionamentos entre tabelas.
- **Do que depende**: da Camada 2 (tabelas já limpas). Estrutura típica:
  - **Tabelas fato** (uma linha por evento, crescem ao longo do tempo): `Fato_Viagens`, `Fato_Ocorrencias`, `Fato_Abastecimentos`, `Fato_Manutencoes`.
  - **Tabelas dimensão** (crescem pouco, descrevem "quem/o quê"): `Dim_Veiculo`, `Dim_Motorista`, `Dim_Cliente_Rota`, `Dim_Calendario` (tabela de datas, essencial para qualquer análise temporal e comparação de períodos).
  - Relacionamentos sempre de dimensão (lado "1") para fato (lado "muitos"), evitando relacionamentos muitos-para-muitos quando possível.
- **Quem usa**: quem constrói o modelo. É invisível para o usuário final, mas é o que determina se os indicadores vão "bater" corretamente.

### Camada 4 — Medidas (DAX / Camada Semântica)

- **Propósito**: definir cada indicador de negócio (KPI) como uma fórmula centralizada e reutilizável, desacoplada de qualquer visual específico.
- **Onde vive**: como "Measures" no modelo Power BI, tipicamente organizadas em uma tabela dedicada (ex.: `_Medidas`) para facilitar manutenção.
- **Do que depende**: da Camada 3 (modelo estrela correto). Uma medida mal definida sobre um modelo mal relacionado produz números errados silenciosamente — por isso o modelo precisa estar validado antes de escalar as medidas.
- **Quem usa**: quem constrói o dashboard define; o gestor final consome o resultado (o número/gráfico), não a fórmula.
- **Exemplos** (alinhados às categorias do PROJECT.md): `SLA de Entrega %`, `Tempo Médio de Parada`, `Disponibilidade de Frota %`, `Custo por Km`, `Margem por Rota`, `Taxa de Acidentes`. Cada uma é uma medida DAX única, reaproveitada em todos os visuais onde aparece.

### Camada 5 — Visualização (Dashboard/Relatório)

- **Propósito**: apresentar os indicadores de forma que o gestor tome decisões rapidamente, com filtros (segmentações) por período, veículo, rota/cliente etc.
- **Onde vive**: nas páginas de relatório do Power BI (.pbix), publicadas no Power BI Service se houver necessidade de acesso web/mobile, ou consumidas localmente via Power BI Desktop.
- **Do que depende**: das Camadas 3 e 4 (modelo + medidas prontos). Esta camada não deveria conter lógica de cálculo — apenas exibição.
- **Quem usa**: o gestor/direção — usuário final único deste projeto (uso próprio, conforme PROJECT.md).
- **Recomendação prática**: organizar por página conforme as 4 categorias de indicadores do projeto (Operacional, Frota, Financeiro, Segurança), com uma página inicial de resumo executivo (visão geral) e filtros globais de período/veículo/rota aplicados em todas as páginas.

---

## Fluxo de Dados

Passo a passo, do evento operacional até o painel:

1. **Evento acontece na operação** (uma viagem é concluída, um veículo abastece, ocorre uma ocorrência/atraso, um veículo entra em manutenção).
2. **Registro manual na planilha padronizada correspondente** (Camada 1) — a operação preenche uma nova linha na tabela de viagens/ocorrências/abastecimentos/manutenções, seguindo o formato fixo (colunas e tipos definidos).
3. **Atualização ("Refresh") do Power BI** — o Power BI se conecta às planilhas de origem e reprocessa os dados via Power Query (Camada 2): limpa, padroniza, aplica transformações. Isso pode ser feito manualmente ("Atualizar" no Power BI Desktop) ou agendado (Power BI Service, se houver licença/gateway configurado).
4. **Recarga do modelo de dados** (Camada 3) — as tabelas fato e dimensão são atualizadas com as novas linhas; os relacionamentos permanecem os mesmos (a estrutura do modelo não muda a cada atualização, só o volume de dados).
5. **Recalculo das medidas** (Camada 4) — o motor DAX do Power BI recalcula automaticamente todos os indicadores com base nos dados atualizados; isso é automático e não requer intervenção manual, desde que o modelo e as medidas estejam corretos.
6. **Dashboard reflete os novos números** (Camada 5) — o gestor abre o Power BI (Desktop ou Service) e vê os indicadores já atualizados, com os filtros de período/veículo/rota disponíveis para explorar o dado.

**Frequência**: como a fonte é manual, o fluxo tipicamente roda em ciclo diário ou semanal — não em tempo real. A frequência ideal depende de quão rápido a operação consegue preencher as planilhas de forma confiável; começar com um ciclo mais espaçado (semanal) e apertar para diário conforme o processo de preenchimento amadurece é a abordagem mais segura para evitar dados incompletos no painel.

---

## Ordem de Construção Sugerida

A abordagem mais robusta para este tipo de projeto é **construir um indicador de ponta a ponta antes de escalar para os demais** — validando o caminho completo (planilha → Power Query → modelo → medida → visual) com um único KPI simples, ao invés de montar toda a base de dados primeiro e só depois testar os cálculos. Isso expõe cedo os problemas mais caros de corrigir depois (estrutura de planilha errada, relacionamento de modelo errado).

Sequência recomendada:

1. **Definir e padronizar a estrutura da(s) planilha(s) de entrada primeiro.** Antes de abrir o Power BI, desenhar no papel/planilha quais colunas cada tabela fato/dimensão vai ter, decidir os campos-chave (ex.: placa do veículo, CPF/matrícula do motorista, código da rota) que vão conectar as tabelas. Erros de estrutura de planilha descobertos tarde custam retrabalho em todas as camadas acima.
2. **Escolher um único indicador simples e de alto valor como piloto** (ex.: "Disponibilidade de Frota %" ou "Custo por Km" — indicadores com poucas dependências de dado). Levar esse indicador de ponta a ponta: planilha real (mesmo que com poucos dados de teste) → conexão no Power Query → tabela fato/dimensão mínima → medida DAX → um visual simples. Isso valida a arquitetura inteira em miniatura.
3. **Construir as tabelas dimensão compartilhadas** (`Dim_Veiculo`, `Dim_Motorista`, `Dim_Cliente_Rota`, `Dim_Calendario`) — elas são reaproveitadas por todos os indicadores subsequentes, então vale estabilizá-las cedo, depois do piloto validar a abordagem.
4. **Adicionar as tabelas fato restantes uma de cada vez**, seguindo a ordem de prioridade de negócio (sugestão, alinhada às categorias do PROJECT.md: Operacional → Frota → Financeiro → Segurança, mas ajustar conforme o que o gestor mais precisa ver primeiro). Para cada tabela fato nova: planilha → Power Query → modelo → medidas daquela categoria → visual.
5. **Construir as medidas de cada categoria junto com a tabela fato correspondente**, não todas de uma vez no final — assim cada bloco de indicadores é testado com dado real antes de avançar.
6. **Montar a visualização final por último**, quando as medidas já estiverem validadas — organizar as páginas do dashboard, aplicar filtros globais, formatação, e a página de resumo executivo.
7. **Formalizar o processo de atualização** (manual ou agendada) só depois que a estrutura estiver estável — não vale a pena automatizar atualização de um modelo que ainda está mudando de formato.

Regra geral: **estrutura de dado (planilha) antes de modelo; modelo antes de medida; medida antes de visual; um indicador completo antes do próximo.**

---

## Atualização e Manutenção

- **Atualização manual (Power BI Desktop)**: o usuário abre o arquivo .pbix e clica em "Atualizar". Simples, sem custo de licença adicional, mas depende de alguém lembrar de fazer isso e ter o arquivo de planilha acessível localmente. Adequado para o estágio inicial do projeto (uso próprio, gestor único) e para ciclos de atualização espaçados (semanal).
- **Atualização agendada (Power BI Service)**: requer publicar o relatório no Power BI Service (nuvem) e configurar um "gateway" se as planilhas estiverem em arquivo local, ou usar planilhas no OneDrive/SharePoint/Google Sheets (via conector) para agendamento nativo sem gateway. Permite definir horários fixos de atualização (ex.: toda manhã às 7h) e o gestor sempre vê o dado já atualizado sem precisar abrir o Desktop. Requer licença Power BI Pro (ou capacidade Premium) dependendo do modo de compartilhamento — a ser validado conforme o orçamento/licenciamento disponível.
- **Comunicar a data da última atualização no próprio dashboard**: como o ciclo é em lote (não tempo real), é uma boa prática incluir um indicador visual (ex.: "Dados atualizados até: DD/MM/AAAA") na página principal, para que o gestor saiba a defasagem dos números que está vendo.
- **Manutenção da estrutura ao longo do tempo**:
  - Mudanças na planilha de origem (nova coluna, renomear campo) exigem revisão da Camada 2 (Power Query) — por isso a estrutura da planilha deve ser tratada como um "contrato" estável, com mudanças raras e deliberadas, não ad-hoc.
  - Erros de digitação nas dimensões (ex.: nome de motorista escrito de formas diferentes) são a causa mais comum de indicadores errados neste tipo de arquitetura — vale considerar listas suspensas/validação de dados na própria planilha de entrada para reduzir esse risco na origem, em vez de tentar corrigir tudo via Power Query.
  - Novos indicadores devem seguir a mesma disciplina da ordem de construção: garantir que o dado de origem existe e está limpo, adicionar/ajustar tabela fato se necessário, criar a medida, só depois adicionar ao visual.
  - Revisão periódica do modelo (ex.: trimestral) para identificar medidas obsoletas, tabelas não usadas, ou oportunidades de simplificação, evitando que o modelo cresça de forma desorganizada.
