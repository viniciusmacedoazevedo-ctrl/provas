# Apuração do 2º turno: acompanhamento ao vivo (TSE)

Planilha para acompanhar a apuração do 2º turno de 2026 (25/10). Ela lê o arquivo **EA20, resultado unificado (`…-u.json`)** do TSE e calcula a probabilidade de vitória de cada candidato conforme as seções são totalizadas.

| Arquivo | Para quê |
|---|---|
| `apuracao_2turno.xlsx` | Planilha pronta com as abas Painel, Config, Dados, Histórico, Regras TSE e Como usar. Vem com dados de demonstração fictícios. |
| `powerquery_tse.m` | Conexão ao vivo no **Excel** por meio de 4 consultas Power Query, com atualização a cada 1 min. |
| `tse_apps_script.gs` | Conexão ao vivo no **Google Planilhas** por meio de um menu "TSE ao vivo", com gatilho a cada 1 min. |
| `gerar_planilha.py` | Gera o `.xlsx` de novo (`python3 gerar_planilha.py`). |

## URL padrão

`https://resultados.tse.jus.br/oficial/ele2026/6258/dados/br/br-c0001-e006258-u.json`

Os códigos de eleição são 6257 para o 1º turno e 6258 para o 2º turno. O nome do arquivo segue a especificação EA20. O caminho das pastas foi deduzido do ambiente simulado do TSE. **Confira o caminho na aba "Documentos" de resultados.tse.jus.br.** Se for diferente, cole a URL exata em `Config!B8`. Para governador, use a sigla da UF como abrangência e o cargo 3.

## Modelo de probabilidade

Para cada totalização, o modelo segue estes passos:

1. Estima os votos válidos que ainda faltam: eleitorado das seções não totalizadas × comparecimento observado × fração de votos válidos.
2. Calcula a fatia dos votos restantes de que o candidato 1 precisa para terminar à frente: `0,5 − diferença / (2 × restantes)`.
3. Calcula a probabilidade com `1 − NORMDIST(fatia necessária; fatia atual + ajuste; σ)`. O valor padrão de σ é 6 p.p. e pode ser alterado em Config. Esse σ representa o fato de que as regiões não são apuradas no mesmo ritmo.
4. Quando o TSE marca `md = e` (matematicamente definido) ou `tf = s` (totalização final), a planilha fixa 100 % e 0 %.

O resultado é uma estimativa estatística e não substitui o resultado oficial.
