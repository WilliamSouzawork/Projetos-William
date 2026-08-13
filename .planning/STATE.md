# STATE.md

## Project Reference

**Core value:** Dar visibilidade consolidada da operação da transportadora — hoje fragmentada em planilhas — através de indicadores confiáveis que suportam decisões de gestão.

**Current focus:** Fase 1 — Fundação de Dados

## Current Position

- **Phase:** 1 - Fundação de Dados
- **Plan:** 01-01-PLAN.md criado (3 tasks: planilha modelo, guia Power BI, validação humana)
- **Status:** Pronto para `/gsd:execute-phase 1`
- **Progress:** `[__________]` 0/6 fases concluídas

## Performance Metrics

- Fases concluídas: 0/6
- Requisitos v1 entregues: 0/19

## Accumulated Context

### Decisões

- Ferramenta de BI: Power BI (Desktop + Meu workspace, sem licença Pro necessária para uso individual)
- Fonte de dados: planilhas manuais, sincronizadas via OneDrive/SharePoint
- Modelagem: esquema estrela (dimensões calendário/veículo/motorista/cliente; fatos viagens/custos)
- Telemetria: já contratada, com eventos comportamentais — Segurança pode usar REQ-SEG-04 sem custo adicional
- OTIF: completude de entrega já é registrada → OTIF completo (não apenas "% no prazo") entra em v1
- Granularidade financeira: nível de frota em v1; segmentação por rota/cliente fica para v2
- Diferenciais avançados (comparativo por motorista, custo por rota, emissões etc.): todos deferidos para v2

### Todos

- Nenhum ainda

### Blockers

- Nenhum

## Session Continuity

Próximo passo: `/gsd:execute-phase 1` para executar o plano da Fase 1 (Fundação de Dados). A Task 3 do plano é `checkpoint:human-action` — exige que o usuário monte o modelo no Power BI Desktop manualmente, já que Claude não tem acesso a essa aplicação gráfica.
