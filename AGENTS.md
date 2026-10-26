Be my DX/UI designer, take care of DX/UI, take care about coherence.

Look at DESIGN.md, always ask before changing this file.
@DESIGN.md

We could also probably get some inspiration from Alabaster theme or Pustota Light.

The theme must work for anyone who just installs it. Never change editor settings to get an effect. Design for the syntax grammar only. Semantic tokens are an optional bonus.

UPSTREAM.md tracks gaps we fix upstream.

README screenshots: `cd tools && npm install && npm run render`. [tools/render.js](tools/render.js) tokenizes the samples with the VS Code grammars and this theme, then screenshots the HTML with headless Chrome.

Release: bump `version` in [vscode/package.json](vscode/package.json), merge, then `cd vscode && npm run package`. The user uploads `vscode/navigate.vsix` by hand: give them https://marketplace.visualstudio.com/manage/publishers/skatromb (⋯ next to Navigate > Update).
