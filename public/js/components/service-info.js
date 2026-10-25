import { $, escapeHtml, icon, rolarPara } from "../lib/dom.js";
import { SERVICOS } from "../lib/servicos.js";
import { buscarCuidadores } from "../services/api.js";
import { openDialog, closeDialog } from "./dialogs.js";

/** Textos da janela "Saber mais" de cada serviço. */
const INFORMACOES = {
  passeio: {
    titulo: "Passeios",
    imagem: "img/servico-passeio.png",
    resumo: "Para os dias em que você não consegue levar seu cachorro para dar uma volta.",
    passos: [
      "Você escolhe a região e o dia do passeio.",
      "Combina com o cuidador o horário, a duração e os cuidados com seu cão, como guia, trajeto e petiscos.",
      "O cuidador busca o cachorro e o traz de volta no horário combinado.",
    ],
  },
  hospedagem: {
    titulo: "Hospedagem",
    imagem: "img/servico-hospedagem.png",
    resumo: "Para viagens e ausências mais longas, com seu pet num ambiente acolhedor.",
    passos: [
      "Você escolhe o período e a região da hospedagem.",
      "Combina com o cuidador rotina, alimentação, remédios e horários.",
      "Seu pet fica na casa do cuidador e volta para você ao fim do período.",
    ],
  },
  cuidados: {
    titulo: "Cuidados temporários",
    imagem: "img/servico-cuidados.png",
    resumo: "Para quando você precisa se ausentar por algumas horas e quer alguém de confiança com o seu bichinho.",
    passos: [
      "Você informa o dia e o intervalo de horas de que precisa.",
      "Combina alimentação, brincadeiras e cuidados específicos.",
      "O cuidador acompanha o pet durante o período combinado.",
    ],
  },
};

/**
 * Janela do "Saber mais" dos cards de serviço. Mostra a explicação do serviço,
 * os cuidadores de demonstração que o oferecem e um botão que aplica o filtro.
 */
export function initServiceInfo() {
  const conteudo = $("#servico-conteudo");
  if (!conteudo) return;

  document.addEventListener("click", (evento) => {
    const gatilho = evento.target.closest("[data-info]");
    if (gatilho) abrir(gatilho.dataset.info, conteudo);
  });

  conteudo.addEventListener("click", (evento) => {
    const botao = evento.target.closest("[data-ver-servico]");
    if (botao) verCuidadores(botao.dataset.verServico);
  });
}

function abrir(chave, conteudo) {
  const info = INFORMACOES[chave];
  if (!info) return;

  conteudo.innerHTML = `
    <div class="service-info">
      <div class="service-info__head">
        <span class="service-info__icon"><img src="${info.imagem}" alt="" width="64" height="64"></span>
        <div>
          <h2 id="servico-titulo">${escapeHtml(info.titulo)}</h2>
          <p class="service-info__lead">${escapeHtml(info.resumo)}</p>
        </div>
      </div>

      <h3 class="service-info__subtitle">Como costuma funcionar</h3>
      <ol class="service-info__steps">
        ${info.passos.map((passo) => `<li>${escapeHtml(passo)}</li>`).join("")}
      </ol>

      <h3 class="service-info__subtitle">Cuidadores de demonstração</h3>
      <div id="servico-cuidadores" class="service-info__people" aria-live="polite">
        <p class="service-info__note">Carregando...</p>
      </div>
      <p class="service-info__note">Perfis e preços são ilustrativos e não representam cuidadores reais.</p>

      <div class="service-info__actions">
        <button class="btn btn--primary" type="button" data-ver-servico="${chave}">
          Ver cuidadores de ${escapeHtml(SERVICOS[chave].curto.toLowerCase())}
          ${icon("arrow-right")}
        </button>
        <button class="btn btn--outline" type="button" data-close>Fechar</button>
      </div>
    </div>`;

  openDialog("dialog-servico");
  carregarCuidadores(chave);
}

async function carregarCuidadores(chave) {
  const area = $("#servico-cuidadores");
  try {
    const lista = await buscarCuidadores({ servico: chave });
    // Se o usuário abriu outro serviço enquanto carregava, descarta este resultado.
    if ($("#servico-cuidadores") !== area) return;
    area.innerHTML = lista.length
      ? `<ul>${lista.map(linha).join("")}</ul>`
      : '<p class="service-info__note">Ainda não há cuidadores de demonstração para este serviço.</p>';
  } catch {
    area.innerHTML = '<p class="service-info__note">Não foi possível carregar os cuidadores agora.</p>';
  }
}

function linha(c) {
  return `
    <li>
      <img src="${escapeHtml(c.foto)}" alt="" width="44" height="44" loading="lazy">
      <span class="service-info__who"><strong>${escapeHtml(c.nome)}</strong><small>${escapeHtml(c.bairro)}</small></span>
      <span class="service-info__price">${escapeHtml(c.preco)}</span>
    </li>`;
}

/** Fecha a janela, mostra a lista já filtrada e deixa o formulário de busca coerente. */
function verCuidadores(chave) {
  const campo = $("#busca-servico");
  if (campo) campo.value = chave;
  closeDialog("dialog-servico");
  document.dispatchEvent(new CustomEvent("teco:buscar", { detail: { servico: chave, bairro: "", data: "" } }));
  rolarPara($("#cuidadores"));
}
