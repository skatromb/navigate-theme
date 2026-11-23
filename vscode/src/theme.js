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
    name: 'Bold: declaration names',
    scope: scopes({
      rust: [
        'source.rust entity.name.type.declaration.rust',
        'meta.embedded.block.rust entity.name.type.declaration.rust',
        'entity.name.module.rust',
        'meta.impl.rust > entity.name.type',
        'entity.name.function.definition.rust',
      ],
      python: ['entity.name.type.class.python', 'entity.name.type.alias.python', 'meta.function.python entity.name.function.python'],
      sql: ['meta.create.sql entity.name.function.sql', 'entity.name.type.cte.sql'],
      jinja: ['entity.name.function.definition.jinja'],
      bash: ['meta.function.shell entity.name.function.shell'],
      markdown: ['entity.name.section.markdown'],
    }),
    settings: { foreground: c.header, fontStyle: 'bold' },
  },
  {
    name: 'Bold important: macro declaration names',
    scope: ['meta.macro.rules.rust entity.name.function.macro.rust'],
    settings: { foreground: c.important, fontStyle: 'bold' },
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
    name: 'Strings and Markdown code',
    scope: scopes({
      any: ['string', 'punctuation.definition.string', 'punctuation.definition.char', 'constant.character.escape'],
      python: ['storage.type.string.python', 'string.regexp keyword', 'string.regexp punctuation'],
      markdown: ['markup.inline.raw.string.markdown', 'markup.fenced_code.block.markdown', 'markup.raw.block.markdown'],
    }),
    settings: { foreground: c.string },
  },
  {
    name: 'Insignificant: keywords, syntax operators, punctuation, Markdown URLs',
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
      sql: ['meta.type.sql', 'meta.type.sql storage.type.sql'],
      yaml: ['keyword.control.flow.block-scalar', 'entity.other.document', 'entity.name.tag.yaml punctuation.definition.string'],
      markdown: ['fenced_code.block.language', 'markup.underline.link', 'meta.separator.markdown', 'markup.heading.setext'],
      bash: [
        'source.shell constant.other.option',
        'meta.embedded.block.shellscript constant.other.option',
        'constant.character.escape.line-continuation.shell',
        'string.interpolated.process-substitution.shell > punctuation.definition.string',
        'source.shell string punctuation.definition.variable variable',
        'meta.embedded.block.shellscript string punctuation.definition.variable variable',
      ],
    }),
    settings: { foreground: c.insignificant },
  },
  {
    name: 'Insignificant: shebang',
    scope: ['meta.shebang.shell', 'meta.shebang.shell punctuation.definition.comment.shebang.shell'],
    settings: { foreground: c.insignificant, fontStyle: '' },
  },
  {
    name: 'Regular: SQL types, Jinja expressions, JSON and YAML keys, YAML numbers and anchors, shell words, code inside strings, Markdown link text and code blocks with a language',
    scope: scopes({
      sql: ['storage.type.sql'],
      markdown: ['markup.fenced_code.block.markdown meta.embedded.block', 'string.other.link.title.markdown', 'string.other.link.description.markdown'],
      jinja: ['meta.embedded.inline.jinja', 'meta.embedded.block.jinja'],
      json: ['support.type.property-name.json', 'support.type.property-name.json constant.character.escape'],
      yaml: ['entity.name.tag.yaml', 'entity.name.tag.yaml constant.character.escape', 'string.unquoted.plain constant', 'variable.other.anchor.yaml', 'variable.other.alias.yaml'],
      bash: [
        'string.unquoted.argument.shell',
        'string.unquoted.shell',
        'string.interpolated.process-substitution.shell',
        'string.interpolated.backtick.shell',
        'string.unquoted.herestring.shell',
        'source.shell string meta.arithmetic.shell',
        'source.shell string variable',
        'source.shell string meta.parameter-expansion',
        'source.shell string meta.scope.subshell',
        'meta.embedded.block.shellscript string meta.arithmetic.shell',
        'meta.embedded.block.shellscript string variable',
        'meta.embedded.block.shellscript string meta.parameter-expansion',
        'meta.embedded.block.shellscript string meta.scope.subshell',
      ],
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
