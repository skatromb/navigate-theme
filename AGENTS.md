Take care about the DX/UI and its coherence, as professional designer would do.

Always look at https://github.com/pustota-theme/pustota as of reference implementation (including in repo tooling) before implementing anything.

Look at DESIGN.md, always ask before changing this file.
@DESIGN.md

We could also get some inspiration from https://github.com/tonsky/vscode-theme-alabaster.

The theme must work for anyone who just installs it.
Never change editor settings to get an effect.
Design for the syntax grammar only.

UPSTREAM.md tracks gaps we fix upstream.

README screenshots: `cd tools && npm install && npm run render`. [tools/render.js](tools/render.js) tokenizes the samples with the VS Code grammars and this theme, then screenshots the HTML with headless Chrome.

Release: bump `version` in [vscode/package.json](vscode/package.json), merge, then push tag `v<version>` on `main`. [.github/workflows/publish.yml](.github/workflows/publish.yml) publishes to the Marketplace with `vsce publish --oidc` and to Open VSX with `ovsx publish --trusted-publishing`, no tokens.
