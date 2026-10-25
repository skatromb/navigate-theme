# Design

Colors come from syntax only, the theme never guesses whether a name is a type or a value.

## Important

- **Bold**: a type name at its definition, so you can find it when you scroll: `struct`, `enum`, `trait`, `type`, `impl` headers, `class`
- ![](swatches/E3825F.png) Brown: control flow, as it changes where the code goes next
  - Rust: `return`, `break`, `continue`, `if`, `match`, `for`, `.await`, `?`, `unsafe`, and macros, as they might hide control flow: `bail!`, `todo!`
  - Python: `return`, `break`, `continue`, `if`, `match`, `for`, `await`, `yield`, `try`, `except`, `raise`, `assert`
- ![](swatches/CFA463.png) _Italic ochre_: comments, as they carry important notes
- ![](swatches/86C17A.png) Green: string literals that you read when debugging

## Regular

- ![](swatches/E0DED8.png) White: every name, variables, fields, functions, types, enum variants, `self`, `Self`, `None`, constants, numbers. Operators that compute: `+`, `-`, `==`, `&&`, `!`, `and`, `not`, `in`

## Insignificant

- ![](swatches/949CA8.png) Gray: keywords, punctuation, `#[...]` attributes and `@decorators`
  - Rust: `fn`, `let`, `pub`, `use`, `impl`, `mut`, `crate`, `super`, lifetimes, operators that glue syntax: `::`, `.`, `->`, `=>`, `=`, `..`, `&`, `*`. Import path prefixes: `std::io::` in `use std::io::Error`
  - Python: `def`, `class`, `async`, `lambda`, `with`, `as`, `pass`, `in` of `for` loops, `{}` in f-strings. Import path prefixes: `os.path` in `from os.path import join`
- ![](swatches/7C8490.png) _Italic gray_: `/// Doc comments` and `"""docstrings"""`

Grammar gaps are fixed with injections in [vscode/syntaxes](vscode/syntaxes), scopes per language are in [vscode/src/theme.js](vscode/src/theme.js).
