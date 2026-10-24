# Navigate

Zed theme that helps you navigate through the sea of code. Panels are copied from [JetBrains Light](https://github.com/artemevsevev/zed-theme-jetbrains).

Most color schemes colorize syntax: keywords, expressions, operators. That doesn't help: you already know the syntax.

What helps instead is dimming noisy boilerplate and highlight few important moments.

## Important

- **Bold brown ![](https://placehold.co/12x12/A4472D/A4472D.png)**: breaking control flow, `return`, `break`, `continue`. Non-breaking control flow shouldn't be highlighted, but currently we can't: `if`, `match`, `loop`, `for`, `.await`, `?`
- **Bold black ![](https://placehold.co/12x12/080808/080808.png)**: all declarations
- Macros ![](https://placehold.co/12x12/080808/080808.png): ❓ currently regular, should be mark as important as ~declarations/control flow as they could be tricky
- _Italic bark ochre_ ![](https://placehold.co/12x12/9F5C10/9F5C10.png): comments, as they carry important notes
- Green ![](https://placehold.co/12x12/0F8A0F/0F8A0F.png): string literals that you read when debugging

## Insignificant

- Transparent gray ![](https://placehold.co/12x12/A8A8A8/A8A8A8.png): `#[...] attributes`
- Italic gray ![](https://placehold.co/12x12/8C8C8C/8C8C8C.png): `\\\ Doc comments`
- Light gray ![](https://placehold.co/12x12/6E6E6E/6E6E6E.png): `fn`, `let`, `pub`, `use`, `impl` keywords, primitive types, generic parameters, lifetimes, punctuation (`::`, `.`, `,`, brackets)

## Regular

Regular black ![](https://placehold.co/12x12/080808/080808.png): variables, fields, types, paths, function and macro calls, constants, operators, numbers, enum variants.

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
      }
    ]
  }
}
```

Tree-sitter sees syntax only. It can't tell a struct declaration from a struct reference, and `?` is just another operator to it. The theme works like that out of the box: function declarations are bold, struct, enum, trait and const declarations stay plain, `?` stays black.

rust-analyzer knows what things are. Turn its semantic tokens on, and declarations get bold, `?` gets brown. There is a catch: Zed's default rules paint every keyword gray, control flow included. Two rules give it back. The third makes `const` declarations bold, like the other declarations.

Each of these settings covers a gap in Zed or rust-analyzer. [UPSTREAM.md](UPSTREAM.md) tracks the fixes.

## Extra (?)

Want more? Zed makes import aliases bold, because rust-analyzer marks them as declarations. One rule keeps them plain. Put it after the three above, the first matching rule wins:

```json
{ "token_modifiers": ["declaration", "library"], "font_weight": "normal" }
```
