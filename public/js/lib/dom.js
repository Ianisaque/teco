/** Utilitários de DOM compartilhados pelos componentes. */

export const $ = (seletor, raiz = document) => raiz.querySelector(seletor);
export const $$ = (seletor, raiz = document) => [...raiz.querySelectorAll(seletor)];

const ENTIDADES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

/** Escapa texto antes de inseri-lo em HTML montado por template string. */
export function escapeHtml(valor) {
  return String(valor).replace(/[&<>"']/g, (caractere) => ENTIDADES[caractere]);
}

/** Ícone do sprite local (Material Design Icons) em img/icons.svg. */
export function icon(nome, classe = "") {
  return `<svg class="icon ${classe}" aria-hidden="true" focusable="false"><use href="img/icons.svg#${nome}"></use></svg>`;
}

/** Rola até um elemento respeitando a preferência por menos movimento. */
export function rolarPara(elemento) {
  const reduzir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  elemento.scrollIntoView({ behavior: reduzir ? "auto" : "smooth", block: "start" });
}

/** "2026-11-12" -> "12/11/2026" (sem passar por Date, para evitar fuso horário). */
export function formatarData(iso) {
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}

/** Data de hoje no fuso local, no formato aceito por <input type="date">. */
export function hojeISO() {
  const agora = new Date();
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  const dia = String(agora.getDate()).padStart(2, "0");
  return `${agora.getFullYear()}-${mes}-${dia}`;
}
