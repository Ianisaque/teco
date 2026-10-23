import { $, hojeISO, rolarPara } from "../lib/dom.js";
import { listarBairros } from "../services/api.js";

/**
 * Formulário de busca. Valida os campos e avisa o resto da página pelo evento
 * `teco:buscar`; quem mostra os resultados é o componente de cuidadores.
 */
export function initSearch() {
  const form = $("#form-busca");
  const servico = $("#busca-servico");
  const bairro = $("#busca-bairro");
  const data = $("#busca-data");

  data.min = hojeISO();
  carregarBairros(bairro);

  const regras = [
    { campo: servico, erro: $("#erro-busca-servico"), validar: () => (servico.value ? "" : "Escolha o tipo de serviço.") },
    {
      campo: data,
      erro: $("#erro-busca-data"),
      validar: () => {
        if (!data.value) return "Informe a data do serviço.";
        if (data.value < hojeISO()) return "Escolha uma data a partir de hoje.";
        return "";
      },
    },
  ];

  const mostrarErro = ({ campo, erro, validar }) => {
    const mensagem = validar();
    erro.hidden = !mensagem;
    erro.textContent = mensagem;
    if (mensagem) campo.setAttribute("aria-invalid", "true");
    else campo.removeAttribute("aria-invalid");
    return !mensagem;
  };

  regras.forEach((regra) => {
    regra.campo.addEventListener("change", () => mostrarErro(regra));
  });

  form.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const resultados = regras.map(mostrarErro);
    if (resultados.includes(false)) {
      regras[resultados.indexOf(false)].campo.focus();
      return;
    }
    document.dispatchEvent(
      new CustomEvent("teco:buscar", {
        detail: { servico: servico.value, bairro: bairro.value, data: data.value },
      })
    );
    rolarPara($("#cuidadores"));
  });

  // "Limpar filtros" na lista de cuidadores também limpa o formulário.
  document.addEventListener("teco:limpar", () => {
    form.reset();
    regras.forEach(({ campo, erro }) => {
      campo.removeAttribute("aria-invalid");
      erro.hidden = true;
    });
  });

  // Botões "Saber mais" dos cards de serviço pré-selecionam o tipo de serviço.
  document.addEventListener("click", (evento) => {
    const gatilho = evento.target.closest("[data-servico]");
    if (!gatilho) return;
    servico.value = gatilho.dataset.servico;
    mostrarErro(regras[0]);
    rolarPara($("#busca"));
    setTimeout(() => bairro.focus({ preventScroll: true }), 350);
  });

  // "Encontrar um cuidador" no hero leva ao formulário já com o foco no primeiro campo.
  $("[data-focus-search]")?.addEventListener("click", () => {
    setTimeout(() => servico.focus({ preventScroll: true }), 350);
  });
}

async function carregarBairros(select) {
  try {
    const bairros = await listarBairros();
    bairros.forEach((nome) => select.append(new Option(nome, nome)));
  } catch {
    /* sem a lista, a busca continua funcionando com "Todas as regiões" */
  }
}
