# Home(work)

**Artists: Cherry Chan & a.syadiq**
Goodman Arts Centre · The Custodians · 24 Oct 2026, 4pm – 10pm

*Home(work)* returns our attention to the custodians who hold Goodman together. Conversations broken into grains of sound, shifting pattern and smeared frames. Their voices drift and fade, the way their work often goes unseen, a rhythm of care.

Physical nodes activate across Block G and Block B on 24 Oct.

---

## What's in this folder

| Path | What it is |
|---|---|
| `index.html` | The whole piece: layout, text, visuals and sound logic |
| `chrome-title.js` | The big title's chrome burst on the opening screen |
| `media/cut.mp4`, `media/cut.webm` | The custodians' footage, cut out of the room (colour on top, transparency matte below) |
| `media/voices.mp3` | The full 3 min 13 s recording |
| `vendor/` | Local copies of Hydra (visuals), Tone.js (sound) and Total Serialism (remix engine) |
| `fonts/` | Fraunces, Instrument Sans and Syne Mono |
| `licenses/` | Licences for the libraries and fonts |
| `.nojekyll` | Tells GitHub Pages to serve the files as they are |

The page needs nothing from the internet beyond this folder.

## Editing the text

Open `index.html` in any text editor (or on GitHub, click the file, then the pencil icon).

- Opening paragraph: search for `returns our attention`
- Event line: search for `Physical nodes`
- Credit: search for `class="credit"`
- Everything said in the recording, with timings: search for `const LINES`

## Trying it on your own computer

Double-clicking `index.html` will not load the sound, because browsers block audio files opened straight from disk. To test locally, open a terminal in this folder and run:

```
python3 -m http.server
```

then visit `http://localhost:8000`.

## Credits and licences

- Visuals: [Hydra](https://hydra.ojack.xyz) by Olivia Jack and contributors, AGPL-3.0
- Sound: [Tone.js](https://tonejs.github.io), MIT
- Remix engine: [Total Serialism](https://github.com/tmhglnd/total-serialism) by Timo Hoogland, MIT
- Fonts: Fraunces, Instrument Sans, Syne Mono, SIL Open Font License

Because Hydra is AGPL-licensed, keep this repository's source public alongside the published site.

The recordings belong to the custodians and the artists. Please don't reuse them outside this work.
