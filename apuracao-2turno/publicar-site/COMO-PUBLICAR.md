# Publicar o painel no site (cPanel)

O painel fica em `https://www.gestaohiperlink.com.br/apuracao/`. Qualquer pessoa abre pelo navegador, no computador ou no celular, sem instalar nada.

## Enviar pelo cPanel (uns 2 minutos)

1. Entre no cPanel e abra o **Gerenciador de Arquivos**.
2. Entre na pasta **public_html**.
3. Clique em **Carregar** e envie o arquivo `apuracao-site.zip`.
4. Volte para `public_html`, clique com o botão direito no `apuracao-site.zip`, escolha **Extrair** e confirme. Isso cria a pasta `apuracao`. Depois pode apagar o zip.
5. Abra `https://www.gestaohiperlink.com.br/apuracao/`.

## Testar antes de domingo

No painel, abra **Configuração e teste da conexão** e escolha **1º turno · Presidente**. Se aparecer "Ao vivo", com o mapa colorido e "Conexão: servidor do site", está tudo funcionando. Depois volte para **2º turno**.

## O que tem na pasta `apuracao`

| Arquivo | Para quê |
|---|---|
| `index.html` | O painel. |
| `tse.php` | Busca os arquivos do TSE para o painel. Aceita somente endereços do TSE. Guarda cada arquivo por 15 segundos, então mesmo com muitos visitantes o site consulta o TSE no máximo uma vez por arquivo nesse intervalo. Se o TSE ficar fora do ar, entrega a última leitura boa. |
| `cache/` | Cópias temporárias dos arquivos do TSE, bloqueadas para acesso direto pelo navegador. |
| `.htaccess` | Define a página inicial e impede que o navegador guarde versão velha do painel. |

## Se aparecer "Sem conexão"

- **"sem conexão com o TSE":** a hospedagem está bloqueando conexões de saída. Peça ao suporte para liberar o acesso a `resultados.tse.jus.br` pela porta 443.
- **A página mostra o código do `tse.php` ou dá erro 500:** em cPanel → **Selecionar versão do PHP**, use o PHP 7.4 ou mais novo, com a extensão **curl** ligada.
- **"arquivo ainda não publicado pelo TSE":** é o normal antes das 17h de 25/10.

## Atualizar o painel

Gere um zip novo com `./montar_pacote.sh` e repita os passos 3 e 4, aceitando substituir os arquivos.
