# Dungeon Ascension — Luminous Armour v1.1

## v1.1 — Visibility without reducing graphics

The v1.0 dark-fantasy grade was too dark to navigate reliably. This patch improves actual scene illumination and material readability while also replacing the blocky character equipment silhouettes.

- Stronger hemisphere light and warm directional key light, complemented by a cool blue fill
- Dedicated warm light follows the player and new room-centre lights illuminate main dungeon routes and combat areas
- Lighter fog tint and density, and tuned filmic exposure for readable walls, ground and enemies
- Reduced black vignette and softened the postprocessing contrast, without disabling antialiasing, decreasing resolution or reducing texture detail
- New tapered forged-steel sword, separate raised fuller, bevelled edges, curved crossguard, leather grip, layered grip rings and sculpted pommel
- More shaped hero breastplate, helmet, pauldrons, vambraces, shin protection and decorative trim
- Enemy armour plates, silhouette accents and distinct archer equipment; the stable built-in hero model remains visible
- Original Nightmare enemy chase distances, collision calculations, dungeon progression, contracts, relics, elite bounties and inventory unchanged
- Same localStorage save key (`dungeon-ascension-v0.1`) and version 1
- Graphics presets remain selectable from the pause menu. This update increases lighting and appearance detail, rather than lowering default graphics

**Verification:** JavaScript parsing and visual wiring checks passed. A full interactive browser test and GPU performance measurements have not been completed. If issues occur, report the dungeon tier, graphics mode, and whether experimental external enemy models were enabled.

**Play:** https://dungeonascension.onrender.com — press Ctrl+Shift+R if an older build remains cached.

## Previous release — Visual Ascension v1.0

## v1.0 Visual Ascension — major art, effects and presentation update
This update makes the existing browser game more atmospheric and readable while retaining the prior movement, Nightmare collision fixes, Elite Hunts, dungeon contracts, crafting, loot, upgrades and permanent progress.

**Environment and graphics**
- Procedurally generated, repeatable stone texture applied to floor, walls and architectural surfaces
- New decorated columns, stone beams, ornate trim, rune discs, relics, coffins and hanging cages
- Boss arena additions, floating crystals, and changing room decoration throughout dungeon tiers
- Floating dust/magic particles with Low / Medium / High density levels
- Distant point lights culled based on player proximity to limit active lighting cost
- Animated arcane portal rings, rotating central crystals and more elaborate treasure chests
- Detailed built-in player armour, helmet, shoulder and sword accents without relying on a broken imported hero model
- More distinctive visual details for brutes, archers, skeletons and bosses

**Combat and rewards**
- Additional hit impacts and ability pulses without modifying how gameplay hitboxes or damage are calculated
- More pronounced boss and elite victories, chest reward animations and effects
- An updated dark-fantasy UI with improved readability, contrast, animations, and accessible reduced-motion styles
- Optional original procedural sound effects for weapon strikes, impact, abilities, loot, boss defeats and portals
- Existing collision and Nightmare chasing logic is left unchanged

**Settings, performance, and saves**
- Esc → Graphics cycles Low / Medium / High (rendering resolution, particle count and number of nearby active lights)
- Esc → Sound Effects toggles Web Audio effects and persists the choice
- Esc → 3D Character Models retains the experimental external enemy model toggle. The built-in player remains the safe visible model
- Save version stays 1 and localStorage key remains `dungeon-ascension-v0.1`; old saves load with defaults for new preferences
- No additional remote asset files are required for the v1.0 visual layer; generated materials and effects are local
- The visual code bounds concurrent impact rings and cleans up transient atmospheric particles when changing worlds
- Rendering quality and frame rates depend on device, GPU and browser. No measured 60 FPS guarantee

**Testing limitations:** JavaScript syntax checks, source-level integration checks, and combat regression tests are supported by the repository test suite; a full interactive 3D browser playthrough has not been verified by these checks. The environment is still a stylised procedural game; this is not a photorealistic, professionally modelled asset replacement.

**Play:** https://dungeonascension.onrender.com — refresh using Ctrl + Shift + R to load the newest files.

## Previous release — Elite Hunts v0.9

## v0.9 Elite Hunts and combat stability
Each dungeon now includes one optional marked elite enemy with extra health, slightly higher attack damage, and a guaranteed completion bounty. This is an additional challenge, not a requirement to defeat the main boss or use the exit portal.

- Elite target is marked in the world and circled in gold on the minimap
- New Elite Hunt HUD shows target health and gold/gem bounty
- Rewards scale with dungeon tier and the Explorer / Veteran / Nightmare multiplier
- Elite bounty is awarded once per dungeon run after the target is defeated
- The existing combat movement, hitbox warnings, and enemy stop distances remain unchanged from v0.8
- Preserves all existing equipment, gold, gems, dungeon progress, contracts, and the `dungeon-ascension-v0.1` save key
- Added reward-scaling tests to the combat regression suite

**Testing status:** JavaScript syntax and source integration checks passed; 2,430 local geometry/reward assertions passed. A real browser playthrough of this update has not yet been completed, so game stability is not guaranteed.

**How to play:** Enter a dungeon contract and follow the gold marker on the minimap to find the elite. Its health is shown in the Elite Hunt panel. Defeat it to automatically claim bonus gold, gems, and XP. You may still finish the dungeon without completing the elite bounty.

## Previously: v0.8 — Nightmare Combat Repair
Fix for reports on tier-five Nightmare runs where enemies ran past the player or appeared to attack from positions different from their visible model.

- Added shared, tested enemy chase math that cannot overshoot the player's stop radius, even with frame hitches or Nightmare movement speeds
- All enemies stop and attack from consistent world-space positions; nearby monsters separate instead of overlapping the player
- Melee attack warnings originate at the enemy; ranged attacks and shockwaves lock the intended target position, and damage uses the exact same radius as the warning
- Red warning zones match the damage area; enemy body hitbox debugging can be enabled with **H**
- **T** toggles auto-attacks; with auto-attacks off, **F** or left-click (after pointer lock) makes a manual basic attack
- Imported third-party enemy models default to **OFF once** for old and new saves to avoid drifting animation mismatches; they remain optional in the pause menu
- A shared pure combat geometry module (`combat-math.mjs`), regression test file and GitHub Actions test command are included
- Existing save key (`dungeon-ascension-v0.1`) and all permanent progression remain intact

**To test:** Refresh with Ctrl+Shift+R, select tier 5 Nightmare, use **H** to see enemy collision positions, and test whether enemies approach and strike from the expected location. The imported model setting can be turned back on in the pause menu, but those models should still be considered experimental until verified.

**Verification:** Source syntax checked, shared combat math passed 1,008 local assertions in the connected tools, and a Node test suite is included in the GitHub workflow. These are not a substitute for a full interactive browser playthrough or confirmed GitHub Actions run.

## v0.7.1 — Player visibility hotfix
The optional third-party knight GLB could hide the original character without displaying a valid replacement, leaving only the sword visible. The playable hero now always uses the built-in animated model until the imported knight's rig, orientation, bounds, and animation have been fully validated. Detailed GLB enemy models remain optional and can be disabled from the pause menu. This change preserves the same save key and all existing gameplay features.



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
