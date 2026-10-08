# PROJECT.md

## O que é

Um sistema de indicadores (dashboard) para uma transportadora de médio porte (frota de 20 a 100 veículos), consolidando dados hoje espalhados em planilhas manuais em um painel único de gestão.

## Para quem

Uso próprio do gestor/direção da transportadora, para tomada de decisão estratégica sobre a operação.

## Valor central (core value)

Dar visibilidade consolidada da operação — hoje fragmentada em planilhas — através de indicadores confiáveis que suportam decisões de gestão, sem depender de compilação manual de dados.

## Categorias de indicadores (v1)

1. **Operacionais** — SLA de entrega, tempo de parada (pátio/rota), ocorrências e atrasos
2. **Frota** — Disponibilidade de veículos, manutenção, consumo de combustível
3. **Financeiros** — Custo por km, receita/margem por rota ou cliente
4. **Segurança** — Acidentes, telemetria (comportamento do motorista), jornada

## Fonte de dados

Hoje: planilhas manuais (Excel/Google Sheets) controladas pela operação.
Sistemas de rastreamento/TMS podem existir mas não são a fonte primária usada no dia a dia — a consolidação real acontece em planilha.

## Formato de entrega

Dashboard em Power BI (ou ferramenta equivalente), alimentado a partir dos dados hoje mantidos em planilha.

## Escala da operação

Frota média: 20 a 100 veículos.

## Fora de escopo (por ora)

- Acesso externo para clientes (compartilhamento de SLA)
- Uso por equipe de CCO/Torre de Controle em tempo real
- Integração automatizada com TMS/rastreamento (pode virar v2 se fizer sentido)

## Contexto adicional

Este projeto se conecta ao domínio coberto pela skill `torre-controle-crg` (consultoria em Torre de Controle/CCO para transporte de cargas) — pode ser usada como referência de KPIs e boas práticas do setor durante o planejamento das fases.
