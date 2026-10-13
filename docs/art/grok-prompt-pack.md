# Grok prompt pack: missing and replacement art

Every image the game is missing or should replace, as of Oct 2026. Each prompt is a **style block** plus a **subject line**: paste the style block for the section, then the subject. The output filename is the heading. `asset-manifest.json` next to this file lists the same items with target path, size and background, so a post-processing script can place them.

**General rules for every prompt**
- Generate larger than the target, then downscale with nearest-neighbour to the true pixel grid. The sizes below are what ships.
- Props, event vignettes and icons: ask for a **solid flat magenta (#FF00FF) background**, so it can be keyed out cleanly. Don't use "transparent background"; models tend to fake a checkerboard.
- No text, no logos, no watermark, no UI, no border or frame.
- Reroll anything that comes back with a corner sparkle or a signature.

---

## A. Landscapes (event-panel backgrounds)

Shown full-bleed behind the event panel (`background-size: cover`). **Ship 960×540 (16:9) JPG**, generated on a 480×270 pixel grid.

### A1. Main map: all 30 landscapes, map-accurate → [`landscape-prompts.md`](landscape-prompts.md)

Each region's image is the view from a real spot on the map, rendered as a 3D composition guide by `tools/landscape-guides/render.py`, so positions and neighbours stay consistent. That file holds the guide images, the shared world bible and a copy-ready prompt per region. It replaces the old per-image list (the missing `unknown_hills`, the borrowed `stormy_water`/`shallow_water`/`icy_mountain_top`/`mountain_east`/`mountain_forest2`, and the watermarked `pleasure_island`/`south_coast`).

### A2. Arena background (watermarked)
| File | Subject line |
|---|---|
| `../images/arenabg.png` | grand sandstone gladiator arena interior, tiered seating, banners, sandy floor, empty, midday (ship 1920×1080) |

### A3. Cathedral map: deferred (12)
Not a focus yet; this map hasn't had much work. When it does, it should get the same map-accurate treatment as the main map.

Setting: **the Shimmering Isles, home base of the Golden Concordat**, a gilded gothic cathedral on an island, white stone and gold trim, sea all around.

| File | Subject line |
|---|---|
| `backforest.jpg` | dense old forest behind a gothic cathedral, cathedral spires visible through the trees, dappled light |
| `agnes_garden.jpg` | walled cathedral herb and flower garden, stone paths, gravestones with flowers, a bench, warm afternoon light |
| `church_roof.jpg` | on the slate roof of a gothic cathedral, flying buttresses, gargoyles, gold-trimmed spires, sea horizon beyond |
| `sewers.jpg` | stone sewers beneath a cathedral, arched brick tunnels, shallow green water channel, lanterns, moss |
| `tower_balcony.jpg` | narrow stone balcony high on a cathedral bell tower, gold railing, view over a sunlit island and sea |
| `courtyard.jpg` | cathedral cloister courtyard, white stone arcades, gold banners, central lawn, statues |
| `tower_top.jpg` | the very top of a gothic bell tower, great bronze bell, open arches, wind and clouds at eye level |
| `bridge.jpg` | ornate white stone bridge leading to a gothic cathedral over a sea channel, gold lamps |
| `church_wall.jpg` | outer wall of a gothic cathedral, stained-glass windows, ivy, buttresses, path along the base |
| `tower_wall.jpg` | climbing the outside of a stone bell tower, sheer wall, ivy, ledges, dizzying drop to the sea |
| `fountain.jpg` | ornate marble fountain in a cathedral plaza, gold statue at its centre, pigeons, sunlight through spray |
| `cross.jpg` | huge golden cross at the cathedral's peak against a dramatic sky, seen up close |

---

## B. Event vignettes (step-on locations)

Shown in the event panel when the player steps on the tile. **Ship 512×512 PNG, transparent background** (generate on magenta). Style anchors already in the game: `sword1.png`–`sword5.png`, `boat1.png`, `underground_well1.png`, `commanders_tent.png`.

**Style block**
```
pixel art diorama vignette, top-down 3/4 view, a small floating patch of ground showing one location, rich detail, crisp pixels, soft drop shadow, JRPG style, isolated on a solid flat magenta #FF00FF background, no text, no watermark, square
```

### B1. Missing files the code already references (drop-in, no code change) (7)
| File | Used by | Subject line |
|---|---|---|
| `legendary_sword.png` | 8 sword-site events (fallback) | an ornate legendary sword driven into a small mossy stone plinth, faint glow |
| `mountain_lair.png` | Veres' Lair | a private alcove carved in grey mountain rock, arranged stones, furs, a small fire, comfortable and deliberate |
| `waterfall.png` | The Singing Falls | a small waterfall in mountain forest, faint luminous musical motes rising from the pool |
| `hells_glow.png` | Hell's Glow, Burned Patch, Second Scar | a patch of scorched earth glowing deep red from cracks below, wisps of heat |
| `secret_cave.png` | Secret Cave | a narrow cave mouth hidden behind thick overgrowth, vines parting slightly |
| `underground_well.png` | Southern Resonance Point | a humming survey site, small wooden derrick over a drilled hole, faint resonance rings in the ground |
| `campfire2.png` | The Warm Spring | a steaming thermal pool in glacier ice, warm turquoise water, snow banks around it |

### B2. Unique art for each sword site (optional, replaces the shared fallback) (8)
| File | Event | Subject line |
|---|---|---|
| `sword_still_water.png` | Blade of Still Water | a sword lying at the bottom of a perfectly still shallow pool, untouched by rust |
| `sword_open_mountain.png` | Blade of the Open Mountain | a sword driven into a shaped mountain rockface at a dragon's eye height |
| `sword_forest_pact.png` | Blade of the Forest Pact | a sword wrapped in living vines that grow in a perfect circle |
| `sword_river_fork.png` | The River Fork | a fork in a river, something glinting beneath the slow water |
| `sword_stone_circle.png` | The Stone Circle | a ring of ancient standing stones on a plateau, a sword at the centre |
| `sword_shrine_sanctum.png` | The Shrine Sanctum | inner sanctum of a dragon shrine, heavy stone, a sword on an altar |
| `sword_glacier_shelf.png` | The Glacier Shelf | a sword suspended inside a shelf of ancient clear blue ice |
| `sword_farthest_shore.png` | The Farthest Shore | the last shore before an unnamed ocean, a sword planted in pale sand |

### B3. Replace the crude 32×32 icons from Feb 2025 (4)
| File | Event | Subject line |
|---|---|---|
| `shrine.png` | Aura Shrine | an ancient humming shrine, carved stone pillar with a floating blue crystal |
| `teleporter.png` | Teleporter to Dragon Island | a ring portal of standing stones humming with blue-violet energy (currently shares `shrine.png`) |
| `rune.png` | Ancient Dragon's Fang Shrine | a giant fossil dragon fang rising from the ground, a rune circle of stones and small glowing lamps at its base |
| `crevice.png` | Malefic Cave | a small crevice in a hillside leaking a nauseating dark purple aura |

---

## C. Resource node props

Shown in the event panel when stepping on a gatherable node. **Ship 256×256 PNG, transparent.** Style anchors: `green_tree.png`, `evergreen_tree.png`, `boulder.png`, `tree_log.png`.

**Style block**
```
single pixel art game prop, top-down 3/4 view, crisp pixels, clean dark outline, soft shadow at the base, cosy JRPG overworld style, centred, isolated on a solid flat magenta #FF00FF background, no text, no watermark, square
```

| File | Subject line |
|---|---|
| `swamp_tree.png` | a gnarled swamp tree with hanging moss, roots in dark water |
| `red_palm_tree.png` | a palm tree with crimson-red fronds |
| `green_mushroom.png` | a large green mushroom with white spots |
| `green_mushroom_mini.png` | a cluster of three small green mushrooms with white spots |
| `blue_mushroom.png` | a large pale-blue mushroom with white spots |
| `blue_mushroom_mini.png` | a cluster of three small pale-blue mushrooms |
| `yellow_mushroom.png` | a large yellow mushroom cap with red spots |
| `yellow_mushroom_mini.png` | a cluster of three small yellow mushrooms with red spots |
| `red_flowers.png` | a clump of red wildflowers in grass |
| `blue_flowers.png` | a clump of blue wildflowers in grass |
| `red_crystal.png` | a formation of jagged red crystals growing from rock |
| `tree.png` | a broad oak tree (replaces the old 32×32 icon) |
| `big_mushroom.png` | a giant red toadstool (replaces the old icon) |
| `rock_mine.png` | a minable rock outcrop with visible ore veins (replaces the old icon) |
| `fountain.png` | a small stone fountain with gems glinting in the basin (replaces the 24×24 icon) |

---

## D. Enemies

Shown in combat, the journal and encounters. **Ship 1024×1024 PNG**, with a scenic background like the current set. Style anchors: `rock_lion.png`, `mountain_basilisk.png`, `forest_prowler.png`.

**Style block**
```
pixel art creature portrait, full body, dynamic three-quarter pose, detailed 32-bit era pixel art, crisp pixels, dramatic rim lighting, matching habitat background, JRPG bestiary style, no text, no watermark, no border, square
```

### D1. Watermarked: regenerate (14, plus `arenabg.png` in A2)
| File | Subject line |
|---|---|
| `biceon.png` | a massive bison with fur of permafrost and horns of solid ice, glacier background |
| `bob.png` | a titanic dragon-shark the size of an island, surfacing from the sea, oddly calm expression |
| `coral-eyes.png` | a sturdy crab whose eyes are living, growing coral, reef background |
| `forest_prowler.png` | a sleek feline predator built for extreme speed, glowing green runes, forest background |
| `goddess.png` | a radiant divine goddess in white and gold with great feathered wings, sunlight clouds |
| `mountain_basilisk.png` | a heavy-scaled coiled lizard that turns prey to stone, rocky mountain background |
| `punching_tortoise.png` | a muscular beach tortoise in a boxing stance, beach background |
| `rock_lion.png` | a proud lion with a mane of jagged stone, forest edge background |
| `shark_soldier.png` | a humanoid shark warrior in coral armour with a trident, undersea kingdom background |
| `solis_sentinel.png` | a knight in golden armour radiating pure sunlight, cathedral interior background |
| `toxolotl.png` | a neon-coloured axolotl secreting paralysing toxin, murky water background |
| `vanguard_siren.png` | an elite siren soldier with trident and coral armour, guardian of the southern seas |
| `water_spirit_beast.png` | a shimmering beast made of pure high-pressure water, swirling sea background |
| `wilhemina.png` | the elite siren commander, ornate blue and gold armour, long blue hair, wielding a blade |

### D2. Older style or unfinished: regenerate for consistency (5)
| File | Subject line |
|---|---|
| `greenhorn.png` | a young green dragon whelp, a little clumsy, golden wheat field background |
| `woodmech_bear.png` | a bear-shaped automaton of carved wood and brass gears, forest background |
| `white_wyvern.png` | a majestic white wyvern, wings spread, waterfall cliff background |
| `aquamech_shark.png` | a mechanical shark of riveted steel plates patrolling deep water |
| `inkjet_ray.png` | a manta ray evolved into a draconic semi-flying beast spitting ink, stormy sky over sea (current one has a white background) |

---

## E. Small UI

| File | Ship | Subject line |
|---|---|---|
| `game_icons/mastery.png` | 32×32 | a small gold medal with a star, pixel art icon, magenta background. Models struggle at 32px, so generate at 512 and downscale, or take one from the existing icon pack instead. |

## Not for Grok

- **Map sprites** for Bonnie (she's placed on the cathedral map but `bonnie.gif` doesn't exist), Alice, Marjane and Minerva. These need to match the LPC walk-sheet format the other NPCs use, so use the LPC character generator rather than an image model.
- **Character art** (TensorArt anime illustrations) is out of scope; it isn't pixel art.
