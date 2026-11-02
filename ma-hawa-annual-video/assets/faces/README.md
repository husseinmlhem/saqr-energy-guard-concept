Processed bobblehead faces live here (`<id>_<expression>.png`, 640×640, transparent, circle-masked).

They are **not committed** (personal photos, public repo). To recreate them:

1. Put the original photos in `assets/faces/raw/` named `<id>_<expression>.jpg`
   e.g. `ali_happy.jpg`, `ali_neutral.jpg`, `ali_shocked.jpg`, `amr_neutral.jpg`, `hussein_tired.jpg`…
2. Run `npm run faces`.

If a file listed in `config/characters.json` is missing, that character is drawn as a line-art placeholder.
