# REQUIREMENTS.md

## Contexto de escopo

- Fonte de dados: planilhas manuais (Excel/Google Sheets)
- Ferramenta de BI: Power BI
- Telemetria: já contratada, com eventos de comportamento (velocidade, freada, jornada)
- Completude de entrega (avaria/falta de item) já é registrada → permite OTIF completo
- Granularidade financeira em v1: nível de frota (não por rota/cliente)

## v1 — Requisitos

### Operacionais

- **REQ-OP-01** — OTIF (On Time In Full): (entregas no prazo E completas) / total de entregas × 100
- **REQ-OP-02** — Tempo médio de parada/permanência (carga, descarga, fiscalização, pátio) por viagem
- **REQ-OP-03** — Ocorrências/atrasos: quantidade e taxa (avaria, atraso, extravio, recusa) sobre total de viagens
- **REQ-OP-04** — Viagens realizadas x programadas (% de aderência ao planejamento)

### Frota

- **REQ-FR-01** — Disponibilidade de frota (veículos disponíveis / frota total)
- **REQ-FR-02** — Taxa de utilização (veículos em operação / veículos disponíveis)
- **REQ-FR-03** — Consumo médio de combustível (km/l), no nível de frota
- **REQ-FR-04** — Manutenção preventiva x corretiva (%)
- **REQ-FR-05** — Custo de manutenção por km
- **REQ-FR-06** — Idade média da frota / km rodado por veículo

### Financeiros

- **REQ-FIN-01** — Custo por km rodado (custo operacional total / km total), nível de frota
- **REQ-FIN-02** — Receita por rota / por cliente
- **REQ-FIN-03** — Margem por rota / por cliente ((receita - custo direto) / receita)
- **REQ-FIN-04** — Composição custo fixo x variável (% de cada um sobre o total)
- **REQ-FIN-05** — Faturamento x meta do período

### Segurança

- **REQ-SEG-01** — Número de acidentes/sinistros, com severidade (com/sem vítima, com/sem dano de carga)
- **REQ-SEG-02** — Taxa de acidentes por milhão de km rodado
- **REQ-SEG-03** — Cumprimento de jornada (Lei 13.103): % de viagens/motoristas dentro dos limites legais
- **REQ-SEG-04** — Eventos de risco por telemetria (velocidade, freada brusca, aceleração brusca) por 1.000 km

## v2 — Deferidos

- OTIF segmentado por causa de falha (atraso vs incompletude vs avaria)
- Custo por km e margem segmentados por rota/cliente (exige definição de método de rateio de custo fixo)
- Comparativo de consumo de combustível por motorista (mesmo veículo/rota)
- Score de risco do motorista (ranking comportamental) — requer calibração por tipo de rota
- Previsão de manutenção preditiva (baseada em km/horas de uso, histórico 12+ meses)
- Margem de contribuição por eixo/corredor logístico (km vazio x km carregado)
- Indicador de carbono/emissões (ESG)
- Dashboard preditivo de risco de atraso (integração com trânsito/clima externos)

## Fora de escopo (anti-features, não construir)

- Rastreamento em tempo real / mapa ao vivo — função do sistema de telemetria já contratado, não do dashboard de gestão
- Alertas operacionais automáticos em tempo real — responsabilidade do CCO/telemetria, não do dashboard
- Custo por km com rateio contábil completo (depreciação, custo de capital, overhead detalhado) — exige integração com contabilidade/ERP não disponível
- Score de risco do motorista usado para decisão automática (bloqueio, desconto) — risco jurídico/trabalhista; dashboard informa, não decide
- Benchmarking externo automático contra "média do setor" — não há base pública confiável para isso
- Integração multi-fornecedor de telemetria "pronta para o futuro" — usar apenas a integração com o fornecedor já contratado
- IA preditiva/ML sofisticada (demanda, preço, manutenção preditiva) — exige histórico de dados que a operação ainda não tem
- RBAC granular / múltiplos perfis de acesso — uso é individual (gestor/direção), um dashboard único resolve
- Indicadores por SKU/item de carga — granularidade de e-commerce/varejo não se aplica a cargas fechadas/fracionadas B2B

## Traceability

| Requirement | Fase | Status |
|-------------|------|--------|
| REQ-OP-01 | Fase 2 | Pendente |
| REQ-OP-02 | Fase 2 | Pendente |
| REQ-OP-03 | Fase 2 | Pendente |
| REQ-OP-04 | Fase 2 | Pendente |
| REQ-FR-01 | Fase 3 | Pendente |
| REQ-FR-02 | Fase 3 | Pendente |
| REQ-FR-03 | Fase 3 | Pendente |
| REQ-FR-04 | Fase 3 | Pendente |
| REQ-FR-05 | Fase 3 | Pendente |
| REQ-FR-06 | Fase 3 | Pendente |
| REQ-FIN-01 | Fase 4 | Pendente |
| REQ-FIN-02 | Fase 4 | Pendente |
| REQ-FIN-03 | Fase 4 | Pendente |
| REQ-FIN-04 | Fase 4 | Pendente |
| REQ-FIN-05 | Fase 4 | Pendente |
| REQ-SEG-01 | Fase 5 | Pendente |
| REQ-SEG-02 | Fase 5 | Pendente |
| REQ-SEG-03 | Fase 5 | Pendente |
| REQ-SEG-04 | Fase 5 | Pendente |

## Validação contra o core value

Core value (PROJECT.md): dar visibilidade consolidada da operação — hoje fragmentada em planilhas — através de indicadores confiáveis que suportam decisões de gestão.

Todos os REQ-* de v1 cobrem as 4 categorias definidas como prioridade (Operacionais, Frota, Financeiros, Segurança), com fórmula clara e fonte de dado identificada (planilha manual + telemetria já contratada). Nenhum item de v1 depende de dado que a transportadora não tenha hoje.
