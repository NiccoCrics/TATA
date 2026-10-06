/* ===== IMPOSTAZIONI: compila qui ===== */
const BOOKING_URL = "https://www.booking.com/hotel/it/casa-odello-suite-and-the-sea-bordighera.it.html?aid=2311236&label=it-it-booking-desktop-new&sid=12eb8772df0cf89bf9677452b0f52a13&dest_id=10347850&dest_type=hotel&dist=0&group_adults=2&group_children=0&hapos=1&hpos=1&no_rooms=1&req_adults=2&req_children=0&room1=A%2CA&sb_price_type=total&sr_order=popularity&srepoch=1791237707&srpvid=3b4d49b8fe9006b80860ad41859be4f2&type=total&ucfs=1&activeTab=main";   // ← incolla il link del tuo motore di prenotazione
const OPEN_IN_NEW_TAB = true;

/* Cartella della galleria (deve contenere anche elenco.json, generato da genera-galleria.js) */
const GALLERY_DIR = 'FOTO/galleria/';

/* Link di prenotazione */
document.querySelectorAll('.js-booking').forEach(a => {
  if (BOOKING_URL) {
    a.href = BOOKING_URL;
    if (OPEN_IN_NEW_TAB) {
      a.target = '_blank';
      a.rel = 'noopener';
    }
  } else {
    a.addEventListener('click', e => e.preventDefault()); // link ancora vuoto
  }
});

/* Foto mancanti: mostra il segnaposto (sezioni statiche) */
document.querySelectorAll('.ph').forEach(f => {
  const img = f.querySelector('img');
  if (!img || !img.getAttribute('src')) {
    f.classList.add('empty');
  } else {
    img.addEventListener('error', () => f.classList.add('empty'));
  }
});

/* Intestazione che si colora allo scroll */
const header = document.getElementById('top');
const onScroll = () => header.classList.toggle('solid', window.scrollY > 60);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

/* Menu mobile */
const burger = document.querySelector('.burger');
const menu = document.querySelector('nav ul');

burger.addEventListener('click', () => {
  const open = menu.classList.toggle('open');
  burger.setAttribute('aria-expanded', open);
  header.classList.add('solid');
});

menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  menu.classList.remove('open');
  burger.setAttribute('aria-expanded', false);
}));

/* Galleria + lightbox */
const gallery = document.getElementById('gallery');
const lb = document.getElementById('lightbox');
const lbImg = lb.querySelector('img');
let items = [];
let idx = 0;

const show = i => {
  if (!items.length) return;
  idx = (i + items.length) % items.length;
  const img = items[idx].querySelector('img');
  lbImg.src = img.getAttribute('src') || '';
  lbImg.alt = img.alt;
};

const close = () => lb.classList.remove('open');

/* Slider: frecce, stato dei pulsanti e vista "tutta la galleria" */
const slider = document.querySelector('.gallery-slider');
const gsPrev = slider.querySelector('.gs-prev');
const gsNext = slider.querySelector('.gs-next');
const gsToggle = document.getElementById('gallery-toggle');

const updateArrows = () => {
  gsPrev.disabled = gallery.scrollLeft <= 2;
  gsNext.disabled = gallery.scrollLeft >= gallery.scrollWidth - gallery.clientWidth - 2;
};
const slide = dir => gallery.scrollBy({ left: dir * gallery.clientWidth * 0.9, behavior: 'smooth' });

gsPrev.addEventListener('click', () => slide(-1));
gsNext.addEventListener('click', () => slide(1));
gallery.addEventListener('scroll', updateArrows, { passive: true });
window.addEventListener('resize', updateArrows);
updateArrows();

gsToggle.addEventListener('click', () => {
  const expanded = slider.classList.toggle('expanded');
  gsToggle.textContent = expanded ? 'Torna allo slider' : 'Scorri tutta la galleria';
  gsToggle.setAttribute('aria-expanded', expanded);
  if (!expanded) {
    gallery.scrollLeft = 0;
    document.getElementById('galleria').scrollIntoView({ behavior: 'smooth' });
  }
  updateArrows();
});

/* Carica l'elenco delle foto e crea la galleria */
fetch(GALLERY_DIR + 'elenco.json')
  .then(r => {
    if (!r.ok) throw new Error('elenco.json non trovato');
    return r.json();
  })
  .then(files => {
    files.forEach((nome, i) => {
      const fig = document.createElement('figure');
      fig.className = 'ph';

      const img = document.createElement('img');
      img.src = GALLERY_DIR + encodeURIComponent(nome);
      img.alt = 'Foto ' + (i + 1) + ' di Casa Odello';
      img.loading = 'lazy';
      img.addEventListener('error', () => fig.classList.add('empty'));

      fig.appendChild(img);
      fig.addEventListener('click', () => {
        if (fig.classList.contains('empty')) return;
        show(i);
        lb.classList.add('open');
      });
      gallery.appendChild(fig);
    });
    items = [...gallery.querySelectorAll('.ph')];
    updateArrows();
  })
  .catch(() => {
    gallery.innerHTML = '<p>Galleria non disponibile.</p>';
  });

lb.querySelector('.lb-close').onclick = close;
lb.querySelector('.lb-prev').onclick = () => show(idx - 1);
lb.querySelector('.lb-next').onclick = () => show(idx + 1);

lb.addEventListener('click', e => {
  if (e.target === lb) close();
});

document.addEventListener('keydown', e => {
  if (!lb.classList.contains('open')) return;
  if (e.key === 'Escape') close();
  if (e.key === 'ArrowLeft') show(idx - 1);
  if (e.key === 'ArrowRight') show(idx + 1);
});

document.getElementById('year').textContent = new Date().getFullYear();