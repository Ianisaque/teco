"""Servidor local do Teco.

Serve o site estático (pasta ``public/``) e uma API JSON simples com os dados
de demonstração (pasta ``data/``). Usa apenas a biblioteca padrão do Python.

Rotas da API:
    GET /api/cuidadores?servico=passeio|hospedagem|cuidados&bairro=Botafogo
    GET /api/bairros

Pontos de extensão futuros (ainda não implementados):
    - trocar ``carregar_cuidadores`` por consultas a um banco de dados;
    - autenticação (login e cadastro) em rotas ``/api/auth/...``;
    - agendamento de serviços em rotas ``/api/agendamentos``.
"""
import json
import os
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

BASE_DIR = Path(__file__).resolve().parent
PUBLIC_DIR = BASE_DIR / "public"
DATA_FILE = BASE_DIR / "data" / "cuidadores.json"

SERVICOS_VALIDOS = {"passeio", "hospedagem", "cuidados"}


def carregar_cuidadores():
    """Lê os cuidadores de demonstração. Ponto de troca por um banco de dados."""
    with DATA_FILE.open(encoding="utf-8") as arquivo:
        return json.load(arquivo)


def filtrar_cuidadores(cuidadores, servico=None, bairro=None):
    resultado = cuidadores
    if servico:
        resultado = [c for c in resultado if servico in c["servicos"]]
    if bairro:
        resultado = [c for c in resultado if c["bairro"].casefold() == bairro.casefold()]
    return resultado


class TecoHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        # Só a pasta public/ fica acessível pelo navegador (app.py e data/ não).
        super().__init__(*args, directory=str(PUBLIC_DIR), **kwargs)

    def do_GET(self):
        url = urlparse(self.path)
        if url.path.startswith("/api/"):
            self.responder_api(url)
        else:
            super().do_GET()

    def responder_api(self, url):
        parametros = parse_qs(url.query)
        try:
            cuidadores = carregar_cuidadores()
        except (OSError, json.JSONDecodeError):
            self.enviar_json(500, {"erro": "Não foi possível carregar os dados."})
            return

        if url.path == "/api/cuidadores":
            servico = parametros.get("servico", [""])[0].strip().lower()
            bairro = parametros.get("bairro", [""])[0].strip()
            if servico and servico not in SERVICOS_VALIDOS:
                self.enviar_json(400, {"erro": "Tipo de serviço inválido."})
                return
            self.enviar_json(200, filtrar_cuidadores(cuidadores, servico, bairro))
        elif url.path == "/api/bairros":
            self.enviar_json(200, sorted({c["bairro"] for c in cuidadores}))
        else:
            self.enviar_json(404, {"erro": "Rota não encontrada."})

    def enviar_json(self, status, conteudo):
        corpo = json.dumps(conteudo, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(corpo)))
        self.end_headers()
        self.wfile.write(corpo)


if __name__ == "__main__":
    # A porta vem da variável PORT (Railway); localmente usa 8000.
    porta = int(os.environ.get("PORT", 8000))
    servidor = ThreadingHTTPServer(("0.0.0.0", porta), TecoHandler)
    print(f"🚀 Servidor online na porta {porta}")
    try:
        servidor.serve_forever()
    except KeyboardInterrupt:
        print("\nServidor encerrado.")
    finally:
        servidor.server_close()