const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const vsctm = require('vscode-textmate');
const oniguruma = require('vscode-oniguruma');

const [language, output] = process.argv.slice(2);
if (!language || !output) {
  console.error('usage: node tools/render.js <rust|python> <out.png>');
  process.exit(1);
}

const ROOT = path.join(__dirname, '..');
const VSCODE_EXTENSIONS = '/Applications/Visual Studio Code.app/Contents/Resources/app/extensions';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const languages = {
  rust: { scope: 'source.rust', grammar: 'rust/syntaxes/rust.tmLanguage.json', sample: 'sample.rs' },
  python: { scope: 'source.python', grammar: 'python/syntaxes/MagicPython.tmLanguage.json', sample: 'sample.py' },
}[language];

const grammarPaths = {
  [languages.scope]: path.join(VSCODE_EXTENSIONS, languages.grammar),
  'source.regexp.python': path.join(VSCODE_EXTENSIONS, 'python/syntaxes/MagicRegExp.tmLanguage.json'),
  [`navigate.injection.${language}`]: path.join(ROOT, 'vscode/syntaxes', `${language}.injection.json`),
};

const theme = JSON.parse(fs.readFileSync(path.join(ROOT, 'vscode/themes/navigate-dark-color-theme.json')));
const background = theme.colors['editor.background'];
const foreground = theme.colors['editor.foreground'];

const wasm = fs.readFileSync(require.resolve('vscode-oniguruma/release/onig.wasm')).buffer;
const onigLib = oniguruma.loadWASM(wasm).then(() => ({
  createOnigScanner: (patterns) => new oniguruma.OnigScanner(patterns),
  createOnigString: (text) => new oniguruma.OnigString(text),
}));

const registry = new vsctm.Registry({
  onigLib,
  theme: { name: theme.name, settings: [{ settings: { foreground } }, ...theme.tokenColors] },
  loadGrammar: async (scopeName) => {
    const file = grammarPaths[scopeName];
    return file ? vsctm.parseRawGrammar(fs.readFileSync(file).toString(), file) : null;
  },
  getInjections: (scopeName) => (scopeName === languages.scope ? [`navigate.injection.${language}`] : []),
});

const FONT_STYLE_OFFSET = 11;
const FONT_STYLE_MASK = 0b1111 << FONT_STYLE_OFFSET;
const FOREGROUND_OFFSET = 15;
const FOREGROUND_MASK = 0b111111111 << FOREGROUND_OFFSET;
const ITALIC = 1;
const BOLD = 2;

const escape = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const LINE_HEIGHT = 28;
const PADDING = 24;
const WIDTH = 1010;

(async () => {
  const grammar = await registry.loadGrammar(languages.scope);
  const colorMap = registry.getColorMap();
  const lines = fs.readFileSync(path.join(ROOT, 'sample', languages.sample), 'utf8').replace(/\n$/, '').split('\n');
  let ruleStack = vsctm.INITIAL;
  const rows = lines.map((line, index) => {
    const { tokens, ruleStack: next } = grammar.tokenizeLine2(line, ruleStack);
    ruleStack = next;
    let html = `<span class="number">${index + 1}</span>`;
    for (let i = 0; i < tokens.length; i += 2) {
      const end = i + 2 < tokens.length ? tokens[i + 2] : line.length;
      const meta = tokens[i + 1];
      const style = (meta & FONT_STYLE_MASK) >>> FONT_STYLE_OFFSET;
      const color = colorMap[(meta & FOREGROUND_MASK) >>> FOREGROUND_OFFSET];
      const css = [`color:${color}`, style & ITALIC && 'font-style:italic', style & BOLD && 'font-weight:bold'].filter(Boolean).join(';');
      html += `<span style="${css}">${escape(line.slice(tokens[i], end))}</span>`;
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
