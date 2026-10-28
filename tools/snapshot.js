const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { LANGUAGES, tokenize } = require('./tokenize');

const SNAPSHOTS_DIR = path.join(__dirname, 'snapshots');
const update = process.argv.includes('--update');

function format(lines) {
  return lines
    .flatMap((tokens, index) =>
      tokens
        .filter(({ text }) => text.trim())
        .map(({ text, color, italic, bold }) => {
          const style = [bold && 'bold', italic && 'italic'].filter(Boolean).join(' ') || '-';
          return `${String(index + 1).padStart(3)} ${color} ${style.padEnd(11)} ${text.trim()}`;
        }),
    )
    .join('\n') + '\n';
}

(async () => {
  fs.mkdirSync(SNAPSHOTS_DIR, { recursive: true });
  for (const language of Object.keys(LANGUAGES)) {
    for (const variant of ['dark', 'light']) {
      const file = path.join(SNAPSHOTS_DIR, `${language}-${variant}.txt`);
      const actual = format((await tokenize(language, variant)).lines);
      if (update) {
        fs.writeFileSync(file, actual);
        console.log(`Written ${path.relative(process.cwd(), file)}`);
        continue;
      }
      try {
        assert.strictEqual(actual, fs.readFileSync(file, 'utf8'));
        console.log(`ok ${language} ${variant}`);
      } catch (error) {
        console.error(`FAIL ${language} ${variant}: run \`npm run snapshot\` to accept\n${error.message}`);
        process.exitCode = 1;
      }
    }
  }
})();
