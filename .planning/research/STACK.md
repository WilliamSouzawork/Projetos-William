# Technology Stack

**Analysis Date:** 2026-08-13

## Contexto considerado

Transportadora de cargas rodoviárias, frota de 20-100 veículos, sem TMS/rastreamento integrado — a fonte de dados hoje é planilha manual (Excel/Google Sheets). Uso é de um único gestor (não multiusuário, não precisa distribuir para equipe). Prioridade: rapidez de implantação, baixo custo, manutenção simples por alguém pouco técnico.

Esse recorte muda a recomendação em relação a uma Torre de Controle de grande porte: aqui não se justifica ETL robusto, banco de dados dedicado, nem licenciamento corporativo. A stack precisa caber no bolso e na rotina de uma operação de médio porte.

---

## Ferramenta de BI

**Recomendação principal: Power BI Desktop (gratuito) + Power BI Service em "Meu workspace" (gratuito, sem licença Pro).**

Por quê:
- **Custo zero para uso individual.** Power BI Desktop é gratuito para instalar e publicar. Para um único gestor consumindo o próprio relatório (sem compartilhar workspace com outras pessoas), a licença Free do Power BI Service é suficiente — Pro só é necessário para publicar em workspaces compartilhados/colaborar com outros usuários ou para agendar atualizações automáticas na nuvem.
- **Ecossistema Microsoft já presente na maioria das transportadoras brasileiras.** Praticamente toda empresa de médio porte já usa Excel/Office 365; a curva de aprendizado para o gestor é menor porque a lógica de tabelas, fórmulas e Power Query conversa diretamente com o Excel que ele já usa.
- **Power Query embutido resolve o problema central**: transformar planilha bagunçada em tabela analítica sem precisar de programação.
- **Mercado de trabalho e suporte no Brasil**: Power BI é a ferramenta de BI mais ensinada, mais suportada em fóruns em português (comunidades, cursos, YouTube) e mais frequentemente pedida em vagas de logística/operações no Brasil — facilita achar ajuda ou eventualmente contratar alguém para dar manutenção.
- **Contorna a limitação de atualização automática**: se a planilha (Excel) for salva no OneDrive ou SharePoint, o Power BI Service sincroniza o arquivo (.pbix construído sobre a pasta de trabalho no OneDrive) automaticamente a cada hora — isso funciona mesmo na licença Free, sem precisar de Pro nem de gateway. Ou seja, dá para ter "atualização quase automática" sem custo, desde que o arquivo fonte fique na nuvem Microsoft.

**Trade-off a aceitar:** se no futuro o gestor quiser compartilhar o dashboard com outras pessoas (diretoria, supervisores) dentro do Power BI Service (não apenas exportar PDF/imagem), aí sim entra o custo de Power BI Pro (US$ 14/usuário/mês, faturado anual, ~US$ 168/ano por pessoa com acesso). Para uso hoje (uso próprio), isso não é necessário — mas vale já planejar o orçamento caso a solução "vaze" para outros usuários.

### Alternativas consideradas

| Ferramenta | Quando faria sentido | Por que não é a recomendação aqui |
|---|---|---|
| **Google Looker Studio** (gratuito, sem limite de usuários) | Se a empresa já vive 100% no ecossistema Google (Google Sheets, Gmail, Drive) e não usa Office/Excel | Menos maduro em modelagem de dados (relacionamentos, DAX/medidas calculadas) e em customização visual; comunidade e conteúdo em português mais escassos que Power BI; a maioria das transportadoras de médio porte no Brasil já roda em Office/Excel, não Google Workspace |
| **Metabase** (self-hosted, grátis; ou cloud pago) | Empresa com equipe técnica capaz de manter um banco de dados e um servidor (Docker/VPS) | Exige infraestrutura (servidor, banco de dados, alguém para manter no ar) incompatível com "gestor pouco técnico" e sem TI dedicada; ganho real só aparece quando os dados já estão em um banco relacional, não em planilhas soltas |
| **Excel puro com Tabelas Dinâmicas/Gráficos** | Necessidade extremamente simples, 3-4 indicadores, sem interatividade | Não escala bem visualmente, não tem a mesma flexibilidade de storytelling visual, difícil de manter "bonito" para apresentar à diretoria; Power BI Desktop tem curva de aprendizado só um pouco maior e entrega resultado muito superior |

---

## Ingestão de Dados

Fluxo recomendado: **Planilha modelo estruturada → Power Query → Modelo Power BI.**

1. **Padronizar a planilha de origem antes de tudo.** O maior risco em projeto assim não é a ferramenta de BI, é a planilha de entrada ficar inconsistente (colunas mudando de nome, abas reorganizadas, células mescladas, fórmulas manuais quebrando o layout). Definir uma "planilha modelo" fixa, com:
   - Uma aba por tipo de lançamento (ex.: `Viagens`, `Custos`, `Veículos`, `Motoristas`), no formato de **tabela do Excel** (`Inserir > Tabela`, não intervalo solto) — isso já dá nome de intervalo dinâmico e facilita o Power Query enxergar linhas novas automaticamente.
   - Uma linha = um evento (uma viagem, um custo, um abastecimento) — nunca dados resumidos/agregados na planilha de origem. Agregação é trabalho do Power BI, não da planilha.
   - Nomes de colunas fixos e sem acento/espaço problemático quando possível (facilita fórmulas e M code).
2. **Power Query como camada de ingestão/transformação.** Dentro do Power BI Desktop, usar Power Query (Obter Dados > Pasta de Trabalho do Excel) para:
   - Ler a planilha modelo,
   - Tratar tipos de dado, duplicidades, valores em branco,
   - Padronizar categorias (ex.: normalizar "SP", "sao paulo", "São Paulo " para um valor único),
   - Gerar as tabelas fato/dimensão finais (ver seção de modelagem).
   - Toda essa lógica fica salva dentro do próprio arquivo `.pbix` — não precisa de outra ferramenta de ETL.
3. **Onde guardar o arquivo fonte:** OneDrive ou SharePoint (não HD local, não pendrive, não e-mail). Isso garante:
   - Sincronização automática do dataset no Power BI Service a cada ~1h mesmo sem licença Pro (ver seção anterior);
   - Backup automático e histórico de versões nativo do OneDrive, importante porque planilha manual é o ponto mais frágil do processo (erro de digitação, exclusão acidental).
4. **Se a origem real for Google Sheets** (equipe já usa Google): Power BI conecta nativamente via conector do Google Sheets (é preciso publicar a planilha ou usar o conector Web/OData); funciona, mas a atualização automática fica mais limitada que com OneDrive — recomendação é migrar a planilha de trabalho para Excel/OneDrive se o destino final é Power BI, evitando manter dois sistemas de arquivo.

---

## Modelagem de Dados

Modelo recomendado: **esquema estrela (star schema)**, simples, com poucas tabelas fato e dimensões claras — evitar tabela única "achatada" com tudo misturado (funciona para poucos indicadores, mas trava a manutenção assim que o número de KPIs cresce).

Estrutura sugerida para indicadores de transporte rodoviário de cargas:

**Tabelas Dimensão** (cadastros, "quem/o quê/quando"):
- `dCalendario` — data, ano, mês, semana, dia da semana (tabela de calendário é praticamente obrigatória em Power BI para qualquer análise temporal/comparação de períodos)
- `dVeiculo` — placa, tipo de veículo, capacidade, ano de fabricação, filial/base
- `dMotorista` — nome/matrícula, categoria de CNH, base
- `dCliente` — cliente, cidade, UF, região
- `dRota` / `dTrajeto` (opcional) — origem, destino, distância padrão

**Tabelas Fato** (eventos, "o que aconteceu, quanto, quando"):
- `fViagens` — 1 linha por viagem/frete: data, veículo, motorista, cliente, origem/destino, peso/volume transportado, valor do frete (receita), km rodado, tempo de viagem
- `fCustos` — 1 linha por lançamento de custo: data, veículo, tipo de custo (combustível, pedágio, manutenção, multa), valor
- `fOcorrencias` (opcional, se o gestor quiser acompanhar avarias/sinistros/atrasos) — data, veículo, tipo de ocorrência, gravidade

Indicadores típicos que esse modelo sustenta sem esforço adicional: custo por km rodado, receita por veículo, ocupação/produtividade da frota, custo de manutenção por veículo, % de viagens no prazo, receita por cliente/região, consumo médio de combustível — todos calculados como medidas DAX sobre as tabelas fato, filtráveis pelas dimensões.

**Por que estrela e não uma planilha única "tudo em uma aba":** separar fato de dimensão evita repetir dado cadastral (placa, nome do motorista) em cada linha de evento, reduz erro de digitação/inconsistência, e é o padrão que o próprio Power BI otimiza internamente (motor VertiPaq) — relatórios ficam mais rápidos e mais fáceis de dar manutenção conforme o número de indicadores cresce.

---

## Automação (opcional)

Para reduzir trabalho manual de lançamento e atualização, sem exigir programação:

- **OneDrive/SharePoint como "cola" de atualização** (já citado): sozinho, resolve 80% do problema de "preciso atualizar o dashboard toda semana" — o gestor só precisa editar a planilha salva na nuvem, o Power BI Service sincroniza sozinho em até ~1h.
- **Power Automate** (incluso no Microsoft 365 em plano básico, ou com cota gratuita limitada): útil para automatizar tarefas de apoio, por exemplo:
  - Notificar por e-mail/Teams quando alguém preenche um formulário de lançamento de viagem/custo;
  - Usar um **Microsoft Forms** simples (motorista ou encarregado de pátio preenche um formulário no celular) que grava direto numa tabela do Excel/SharePoint — elimina digitação manual do gestor e mantém a planilha sempre no formato "uma linha por evento" que o modelo de dados exige.
  - Isso é opcional e só vale a pena se o volume de lançamentos justificar (frota maior, muitos eventos por dia).
- **Google Apps Script**: só entra em cena se a operação decidir manter Google Sheets como fonte (não é a recomendação principal aqui); serviria para os mesmos fins que o Power Automate (formulário → planilha, validação de dados, notificações).
- Nenhuma automação substitui a padronização da planilha — vale implantar a planilha modelo primeiro, estabilizar o hábito de preenchimento, e só depois investir em automação de captura.

---

## O que NÃO usar

- **TMS completo ou plataforma de BI enterprise (SAP BI, Qlik Enterprise, Tableau com licenciamento corporativo, Microsoft Fabric/Premium capacity) de saída.** Custo e complexidade de implantação incompatíveis com frota de 20-100 veículos e time sem TI dedicada; esse tipo de solução exige integração de dados via banco/API que a operação hoje não tem (fonte é planilha manual).
- **Banco de dados relacional dedicado (SQL Server, PostgreSQL) só para sustentar o dashboard.** Sem volume de dados nem número de usuários que justifique — Power Query lendo direto do Excel resolve com muito menos manutenção. Reconsiderar isso somente se a operação crescer, ganhar TMS/telemetria real, e o volume de linhas/usuários aumentar a ponto do arquivo Excel ficar lento ou for preciso concorrência de múltiplos usuários escrevendo ao mesmo tempo.
- **Ferramentas de BI self-hosted (Metabase, Apache Superset, Redash) para este cenário.** Exigem servidor, atualização de sistema, backup, e conhecimento técnico de infraestrutura que o gestor não tem e não deveria precisar ter — o ganho (sem custo de licença) não compensa o risco operacional de manter serviço no ar sozinho.
- **Planilha "solta" sem estrutura de tabela, com fórmulas manuais e células mescladas como fonte para o Power BI.** Não é uma ferramenta, é um hábito a evitar: gera retrabalho constante em Power Query porque qualquer mudança de layout na planilha quebra a transformação já configurada.
- **Excel com Power Pivot/Power View como substituto do Power BI.** Tecnicamente possível (mesmo motor DAX), mas Power BI Desktop tem melhor experiência visual, mais tipos de gráfico, e é o caminho natural se depois for preciso publicar no Power BI Service — não há vantagem real em ficar só no Excel.
- **Google Looker Studio, se a operação já é Microsoft/Office.** Combinar as duas nuvens (Excel no OneDrive + BI no Google) cria duas fontes de verdade e atualização manual dupla — mais um ponto de falha do que ganho.

---

## Requisitos de Plataforma

Para o gestor ter tudo funcionando:

- **Power BI Desktop** instalado na máquina Windows do gestor (gratuito, download direto da Microsoft; não roda nativamente em Mac — se o gestor usa Mac, precisa de máquina virtual Windows ou usar o Power BI Service via navegador para consumo, mas a construção do modelo/relatório em si exige Power BI Desktop em Windows).
- **Conta Microsoft 365** com OneDrive (a maioria das transportadoras já tem, mesmo que seja plano básico Business) — é onde a planilha-fonte deve morar para habilitar a sincronização automática.
- **Conta no Power BI Service** (app.powerbi.com) — a mesma conta Microsoft/organizacional do Office 365 já habilita o nível gratuito ("Meu workspace"); não precisa de licença Pro para uso individual, conforme explicado acima.
- **Excel (Microsoft 365 ou standalone)** para editar a planilha modelo — se hoje o gestor usa Google Sheets, a migração da planilha de trabalho para Excel/OneDrive é pré-requisito prático para aproveitar a sincronização automática e o ecossistema recomendado.
- Nenhum servidor, banco de dados ou infraestrutura de TI adicional é necessário nesta primeira fase.
