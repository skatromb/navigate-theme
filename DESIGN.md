# Design

Colors come from the grammar. Semantic tokens only fix what the grammar cannot tell apart.

## Important

- ![](samples/swatches/dark/header.svg) ![](samples/swatches/light/header.svg) **Bold**: items that read like article headings in your code, at any depth: declarations of types, functions, methods, modules, macros, impl headers, named queries. Values stay regular: constants, fields, variables.
- ![](samples/swatches/dark/important.svg) ![](samples/swatches/light/important.svg) Orange-brown: control flow, as it needs extra attention: `return`, `break`, `continue`, `if`, `for … in`
- ![](samples/swatches/dark/comment.svg) ![](samples/swatches/light/comment.svg) _Italic ochre_: comments, as they carry important notes
- ![](samples/swatches/dark/string.svg) ![](samples/swatches/light/string.svg) Green: string literals and code in Markdown that you look for when debugging. Code inside a string, like a template expression, keeps its colors

## Regular

- ![](samples/swatches/dark/regular.svg) ![](samples/swatches/light/regular.svg) White (black): regular code, like variables, functions, return types, constants, and numbers

## Insignificant

- ![](samples/swatches/dark/insignificant.svg) ![](samples/swatches/light/insignificant.svg) Gray: pure syntax, like keywords, operators, punctuation, template delimiters, attributes and decorators. Also import path prefixes and types, except when used as a value, like `Option` in `-> Option<i64>` or `Some(x)`.
- ![](samples/swatches/dark/doc-comment.svg) ![](samples/swatches/light/doc-comment.svg) _Italic gray_: doc comments, like `/// Doc` and `"""docstrings"""`

Grammar gaps are fixed with injections in [vscode/syntaxes](vscode/syntaxes), scopes per language are in [vscode/src/theme.js](vscode/src/theme.js).
