import { $, escapeHtml, icon } from "../lib/dom.js";

const DURACAO_MS = 4500;

/** Mostra um aviso rápido na parte de baixo da tela. */
export function showToast(mensagem) {
  const regiao = $("#toast-region");
  if (!regiao) return;

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `${icon("info")}<span>${escapeHtml(mensagem)}</span>`;
  regiao.append(toast);

  setTimeout(() => {
    toast.classList.add("is-leaving");
    setTimeout(() => toast.remove(), 300);
  }, DURACAO_MS);
}
