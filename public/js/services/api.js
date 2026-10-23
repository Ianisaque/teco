/**
 * Camada de acesso à API.
 *
 * Hoje só existem as rotas de demonstração servidas pelo app.py. Quando houver
 * banco de dados, autenticação e agendamento, as novas chamadas entram aqui
 * (por exemplo `entrar()`, `cadastrar()` e `agendarServico()`), sem mexer nos
 * componentes de interface.
 */

async function requisitar(caminho, parametros = {}) {
  const query = new URLSearchParams(
    Object.entries(parametros).filter(([, valor]) => valor)
  ).toString();
  const resposta = await fetch(query ? `${caminho}?${query}` : caminho);
  if (!resposta.ok) {
    throw new Error(`Falha na requisição (${resposta.status})`);
  }
  return resposta.json();
}

/** @param {{servico?: string, bairro?: string}} filtros */
export function buscarCuidadores(filtros = {}) {
  return requisitar("/api/cuidadores", filtros);
}

export function listarBairros() {
  return requisitar("/api/bairros");
}
