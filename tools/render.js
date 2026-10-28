const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const { tokenize } = require('./tokenize');

const [language, output, variant = 'dark'] = process.argv.slice(2);
if (!language || !output) {
  console.error('usage: node tools/render.js <rust|python> <out.png> [dark|light]');
  process.exit(1);
}

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const escape = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const LINE_HEIGHT = 28;
const PADDING = 24;
const WIDTH = 1010;

(async () => {
  const { theme, lines } = await tokenize(language, variant);
  const background = theme.colors['editor.background'];
  const foreground = theme.colors['editor.foreground'];
  const rows = lines.map((tokens, index) => {
    let html = `<span class="number">${index + 1}</span>`;
    for (const { text, color, italic, bold } of tokens) {
      const css = [`color:${color}`, italic && 'font-style:italic', bold && 'font-weight:bold'].filter(Boolean).join(';');
      html += `<span style="${css}">${escape(text)}</span>`;
    }
    return `<div>${html}</div>`;
  });

  const page = `<!doctype html><meta charset="utf-8"><style>
body{margin:0;background:${background}}
pre{margin:0;padding:12px 24px 12px 8px;font:16px/${LINE_HEIGHT}px "JetBrains Mono";color:${foreground};display:inline-block;font-variant-ligatures:none;font-feature-settings:"calt" 0,"liga" 0}
.number{color:${foreground}80;display:inline-block;width:2.5ch;text-align:right;margin-right:2ch}
</style><pre>${rows.join('')}</pre>`;

  const htmlFile = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'navigate-')), `${language}.html`);
  fs.writeFileSync(htmlFile, page);
  execFileSync(CHROME, [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--force-device-scale-factor=2',
    `--window-size=${WIDTH},${lines.length * LINE_HEIGHT + PADDING}`,
    `--screenshot=${path.resolve(output)}`,
    `file://${htmlFile}`,
  ], { stdio: 'ignore' });
  console.log(`Written ${output}`);
})();
