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
    name: 'Italic: comments',
    scope: scopes({
      any: ['comment', 'comment punctuation.definition.comment'],
    }),
    settings: { foreground: c.comment, fontStyle: 'italic' },
  },
  {
    name: 'Strings',
    scope: scopes({
      any: ['string', 'punctuation.definition.string', 'punctuation.definition.char', 'constant.character.escape'],
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
        'meta.use entity.name.namespace',
        'entity.name.type.lifetime',
      ],
    }),
    settings: { foreground: c.insignificant },
  },
  {
    name: 'Regular: math, comparison, logic operators',
    scope: scopes({
      any: [
        'keyword.operator.math',
        'keyword.operator.arithmetic',
        'keyword.operator.comparison',
        'keyword.operator.relational',
        'keyword.operator.logical',
        'keyword.operator.bitwise',
        'keyword.operator.increment',
        'keyword.operator.decrement',
        'keyword.operator.exponent',
        'keyword.operator.assignment.compound',
      ],
      rust: ['keyword.operator.assignment.rust'],
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
    }),
    settings: { foreground: c.docComment, fontStyle: 'italic' },
  },
  {
    name: 'Attributes',
    scope: scopes({
      rust: [
        'meta.attribute.rust',
        'meta.attribute.rust punctuation',
        'meta.attribute.rust punctuation.definition.string',
        'meta.attribute.rust string',
        'meta.attribute.rust keyword',
      ],
    }),
    settings: { foreground: c.attribute },
  },
  { scope: ['markup.italic'], settings: { fontStyle: 'italic' } },
  { scope: ['markup.bold'], settings: { fontStyle: 'bold' } },
  { scope: ['markup.strikethrough'], settings: { fontStyle: 'strikethrough' } },
];

module.exports = (palette) => ({
  name: palette.name,
  $schema: 'vscode://schemas/color-theme',
  type: 'dark',
  include: palette.ui,
  semanticHighlighting: false,
  colors: {
    'editor.background': palette.colors.background,
    'editor.foreground': palette.colors.regular,
    ...bracketColors(palette.colors.insignificant),
  },
  tokenColors: tokenColors(palette.colors),
});
