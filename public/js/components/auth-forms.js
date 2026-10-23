import { $, $$ } from "../lib/dom.js";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const validadores = {
  nome: (valor) => {
    const nome = valor.trim();
    if (!nome) return "Informe seu nome.";
    if (nome.length < 3 || !nome.includes(" ")) return "Informe nome e sobrenome.";
    return "";
  },
  email: (valor) => {
    if (!valor.trim()) return "Informe seu e-mail.";
    if (!EMAIL.test(valor.trim())) return "Use um e-mail válido, como nome@exemplo.com.";
    return "";
  },
  senhaLogin: (valor) => (valor ? "" : "Informe sua senha."),
  senhaCadastro: (valor) => {
    if (!valor) return "Crie uma senha.";
    if (valor.length < 8) return "A senha precisa ter pelo menos 8 caracteres.";
    return "";
  },
};

/**
 * Formulários de login e cadastro. A validação é real, mas não há backend de
 * autenticação: nada é enviado nem salvo, e a interface deixa isso claro.
 * Quando a API existir, a chamada entra no ponto marcado com "INTEGRAÇÃO".
 */
export function initAuthForms() {
  configurar($("#form-login"), {
    campos: { email: validadores.email, senha: validadores.senhaLogin },
    aoValidar: () => ({
      tipo: "info",
      mensagem: "Login indisponível na demonstração: o Teco ainda não tem autenticação. A estrutura já está preparada para essa integração.",
    }),
  });

  configurar($("#form-cadastro"), {
    campos: { nome: validadores.nome, email: validadores.email, senha: validadores.senhaCadastro },
    aoValidar: (dados) => ({
      tipo: "success",
      mensagem: `Dados válidos${dados.tipo === "cuidador" ? " para o cadastro de cuidador" : ""}! Nada foi enviado nem salvo: esta é uma demonstração sem banco de dados.`,
    }),
  });
}

function configurar(form, { campos, aoValidar }) {
  const status = $(".form-status", form);

  const validarCampo = (nome) => {
    const input = form.elements[nome];
    const erro = $(`#erro-${input.id}`);
    const mensagem = campos[nome](input.value);
    erro.hidden = !mensagem;
    erro.textContent = mensagem;
    if (mensagem) input.setAttribute("aria-invalid", "true");
    else input.removeAttribute("aria-invalid");
    return !mensagem;
  };

  Object.keys(campos).forEach((nome) => {
    const input = form.elements[nome];
    input.addEventListener("blur", () => input.value && validarCampo(nome));
    input.addEventListener("input", () => input.hasAttribute("aria-invalid") && validarCampo(nome));
  });

  form.addEventListener("submit", (evento) => {
    evento.preventDefault();
    status.hidden = true;

    const resultados = Object.keys(campos).map(validarCampo);
    if (resultados.includes(false)) {
      form.elements[Object.keys(campos)[resultados.indexOf(false)]].focus();
      return;
    }

    // INTEGRAÇÃO FUTURA: enviar os dados à API (services/api.js) aqui.
    const dados = Object.fromEntries(new FormData(form));
    const { tipo, mensagem } = aoValidar(dados);
    status.dataset.tipo = tipo;
    status.textContent = mensagem;
    status.hidden = false;
  });

  // Ao fechar a janela, limpa mensagens e erros da próxima abertura.
  form.closest("dialog").addEventListener("close", () => {
    form.reset();
    status.hidden = true;
    $$("[aria-invalid]", form).forEach((campo) => campo.removeAttribute("aria-invalid"));
    $$(".field__error", form).forEach((erro) => (erro.hidden = true));
  });
}
