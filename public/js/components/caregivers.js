import { $, escapeHtml, formatarData, icon } from "../lib/dom.js";
import { SERVICOS } from "../lib/servicos.js";
import { buscarCuidadores } from "../services/api.js";
import { openDialog, closeDialog } from "./dialogs.js";
import { showToast } from "./toast.js";

const lista = () => $("#lista-cuidadores");
const resumo = () => $("#resultado-resumo");
const botaoLimpar = () => $("#btn-limpar-filtros");

let cuidadoresAtuais = [];
let filtrosAtuais = {};

/** Seção "Cuidadores em destaque": carrega, filtra e abre os perfis. */
export function initCaregivers() {
  carregar({});

  document.addEventListener("teco:buscar", (evento) => carregar(evento.detail));

  botaoLimpar().addEventListener("click", () => {
    document.dispatchEvent(new CustomEvent("teco:limpar"));
    carregar({});
  });

  lista().addEventListener("click", (evento) => {
    const botao = evento.target.closest("[data-perfil]");
    if (botao) abrirPerfil(Number(botao.dataset.perfil));
    if (evento.target.closest("[data-tentar-novamente]")) carregar(filtrosAtuais);
    if (evento.target.closest("[data-ver-todos]")) {
      document.dispatchEvent(new CustomEvent("teco:limpar"));
      carregar({});
    }
  });

  $("#perfil-conteudo").addEventListener("click", (evento) => {
    if (!evento.target.closest("[data-solicitar-contato]")) return;
    closeDialog("dialog-perfil");
    openDialog("dialog-cadastro");
    showToast("Para solicitar contato, crie uma conta. O cadastro é apenas uma demonstração.");
  });
}

async function carregar(filtros) {
  filtrosAtuais = filtros;
  const temFiltro = Boolean(filtros.servico || filtros.bairro);
  botaoLimpar().hidden = !temFiltro;

  lista().setAttribute("aria-busy", "true");
  lista().innerHTML = '<div class="skeleton"></div>'.repeat(3);
  resumo().textContent = "Carregando cuidadores...";

  try {
    cuidadoresAtuais = await buscarCuidadores({ servico: filtros.servico, bairro: filtros.bairro });
  } catch {
    mostrarErro();
    return;
  }

  if (cuidadoresAtuais.length === 0) {
    mostrarVazio(temFiltro);
  } else {
    lista().innerHTML = cuidadoresAtuais.map(cartao).join("");
  }
  resumo().textContent = montarResumo(filtros, cuidadoresAtuais.length);
  lista().setAttribute("aria-busy", "false");
}

function montarResumo({ servico, bairro, data }, total) {
  if (!servico && !bairro) return `Mostrando todos os cuidadores de demonstração (${total}).`;
  const partes = [];
  if (servico) partes.push(SERVICOS[servico].rotulo);
  if (bairro) partes.push(`em ${bairro}`);
  const plural = total === 1 ? "cuidador encontrado" : "cuidadores encontrados";
  const dataTexto = data ? ` Data desejada: ${formatarData(data)}.` : "";
  return `${total} ${plural} para ${partes.join(" ")}.${dataTexto}`;
}

function mostrarErro() {
  lista().innerHTML = `
    <div class="state state--error">
      ${icon("alert")}
      <h3>Não foi possível carregar os cuidadores</h3>
      <p>Verifique sua conexão e se o servidor está em execução, e tente de novo.</p>
      <button class="btn btn--primary" type="button" data-tentar-novamente>Tentar novamente</button>
    </div>`;
  resumo().textContent = "Erro ao carregar os cuidadores.";
  lista().setAttribute("aria-busy", "false");
}

function mostrarVazio(temFiltro) {
  lista().innerHTML = `
    <div class="state">
      ${icon("paw")}
      <h3>Nenhum cuidador encontrado</h3>
      <p>${temFiltro ? "Ainda não há perfis de demonstração para essa combinação de serviço e região." : "Ainda não há cuidadores cadastrados."}</p>
      ${temFiltro ? '<button class="btn btn--outline" type="button" data-ver-todos>Ver todos os cuidadores</button>' : ""}
    </div>`;
}

function chips(servicos) {
  return servicos
    .filter((chave) => SERVICOS[chave])
    .map((chave) => `<li class="chip">${icon(SERVICOS[chave].icone)}${SERVICOS[chave].curto}</li>`)
    .join("");
}

function formatarNota(nota) {
  return Number(nota).toFixed(1).replace(".", ",");
}

function separarPreco(preco) {
  const [valor, unidade] = String(preco).split("/");
  return `${escapeHtml(valor)}${unidade ? `<small>/${escapeHtml(unidade)}</small>` : ""}`;
}

function cartao(c) {
  return `
    <article class="caregiver">
      <div class="caregiver__photo">
        <img src="${escapeHtml(c.foto)}" alt="Foto de ${escapeHtml(c.nome)}" loading="lazy">
        <span class="tag">Demonstração</span>
      </div>
      <div class="caregiver__body">
        <h3>${escapeHtml(c.nome)}</h3>
        <p class="caregiver__region">${icon("pin")}${escapeHtml(c.bairro)}</p>
        <ul class="chips" aria-label="Serviços oferecidos">${chips(c.servicos)}</ul>
        <div class="caregiver__meta">
          <span class="rating">${icon("star")}${formatarNota(c.avaliacao)}<small>(ilustrativa)</small></span>
          <span class="price">${separarPreco(c.preco)}</span>
        </div>
        <button class="btn btn--outline" type="button" data-perfil="${c.id}" aria-label="Ver perfil de ${escapeHtml(c.nome)}">Ver perfil</button>
      </div>
    </article>`;
}

function abrirPerfil(id) {
  const c = cuidadoresAtuais.find((item) => item.id === id);
  if (!c) return;

  $("#perfil-conteudo").innerHTML = `
    <div class="profile">
      <div class="profile__head">
        <img class="profile__photo" src="${escapeHtml(c.foto)}" alt="Foto de ${escapeHtml(c.nome)}">
        <div>
          <h2 id="perfil-titulo">${escapeHtml(c.nome)}</h2>
          <p class="caregiver__region">${icon("pin")}${escapeHtml(c.bairro)}</p>
        </div>
      </div>
      <p class="notice" style="margin:0">${icon("info")}<span>Perfil de demonstração, com avaliação e preço ilustrativos.</span></p>
      <p class="profile__about">${escapeHtml(c.sobre)}</p>
      <dl class="profile__rows">
        <div class="profile__row"><dt>Serviços</dt><dd><ul class="chips" style="justify-content:flex-end">${chips(c.servicos)}</ul></dd></div>
        <div class="profile__row"><dt>Avaliação ilustrativa</dt><dd class="rating">${icon("star")}${formatarNota(c.avaliacao)}</dd></div>
        <div class="profile__row"><dt>Preço de demonstração</dt><dd class="price">${separarPreco(c.preco)}</dd></div>
      </dl>
      <div class="profile__actions">
        <button class="btn btn--primary" type="button" data-solicitar-contato>Solicitar contato</button>
        <button class="btn btn--outline" type="button" data-close>Fechar</button>
      </div>
    </div>`;
  openDialog("dialog-perfil");
}
