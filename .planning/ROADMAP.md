# ROADMAP.md

## Overview

Dashboard de indicadores (KPIs) para transportadora de cargas rodoviárias de médio porte, construído em Power BI a partir de planilhas manuais estruturadas. O roadmap segue o padrão recomendado pela pesquisa de arquitetura: primeiro construir a fundação de dados, depois validar cada categoria de indicador como fatia vertical completa (planilha → modelo → medida → visual), terminando com a consolidação num painel único.

**Fases:** 6
**Profundidade (depth):** standard
**Cobertura:** 19/19 requisitos v1 mapeados

## Phase Structure

| Fase | Objetivo | Requisitos | Critérios de sucesso |
|------|----------|------------|----------------------|
| 1 - Fundação de Dados | Base de dados estruturada existe e Power BI está conectado a ela | (infraestrutura, sem REQ direto) | 4 |
| 2 - Indicadores Operacionais | Gestor vê o nível de serviço da operação | REQ-OP-01..04 | 4 |
| 3 - Indicadores de Frota | Gestor vê saúde e disponibilidade da frota | REQ-FR-01..06 | 6 |
| 4 - Indicadores Financeiros | Gestor vê custo, receita e margem da operação | REQ-FIN-01..05 | 5 |
| 5 - Indicadores de Segurança | Gestor vê risco e conformidade de segurança | REQ-SEG-01..04 | 4 |
| 6 - Consolidação e Publicação | Painel único está pronto para uso real no dia a dia | (consolidação, sem REQ novo) | 4 |

## Dependências

```
Fase 1 (Fundação)
 ├─→ Fase 2 (Operacionais)
 ├─→ Fase 3 (Frota)
 ├─→ Fase 4 (Financeiros) — usa dado de consumo/manutenção da Fase 3
 └─→ Fase 5 (Segurança) — usa dado de telemetria já contratada

Fases 2, 3, 4, 5 → Fase 6 (Consolidação)
```

Fases 2, 3 e 5 podem ser executadas em paralelo após a Fase 1 (não dependem umas das outras). Fase 4 depende de dados de custo de manutenção/combustível que também alimentam a Fase 3, mas pode ser planejada em paralelo.

---

## Phase 1: Fundação de Dados

**Goal:** A base de dados estruturada existe e o Power BI está conectado a ela.

**Requirements:** Nenhum REQ-ID direto — infraestrutura pré-requisito para todas as demais fases.

**Success Criteria:**
1. Existe uma planilha modelo com abas separadas para viagens, veículos, custos, ocorrências e eventos de telemetria, sem mesclagens ou fórmulas manuais nos dados brutos.
2. O Power BI está conectado à planilha (local ou via OneDrive/SharePoint) e atualiza o modelo sem erro.
3. O modelo de dados no Power BI segue esquema estrela (dimensões: calendário, veículo, motorista, cliente; fatos: viagens, custos), validado com pelo menos uma linha de teste.
4. A data/hora da última atualização do modelo é visível no arquivo Power BI.

## Phase 2: Indicadores Operacionais

**Goal:** O gestor consegue ver o nível de serviço da operação no painel.

**Requirements:** REQ-OP-01, REQ-OP-02, REQ-OP-03, REQ-OP-04

**Success Criteria:**
1. O gestor consegue ver o OTIF do período selecionado no painel.
2. O gestor consegue ver o tempo médio de parada por viagem.
3. O gestor consegue ver quantidade e taxa de ocorrências (atraso, avaria, extravio, recusa).
4. O gestor consegue ver o percentual de viagens realizadas versus programadas.

## Phase 3: Indicadores de Frota

**Goal:** O gestor consegue ver a saúde e disponibilidade da frota no painel.

**Requirements:** REQ-FR-01, REQ-FR-02, REQ-FR-03, REQ-FR-04, REQ-FR-05, REQ-FR-06

**Success Criteria:**
1. O gestor consegue ver a disponibilidade atual da frota (%).
2. O gestor consegue ver a taxa de utilização dos veículos disponíveis.
3. O gestor consegue ver o consumo médio de combustível (km/l) da frota.
4. O gestor consegue ver a proporção de manutenção preventiva versus corretiva.
5. O gestor consegue ver o custo de manutenção por km rodado.
6. O gestor consegue ver a idade média/km acumulado da frota.

## Phase 4: Indicadores Financeiros

**Goal:** O gestor consegue ver custo, receita e margem da operação no painel.

**Requirements:** REQ-FIN-01, REQ-FIN-02, REQ-FIN-03, REQ-FIN-04, REQ-FIN-05

**Success Criteria:**
1. O gestor consegue ver o custo por km rodado da frota.
2. O gestor consegue ver a receita por rota e por cliente.
3. O gestor consegue ver a margem por rota e por cliente.
4. O gestor consegue ver a composição de custo fixo versus variável.
5. O gestor consegue ver o faturamento realizado versus a meta do período.

## Phase 5: Indicadores de Segurança

**Goal:** O gestor consegue ver risco e conformidade de segurança da frota no painel.

**Requirements:** REQ-SEG-01, REQ-SEG-02, REQ-SEG-03, REQ-SEG-04

**Success Criteria:**
1. O gestor consegue ver o número de acidentes/sinistros, com severidade.
2. O gestor consegue ver a taxa de acidentes por milhão de km rodado.
3. O gestor consegue ver o percentual de conformidade com jornada (Lei 13.103).
4. O gestor consegue ver a frequência de eventos de risco por telemetria a cada 1.000 km.

## Phase 6: Consolidação e Publicação

**Goal:** O painel completo está pronto para uso real no dia a dia do gestor.

**Requirements:** Nenhum REQ-ID novo — consolida as fases 2-5 em um produto único.

**Success Criteria:**
1. Todas as 4 categorias de indicadores estão reunidas em um painel único e navegável.
2. O painel permite filtrar por período (ex: mês, trimestre).
3. O processo de atualização periódica dos dados está definido e documentado (manual ou agendado).
4. O gestor validou o painel com dados reais de pelo menos um período e confirmou que os números fazem sentido.

---

## Progress

| Fase | Status |
|------|--------|
| 1 - Fundação de Dados | Não iniciada |
| 2 - Indicadores Operacionais | Não iniciada |
| 3 - Indicadores de Frota | Não iniciada |
| 4 - Indicadores Financeiros | Não iniciada |
| 5 - Indicadores de Segurança | Não iniciada |
| 6 - Consolidação e Publicação | Não iniciada |

## Coverage

✓ Todos os 19 requisitos v1 mapeados
✓ Nenhum requisito órfão
