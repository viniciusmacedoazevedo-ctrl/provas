// =====================================================================
// Conector ao vivo TSE -> Excel (Power Query) — arquivo EA20 "-u.json"
// Crie 4 consultas em Dados > Obter Dados > Outras Fontes > Consulta Nula,
// abra o Editor Avançado e cole cada bloco abaixo, com o NOME indicado.
// Veja o passo a passo completo na aba "Como usar" da planilha.
// =====================================================================


// ---------------------------------------------------------------------
// Consulta 1 — nome: TSE   (Carregar como: Somente Conexão)
// Baixa o JSON da URL montada em Config!B12 (nome definido URL_TSE).
// ---------------------------------------------------------------------
let
    Url = Excel.CurrentWorkbook(){[Name = "URL_TSE"]}[Content]{0}[Column1],
    // parâmetro "t" evita que algum cache intermediário devolva arquivo antigo
    Fonte = Json.Document(
        Web.Contents(Url, [Query = [t = Text.From(Number.Round(Number.From(DateTime.LocalNow()) * 86400))],
                          Headers = [#"Cache-Control" = "no-cache"]]),
        65001)
in
    Fonte


// ---------------------------------------------------------------------
// Consulta 2 — nome: Resumo   (Carregar em: Tabela, planilha Dados, célula A1)
// ---------------------------------------------------------------------
let
    J = TSE,
    N = (x) => try Number.FromText(Text.From(x), "en-US") otherwise 0,
    T = (x) => if x = null then "" else Text.From(x),
    F = (r, k) => Record.FieldOrDefault(r, k, null),
    s = Record.FieldOrDefault(J, "s", []),
    e = Record.FieldOrDefault(J, "e", []),
    v = Record.FieldOrDefault(J, "v", []),
    Cargo = try J[carg]{0} otherwise [nmn = ""],
    Linhas = {
        {"ele", T(F(J, "ele"))}, {"t", T(F(J, "t"))}, {"tpabr", T(F(J, "tpabr"))},
        {"cdabr", T(F(J, "cdabr"))}, {"cargo", T(F(Cargo, "nmn"))},
        {"dt", T(F(J, "dt"))}, {"ht", T(F(J, "ht"))},
        {"and", T(F(J, "and"))}, {"md", T(F(J, "md"))}, {"tf", T(F(J, "tf"))}, {"dv", T(F(J, "dv"))},
        {"ts", N(F(s, "ts"))}, {"st", N(F(s, "st"))},
        {"te", N(F(e, "te"))}, {"est", N(F(e, "est"))}, {"esi", N(F(e, "esi"))},
        {"c", N(F(e, "c"))}, {"a", N(F(e, "a"))},
        {"tv", N(F(v, "tv"))}, {"vv", N(F(v, "vv"))}, {"vb", N(F(v, "vb"))},
        {"tvn", N(F(v, "tvn"))}, {"van", N(F(v, "van"))}, {"vansj", N(F(v, "vansj"))}
    },
    Tabela = #table(type table [Campo = text, Valor = any], Linhas)
in
    Tabela


// ---------------------------------------------------------------------
// Consulta 3 — nome: Candidatos   (Carregar em: Tabela, planilha Dados, célula E1)
// Ordenado pelo número de urna (ordem fixa; "seq" muda durante a apuração).
// ---------------------------------------------------------------------
let
    J = TSE,
    N = (x) => try Number.FromText(Text.From(x), "en-US") otherwise 0,
    F = (r, k, d) => Record.FieldOrDefault(r, k, d),
    Agr = try J[carg]{0}[agr] otherwise {},
    Lista = List.Combine(List.Transform(Agr, (a) =>
              List.Combine(List.Transform(F(a, "par", {}), (p) =>
                List.Transform(F(p, "cand", {}), (c) => {
                    N(F(c, "n", 0)),
                    F(c, "nmu", F(c, "nm", "")),
                    F(p, "sg", ""),
                    N(F(c, "vap", 0)),
                    F(c, "e", ""),
                    F(c, "st", ""),
                    N(F(c, "seq", 0))
                }))))),
    Tabela = #table(
        type table [Numero = number, Nome = text, Partido = text, Votos = number,
                    Eleito = text, Situacao = text, Seq = number],
        Lista),
    Ordenado = Table.Sort(Tabela, {{"Numero", Order.Ascending}})
in
    Ordenado


// ---------------------------------------------------------------------
// Consulta 4 — nome: tbHistorico   (Carregar em: Tabela, planilha Histórico, célula A1)
// Consulta "auto-referente": lê a própria tabela já carregada e acrescenta
// a totalização atual quando data/hora mudaram. Assim o histórico cresce a
// cada atualização e alimenta os gráficos de probabilidade.
// ---------------------------------------------------------------------
let
    R = Resumo,
    Val = (k) => try R{[Campo = k]}[Valor] otherwise 0,
    C = Candidatos,
    Vot = (i) => try C{i}[Votos] otherwise 0,
    Tipo = type table [Data = text, Hora = text, Secoes = number, SecoesTot = number,
                       Eleitorado = number, EleitTot = number, EleitInst = number,
                       Comparec = number, VotosTotais = number, VotosValidos = number,
                       VotosCand1 = number, VotosCand2 = number],
    Atual = #table(Tipo, {{
        Text.From(Val("dt")), Text.From(Val("ht")), Val("ts"), Val("st"),
        Val("te"), Val("est"), Val("esi"), Val("c"), Val("tv"), Val("vv"),
        Vot(0), Vot(1)}}),
    Anterior = try Table.TransformColumnTypes(
                    Table.SelectColumns(Excel.CurrentWorkbook(){[Name = "tbHistorico"]}[Content], Table.ColumnNames(Atual)),
                    {{"Data", type text}, {"Hora", type text}})
               otherwise #table(Tipo, {}),
    Juntos = Table.Combine({Anterior, Atual}),
    SemRepetir = Table.Distinct(Juntos, {"Data", "Hora"}),
    SemVazios = Table.SelectRows(SemRepetir, each [Data] <> "" and [Data] <> null)
in
    SemVazios
