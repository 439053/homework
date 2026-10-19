# same air

**Cherry Chan, 2026** · *A companion to Home(work) by a.syadiq*
HOME | GROUND 2026 · Goodman Arts Centre · 24 Oct 2026

Drawing on oral history interviews with Goodman Arts Centre's custodians, *same air* disperses their recollections of routine, friendship and care into an online listening space. Their voices are broken into grains of sound and surface only briefly, as they might in passing along a corridor. The work also responds to Singapore's live air-quality readings: as haze thickens, the custodians grow harder to reach.

Voices: Osman, Miskam, Navina, Rimashini, Dorothy Neo. Interviews: Velda Phua, assisted by a.syadiq, for *kiss the raindrops*. Air-quality data: National Environment Agency, via data.gov.sg.

---

## What's in this folder

| Path | What it is |
|---|---|
| `index.html` | The whole piece: layout, text, visuals and sound logic |
| `chrome-title.js` | The big title's chrome burst on the opening screen |
| `haze.js`, `air.json` | The live haze; `air.json` is refreshed hourly by the GitHub Action in `.github/` |
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
- Companion line: search for `A companion to`
- Credits panel: search for `id="credits"`
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
