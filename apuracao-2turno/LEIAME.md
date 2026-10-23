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

**Análise por estado** (consulta os 27 estados + exterior a cada rodada, além do total nacional):

- **Projeção estado a estado:** os votos que faltam em cada UF são divididos pela preferência daquele estado. Enquanto o estado apurou pouco, a preferência mistura o % atual com o resultado de Lula × Flávio no 1º turno; acima de 20% apurado, vale só o % atual. A tabela mostra % apurado, votos de cada um, 1º turno, votos que faltam e saldo projetado por estado.
- **Dupla checagem nacional × soma dos estados:** mostra os dois totais lado a lado e a diferença. Se o total nacional travar enquanto os estados seguem, o modo "automático" passa a usar a soma dos estados no placar.
- **Mapa interativo do Brasil:** cada estado fica vermelho se Lula está na frente e azul se Flávio está na frente; a cor é mais forte quanto maior a vantagem. Clique num estado (ou escolha na lista) para ver ao lado: % apurado, votos e % de cada um, quem lidera e por quanto, 1º turno, votos que faltam, saldo projetado, abstenção 1º → 2º turno e o gráfico do estado ao longo da apuração. Clicar de novo volta para o Brasil. Para somar estados, segure Ctrl (⌘ no Mac) e clique em vários estados, ou ligue o botão "Somar estados" (útil no celular): o painel ao lado mostra a soma dos votos, % apurado, projeção e abstenção dos estados escolhidos. O botão "Abstenção" pinta o mapa pela variação da abstenção.
- **Abstenção por estado, 1º × 2º turno:** gráfico com uma barra por estado: para cima (laranja) se a abstenção aumentou em relação ao 1º turno, para baixo (verde) se diminuiu, com o valor em pontos percentuais. A tabela completa fica logo abaixo, recolhida.
- **1º turno × 2º turno por estado:** duas barras por estado (Lula em vermelho, Outros em cinza, Flávio em azul, em % dos válidos), do estado com mais eleitores para o com menos, com o Brasil no topo e o % já apurado do 2º turno ao lado.
- **Exportar estados (CSV):** gera a planilha com votos e abstenção por estado.

**Para testar antes de domingo:** abra "Configuração e teste da conexão" e escolha "1º turno · Presidente". Esse arquivo já está publicado, então dá para conferir se a conexão funciona. Depois volte para "2º turno". Se o TSE publicar o arquivo em outro caminho, escolha "URL personalizada" e cole o endereço. O endereço aparece na aba "Documentos" de resultados.tse.jus.br.

**Endereço padrão:** `https://resultados.tse.jus.br/oficial/ele2026/6258/dados/br/br-c0001-e006258-u.json`. O código da eleição é 6258 (2º turno); o 1º turno é 6257.

## Planilha · `apuracao_2turno.xlsx`

A mesma conta da probabilidade, em Excel ou Google Planilhas. Lula e Flávio Bolsonaro já estão cadastrados e não há dados fictícios. A conexão exige um passo único, descrito na aba "Como usar":

- **Excel:** usar `powerquery_tse.m`.
- **Google Planilhas:** usar `tse_apps_script.gs`, que cria o menu "TSE ao vivo".

`gerar_planilha.py` gera a planilha de novo.

## Como a probabilidade é calculada

1. Em cada estado, os votos válidos que faltam são estimados assim: eleitorado das seções não totalizadas × comparecimento × fração de válidos (do próprio estado; do 1º turno enquanto o estado não começou).
2. Esses votos são divididos pela preferência do estado (passo acima) e somados aos votos já apurados: isso dá a projeção final.
3. A incerteza soma uma parte local de cada estado (maior quando o estado apurou pouco) e uma parte nacional igual para todos (padrão 3 p.p., ajustável).
4. Se os arquivos dos estados não estiverem disponíveis, o painel volta ao modelo nacional simples.
5. Quando o TSE marca a eleição como matematicamente definida (`md = e`) ou com totalização final (`tf = s`), o painel mostra 100% e 0%.

O resultado é uma estimativa. O resultado oficial é sempre o do TSE.
