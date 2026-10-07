/* ===== IMPOSTAZIONI: compila qui ===== */
const FORM_ENDPOINT = "https://formspree.io/f/mdeaeawy";// ← URL del servizio che invia l'email (vedi istruzioni)
const HOST_EMAIL    = "casaodello.bordighera@gmail.com";// ← usata solo come alternativa se FORM_ENDPOINT è vuoto

const form = document.getElementById('contact-form');
const status = document.getElementById('status');
const btn = form.querySelector('button[type=submit]');

// Non permettere date nel passato
const today = new Date().toISOString().split('T')[0];
form.arrivo.min = today; form.partenza.min = today;
form.arrivo.addEventListener('change', () => { form.partenza.min = form.arrivo.value || today; });

const setErr = (name, msg) => {
  const el = form.querySelector(`[data-for="${name}"]`);
  if (el) el.textContent = msg;
  const field = form.elements[name] || document.getElementById(name);
  if (field) field.setAttribute('aria-invalid', msg ? 'true' : 'false');
};

function validate(){
  let ok = true;
  ['nome','email','partenza','messaggio','privacy'].forEach(n => setErr(n,''));
  if (!form.nome.value.trim()) { setErr('nome','Scrivi il tuo nome.'); ok = false; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.value.trim())) {
    setErr('email','Inserisci un indirizzo email valido.'); ok = false; }
  if (form.arrivo.value && form.partenza.value && form.partenza.value <= form.arrivo.value) {
    setErr('partenza','La partenza deve essere dopo l\'arrivo.'); ok = false; }
  if (form.messaggio.value.trim().length < 10) {
    setErr('messaggio','Scrivi almeno una breve frase.'); ok = false; }
  if (!document.getElementById('privacy').checked) {
    setErr('privacy','Serve il tuo consenso per inviare il messaggio.'); ok = false; }
  if (!ok) form.querySelector('[aria-invalid="true"]')?.focus();
  return ok;
}

const show = (type, msg) => { status.className = 'full status ' + type; status.textContent = msg; };

form.addEventListener('submit', async e => {
  e.preventDefault();
  status.className = 'full status';
  if (!validate()) return;
  if (form.sito.value) return;   // un bot ha compilato il campo trappola: ignora

  const data = {
    tipo: form.tipo.value, nome: form.nome.value.trim(), email: form.email.value.trim(),
    arrivo: form.arrivo.value || '—', partenza: form.partenza.value || '—',
    ospiti: form.ospiti.value, messaggio: form.messaggio.value.trim()
  };
  const subject = `${data.tipo} – ${data.nome}`;

  /* Nessun servizio configurato: apre il programma di posta dell'utente */
  if (!FORM_ENDPOINT) {
    const body = `Nome: ${data.nome}\nEmail: ${data.email}\nArrivo: ${data.arrivo}\nPartenza: ${data.partenza}\nOspiti: ${data.ospiti}\n\n${data.messaggio}`;
    window.location.href = `mailto:${HOST_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    show('ok','Si è aperto il tuo programma di posta: premi Invia per completare la richiesta.');
    return;
  }

  /* Invio tramite servizio esterno (Formspree, Web3Forms, ecc.) */
  btn.disabled = true; btn.textContent = 'Invio in corso…';
  try {
    const res = await fetch(FORM_ENDPOINT, {
      method:'POST',
      headers:{'Content-Type':'application/json','Accept':'application/json'},
      body: JSON.stringify({ ...data, _replyto: data.email, _subject: subject })
    });
    if (!res.ok) throw new Error(res.status);
    show('ok','Messaggio inviato. Ti risponderemo all\'indirizzo ' + data.email + '.');
    form.reset();
  } catch {
    show('ko','Non siamo riusciti a inviare il messaggio. Riprova o scrivici a ' + HOST_EMAIL + '.');
  } finally {
    btn.disabled = false; btn.textContent = 'Invia messaggio';
  }
});

document.getElementById('year').textContent = new Date().getFullYear();
