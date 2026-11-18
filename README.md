# Game Forge

[![Made with pollinations.ai](https://raw.githubusercontent.com/pollinations/pollinations/main/packages/ui/src/brand/pollinations-badge.svg)](https://pollinations.ai/?ref=badge)

Describe a game in one line; a Pollinations text model writes it as a single self-contained HTML page,
and the app drops it into a sandboxed frame so you can play it right away and share the link.

Live: **https://game-forge.pollinations.app**

Built for the [#20021 quest](https://github.com/pollinations/pollinations/issues/20021).

## How it works

- `index.html` + `app.js` + `style.css`: the whole app, static, no framework and no build step.
- The idea goes to `gen.pollinations.ai/v1/chat/completions` (default `openai/gpt-5.3-codex`) with
  strict instructions: one HTML document, inline style and script, no network, canvas or DOM,
  score, start screen, game over and restart.
- The answer is cut down to the document and set as the `srcdoc` of an iframe with
  `sandbox="allow-scripts"`, so the forged game runs with no network and no access to the page.
- Sign-in is the **Pollinations Connect** widget: the visitor spends from their own pollen balance,
  and the app never sees a key it was not handed.
- The idea travels in the URL hash (`#idea=…`), so a link reproduces the run.

## Files

```
index.html   the page, the Connect widget and the frame
app.js       the model call, the HTML extraction, the share link
style.css    the layout
screenshot.png  the app after forging "a tiny submarine dodging mines and collecting pearls"
```

## License

MIT.
