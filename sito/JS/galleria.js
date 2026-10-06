// Uso: node genera-galleria.js
// Legge le immagini in FOTO/galleria e crea FOTO/galleria/elenco.json
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname,'..', 'FOTO', 'galleria');

const files = fs.readdirSync(dir)
  .filter(f => /\.(jpe?g|png|webp|avif)$/i.test(f))
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

fs.writeFileSync(path.join(dir, 'elenco.json'), JSON.stringify(files, null, 2));
console.log(files.length + ' foto trovate');