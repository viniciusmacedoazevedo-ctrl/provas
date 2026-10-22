#!/bin/sh
# Inicia o painel de apuração ao vivo (precisa de Python 3).
cd "$(dirname "$0")" || exit 1
if command -v python3 >/dev/null 2>&1; then exec python3 servidor.py
elif command -v python >/dev/null 2>&1; then exec python servidor.py
else echo "Python 3 não encontrado. Instale em https://www.python.org/downloads/"; exit 1
fi
