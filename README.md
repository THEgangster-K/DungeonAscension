# Dungeon Ascension — Dungeon Reforged v0.2

A browser-based 3D fantasy dungeon grinding simulator built with Three.js.

## Play
https://dungeonascension.onrender.com/

## What's new in v0.2
- Enemy attack telegraphs before damage, with an opportunity to dodge out of the warned area
- Bone Guardian phase two below half health, visible boss health HUD
- Additional bone archer enemy variant with targeted attack warnings
- Decorated dungeon chambers: carved columns, banners, rubble, braziers, floor sigils, extra treasure chests
- Enhanced procedural character geometry, armour, cloaks and boss details
- Visual swing/ability effects and target health display
- Stamina, automatic combat state, weapon mastery and FPS readouts
- New critical-chance and loot-chance gold upgrades
- Mastery progress from defeated enemies, improving attack power
- Slightly increased dungeon completion rewards
- Adaptive pixel ratio depending on graphics preference

## Controls
- WASD — Move
- Mouse — Look around (click gameplay to capture cursor)
- V — Switch first-person and third-person
- T — Toggle automatic attacks
- Shift — Sprint
- Q — Dodge
- 1–4 — Special abilities
- E — Interact
- I — Inventory/crafting
- U — Upgrade shop
- Esc — Pause

## Running locally
Run a local static server in this directory (for example `python -m http.server 8000`) and visit http://localhost:8000.

## Deployment
Static site on Render. Publish directory: `.`; build command: `echo "No build required"`. GitHub pushes to `main` automatically deploy if auto-deploy is on.

## Save compatibility
The game retains the existing `dungeon-ascension-v0.1` localStorage key. Your saved level, XP, currencies, items, equipped equipment, upgrades and dungeon progress are preserved. Additional v0.2 fields default to zero when loading older saves. Use **Pause → Export Save** to create a backup.

Local storage is specific to the browser and device and can be erased by browser settings.

## Quality and limits
v0.2 adds a much richer prototype but is not a finished commercial RPG. The 3D assets are procedurally built from geometry rather than imported hand-animated character models. Automated smoke tests are defined in `.github/workflows/smoke.yml`; full gameplay and performance need browser playtesting.

## Files
- `index.html` — menus and HUD
- `style.css` — layout and UI
- `game.js` — gameplay, world generation, combat, equipment, saving
