# Upstream work

Every setting in README exists because a label is missing. What removes each one, and what is in flight.

- `keyword`/`operator` + `controlFlow` rules: Zed branch `rust-control-flow-semantic-tokens`, adds them to `crates/grammars/src/rust/semantic_token_rules.json`.
- `const` rule: not proposed yet. Same Zed file, `const + declaration → constant.definition`.
- Alias rule: not proposed yet. Same Zed file, `declaration + library → type`, an import alias is not a definition.
- `semantic_tokens: combined`: Zed branch `rust-type-definition-highlight` adds `@type.definition` for struct, enum, trait to `highlights.scm`. Still missing there: `const_item name → constant.definition`, `try_expression "?" → keyword.control`. With both, the theme needs no settings.
- Angle brackets `<>` colored as operator: Zed branch `rust-generic-angle-brackets`.
- `impl` header as heading: no label anywhere. Plan: rust-analyzer modifier `implTarget` on the self type, then a rule `struct + implTarget → type.definition`. Not started.
