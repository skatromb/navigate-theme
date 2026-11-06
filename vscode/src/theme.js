const scopes = (byLanguage) => Object.values(byLanguage).flat();

const bracketColors = (color) =>
  Object.fromEntries([1, 2, 3, 4, 5, 6].map((index) => [`editorBracketHighlight.foreground${index}`, color]));

const tokenColors = (c) => [
  {
    name: 'Important: control flow, ?, macros, unsafe',
    scope: scopes({
      any: ['keyword.control', 'entity.name.function.macro', 'entity.name.type.macro'],
      rust: ['keyword.operator.question.rust', 'keyword.other.unsafe.rust'],
    }),
    settings: { foreground: c.important },
  },
  {
    name: 'Bold: type names at their definition, top-level functions',
    scope: scopes({
      rust: [
        'source.rust entity.name.type.struct',
        'source.rust entity.name.type.enum',
        'source.rust entity.name.type.trait',
        'source.rust entity.name.type.declaration',
        'meta.impl.rust > entity.name.type',
        'meta.toplevel.rust meta.function.definition.rust entity.name.function',
      ],
      python: ['source.python entity.name.type.class', 'meta.toplevel.python meta.function.python entity.name.function'],
      sql: ['meta.create.sql entity.name.function.sql', 'entity.name.type.cte.sql'],
      jinja: ['entity.name.function.definition.jinja'],
    }),
    settings: { fontStyle: 'bold' },
  },
  {
    name: 'Italic: comments',
    scope: scopes({
      any: ['comment', 'comment punctuation.definition.comment'],
      dbt: [
        'meta.funcsign.dbt',
        'meta.funcsign.dbt keyword',
        'meta.funcsign.dbt keyword.control',
        'meta.funcsign.dbt punctuation',
      ],
    }),
    settings: { foreground: c.comment, fontStyle: 'italic' },
  },
  {
    name: 'Strings',
    scope: scopes({
      any: ['string', 'punctuation.definition.string', 'punctuation.definition.char', 'constant.character.escape'],
      python: ['storage.type.string.python', 'string.regexp keyword', 'string.regexp punctuation'],
    }),
    settings: { foreground: c.string },
  },
  {
    name: 'Insignificant: keywords, syntax operators, punctuation',
    scope: scopes({
      any: ['keyword', 'storage', 'keyword.control.import', 'keyword.control.export', 'keyword.control.from', 'punctuation'],
      rust: [
        'meta.impl.rust keyword.control',
        'variable.language.super',
        'meta.use variable.language.self',
        'meta.use entity.name.namespace',
        'meta.type.rust',
        'entity.name.type.lifetime',
        'meta.attribute.rust',
        'meta.attribute.rust string',
        'meta.attribute.rust punctuation.definition.string',
      ],
      python: [
        'entity.name.namespace.python',
        'meta.type.python',
        'meta.type.python string',
        'meta.type.python punctuation.definition.string',
        'constant.character.format.placeholder.other.python',
        'meta.function.decorator.python',
        'meta.function.decorator.python string',
        'meta.function.decorator.python punctuation.definition.string',
      ],
      sql: ['meta.type.sql'],
    }),
    settings: { foreground: c.insignificant },
  },
  {
    name: 'Regular: SQL types, Jinja expressions',
    scope: scopes({
      sql: ['storage.type.sql'],
      jinja: ['meta.embedded.inline.jinja', 'meta.embedded.block.jinja'],
    }),
    settings: { foreground: c.regular },
  },
  {
    name: 'Italic insignificant: doc comments',
    scope: scopes({
      any: [
        'comment.line.documentation',
        'comment.block.documentation',
        'comment.line.documentation punctuation.definition.comment',
        'comment.block.documentation punctuation.definition.comment',
      ],
      python: ['string.quoted.docstring', 'string.quoted.docstring punctuation.definition.string'],
    }),
    settings: { foreground: c.docComment, fontStyle: 'italic' },
  },
  { scope: ['markup.italic'], settings: { fontStyle: 'italic' } },
  { scope: ['markup.bold'], settings: { fontStyle: 'bold' } },
  { scope: ['markup.strikethrough'], settings: { fontStyle: 'strikethrough' } },
];

const semanticTokenColors = (c) => ({
  '*.documentation': { foreground: c.docComment, fontStyle: 'italic' },
  'selfKeyword:rust': c.regular,
  'selfTypeKeyword:rust': c.regular,
  'operator.controlFlow:rust': c.important,
  'keyword.unsafe:rust': c.important,
});

module.exports = (palette) => ({
  name: palette.name,
  $schema: 'vscode://schemas/color-theme',
  type: palette.type,
  include: palette.ui,
  semanticHighlighting: true,
  semanticTokenColors: semanticTokenColors(palette.colors),
  colors: {
    'editor.background': palette.colors.background,
    'editor.foreground': palette.colors.regular,
    ...bracketColors(palette.colors.insignificant),
  },
  tokenColors: tokenColors(palette.colors),
});
