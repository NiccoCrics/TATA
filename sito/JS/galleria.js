// Uso (dalla cartella principale del sito):  node JS/galleria.js
// Legge le immagini in FOTO/galleria e crea elenco.json ed elenco.js nella stessa cartella
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'FOTO', 'galleria');

const files = fs.readdirSync(dir)
  .filter(f => /\.(jpe?g|png|webp|avif)$/i.test(f))
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

fs.writeFileSync(path.join(dir, 'elenco.json'), JSON.stringify(files, null, 2));
// elenco.js si carica con un normale <script>, quindi funziona anche aprendo il file con doppio clic
fs.writeFileSync(path.join(dir, 'elenco.js'), 'window.ELENCO_FOTO = ' + JSON.stringify(files, null, 2) + ';\n');

console.log(files.length + ' foto trovate');