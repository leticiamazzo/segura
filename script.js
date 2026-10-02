/*
  ENVIO DOS LEADS
  1) Crie um formulário grátis em https://formspree.io e copie a URL (ex.: https://formspree.io/f/abcdwxyz)
  2) Cole a URL abaixo. Os cadastros chegarão no seu e-mail e no painel do Formspree.
  Se deixar vazio, o site funciona em modo demonstração (salva só no navegador).
*/
const FORM_ENDPOINT = "https://formspree.io/f/mqpavpba"; // Cole a URL do Formspree aqui

const form = document.getElementById("leadForm");
const statusEl = document.getElementById("status");
const btn = document.getElementById("submitBtn");
document.getElementById("year").textContent = new Date().getFullYear();

// Máscara de telefone (11) 99999-9999
const tel = document.getElementById("telefone");
tel.addEventListener("input", () => {
  let v = tel.value.replace(/\D/g, "").slice(0, 11);
  if (v.length > 6) v = `(${v.slice(0, 2)}) ${v.slice(2, v.length - 4)}-${v.slice(-4)}`;
  else if (v.length > 2) v = `(${v.slice(0, 2)}) ${v.slice(2)}`;
  else if (v.length) v = `(${v}`;
  tel.value = v;
});

function setError(input, msg) {
  const field = input.closest(".field");
  field.classList.toggle("invalid", !!msg);
  field.querySelector(".err").textContent = msg || "";
  input.setAttribute("aria-invalid", msg ? "true" : "false");
}

function validate() {
  let ok = true;
  const nome = form.nome, email = form.email, tel = form.telefone;

  if (nome.value.trim().split(/\s+/).filter(Boolean).length < 1 || nome.value.trim().length < 2) {
    setError(nome, "Digite seu nome."); ok = false;
  } else setError(nome);

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim())) {
    setError(email, "Digite um e-mail válido, como maria@email.com."); ok = false;
  } else setError(email);

  const digits = tel.value.replace(/\D/g, "");
  if (digits.length < 10) {
    setError(tel, "Digite o WhatsApp com DDD."); ok = false;
  } else setError(tel);

  const consentErr = document.getElementById("consentErr");
  if (!form.consent.checked) {
    consentErr.textContent = "Marque a caixa para continuar."; ok = false;
  } else consentErr.textContent = "";

  return ok;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  statusEl.textContent = "";
  statusEl.classList.remove("error");
  if (!validate()) return;

  const data = {
    nome: form.nome.value.trim(),
    email: form.email.value.trim(),
    telefone: form.telefone.value,
    perfil: form.perfil.value,
    data: new Date().toISOString()
  };

  btn.disabled = true;
  btn.textContent = "Enviando...";

  try {
    if (FORM_ENDPOINT) {
      const res = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Falha no envio");
    } else {
      try {
        const leads = JSON.parse(localStorage.getItem("segura_leads") || "[]");
        leads.push(data);
        localStorage.setItem("segura_leads", JSON.stringify(leads));
      } catch (_) { /* armazenamento indisponível: segue em modo demo */ }
    }

    form.hidden = true;
    document.getElementById("successName").textContent = data.nome.split(" ")[0];
    document.getElementById("success").hidden = false;
  } catch (err) {
    statusEl.textContent = "Não foi possível enviar agora. Verifique sua conexão e tente de novo.";
    statusEl.classList.add("error");
    btn.disabled = false;
    btn.textContent = "Quero fazer parte";
  }
});
