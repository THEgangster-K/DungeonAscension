# Dungeon Ascension — Animated Depths v0.5

A browser-based 3D fantasy dungeon grinding simulator built with Three.js.

## Play
https://dungeonascension.onrender.com/

## What's new in v0.5
- Lightweight procedural arm/leg animation for the hero and enemies (walking, attacking and wind-ups)
- Additional layered equipment visual details on characters
- Dungeon arches, floor medallions and room-specific decorative features
- Low / Medium / High graphics preset button in the pause menu; saves user preference
- Enhanced combat HUD readability
- All previous contracts, relics, loot, progression and save key retained

## Previously added in v0.4
- Dungeon portal now opens a tier and difficulty selection menu
- Replay previously unlocked tiers to farm gear and gold
- Three challenges: Explorer (100% rewards), Veteran (165%), Nightmare (230%)
- Higher difficulties strengthen enemy health, damage, and sometimes speed
- XP, gold, gems, and dungeon clear rewards scale with the chosen challenge
- Contract HUD indicates current tier, challenge, and reward multiplier
- Existing v0.1 save key and progression remain compatible

## Previously added in v0.3
- Relic shrines in dungeons offering one random run-only blessing: improved damage, reduced damage taken, better loot chance, or healing
- Three additional room decoration themes: rune crystals, crypt niches, and rubble
- Inventory bulk-sell tool for Common and Uncommon equipment, protecting equipped and Rare+ items
- Relic blessing indicator in the HUD
- Prevent repeated T key events rapidly toggling automatic attacks

## Previously added in v0.2
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
The game retains the existing `dungeon-ascension-v0.1` localStorage key. Your saved level, XP, currencies, items, equipped equipment, upgrades and dungeon progress are preserved. Additional progression fields default to zero when loading older saves. Use **Pause → Export Save** to create a backup.

Local storage is specific to the browser and device and can be erased by browser settings.

## Quality and limits
v0.5 expands the prototype but is not a finished commercial RPG. The 3D assets are procedurally built from geometry rather than imported hand-animated character models. Automated smoke tests are defined in `.github/workflows/smoke.yml`; full gameplay and performance need browser playtesting.

## Files
- `index.html` — menus and HUD
- `style.css` — layout and UI
- `game.js` — gameplay, world generation, combat, equipment, saving

## Contract gameplay
Enter the purple hub portal and select any tier you have unlocked. Choose Explorer, Veteran, or Nightmare, then click **Enter Dungeon**. Temporary relic bonuses still apply for that run. Complete the boss and use the exit portal to return to the hub. Choosing earlier tiers will not reduce your highest unlocked tier.

## Graphics
Open the pause menu (Esc) and click **Graphics** to cycle through Low, Medium and High rendering resolutions. Changes apply immediately and persist in the browser save. Quality settings affect rendering resolution, not the core gameplay mechanics.

## Current limitations
Procedural animations and geometry are an improvement over static blocks but do not replace professionally authored 3D character models. Static hosting successfully deploying does not prove the gameplay is bug-free; browser playtesting remains necessary.
