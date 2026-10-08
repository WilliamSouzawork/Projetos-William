# Features Analysis (Indicadores)

**Analysis Date:** 2026-08-13

**Contexto:** Dashboard de KPIs para transportadora rodoviária de cargas de médio porte (20-100 veículos), Brasil, uso por gestor/direção. Categorias já priorizadas: Operacionais, Frota, Financeiros, Segurança.

---

## Table Stakes (indispensáveis)

Indicadores que qualquer transportadora de médio porte precisa ter para gerir a operação com o mínimo de controle. Se faltar algum destes, o dashboard não cumpre sua função básica.

### Operacionais

| KPI | Fórmula / Definição | Por que é indispensável |
|---|---|---|
| **OTIF (On Time In Full)** | (Entregas no prazo E completas) / Total de entregas × 100 | Métrica-mãe de nível de serviço. Benchmark de mercado: 95-98%. É o indicador que o cliente cobra, mesmo informalmente. |
| **Entregas no prazo (On Time)** | Entregas realizadas dentro da janela combinada / Total de entregas × 100 | Versão simplificada do OTIF quando ainda não há dado confiável de "completude" (avarias, falta de item). Útil como indicador de transição antes de calcular OTIF completo. |
| **Tempo médio de parada / permanência** | Soma do tempo parado (carga, descarga, fiscalização, pátio) / Nº de viagens | Tempo parado é custo direto (veículo ocioso não gera receita) e principal causa de atraso em frota própria. |
| **Ocorrências / atrasos (quantidade e taxa)** | Nº de ocorrências (avaria, atraso, extravio, recusa) / Total de viagens × 100 | Base para qualquer ação corretiva. Sem contagem de ocorrência não existe gestão de causa-raiz. |
| **Viagens realizadas x programadas** | Viagens concluídas / Viagens planejadas × 100 | Indicador simples de aderência ao planejamento, mesmo sem TMS sofisticado. |

### Frota

| KPI | Fórmula / Definição | Por que é indispensável |
|---|---|---|
| **Disponibilidade de frota** | (Nº veículos disponíveis para operar) / (Nº veículos da frota total) × 100 | Determina capacidade real de atender à demanda. É o primeiro número que a diretoria pergunta. |
| **Taxa de utilização** | Veículos em operação / Veículos disponíveis × 100 | Diferencia "ocioso por manutenção" de "ocioso por falta de demanda" — decisão de gestão distinta. |
| **Consumo médio de combustível (km/l)** | Km rodado / Litros consumidos | Maior item de custo variável (35-50% do custo operacional). Sem isso não se enxerga o maior vazamento de margem. |
| **Manutenção preventiva x corretiva (%)** | Nº ordens de serviço preventivas / Total de OS × 100 | Proxy de saúde da frota. Alta proporção de corretiva = frota mal cuidada = mais quebra e mais custo. |
| **Custo de manutenção por km** | Custo total de manutenção (peças + mão de obra) / Km rodado | Junto com combustível, é o principal driver de custo variável de frota. |
| **Idade média da frota / km rodado por veículo** | Média simples de idade (anos) ou km acumulado | Indicador de risco de quebra e de necessidade de renovação de frota — decisão de CAPEX. |

### Financeiros

| KPI | Fórmula / Definição | Por que é indispensável |
|---|---|---|
| **Custo por km rodado** | Custo operacional total (fixo + variável) / Km total rodado | O indicador financeiro central do setor. Todo o resto (frete cobrado, margem, precificação) se ancora nele. |
| **Receita por rota / por cliente** | Soma do faturamento agrupado por rota ou cliente | Base mínima para saber quem/o que sustenta o negócio. |
| **Margem por rota / por cliente** | (Receita - Custo direto) / Receita × 100, agrupado por rota/cliente | Sem isso a empresa pode estar rodando rotas ou atendendo clientes que dão prejuízo sem saber. |
| **Custo fixo x variável (composição)** | Custo fixo total e variável total, e % de cada um sobre o custo total | Estrutura básica de qualquer análise de custo de transporte — separa o que é possível reduzir no curto prazo do que não é. |
| **Faturamento x meta** | Faturamento realizado / Meta do período × 100 | Indicador gerencial mínimo de acompanhamento comercial. |

### Segurança

| KPI | Fórmula / Definição | Por que é indispensável |
|---|---|---|
| **Nº de acidentes / sinistros** | Contagem simples, com severidade (com/sem vítima, com/sem dano de carga) | Indicador legal, de seguro e reputacional. É o número que aparece em auditoria de cliente/seguradora. |
| **Taxa de acidentes por km rodado** | Nº de acidentes / (Km total rodado / 1.000.000) — acidentes por milhão de km | Normaliza o indicador bruto pelo volume operado, permitindo comparação entre períodos/frota. |
| **Cumprimento de jornada (Lei 13.103)** | % de viagens/motoristas dentro dos limites legais de direção contínua e descanso | Exposição legal direta — autuação, indenização trabalhista, e é causa comprovada de acidente por fadiga. |
| **Eventos de risco por telemetria (frequência)** | Nº de eventos (excesso de velocidade, freada brusca, aceleração brusca) / 1.000 km rodados | Indicador preditivo mais barato de implantar quando já existe rastreador/telemetria contratada (a maioria das transportadoras de médio porte já tem). |

---

## Diferenciais (avançados, agregam valor extra)

Indicadores que não são obrigatórios para operar, mas que diferenciam um dashboard "de gestão avançada" de um "dashboard básico". Fazem sentido como v1.5/v2, ou quando a maturidade de dados permitir.

- **OTIF segmentado por causa de falha (atraso vs incompletude vs avaria)** — exige categorização de ocorrência mais fina do que a maioria das transportadoras médias registra hoje. Justificativa: transforma OTIF de "termômetro" em ferramenta de ação corretiva.
- **Custo por km segmentado por rota/tipo de carga/veículo** — mais granular que custo por km da frota. Exige rateio de custo fixo por rota, o que só compensa com volume de viagens suficiente para significância estatística.
- **Score de risco do motorista (ranking comportamental)** — combina eventos de telemetria em um índice único por motorista. Valioso para programas de bonificação/treinamento direcionado, mas exige volume de dados de telemetria consistente e calibração para não gerar ranking injusto (motorista de rota urbana terá mais eventos que motorista de rodovia).
- **Previsão de manutenção preditiva (baseada em km/horas de uso)** — alerta automático antes da quebra, não apenas registro do que já quebrou. Diferencial real de eficiência, mas depende de plano de manutenção estruturado e histórico de dados confiável (12+ meses).
- **Margem de contribuição por eixo/corredor logístico** — cruza custo por km com ocupação/retorno vazio (frete de retorno). Avançado porque exige dado de "km vazio x km carregado" bem apurado.
- **Comparativo de consumo por motorista (mesmo veículo, mesma rota)** — isola o fator humano no consumo de combustível. Ferramenta de gestão de performance, não de operação básica.
- **Indicador de carbono / emissões (km rodado x fator de emissão)** — cada vez mais pedido por clientes grandes (ESG), mas não é crítico para gestão interna de uma frota de 20-100 veículos ainda.
- **Dashboard preditivo de risco de atraso (baseado em trânsito/clima em tempo real)** — exige integração com fontes externas (trânsito, clima), que é investimento de infraestrutura, não apenas de indicador.

---

## Anti-features (evitar em v1)

Coisas que parecem sofisticadas mas que, nesse contexto (transportadora média, sem TMS robusto, dashboard para gestão, não para operação em tempo real), tendem a gerar mais custo/complexidade do que valor — ou pior, dado errado apresentado com confiança.

- **Rastreamento em tempo real / mapa ao vivo dentro do dashboard de KPIs.** Isso é função de plataforma de rastreamento (já existe fornecedor especializado — Onixsat, Sascar, Trimble etc.), não de dashboard de indicadores gerenciais. Misturar as duas coisas infla o escopo e duplica uma ferramenta que a empresa provavelmente já paga.
- **Alertas operacionais automatizados em tempo real (ex: "motorista X ultrapassou velocidade agora").** Isso é responsabilidade do sistema de telemetria/CCO, não do dashboard de gestão que o diretor olha 1-2x por semana. Confundir "dashboard de indicador" com "torre de controle operacional" é o erro clássico de escopo nesse tipo de projeto.
- **Custo por km "verdadeiro" com rateio contábil completo (depreciação, custo de capital, overhead administrativo detalhado).** Tecnicamente mais correto, mas exige integração com contabilidade/ERP que a maioria das transportadoras médias não tem estruturada. Em v1, custo por km com custos fixos e variáveis operacionais já é suficiente e é o que o gestor consegue validar "no olho".
- **Score de risco do motorista usado para decisão automática (ex: bloqueio, desconto em folha).** Isso é decisão de RH/jurídico com implicação trabalhista (Lei 13.103, convenções sindicais) — o dashboard deve informar, nunca decidir ou acionar automaticamente. Construir isso em v1 é assumir risco jurídico desnecessário.
- **Benchmarking externo automático (comparar seus KPIs com "a média do setor") sem fonte de dado consistente.** Não existe uma base pública, confiável e atualizada de benchmark setorial brasileiro granular o suficiente. Fingir esse comparativo com número genérico da internet gera decisão errada.
- **Integração com múltiplas fontes de telemetria/rastreador em tempo real via múltiplos protocolos.** Se a empresa tem um fornecedor de telemetria, a integração deve ser uma (a existente), via exportação/API já disponível — não construir uma camada de integração multi-fornecedor "pronta para o futuro" que ninguém pediu.
- **IA preditiva/ML para previsão de demanda, preço de frete ou manutenção preditiva sofisticada em v1.** Exige histórico de dados de qualidade (12+ meses, sem lacunas) que uma operação sem TMS normalmente não tem ainda. Construir isso antes de ter a base de dados consistente é investir em modelo que vai "aprender" com dado ruim.
- **Customização de dashboard por usuário/perfil com múltiplos níveis de permissão (RBAC granular).** Para uma operação de porte médio com uso concentrado na direção/gestão, um dashboard único e bem desenhado resolve. RBAC complexo é over-engineering típico de ferramenta pensada para operação grande com múltiplos departamentos.
- **Cálculo de OTIF/indicadores por SKU/item de carga (nível de granularidade de operação e-commerce/varejo).** Transporte de cargas fechadas/fracionadas B2B não opera no mesmo nível de granularidade de last-mile urbano — importar esse padrão de outro setor é solução errada para o problema.

---

## Complexidade e Dependências

Mapa do que precisa existir (dado, processo ou indicador anterior) para que outro indicador possa ser calculado corretamente.

```
Km rodado (odômetro/GPS por viagem)
 ├─→ Consumo médio (km/l)          [+ litros abastecidos]
 ├─→ Custo de manutenção por km    [+ custo total de manutenção]
 ├─→ Custo por km rodado           [+ custo fixo total + custo variável total]
 │     └─→ Margem por rota/cliente [+ receita por rota/cliente]
 │     └─→ Custo por km por rota   [+ rateio de custo fixo por rota — avançado]
 └─→ Taxa de acidentes por km      [+ contagem de acidentes]

Registro de ocorrência por viagem (atraso, avaria, item faltante)
 ├─→ Entregas no prazo (On Time)
 ├─→ OTIF                          [depende também de "completude" registrada — dado mais raro]
 └─→ OTIF por causa de falha       [avançado — exige categorização fina da ocorrência]

Cadastro de frota + status (ativo, em manutenção, parado)
 ├─→ Disponibilidade de frota
 └─→ Taxa de utilização

Ordem de serviço de manutenção (tipo: preventiva/corretiva)
 ├─→ % preventiva x corretiva
 └─→ Manutenção preditiva          [avançado — exige histórico 12+ meses e plano de manutenção estruturado]

Dado de telemetria/rastreador (eventos de velocidade, freada, jornada)
 ├─→ Eventos de risco por 1.000 km
 ├─→ Cumprimento de jornada (Lei 13.103)
 └─→ Score de risco do motorista   [avançado — exige calibração por tipo de rota]

Receita por viagem/contrato (faturamento)
 ├─→ Receita por rota/cliente
 ├─→ Faturamento x meta
 └─→ Margem por rota/cliente       [+ custo por km/rota]
```

**Leitura prática:**

1. **A base de tudo é "km rodado por viagem" e "custo total do período" bem apurados.** Sem esses dois dados confiáveis, nenhum indicador financeiro (custo por km, margem) é confiável — o resto do dashboard fica bonito mas errado.
2. **OTIF é mais exigente do que parece.** "No prazo" a maioria das transportadoras já registra (data de entrega x data prometida). "Completo" (sem avaria, sem falta de item) normalmente não é registrado de forma estruturada hoje — é o gap mais comum entre "queremos OTIF" e "temos dado pra calcular OTIF". Recomenda-se começar com "% no prazo" isolado e evoluir para OTIF completo quando o registro de ocorrência por tipo estiver maduro.
3. **Segurança depende de telemetria já contratada.** Se a transportadora não tem rastreador/telemetria com captura de eventos (velocidade, freada, jornada), os KPIs de segurança do dashboard ficam limitados a "nº de acidentes" — o que é table stakes, mas pobre. Vale confirmar logo no início do projeto se já existe fornecedor de telemetria e quais dados ele exporta, porque isso determina o teto de sofisticação da categoria Segurança sem custo adicional.
4. **Custo por km "por rota" e "margem por rota" são naturalmente mais avançados** porque exigem rateio de custo fixo (que é da frota/empresa como um todo) para uma unidade menor (a rota). Isso é decisão de método contábil, não só de dado — vale definir com o usuário antes de prometer esse nível de granularidade em v1.
5. **Nenhum indicador de segurança deve virar gatilho automático de punição dentro do dashboard.** Isso separa claramente "dashboard de indicador para gestão" de "sistema de compliance/RH" — mistura os dois é a anti-feature mais arriscada juridicamente da lista.
