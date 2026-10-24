import { $, $$ } from "../lib/dom.js";

const ESPERA_ANTES_DE_PASSEAR_MS = 4500;

/**
 * Pupilas dos bichos do hero que seguem o cursor.
 * As pupilas são círculos SVG sobre a imagem (img/pets.webp, que não tem pupilas).
 * Cada olho guarda no HTML o centro e os raios da parte branca (data-*), em
 * coordenadas da imagem, e a pupila nunca sai desse espaço.
 */
export function initPetEyes() {
  const svg = $(".pets__eyes");
  if (!svg) return;

  const viewBox = svg.viewBox.baseVal;
  const olhos = $$(".eye", svg).map((olho) => ({
    pupila: $(".eye__pupil", olho),
    cx: Number(olho.dataset.cx),
    cy: Number(olho.dataset.cy),
    folgaX: Math.max(Number(olho.dataset.rx) - Number(olho.dataset.r) - 1.2, 0.8),
    folgaY: Math.max(Number(olho.dataset.ry) - Number(olho.dataset.r) - 1.2, 0.8),
    alcance: Number(olho.dataset.rx) * 4,
  }));

  const menosMovimento = window.matchMedia("(prefers-reduced-motion: reduce)");
  let ultimoPonto = null; // posição do cursor na janela (clientX/clientY)
  let quadroPendente = false;
  let temporizadorPasseio = 0;
  let temporizadorOlhar = 0;

  /** Posiciona as pupilas olhando para um ponto da janela (ou para frente, se não houver). */
  function olharPara(ponto) {
    const caixa = svg.getBoundingClientRect();
    const escala = caixa.width / viewBox.width;
    olhos.forEach((olho) => {
      let dx = 0;
      let dy = 0;
      if (ponto) {
        const alvoX = (ponto.x - caixa.left) / escala - olho.cx;
        const alvoY = (ponto.y - caixa.top) / escala - olho.cy;
        const distancia = Math.hypot(alvoX, alvoY);
        if (distancia > 0.001) {
          const forca = Math.min(1, distancia / olho.alcance);
          dx = (alvoX / distancia) * olho.folgaX * forca;
          dy = (alvoY / distancia) * olho.folgaY * forca;
        }
      }
      olho.pupila.style.transform = `translate(${olho.cx + dx}px, ${olho.cy + dy}px)`;
    });
  }

  function agendarAtualizacao() {
    if (quadroPendente) return;
    quadroPendente = true;
    requestAnimationFrame(() => {
      quadroPendente = false;
      olharPara(ultimoPonto);
    });
  }

  // Sem ninguém mexendo no mouse ou na tela, os bichos olham em volta de vez em quando.
  function comecarPasseio() {
    const olharAleatorio = () => {
      ultimoPonto = { x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight };
      agendarAtualizacao();
      temporizadorOlhar = setTimeout(olharAleatorio, 1800 + Math.random() * 1800);
    };
    olharAleatorio();
  }

  function aoMoverPonteiro(evento) {
    clearTimeout(temporizadorPasseio);
    clearTimeout(temporizadorOlhar);
    ultimoPonto = { x: evento.clientX, y: evento.clientY };
    agendarAtualizacao();
    temporizadorPasseio = setTimeout(comecarPasseio, ESPERA_ANTES_DE_PASSEAR_MS);
  }

  const aoRolar = () => ultimoPonto && agendarAtualizacao();

  function ativar() {
    window.addEventListener("pointermove", aoMoverPonteiro, { passive: true });
    window.addEventListener("pointerdown", aoMoverPonteiro, { passive: true });
    window.addEventListener("scroll", aoRolar, { passive: true });
    window.addEventListener("resize", aoRolar, { passive: true });
    // Em telas de toque não há cursor: começa a olhar em volta logo de início.
    const semCursor = window.matchMedia("(hover: none)").matches;
    temporizadorPasseio = setTimeout(comecarPasseio, semCursor ? 1200 : ESPERA_ANTES_DE_PASSEAR_MS);
  }

  function desativar() {
    window.removeEventListener("pointermove", aoMoverPonteiro);
    window.removeEventListener("pointerdown", aoMoverPonteiro);
    window.removeEventListener("scroll", aoRolar);
    window.removeEventListener("resize", aoRolar);
    clearTimeout(temporizadorPasseio);
    clearTimeout(temporizadorOlhar);
    ultimoPonto = null;
    olharPara(null);
  }

  olharPara(null);
  if (!menosMovimento.matches) ativar();
  menosMovimento.addEventListener("change", (evento) => (evento.matches ? desativar() : ativar()));
}
