import { $ } from "../lib/dom.js";

const CHAVE = "teco:contraste";

/** Alternador de alto contraste (preferência salva no navegador). */
export function initContrast() {
  const botao = $("#btn-contraste");
  const raiz = document.documentElement;

  const aplicar = (ativo) => {
    if (ativo) raiz.dataset.contraste = "alto";
    else delete raiz.dataset.contraste;
    botao.setAttribute("aria-pressed", String(ativo));
  };

  aplicar(raiz.dataset.contraste === "alto");

  botao.addEventListener("click", () => {
    const ativo = botao.getAttribute("aria-pressed") !== "true";
    aplicar(ativo);
    try {
      if (ativo) localStorage.setItem(CHAVE, "alto");
      else localStorage.removeItem(CHAVE);
    } catch {
      /* armazenamento indisponível: a preferência vale só nesta visita */
    }
  });
}
