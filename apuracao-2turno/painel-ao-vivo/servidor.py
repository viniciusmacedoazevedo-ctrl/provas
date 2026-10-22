"""Servidor local do painel de apuração.

Serve o index.html e repassa ao navegador os arquivos JSON do TSE (rota /tse?u=<url>),
evitando o bloqueio de acesso entre sites (CORS). Só aceita endereços do TSE.

Uso: python servidor.py   (abre o navegador em http://localhost:8765)
"""
import http.server
import json
import socketserver
import sys
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
import webbrowser
from pathlib import Path

PORTA = 8765
PASTA = Path(__file__).resolve().parent
HOSTS_PERMITIDOS = {"resultados.tse.jus.br", "resultados-sim.tse.jus.br"}


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(PASTA), **kwargs)

    def do_GET(self):
        partes = urllib.parse.urlsplit(self.path)
        if partes.path == "/tse":
            self.repassar_tse(urllib.parse.parse_qs(partes.query).get("u", [""])[0])
        else:
            super().do_GET()

    def repassar_tse(self, url):
        destino = urllib.parse.urlsplit(url)
        if destino.scheme != "https" or destino.hostname not in HOSTS_PERMITIDOS:
            return self.responder(400, "Endereço não permitido: use um arquivo de resultados.tse.jus.br")
        sep = "&" if destino.query else "?"
        req = urllib.request.Request(
            f"{url}{sep}t={int(time.time() * 1000)}",
            headers={"User-Agent": "Mozilla/5.0 painel-apuracao", "Cache-Control": "no-cache"},
        )
        try:
            with urllib.request.urlopen(req, timeout=20) as resp:
                corpo = resp.read()
            json.loads(corpo)  # garante que é JSON antes de entregar
        except urllib.error.HTTPError as e:
            msg = "arquivo ainda não publicado pelo TSE (HTTP 404/403)" if e.code in (403, 404) else f"TSE respondeu HTTP {e.code}"
            return self.responder(502, msg)
        except (urllib.error.URLError, TimeoutError, OSError) as e:
            return self.responder(502, f"sem conexão com o TSE ({getattr(e, 'reason', e)})")
        except ValueError:
            return self.responder(502, "o TSE devolveu algo que não é JSON")
        self.responder(200, corpo, "application/json; charset=utf-8")

    def responder(self, codigo, corpo, tipo="text/plain; charset=utf-8"):
        dados = corpo if isinstance(corpo, bytes) else corpo.encode("utf-8")
        self.send_response(codigo)
        self.send_header("Content-Type", tipo)
        self.send_header("Content-Length", str(len(dados)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Proxy-TSE", "1")
        self.end_headers()
        self.wfile.write(dados)

    def log_message(self, fmt, *args):
        if "/tse" in (args[0] if args else ""):
            return  # não poluir o terminal a cada consulta
        super().log_message(fmt, *args)


class Servidor(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True
    allow_reuse_address = True


def main():
    porta = next((int(a) for a in sys.argv[1:] if a.isdigit()), PORTA)
    with Servidor(("127.0.0.1", porta), Handler) as srv:
        url = f"http://localhost:{porta}/"
        print(f"Painel de apuração rodando em {url}")
        print("Deixe esta janela aberta durante a apuração. Para encerrar: Ctrl+C.")
        if "--sem-navegador" not in sys.argv:
            threading.Timer(1.0, webbrowser.open, args=(url,)).start()
        try:
            srv.serve_forever()
        except KeyboardInterrupt:
            pass


if __name__ == "__main__":
    main()
