#!/bin/sh
# Monta apuracao-site.zip para enviar pelo Gerenciador de Arquivos do cPanel.
# Uso: ./montar_pacote.sh [saida.zip]
set -e
cd "$(dirname "$0")"
SAIDA="${1:-$PWD/apuracao-site.zip}"
cp ../painel-ao-vivo/index.html apuracao/index.html
rm -f "$SAIDA"
zip -qr "$SAIDA" apuracao -x 'apuracao/cache/*.json' 'apuracao/cache/*.lock' 'apuracao/cache/*.tmp'
rm apuracao/index.html
echo "Pacote: $SAIDA"
