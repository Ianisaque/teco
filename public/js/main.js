import { $, $$ } from "./lib/dom.js";
import { initNav } from "./components/nav.js";
import { initContrast } from "./components/contrast.js";
import { initDialogs } from "./components/dialogs.js";
import { initSearch } from "./components/search.js";
import { initCaregivers } from "./components/caregivers.js";
import { initAuthForms } from "./components/auth-forms.js";
import { initReveal } from "./components/reveal.js";
import { initPetEyes } from "./components/pet-eyes.js";
import { initServiceInfo } from "./components/service-info.js";
import { showToast } from "./components/toast.js";

initNav();
initContrast();
initDialogs();
initSearch();
initCaregivers();
initAuthForms();
initReveal();
initPetEyes();
initServiceInfo();

// Links de demonstração (redes sociais e políticas): avisam que ainda não existem.
$$("[data-demo]").forEach((botao) => {
  botao.addEventListener("click", () => {
    showToast(`${botao.dataset.demo}: link de demonstração, esta página ainda não existe.`);
  });
});

$("#ano").textContent = new Date().getFullYear();
