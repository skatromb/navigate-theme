# Navigate

Zed theme that helps you navigate through the sea of code. Panels are copied from [JetBrains Light](https://github.com/artemevsevev/zed-theme-jetbrains).

Most color schemes colorize syntax: keywords, expressions, operators. That doesn't help: you already know the syntax.

What helps instead is dimming noisy boilerplate and highlight few important moments.

## Important

- **Bold brown ![](swatches/A4472D.svg)**: breaking control flow, `return`, `break`, `continue`. Non-breaking control flow shouldn't be highlighted, but currently we can't: `if`, `match`, `loop`, `for`, `.await`, `?`
- **Bold black ![](swatches/080808.svg)**: all declarations
- Brown ![](swatches/A4472D.svg): macros, as they might hide control flow: `bail!`, `ensure!`, `todo!`, and `?` inside
- _Italic bark ochre_ ![](swatches/9F5C10.svg): comments, as they carry important notes
- Green ![](swatches/0F8A0F.svg): string literals that you read when debugging

## Insignificant

- Transparent gray ![](swatches/A8A8A8.svg): `#[...] attributes`
- Italic gray ![](swatches/8C8C8C.svg): `\\\ Doc comments`
- Light gray ![](swatches/6E6E6E.svg): `fn`, `let`, `pub`, `use`, `impl` keywords, primitive types, generic parameters, lifetimes, punctuation (`::`, `.`, `,`, brackets)

## Regular

Regular black ![](swatches/080808.svg): variables, fields, types, paths, function and macro calls, constants, operators, numbers, enum variants.

## Installation

You need these settings:

```json
// ~/.config/zed/settings.json

{
  "languages": { "Rust": { "semantic_tokens": "combined" } },
  "global_lsp_settings": {
    "semantic_token_rules": [
      {
        "token_type": "keyword",
        "token_modifiers": ["controlFlow"],
        "style": ["keyword.control"]
      },
      {
        "token_type": "operator",
        "token_modifiers": ["controlFlow"],
        "style": ["keyword.control"]
      },
      {
        "token_type": "const",
        "token_modifiers": ["declaration"],
        "style": ["constant.definition"]
      },
      {
        "token_modifiers": ["declaration", "library"],
        "font_weight": "normal"
      }
    ]
  }
}
```

Without these settings the theme still works, with three gaps:

- struct, enum, trait and const declarations are plain, not bold
- `?` is black, not brown
- generic parameters are black, not gray

With semantic tokens on but without the rules:

- `return`, `if`, `match`, `.await` and the rest of control flow turn gray
- import aliases like `as Map` turn bold.

Each rule covers a gap in Zed or rust-analyzer, [UPSTREAM.md](UPSTREAM.md) tracks the fixes.
