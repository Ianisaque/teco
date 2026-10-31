/**
 * Camada de acesso aos dados.
 *
 * Tenta primeiro a API do app.py (`api/...`). Se ela não existir (como no
 * GitHub Pages, que só serve arquivos estáticos), lê `data/cuidadores.json` e
 * aplica os mesmos filtros no navegador. Os componentes não percebem a
 * diferença.
 *
 * Os caminhos são relativos de propósito: o site pode estar na raiz (localhost)
 * ou em uma subpasta (usuario.github.io/teco/).
 *
 * Quando houver banco de dados, autenticação e agendamento, as novas chamadas
 * entram aqui (por exemplo `entrar()`, `cadastrar()` e `agendarServico()`).
 */

const SERVICOS_VALIDOS = ["passeio", "hospedagem", "cuidados"];

// O GitHub Pages nunca tem API; nele nem tentamos (evita erros 404 no console).
// Em outros lugares, a primeira falha da API faz o site usar só o arquivo JSON.
let apiDisponivel = !location.hostname.endsWith(".github.io");

async function daApiOuDoArquivo(caminhoApi, comArquivo) {
  if (apiDisponivel) {
    try {
      return await lerJson(caminhoApi);
    } catch {
      apiDisponivel = false;
    }
  }
  return comArquivo(await carregarEstaticos());
}

async function lerJson(caminho) {
  const resposta = await fetch(caminho);
  if (!resposta.ok) {
    throw new Error(`Falha na requisição (${resposta.status})`);
  }
  return resposta.json();
}

let estaticos = null;
function carregarEstaticos() {
  estaticos ??= lerJson("data/cuidadores.json").catch((erro) => {
    estaticos = null; // permite tentar de novo
    throw erro;
  });
  return estaticos;
}

/** Mesmo comportamento do filtro do app.py. */
function filtrar(cuidadores, { servico, bairro } = {}) {
  if (servico && !SERVICOS_VALIDOS.includes(servico)) {
    throw new Error("Tipo de serviço inválido.");
  }
  return cuidadores.filter(
    (c) =>
      (!servico || c.servicos.includes(servico)) &&
      (!bairro || c.bairro.toLowerCase() === bairro.toLowerCase())
  );
}

/** @param {{servico?: string, bairro?: string}} filtros */
export async function buscarCuidadores(filtros = {}) {
  const query = new URLSearchParams(
    Object.entries(filtros).filter(([, valor]) => valor)
  ).toString();
  return daApiOuDoArquivo(query ? `api/cuidadores?${query}` : "api/cuidadores", (todos) =>
    filtrar(todos, filtros)
  );
}

export function listarBairros() {
  return daApiOuDoArquivo("api/bairros", (todos) =>
    [...new Set(todos.map((c) => c.bairro))].sort((a, b) => a.localeCompare(b, "pt-BR"))
  );
}
