# Dungeon Ascension — First Descent (v0.1.0)

A playable single-player 3D browser dungeon simulator made with Three.js.

## Quick start

1. Extract the ZIP.
2. In the extracted folder, run `python -m http.server 8000` (or `npx serve .`).
3. Open `http://localhost:8000` in Chrome, Edge, or Firefox.
4. You need an internet connection for the Three.js module loaded from jsDelivr.

**Do not rely on double-clicking `index.html`**: browser module security settings can block local `file://` imports. Serve the folder with a local web server instead.

## Deploy to Render

- Upload **all three files** (`index.html`, `game.js`, `style.css`) to the root of your GitHub repository.
- For a new Render Static Site set **Build Command** to `echo Ready` and **Publish Directory** to `.`.
- No backend is required. Keep `index.html` in the published directory.

## Controls

| Key | Action |
|---|---|
| WASD | Move |
| Mouse | Look around (click game to lock mouse) |
| Shift | Sprint |
| Q | Dodge |
| V | Switch first-/third-person |
| 1 | Power Strike |
| 2 | Whirlwind |
| 3 | Battle Rush |
| 4 | Second Wind |
| E | Interact (portal, merchant, chest) |
| I | Inventory & crafting |
| U | Blacksmith upgrades |
| Esc | Pause |

## Progression

- Start in Adventurer's Haven and press **E** at the glowing portal to enter the dungeon.
- Hybrid auto-combat attacks nearby enemies; manually activate abilities for tougher encounters.
- Defeat the Bone Guardian to unlock the dungeon exit and the next difficulty tier.
- Earn XP, gold, gems, random gear and crafting recipes. Upgrade at the blacksmith.
- Saves automatically to your **current browser's localStorage**, after important actions and every 30 seconds. Save data may be lost if site data is cleared. Export save backups from the pause menu.

## Scope and known limitations

This is an early playable foundation, not the finished multi-world game. Includes a 3D hub, one dungeon biome with variable enemy counts/difficulty, random loot, basic procedural layouts, a boss, crafting, upgrades, inventory, local saves and camera switching. It uses procedural low-poly art placeholders and simple enemy pursuit, with future stages planned for polished models, animation, expanded dungeons, and more advanced combat/AI. Mobile touch controls, true multiplayer, cloud saves, and full controller support are not included.

## Project files

- `index.html`: UI and HTML entry point
- `style.css`: UI styling
- `game.js`: Three.js gameplay and saving

## Troubleshooting

If the screen stays dark, check your browser's Developer Tools > Console and ensure you can access `https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js`. Open the folder via a local server and not `file://`. For refresh-related issues, export a save backup before clearing site data.
