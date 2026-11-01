# Design

Colors come from the grammar. Semantic tokens only fix what the grammar cannot tell apart.

## Important

- **Bold**: names at their top-level definition: types, classes, top-level functions, macros, named queries. Example: `struct **Order**`, `class **Order**`
- ![](swatches/E3825F.png) Orange-brown: control flow, as it needs extra attention: `return`, `break`, `continue`, `if`, `for … in`
- ![](swatches/CFA463.png) _Italic ochre_: comments, as they carry important notes
- ![](swatches/86C17A.png) Green: string literals that you look for when debugging. Code inside a string, like a template expression, keeps its colors

## Regular

- ![](swatches/E0DED8.png) White: regular code, like variables, functions, types, constants, and numbers. Words that pick a value or define behaviour: `==`, `in`, `desc`

## Insignificant

- ![](swatches/949CA8.png) Gray: pure syntax, like keywords, punctuation, template delimiters, attributes and decorators. Connectors: `and`, `or`. Operators that glue syntax: `.`, `::`, `=`, `=>`. Import path prefixes.
- ![](swatches/7C8490.png) _Italic gray_: doc comments, like `/// Doc` and `"""docstrings"""`

Grammar gaps are fixed with injections in [vscode/syntaxes](vscode/syntaxes), scopes per language are in [vscode/src/theme.js](vscode/src/theme.js).
