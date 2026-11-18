/**
 * Game Forge — describe a game, get a playable one.
 *
 * The text model writes a single self-contained HTML page; the page is dropped into a sandboxed
 * iframe (allow-scripts, no network) and played. Sign-in is the Pollinations Connect widget, so a
 * visitor spends from their own pollen balance.
 */
(function () {
  const el = (id) => document.getElementById(id);
  const widget = document.querySelector('polli-connect');
  const MODEL = 'openai/gpt-5.3-codex';

  const SAMPLES = [
    'a tiny submarine dodging mines and collecting pearls, three lives, arrow keys',
    'a one-button rocket that hops between platforms, score by height, space to jump',
    'a street cat catching falling fish while dodging pigeons, mouse controls, 60 seconds',
    'a two-player snake duel on one keyboard, WASD against arrows, first to 5 wins',
    'a lantern-keeper lighting candles in the dark before the oil runs out, click to move',
  ];

  const key = () => (widget && widget.apiKey ? widget.apiKey : null);
  const status = (t) => { el('status').textContent = t || ''; };

  const PROMPT = (idea) => `You write small browser games. Write ONE self-contained HTML page for this game:

"${idea}"

Hard rules:
- A single HTML document: <!doctype html> with inline <style> and <script>. No external files, no
  network calls, no imports, no build step, no framework.
- It must run inside a sandboxed iframe with scripts but no network: everything in one page.
- Keyboard (and mouse/touch where it fits) controls, drawn on a <canvas> or with DOM elements.
- A visible score, a start screen, a game-over screen and a restart key.
- Keep it under 400 lines and make it actually fun in the first five seconds: small, complete and
  polished beats ambitious and broken.
- No lettering that the browser cannot render; no emojis in the drawing code.
- Answer with the HTML only, starting at <!doctype html> and ending at </html>. No prose, no code
  fence.`;

  function extractHtml(text) {
    const fence = text.match(/```(?:html)?\s*([\s\S]*?)```/i);
    const body = fence ? fence[1] : text;
    const start = body.search(/<!doctype html|<html/i);
    if (start < 0) return null;
    const end = body.lastIndexOf('</html>');
    return end > start ? body.slice(start, end + 7) : body.slice(start);
  }

  async function askModel(idea) {
    const res = await fetch('https://gen.pollinations.ai/v1/chat/completions', {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${key()}` },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: 'You answer with one complete HTML document and nothing else.' },
          { role: 'user', content: PROMPT(idea) },
        ],
        temperature: 0.8,
        max_tokens: 6000,
      }),
    });
    if (!res.ok) throw new Error(`the model answered HTTP ${res.status}`);
    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content ?? data?.choices?.[0]?.text ?? '';
    if (!text) throw new Error('the model answered nothing');
    return text;
  }

  function show(html, idea) {
    const frame = el('game');
    frame.srcdoc = html;
    el('code').textContent = html;
    el('stage').hidden = false;
    el('share').hidden = false;
    el('title').textContent = idea;
    el('howto').textContent = `${html.length.toLocaleString('en-US')} bytes of one page — click the frame, then use its own keys.`;
    history.replaceState(null, '', `#idea=${encodeURIComponent(idea)}`);
  }

  async function forge() {
    const idea = el('idea').value.trim();
    if (idea === '') { status('write an idea first'); el('idea').focus(); return; }
    if (!key()) { status('connect first (top right) so the model spends your pollen'); return; }
    el('forge').disabled = true;
    status(`asking ${MODEL} to write “${idea}”…`);
    try {
      const text = await askModel(idea);
      const html = extractHtml(text);
      if (!html) throw new Error('the answer carried no HTML page');
      show(html, idea);
      status('ready — the game is in the frame');
    } catch (err) {
      status(`failed: ${err.message}. Try again, or simplify the idea.`);
    } finally {
      el('forge').disabled = false;
    }
  }

  el('forge').addEventListener('click', forge);
  el('sample').addEventListener('click', () => {
    el('idea').value = SAMPLES[Math.floor(Math.random() * SAMPLES.length)];
    status('idea picked — press Forge the game');
    el('idea').focus();
  });
  el('share').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(location.href);
      status('share link copied');
    } catch {
      status('copy the address bar to share');
    }
  });
  el('copy').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(el('code').textContent);
      status('the game HTML is on your clipboard');
    } catch {
      status('select the source and copy it by hand');
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) forge();
  });

  const hash = new URLSearchParams(location.hash.slice(1)).get('idea');
  if (hash) { el('idea').value = hash; status('idea from the link — press Forge the game'); }
  else status('waiting for the idea');
})();