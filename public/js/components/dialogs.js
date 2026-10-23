import { $, $$ } from "../lib/dom.js";

/** Abre um <dialog> modal pelo id. */
export function openDialog(id) {
  const dialog = document.getElementById(id);
  if (dialog && !dialog.open) {
    dialog.showModal();
    document.body.classList.add("has-dialog");
  }
  return dialog;
}

export function closeDialog(id) {
  document.getElementById(id)?.close();
}

/**
 * Liga os atributos declarativos do HTML:
 *  data-open="id"   abre a janela (data-tipo preenche o tipo de conta no cadastro)
 *  data-switch="id" fecha a janela atual e abre outra
 *  data-close       fecha a janela atual
 */
export function initDialogs() {
  $$("dialog.dialog").forEach((dialog) => {
    dialog.addEventListener("click", (evento) => {
      if (evento.target === dialog) dialog.close(); // clique no fundo escurecido
    });
    dialog.addEventListener("close", () => {
      if (!$$("dialog.dialog[open]").length) document.body.classList.remove("has-dialog");
    });
  });

  document.addEventListener("click", (evento) => {
    const gatilho = evento.target.closest("[data-open], [data-switch], [data-close]");
    if (!gatilho) return;

    if (gatilho.dataset.close !== undefined) {
      gatilho.closest("dialog")?.close();
    } else if (gatilho.dataset.switch) {
      gatilho.closest("dialog")?.close();
      openDialog(gatilho.dataset.switch);
    } else if (gatilho.dataset.open) {
      if (gatilho.dataset.tipo) {
        const opcao = $(`#form-cadastro input[name="tipo"][value="${gatilho.dataset.tipo}"]`);
        if (opcao) opcao.checked = true;
      }
      closeMenu();
      openDialog(gatilho.dataset.open);
    }
  });
}

function closeMenu() {
  document.dispatchEvent(new CustomEvent("teco:fechar-menu"));
}
