# Guia Power BI — Fase 1: Fundação de Dados

Este guia é o passo a passo para conectar a planilha `dados/planilha-modelo-transportadora.xlsx` ao Power BI Desktop e montar o modelo de dados que vai sustentar todos os indicadores das próximas fases. Não é preciso conhecimento prévio de modelagem de dados — siga na ordem.

## 1. Onde salvar a planilha (para atualização automática)

Antes de conectar, salve `planilha-modelo-transportadora.xlsx` no **OneDrive** ou **SharePoint** (não deixe só no computador local). Isso permite que o Power BI Service atualize o dataset automaticamente a cada ~1 hora, mesmo sem licença Power BI Pro — sem isso, toda atualização precisa ser manual, abrindo o Power BI Desktop.

Se por enquanto você só vai usar o Power BI Desktop localmente (sem publicar no Service), pode pular esse passo e voltar a ele mais adiante.

## 2. Conectar a planilha ao Power BI Desktop

1. Abra o Power BI Desktop
2. **Página Inicial → Obter Dados → Pasta de Trabalho do Excel**
3. Selecione o arquivo `planilha-modelo-transportadora.xlsx`
4. Na janela do **Navegador**, marque as 5 tabelas de dado: `TblViagens`, `TblVeiculos`, `TblCustos`, `TblOcorrencias`, `TblTelemetria`
   - **Não marque a aba README** — ela é só documentação, não é dado
5. Clique em **Transformar Dados** (não "Carregar" direto) para revisar os tipos de coluna no Power Query antes de carregar
6. No Editor poder Query, confira que:
   - Colunas `Data_*` estão como tipo **Data**
   - Colunas `Km_*`, `Valor`, `Horas_*` estão como tipo **Número Decimal**
   - Demais colunas de texto estão como **Texto**
7. Clique em **Fechar e Aplicar**

Nesse ponto você já tem as 5 tabelas carregadas no modelo, mas ainda soltas (sem relacionamento) — próximo passo é isso.

## 3. Modelo de dados — esquema estrela

O modelo final terá **tabelas de dimensão** (quem/quando) e **tabelas fato** (o que aconteceu, com números para somar/calcular).

### Dimensões a criar

| Dimensão | Origem | Como criar |
|---|---|---|
| `dCalendario` | Gerada via Power Query (script abaixo) | Cobre o intervalo de datas usado em Viagens/Custos/Ocorrencias/Telemetria |
| `dVeiculo` | A partir de `TblVeiculos` | Já vem praticamente pronta — é a própria tabela de veículos |
| `dMotorista` | Extraída de `TblViagens`/`TblTelemetria` | Lista de `ID_Motorista` únicos (script abaixo) |
| `dCliente` | Extraída de `TblViagens` | Lista de `ID_Cliente` únicos (script abaixo) |

### Fatos (mantidos como estão, só renomeados por clareza)

| Fato | Origem |
|---|---|
| `fViagens` | `TblViagens` |
| `fCustos` | `TblCustos` |
| `fOcorrencias` | `TblOcorrencias` |
| `fTelemetria` | `TblTelemetria` |

No Power Query, você pode simplesmente **renomear** as consultas `TblViagens → fViagens`, `TblCustos → fCustos`, `TblOcorrencias → fOcorrencias`, `TblTelemetria → fTelemetria`, e `TblVeiculos → dVeiculo` (botão direito na consulta → Renomear).

### Scripts Power Query (M) para as dimensões geradas

No Editor do Power Query: **Página Inicial → Nova Fonte → Consulta em Branco**, depois **Editor Avançado**, cole o script, ajuste o nome da consulta.

**dCalendario:**

```m
let
    DataInicio = #date(2026, 1, 1),
    DataFim = #date(2027, 12, 31),
    NumDias = Duration.Days(DataFim - DataInicio) + 1,
    ListaDatas = List.Dates(DataInicio, NumDias, #duration(1,0,0,0)),
    TabelaBase = Table.FromList(ListaDatas, Splitter.SplitByNothing(), {"Data"}),
    TipoData = Table.TransformColumnTypes(TabelaBase, {{"Data", type date}}),
    ColAno = Table.AddColumn(TipoData, "Ano", each Date.Year([Data]), Int64.Type),
    ColMes = Table.AddColumn(ColAno, "Mes", each Date.Month([Data]), Int64.Type),
    ColNomeMes = Table.AddColumn(ColMes, "NomeMes", each Date.MonthName([Data]), type text),
    ColTrimestre = Table.AddColumn(ColNomeMes, "Trimestre", each "T" & Text.From(Date.QuarterOfYear([Data])), type text),
    ColAnoMes = Table.AddColumn(ColTrimestre, "AnoMes", each Date.ToText([Data], "yyyy-MM"), type text)
in
    ColAnoMes
```

**dMotorista** (ajuste `#"fViagens"` para o nome real da sua consulta de viagens):

```m
let
    Origem = #"fViagens",
    ColunaMotorista = Table.SelectColumns(Origem, {"ID_Motorista"}),
    SemDuplicados = Table.Distinct(ColunaMotorista),
    SemVazios = Table.SelectRows(SemDuplicados, each [ID_Motorista] <> null and [ID_Motorista] <> "")
in
    SemVazios
```

**dCliente** (mesma lógica, trocando a coluna):

```m
let
    Origem = #"fViagens",
    ColunaCliente = Table.SelectColumns(Origem, {"ID_Cliente"}),
    SemDuplicados = Table.Distinct(ColunaCliente),
    SemVazios = Table.SelectRows(SemDuplicados, each [ID_Cliente] <> null and [ID_Cliente] <> "")
in
    SemVazios
```

## 4. Criar os relacionamentos

Na **Vista de Modelo** (ícone de modelo na barra lateral esquerda do Power BI Desktop):

1. Arraste `dVeiculo[ID_Veiculo]` até `fViagens[ID_Veiculo]` → cria relacionamento 1 (dVeiculo) para muitos (fViagens)
2. Repita `dVeiculo[ID_Veiculo]` → `fCustos[ID_Veiculo]`
3. Repita `dVeiculo[ID_Veiculo]` → `fTelemetria[ID_Veiculo]`
4. `dMotorista[ID_Motorista]` → `fViagens[ID_Motorista]`
5. `dMotorista[ID_Motorista]` → `fTelemetria[ID_Motorista]`
6. `dCliente[ID_Cliente]` → `fViagens[ID_Cliente]`
7. `dCalendario[Data]` → `fViagens[Data_Saida]`
8. `dCalendario[Data]` → `fCustos[Data]`
9. `dCalendario[Data]` → `fOcorrencias[Data]`
10. `dCalendario[Data]` → `fTelemetria[Data]`
11. `fOcorrencias[ID_Viagem]` → `fViagens[ID_Viagem]`

Para cada relacionamento criado, verifique (clique duas vezes na linha entre as tabelas):
- Cardinalidade: **"Um para Muitos" (1:*)**, com a dimensão do lado "Um"
- Direção do filtro: **Único** (da dimensão para o fato — deixe o padrão)

Ao final, seu modelo deve parecer uma estrela: `dCalendario`, `dVeiculo`, `dMotorista`, `dCliente` no centro/topo, com os 4 fatos ao redor, cada um ligado às dimensões que usa.

## 5. Validar o modelo

1. Vá para a **Vista de Relatório**
2. Insira um visual de **Tabela** ou **Matriz**
3. Arraste `dCalendario[NomeMes]` para as linhas e `fViagens[Km_Rodado]` (com agregação Soma) para os valores
4. Confira: a soma de Km_Rodado por mês deve bater com o que está na planilha de origem (some manualmente as 3 linhas de exemplo da aba Viagens e compare)
5. Se os números não baterem, revise o relacionamento `dCalendario[Data] → fViagens[Data_Saida]` — é a causa mais comum de erro nessa etapa

## 6. Exibir a data da última atualização

Crie uma medida DAX simples para saber quando os dados foram atualizados pela última vez:

1. Clique com o botão direito em qualquer tabela fato (ex: `fViagens`) → **Nova Medida**
2. Cole:

```dax
Ultima_Atualizacao = "Atualizado em: " & FORMAT(NOW(), "dd/mm/yyyy hh:mm")
```

3. Adicione essa medida como um **Cartão** (Card) em algum canto do relatório

Isso mostra a hora em que o relatório foi **aberto/recalculado**, não necessariamente a hora do último refresh de dados no Service — mas já resolve o objetivo de "o usuário sabe se está vendo dado atualizado" para uso local no Power BI Desktop. Se e quando publicar no Power BI Service, o próprio Service mostra a data do último refresh automático do dataset (Configurações do Dataset → Histórico de Atualização).

## 7. Checklist final desta fase

- [ ] As 5 tabelas de dado foram importadas sem erro
- [ ] `dCalendario`, `dMotorista`, `dCliente` foram criadas via Power Query
- [ ] `dVeiculo`, `fViagens`, `fCustos`, `fOcorrencias`, `fTelemetria` estão nomeadas e carregadas
- [ ] Os 11 relacionamentos da seção 4 estão criados e ativos (linha sólida, não pontilhada)
- [ ] A tabela de teste (Km_Rodado por mês) bate com a planilha de origem
- [ ] O cartão "Ultima_Atualizacao" aparece no relatório
- [ ] O arquivo foi salvo como `.pbix`

Com isso a Fase 1 está concluída e o modelo está pronto para receber as medidas e visuais das próximas fases (Operacionais, Frota, Financeiros, Segurança).
