# Apuração do 2º turno 2026 ao vivo: Lula (13) × Flávio Bolsonaro (22)

## Painel ao vivo (recomendado) · pasta `painel-ao-vivo/`

É uma página web que roda no seu computador e lê o arquivo de resultado do TSE (EA20, `…-u.json`) a cada 30 segundos.

**Como abrir:**

| Sistema | O que fazer |
|---|---|
| Windows | Dê dois cliques em `iniciar-windows.bat`. Se o Python estiver instalado, ele é usado. Se não, o painel usa o PowerShell, que já vem no Windows. |
| Mac / Linux | Rode `./iniciar-mac-linux.sh` (precisa de Python 3). |

O navegador abre sozinho em `http://localhost:8765`. **Deixe a janela preta aberta durante a apuração.** Ela é o servidor local que busca os dados no TSE: o navegador sozinho é bloqueado ao ler dados de outro site.

**O que o painel mostra:**

- % de seções totalizadas e situação da apuração.
- Votos e % dos válidos de cada candidato.
- Probabilidade de vitória de cada um.
- Diferença de votos, votos que faltam e quanto deles quem está atrás precisa para virar.
- Gráficos de probabilidade e de % ao longo da apuração.
- Exportação do histórico em CSV, que abre no Excel.

**Para testar antes de domingo:** abra "Configuração e teste da conexão" e escolha "1º turno · Presidente". Esse arquivo já está publicado, então dá para conferir se a conexão funciona. Depois volte para "2º turno". Se o TSE publicar o arquivo em outro caminho, escolha "URL personalizada" e cole o endereço. O endereço aparece na aba "Documentos" de resultados.tse.jus.br.

**Endereço padrão:** `https://resultados.tse.jus.br/oficial/ele2026/6258/dados/br/br-c0001-e006258-u.json`. O código da eleição é 6258 (2º turno); o 1º turno é 6257.

## Planilha · `apuracao_2turno.xlsx`

A mesma conta da probabilidade, em Excel ou Google Planilhas. Lula e Flávio Bolsonaro já estão cadastrados e não há dados fictícios. A conexão exige um passo único, descrito na aba "Como usar":

- **Excel:** usar `powerquery_tse.m`.
- **Google Planilhas:** usar `tse_apps_script.gs`, que cria o menu "TSE ao vivo".

`gerar_planilha.py` gera a planilha de novo.

## Como a probabilidade é calculada

1. Os votos válidos que faltam são estimados assim: eleitorado das seções não totalizadas × comparecimento observado × fração de válidos.
2. Para virar, quem está atrás precisa de `0,5 + diferença / (2 × votos que faltam)` desses votos.
3. A probabilidade supõe que a fatia de cada candidato nos votos que faltam fica perto da fatia atual, com incerteza de ±6 p.p. Essa margem pode ser ajustada, porque as regiões são apuradas em ritmos diferentes.
4. Quando o TSE marca a eleição como matematicamente definida (`md = e`) ou com totalização final (`tf = s`), o painel mostra 100% e 0%.

O resultado é uma estimativa. O resultado oficial é sempre o do TSE.
