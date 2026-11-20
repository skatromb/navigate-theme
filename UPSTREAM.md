# Upstream work

Labels Zed lacks to match the VS Code theme. Branch names refer to local Zed patches, now deleted.

On hold: an extension can't add queries to a built-in language, so a theme can't ship its own rules like VS Code injections. Waiting for [#8795](https://github.com/zed-industries/zed/issues/8795), extending built-in queries from an extension.

## Tree-sitter, default settings

- `?` as control flow: `rust-try-keyword-control`, `(try_expression "?" @keyword.control)` plus the `operator + controlFlow` rule.
- Bold top-level struct, enum, union, type alias, trait: `rust-type-definition-highlight`, `type.definition` and `type.interface.definition` on direct children of `source_file`.
- Bold top-level `impl` header, self type and trait: `rust-impl-type-definition`, same anchoring.
- Python `\` line continuation gray: `python-punctuation-special`, `(line_continuation) @punctuation.special`.
- Not started: `unsafe` as important, methods and nested functions not bold (every `function_item` is `function.definition`), top-level `mod` name bold, type annotations gray (every type is `type`).

## Semantic tokens, only with `semantic_tokens` on

- Control flow keywords: `rust-control-flow-semantic-tokens`, `keyword + controlFlow → keyword.control`.

## Dropped

- `rust-generic-angle-brackets`, `rust-colon-punctuation`: operators and punctuation share one gray.
- `const` and alias semantic rules, rust-analyzer `implTarget`: tree-sitter covers it.
- Derive arguments like `Debug` gray: Zed keeps them `type` on purpose, [#37439](https://github.com/zed-industries/zed/pull/37439).
- `rust-namespace-path-prefix`: grays path prefixes in code too, the theme grays them only in `use`.
