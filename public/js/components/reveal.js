import { $$ } from "../lib/dom.js";

/** Entrada suave dos blocos ao rolar a página. */
export function initReveal() {
  const itens = $$(".reveal");
  if (!("IntersectionObserver" in window)) {
    itens.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observador = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((entrada) => {
        if (!entrada.isIntersecting) return;
        const item = entrada.target;
        item.classList.add("is-visible");
        observador.unobserve(item);
        // Depois da animação, devolve o elemento ao estilo normal (hover etc.).
        setTimeout(() => item.classList.remove("reveal", "is-visible"), 700);
      });
    },
    { threshold: 0.12 }
  );
  itens.forEach((item) => observador.observe(item));
}
