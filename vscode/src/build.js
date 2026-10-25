const fs = require('fs');
const path = require('path');

const buildTheme = require('./theme');

const ROOT = path.join(__dirname, '..');

for (const palette of ['dark'].map((name) => require(`./palettes/${name}.json`))) {
  const target = path.join(ROOT, 'themes', palette.filename);
  fs.writeFileSync(target, JSON.stringify(buildTheme(palette), null, 2) + '\n');
  console.log(`Written ${path.relative(process.cwd(), target)}`);
}
