# Zed notes

Zed 1.25.3, macOS.

## Highlighting

- Semantic tokens are off by default: `"languages": { "Rust": { "semantic_tokens": "combined" } }`.
- Rules: `global_lsp_settings.semantic_token_rules`. A rule matches when all its modifiers are present. Order: defaults, language, user. Inside the user list the first matching rule wins. Each rule overwrites only the fields it sets, so set `font_weight` explicitly to drop bold.
- Default rules: `assets/settings/default_semantic_token_rules.json`. Every `keyword` maps to `keyword`, so control flow loses `keyword.control` unless a user rule restores it. Declarations map to `type.definition`.
- Rust rules: `crates/grammars/src/rust/semantic_token_rules.json`, between defaults and user rules. Has `attribute`, `typeAlias`, punctuation, no `controlFlow`.
- Zed does not ask rust-analyzer for punctuation tokens, so brackets, `::` and `.` are always colored by tree-sitter.
- Theme syntax keys match by exact name, with fallback to the parent: a missing `namespace.crateRoot` uses `namespace`. A rule without `token_type` matches every token type.
- Zed fetches semantic tokens before rust-analyzer loaded dependencies and does not refetch. Partial tokens: unresolved import alias is `variable [declaration]`, crate root has no token. Fix candidate: `editor: restart language server`.
- Semantic token colors are baked on arrival. After a theme edit: Rebuild, then `touch ~/.config/zed/settings.json`.
- rust-analyzer puts `library` on types from other crates and nothing on workspace types. That is the only way to tell them apart.
- rust-analyzer runs from the worktree root. A Cargo project two levels deep is not found. Open it as its own workspace.

## Rust captures

Source: `crates/grammars/src/rust/highlights.scm`.

- Every type name is `type`: declarations, references, `impl Encoder`, `Some`, `Ok`. Traits have `type.interface`, also everywhere, so a trait declaration needs rust-analyzer too. Enum names in `use` lists are `type` in tree-sitter and `type.enum` in rust-analyzer: color both the same.
- `return`, `break`, `continue`, `if`, `match`, `for`, `in`, `await` share `keyword.control`. rust-analyzer marks the same set as `controlFlow`. No way to split them.
- `?` is a plain `operator`. Only rust-analyzer marks it `controlFlow`, as token type `operator`, so a rule maps it to `keyword.control`.
- `<` and `>` are `operator` everywhere, also in `Vec<T>`: the operator list comes after the bracket pattern and wins. Fix in flight, see UPSTREAM.md.
- Tail expressions have no capture in tree-sitter or rust-analyzer. A returned value cannot be colored.
- Struct, enum, trait and const declaration names need rust-analyzer: tree-sitter has no `type.definition` or `constant.definition` for Rust. Go has it. Fix in flight, see UPSTREAM.md.

## Inspecting

- `sample/sample.rs` fits one screen and has every element the theme styles. Screenshots go to `screenshots/`, git-ignored.
- `dev: open highlights tree view`: range, color, capture and semantic token per highlight. Opens by hand only.
- `python3 tools/semtok.py <rust-analyzer> <project root> <file>`: tokens straight from rust-analyzer. Set `RA_INIT='{...}'` to pass init options.

## Automation

- `screencapture -x -l <window id> out.png` grabs one Zed window, even behind others. Window ids: `swift tools/winid.swift`. Needs Screen Recording for Zed. 1 second after `zed <file>` is enough.
- `zed <file>` picks the window whose worktree contains the file. No way to target a window.
- `osascript` keystrokes need System Events permission.
- `zed: reload extensions` only rebuilds the index. It reloads a dev extension only when `extension.toml` changed. After a theme edit use Rebuild in the extensions panel (log: `finished compiling extension`).
