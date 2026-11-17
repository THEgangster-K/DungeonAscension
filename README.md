# Dungeon Ascension — Shadows of the Deep v0.7

A browser-based 3D fantasy dungeon grinding simulator built with Three.js.

## Play
https://dungeonascension.onrender.com/

## What's new in v0.7
- Accessible side chambers branch off selected dungeon rooms, with real openings in the original wall layout
- Optional treasure side paths, some guarded by additional enemies
- New Guardian Shockwave attack with a larger visible telegraph and extra reaction time
- Phase-two Guardian summons two sentinels, alongside its existing speed and damage increases
- Boss phase indicator in the HUD and side-chamber count display
- Original save key, dungeon contracts, relics, crafting, equipment, character models, and controls preserved

## Previously added in v0.6
- Animated character model loading via glTF, replacing procedural visuals for the hero and dungeon enemies when loading succeeds
- CC0 Quaternius-derived knight, skeleton and demon models, loaded from the public Warptracker GitHub asset collection
- Animated idle and movement states where included in the source models
- Restored enemy limb animations after identifying an earlier AI override
- Updated 3D model status on the HUD and a pause-menu toggle between detailed models and lightweight procedural graphics
- Asynchronous model loading with fallback so missing third-party assets do not stop the game
- Existing character data, contracts, relics, upgrades and original save key retained

## Previously added in v0.5
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
v0.7 expands the prototype but is not a finished commercial RPG. The 3D assets are procedurally built from geometry rather than imported hand-animated character models. Automated smoke tests are defined in `.github/workflows/smoke.yml`; full gameplay and performance need browser playtesting.

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

## Animated 3D model sources and license
These optional models are loaded at runtime from `https://raw.githubusercontent.com/ilrein/warptracker/main/public/models/`, specifically `knight.glb`, `skeleton.glb`, and `demon.glb`. They are derived from Quaternius's Animated Knight Pack, Animated Monster Pack, and Ultimate Monsters, all CC0. See the [source asset manifest](https://github.com/ilrein/warptracker/blob/main/ASSETS.md) and [Quaternius](https://quaternius.com/). The game does not redistribute model bytes in this repository. Third-party model downloads require network access; if unavailable, simpler existing geometry remains visible.

## v0.6 testing and limitations
Static checks confirm JavaScript syntax, import-map presence, UI integration, old save-key preservation, and model fallback wiring. Live browser gameplay, animation transitions, model load success on all devices, and frame rate have NOT been fully verified. Use **Esc → 3D Character Models** to switch to lighter graphics if needed. Imported assets improve character shapes but room layouts still use the original template-based system.

## v0.7 dungeon and boss notes
Optional side chambers connect to alternating main chambers through a wide doorway. They may contain guarded treasure or quieter loot opportunities. Continue along the central passage to find the Bone Guardian. During the boss encounter, larger circular warning areas indicate a shockwave: move outside the marked circle or dodge before the attack lands. At half health, the Guardian summons additional enemies. Earlier contracts and dungeon tiers remain replayable.

## v0.7 verification
JavaScript syntax and integration checks pass; all required site assets remain linked, including saved progress compatibility. A completed browser gameplay session and device-specific FPS measurements are **not** available from these checks. The previous glTF model CDN dependency remains optional and can be disabled using the pause-menu toggle.
