const FORM_ENDPOINT = "https://formspree.io/f/mdeaeawy"; // ← URL del servizio che invia l'email (Formspree, Web3Forms…)
const HOST_EMAIL    = "casaodello.bordighera@gmail.com";// ← usata se FORM_ENDPOINT è vuoto

const form = document.getElementById('contact-form');
const status = document.getElementById('status');
const btn = form.querySelector('button[type=submit]');
const choices = document.getElementById('mail-choices');

const today = new Date().toISOString().split('T')[0];
form.arrivo.min = today; form.partenza.min = today;
form.arrivo.addEventListener('change', () => { form.partenza.min = form.arrivo.value || today; });

const setErr = (name, msg) => {
  const el = form.querySelector(`[data-for="${name}"]`);
  if (el) el.textContent = msg;
  const f = form.elements[name] || document.getElementById(name);
  if (f) f.setAttribute('aria-invalid', msg ? 'true' : 'false');
};

function validate(){
  let ok = true;
  ['nome','email','partenza','messaggio','privacy'].forEach(n => setErr(n,''));
  if (!form.nome.value.trim()) { setErr('nome','Scrivi il tuo nome.'); ok = false; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.value.trim())) { setErr('email','Inserisci un indirizzo email valido.'); ok = false; }
  if (form.arrivo.value && form.partenza.value && form.partenza.value <= form.arrivo.value) { setErr('partenza','La partenza deve essere dopo l\'arrivo.'); ok = false; }
  if (form.messaggio.value.trim().length < 10) { setErr('messaggio','Scrivi almeno una breve frase.'); ok = false; }
  if (!document.getElementById('privacy').checked) { setErr('privacy','Serve il tuo consenso per inviare il messaggio.'); ok = false; }
  if (!ok) form.querySelector('[aria-invalid="true"]')?.focus();
  return ok;
}

const show = (type, msg) => { status.className = 'full status ' + type; status.textContent = msg; };

function showWebmail(to, subject, body){
  const t = encodeURIComponent(to), s = encodeURIComponent(subject), b = encodeURIComponent(body);
  choices.innerHTML = `
    <p>Scegli con cosa inviare il messaggio:</p>
    <div class="mail-btns">
      <a class="btn" target="_blank" rel="noopener" href="https://mail.google.com/mail/?view=cm&amp;fs=1&amp;to=${t}&amp;su=${s}&amp;body=${b}">Gmail</a>
      <a class="btn" target="_blank" rel="noopener" href="https://outlook.live.com/mail/0/deeplink/compose?to=${t}&amp;subject=${s}&amp;body=${b}">Outlook</a>
      <a class="btn" target="_blank" rel="noopener" href="https://compose.mail.yahoo.com/?to=${t}&amp;subject=${s}&amp;body=${b}">Yahoo</a>
      <a class="btn ghost" href="mailto:${t}?subject=${s}&amp;body=${b}">Programma di posta</a>
      <button type="button" class="btn ghost" id="copy-msg">Copia il messaggio</button>
    </div>`;
  choices.hidden = false;
  document.getElementById('copy-msg').addEventListener('click', async e => {
    try {
      await navigator.clipboard.writeText(`A: ${to}\nOggetto: ${subject}\n\n${body}`);
      e.target.textContent = 'Copiato! Incollalo nella tua email';
    } catch { e.target.textContent = 'Copia non riuscita: scrivici a ' + to; }
  });
}

form.addEventListener('submit', async e => {
  e.preventDefault();
  status.className = 'full status'; choices.hidden = true;
  if (!validate() || form.sito.value) return;

  const data = {
    tipo: form.tipo.value, nome: form.nome.value.trim(), email: form.email.value.trim(),
    arrivo: form.arrivo.value || '—', partenza: form.partenza.value || '—',
    ospiti: form.ospiti.value, messaggio: form.messaggio.value.trim()
  };
  const subject = `${data.tipo} - ${data.nome}`;

  if (!FORM_ENDPOINT) {
    const body = `Nome: ${data.nome}\nEmail: ${data.email}\nArrivo: ${data.arrivo}\nPartenza: ${data.partenza}\nOspiti: ${data.ospiti}\n\n${data.messaggio}`;
    if (window.matchMedia('(pointer: coarse)').matches) {
      window.location.href = `mailto:${HOST_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      show('ok','Si è aperta la tua app di posta: premi Invia per completare la richiesta.');
    } else showWebmail(HOST_EMAIL, subject, body);
    return;
  }

  btn.disabled = true; btn.textContent = 'Invio in corso…';
  try {
    const res = await fetch(FORM_ENDPOINT, {
      method:'POST', headers:{'Content-Type':'application/json','Accept':'application/json'},
      body: JSON.stringify({ ...data, _replyto: data.email, _subject: subject })
    });
    if (!res.ok) throw new Error(res.status);
    show('ok','Messaggio inviato. Ti risponderemo all\'indirizzo ' + data.email + '.');
    form.reset();
  } catch {
    show('ko','Non siamo riusciti a inviare il messaggio. Riprova o scrivici a ' + HOST_EMAIL + '.');
  } finally { btn.disabled = false; btn.textContent = 'Invia messaggio'; }
});

document.getElementById('year').textContent = new Date().getFullYear();
