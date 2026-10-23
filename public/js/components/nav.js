import { $, $$ } from "../lib/dom.js";

/** Menu responsivo, sombra do cabeçalho ao rolar e link ativo por seção. */
export function initNav() {
  const cabecalho = $(".site-header");
  const menu = $("#menu");
  const botao = $("#btn-menu");

  const definirMenu = (aberto) => {
    menu.classList.toggle("is-open", aberto);
    botao.setAttribute("aria-expanded", String(aberto));
    botao.setAttribute("aria-label", aberto ? "Fechar menu" : "Abrir menu");
  };

  botao.addEventListener("click", () => definirMenu(botao.getAttribute("aria-expanded") !== "true"));

  menu.addEventListener("click", (evento) => {
    if (evento.target.closest("a")) definirMenu(false);
  });
  document.addEventListener("teco:fechar-menu", () => definirMenu(false));
  document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape" && menu.classList.contains("is-open")) {
      definirMenu(false);
      botao.focus();
    }
  });
  window.matchMedia("(min-width: 960px)").addEventListener("change", (e) => e.matches && definirMenu(false));

  const atualizarCabecalho = () => cabecalho.classList.toggle("is-scrolled", window.scrollY > 8);
  atualizarCabecalho();
  window.addEventListener("scroll", atualizarCabecalho, { passive: true });

  // Marca no menu a seção que está na tela.
  const links = $$(".nav__link");
  const secoes = links.map((link) => $(link.getAttribute("href"))).filter(Boolean);
  const observador = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((entrada) => {
        if (!entrada.isIntersecting) return;
        links.forEach((link) => {
          const atual = link.getAttribute("href") === `#${entrada.target.id}`;
          if (atual) link.setAttribute("aria-current", "true");
          else link.removeAttribute("aria-current");
        });
      });
    },
    { rootMargin: "-35% 0px -55% 0px" }
  );
  secoes.forEach((secao) => observador.observe(secao));
}
