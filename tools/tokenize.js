const fs = require('fs');
const path = require('path');
const vsctm = require('vscode-textmate');
const oniguruma = require('vscode-oniguruma');
const buildTheme = require('../vscode/src/theme');

const ROOT = path.join(__dirname, '..');

const LANGUAGES = {
  rust: { scope: 'source.rust', grammar: 'rust/syntaxes/rust.tmLanguage.json', sample: 'sample.rs' },
  python: { scope: 'source.python', grammar: 'python/syntaxes/MagicPython.tmLanguage.json', sample: 'sample.py' },
};
const REGEXP_GRAMMAR = 'python/syntaxes/MagicRegExp.tmLanguage.json';
const VSCODE_VERSION = '1.143.1';
const GRAMMARS_DIR = path.join(__dirname, 'node_modules/.cache', `vscode-${VSCODE_VERSION}`);

const FONT_STYLE_OFFSET = 11;
const FONT_STYLE_MASK = 0b1111 << FONT_STYLE_OFFSET;
const FOREGROUND_OFFSET = 15;
const FOREGROUND_MASK = 0b111111111 << FOREGROUND_OFFSET;
const ITALIC = 1;
const BOLD = 2;

const wasm = fs.readFileSync(require.resolve('vscode-oniguruma/release/onig.wasm')).buffer;
const onigLib = oniguruma.loadWASM(wasm).then(() => ({
  createOnigScanner: (patterns) => new oniguruma.OnigScanner(patterns),
  createOnigString: (text) => new oniguruma.OnigString(text),
}));

async function downloadGrammar(grammar) {
  const target = path.join(GRAMMARS_DIR, grammar);
  if (fs.existsSync(target)) return target;
  const url = `https://raw.githubusercontent.com/microsoft/vscode/${VSCODE_VERSION}/extensions/${grammar}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url}: ${response.status}`);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, await response.text());
  return target;
}

async function tokenize(language, variant) {
  const languages = LANGUAGES[language];
  const grammarPaths = {
    [languages.scope]: await downloadGrammar(languages.grammar),
    'source.regexp.python': await downloadGrammar(REGEXP_GRAMMAR),
    [`navigate.injection.${language}`]: path.join(ROOT, 'vscode/syntaxes', `${language}.injection.json`),
  };
  const theme = buildTheme(require(`../vscode/src/palettes/${variant}.json`));
  const foreground = theme.colors['editor.foreground'];
  const registry = new vsctm.Registry({
    onigLib,
    theme: { name: theme.name, settings: [{ settings: { foreground } }, ...theme.tokenColors] },
    loadGrammar: async (scopeName) => {
      const file = grammarPaths[scopeName];
      return file ? vsctm.parseRawGrammar(fs.readFileSync(file).toString(), file) : null;
    },
    getInjections: (scopeName) => (scopeName === languages.scope ? [`navigate.injection.${language}`] : []),
  });

  const grammar = await registry.loadGrammar(languages.scope);
  const colorMap = registry.getColorMap();
  const lines = fs.readFileSync(path.join(ROOT, 'sample', languages.sample), 'utf8').replace(/\n$/, '').split('\n');
  let ruleStack = vsctm.INITIAL;
  const tokenLines = lines.map((line) => {
    const { tokens, ruleStack: next } = grammar.tokenizeLine2(line, ruleStack);
    ruleStack = next;
    const result = [];
    for (let i = 0; i < tokens.length; i += 2) {
      const end = i + 2 < tokens.length ? tokens[i + 2] : line.length;
      const meta = tokens[i + 1];
      const style = (meta & FONT_STYLE_MASK) >>> FONT_STYLE_OFFSET;
      result.push({
        text: line.slice(tokens[i], end),
        color: colorMap[(meta & FOREGROUND_MASK) >>> FOREGROUND_OFFSET],
        italic: Boolean(style & ITALIC),
        bold: Boolean(style & BOLD),
      });
    }
    return result;
  });
  return { theme, lines: tokenLines };
}

module.exports = { LANGUAGES, tokenize };
