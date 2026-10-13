"""
Builds the fishing content from the HEO fishing icon pack
(~/Documents/art/Else/fishing_icon_pack, free for commercial use):
  - slices fishes.png / fishing_gear.png / objects.png into static/fishing/...
  - writes src/lib/data/fishingRoster.ts from the SPEC tables below.

Edit the tables, then:  python tools/fishing/build.py   (needs Pillow)

Fish columns: id name | zones | rarity | min level | time | seasons | behaviour | size cm
  zones:     C coast  S open sea  D deep (storm)  K cold  F fresh  M swamp
  rarity:    c common  u uncommon  r rare  l legendary
  time:      a any  d Dawnrise  n Duskfall
  seasons:   - any, else letters P(spring) U(summer) A(autumn) W(winter)
  behaviour: d darter  s steady  k sinker  e erratic
"""
import json, re
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
PACK = Path.home() / 'Documents/art/Else/fishing_icon_pack'
OUT = ROOT / 'static/fishing'

FISH = """
progenetica Progenetica|F|c|1|a|-|d|0.8-1.1
clownfish Clownfish|C|c|1|a|-|d|7-11
blue_tang Blue Tang|C|c|2|a|-|d|20-31
yellow_tang Yellow Tang|C|c|1|a|-|d|15-20
gem_tang Gem Tang|C|r|6|a|-|d|18-22
sailfin_tang Sailfin Tang|C|u|3|a|-|d|30-40
angelfish Angelfish|F|u|3|a|-|s|10-15
queen_angelfish Queen Angelfish|C|u|4|d|-|s|30-45
french_angelfish French Angelfish|C|u|4|a|-|s|25-41
goldfish Goldfish|F|c|1|a|-|s|10-20
fighting_fish Fighting Fish|F|u|3|n|-|e|5-7
catfish Catfish|M|c|2|n|-|k|60-150
porcupinefish Porcupinefish|C|u|3|a|-|e|20-40
spotted_pufferfish Spotted Pufferfish|M|u|3|a|-|e|10-17
ocean_sunfish Ocean Sunfish|S|r|7|d|U|k|150-300
mahi_mahi Mahi Mahi|S|u|4|d|U|d|80-150
roules_goby Roule's Goby|C|c|1|a|-|d|4-7
red_piranha Red Piranha|M|u|4|a|-|e|20-33
lionfish Lionfish|C|u|4|n|-|s|25-38
red_scorpionfish Red Scorpionfish|C|u|3|n|-|k|25-50
stonefish Stonefish|C|r|6|n|-|k|30-40
flying_fish Flying Fish|S|u|3|d|U|d|18-30
guppy Guppy|F|c|1|a|-|d|2-6
sailfin_molly Sailfin Molly|M|c|1|a|-|d|8-15
greater_weever Greater Weever|C|c|2|n|-|k|20-40
sockeye_salmon Sockeye Salmon|F|u|4|a|A|s|50-84
taimen Taimen|K|r|7|d|W|k|70-150
atlantic_salmon Atlantic Salmon|K|u|4|a|A|s|60-120
masu Masu|F|u|3|d|P|d|30-70
monkfish Monkfish|K|u|4|n|-|k|50-100
humpback_anglerfish Humpback Anglerfish|D|r|8|n|-|k|10-18
hairy_frogfish Hairy Frogfish|C|r|6|a|-|k|10-22
common_carp Common Carp|F|c|1|a|-|k|30-80
tench Tench|M|c|2|n|-|k|20-70
koi Koi|F|r|5|d|P|s|40-90
barracuda Barracuda|S|u|4|a|-|d|60-165
cardinal_tetra Cardinal Tetra|F|c|1|a|-|d|2-5
emperor_tetra Emperor Tetra|F|c|2|a|-|d|3-5
zebrafish Zebrafish|F|c|1|a|-|d|3-4
petticoat_tetra Petticoat Tetra|F|c|1|a|-|d|4-7
perch Perch|F|c|1|d|-|s|15-45
starry_sturgeon Starry Sturgeon|K|r|7|a|W|k|100-220
lake_sturgeon Lake Sturgeon|F|r|6|a|A|k|90-200
striped_marlin Striped Marlin|D|r|8|d|U|e|200-420
swordfish Swordfish|D|r|8|n|-|e|120-450
garfish Garfish|S|c|2|a|-|d|50-90
sardine Sardine|S|c|1|a|-|d|15-25
atlantic_herring Atlantic Herring|K|c|1|a|-|d|20-40
blackspot_seabream Blackspot Seabream|S|c|2|a|-|s|30-60
gilthead_seabream Gilthead Seabream|C|c|2|a|-|s|30-60
atlantic_cod Atlantic Cod|K|c|2|a|-|k|50-120
hake Hake|S|c|2|n|-|s|40-100
bluefin_tuna Bluefin Tuna|D|r|7|d|-|e|150-300
pike Pike|F|u|4|d|-|d|40-130
common_barbel Common Barbel|F|c|2|n|-|k|30-90
tiger_barb Tiger Barb|F|c|1|a|-|d|4-7
cherry_barb Cherry Barb|F|c|1|a|-|d|3-5
opah Opah|D|r|7|a|-|s|80-200
blue_discus Blue Discus|F|r|5|a|-|s|12-20
rainbow_trout Rainbow Trout|F|u|3|d|P|d|30-76
ribbon_eel Ribbon Eel|C|r|6|n|-|e|65-130
giant_moray Giant Moray|C|u|5|n|-|e|150-300
european_conger European Conger|S|u|4|n|-|e|100-300
harlequin_snake_eel Harlequin Snake Eel|C|u|4|n|-|e|50-97
oarfish Oarfish|D|l|10|n|W|e|300-800
coelacanth Coelacanth|D|l|10|n|-|k|150-200
longnose_gar Longnose Gar|M|u|4|a|-|d|60-150
saddled_bichir Saddled Bichir|M|u|3|n|-|k|30-75
senegal_bichir Senegal Bichir|M|c|2|n|-|k|20-35
turbot Turbot|S|u|4|a|-|k|40-100
european_seabass European Seabass|C|c|2|d|-|s|30-100
european_anchovy European Anchovy|S|c|1|a|-|d|10-20
humphead_wrasse Humphead Wrasse|C|r|7|d|-|k|100-200
common_stingray Common Stingray|C|u|3|a|-|k|45-140
mako_shark Shortfin Mako Shark|D|r|8|a|U|e|180-400
river_lamprey River Lamprey|F|u|3|n|W|e|20-50
racoon_butterfish Racoon Butterfish|C|c|2|n|-|d|15-20
atlantic_trumpetfish Atlantic Trumpetfish|C|u|3|a|-|s|50-80
lyretail_anthias Lyretail Anthias|C|u|3|a|-|d|6-9
fire_goby Fire Goby|C|u|3|a|-|d|6-9
atlantic_spadefish Atlantic Spadefish|C|c|2|a|-|s|30-90
blue_acara Blue Acara|F|c|2|a|-|s|10-16
oscar Oscar|F|u|3|a|-|s|25-45
dwarf_gourami Dwarf Gourami|F|c|1|a|-|d|6-9
clown_loach Clown Loach|M|u|3|n|-|d|15-30
arapaima Arapaima|M|l|10|d|U|k|200-450
asian_arowana Asian Arowana|M|r|7|d|-|d|60-90
moorish_idol Moorish Idol|C|u|4|a|-|d|15-23
banggai_cardinalfish Banggai Cardinalfish|C|u|3|n|-|d|6-8
longhorn_cowfish Longhorn Cowfish|C|u|4|a|-|e|30-50
hogfish Hogfish|C|c|2|a|-|s|50-90
bluehead_wrasse Bluehead Wrasse|C|c|1|a|-|d|8-15
lumpfish Lumpfish|K|u|3|a|P|k|30-60
boesemans_rainbowfish Boeseman's Rainbowfish|F|u|3|d|-|d|8-11
hillstream_loach Hillstream Loach|F|u|4|a|-|d|5-8
seahorse Seahorse|C|r|5|a|-|s|12-20
pacific_oyster Pacific Oyster|C|c|1|a|-|k|8-20
pearl_oyster Pearl Oyster|C|r|6|a|-|k|15-30
hard_clam Hard Clam|C|c|1|a|-|k|7-12
giant_clam Giant Clam|C|l|9|a|U|k|80-120
mediterranean_mussel Mediterranean Mussel|C|c|1|a|-|k|5-15
great_scallop Great Scallop|S|c|2|a|-|k|10-17
spiny_cockle Spiny Cockle|C|c|1|a|-|k|6-10
fried_egg_jellyfish Fried Egg Jellyfish|S|u|3|a|U|e|20-35
nomad_jellyfish Nomad Jellyfish|S|c|2|a|U|e|40-80
portuguese_man_o_war Portuguese Man o' War|S|r|6|a|U|e|30-60
moon_jelly Moon Jelly|C|c|1|n|-|e|25-40
flame_jellyfish Flame Jellyfish|D|u|5|n|-|e|30-50
common_octopus Common Octopus|C|u|4|n|-|e|30-100
flapjack_octopus Flapjack Octopus|D|r|8|n|-|e|15-20
giant_squid Giant Squid|D|l|10|n|W|e|500-1300
common_squid Common Squid|S|c|2|n|-|d|20-50
cushion_star Cushion Star|C|c|1|a|-|k|15-25
common_starfish Common Starfish|C|c|1|a|-|k|10-30
sea_sponge Sea Sponge|C|c|1|a|-|k|10-30
sea_urchin Sea Urchin|C|c|1|a|-|k|4-7
red_king_crab Red King Crab|K|r|6|a|W|k|50-180
hermit_crab Hermit Crab|C|c|1|a|-|d|3-10
blue_crab Blue Crab|C|c|2|a|U|d|10-23
yeti_crab Yeti Crab|D|r|8|n|-|k|10-15
horseshoe_crab Horseshoe Crab|C|u|3|n|P|k|30-60
crayfish Crayfish|F|c|2|n|-|d|8-12
common_lobster Common Lobster|K|u|4|n|-|k|25-60
spiny_lobster Spiny Lobster|C|u|4|n|-|k|20-60
shrimp Shrimp|S|c|1|a|-|d|10-20
green_sea_turtle Green Sea Turtle|C|r|7|d|U|s|80-120
axolotl Axolotl|M|r|5|n|-|s|15-30
chambered_nautilus Chambered Nautilus|D|r|7|n|-|k|15-25
goose_barnacle Goose Barnacle|K|c|2|a|-|k|3-8
blue_sea_dragon Blue Sea Dragon|S|r|6|a|U|d|2-4
sea_butterfly Sea Butterfly|K|u|3|a|-|d|0.5-1
giant_cuttlefish Giant Cuttlefish|S|u|4|a|-|e|30-100
sea_cucumber Sea Cucumber|C|c|1|a|-|k|10-30
common_sea_slug Common Sea Slug|K|c|1|a|-|k|5-12
emerald_sea_slug Emerald Sea Slug|M|u|3|a|-|k|2-6
leaf_sheep Leaf Sheep|C|r|6|a|-|k|0.5-1
sea_bunny Sea Bunny|K|r|5|a|W|k|1-2.5
giant_isopod Giant Isopod|D|u|5|n|-|k|19-50
queen_conch Queen Conch|C|u|3|a|-|k|15-31
purple_cone_snail Purple Cone Snail|C|u|4|n|-|k|4-8
fireworm Fireworm|C|c|2|n|-|e|10-30
spoon_worm Spoon Worm|M|c|2|a|-|e|10-20
planaria Planaria|F|c|1|a|-|e|1-3
medicinal_leech Medicinal Leech|M|c|1|n|-|e|5-15
"""

# Objects: id name | kind (junk / treasure) | weight (relative chance within its kind)
OBJECTS = """
green_algae Green Algae|junk|10
red_algae Red Algae|junk|8
seaweed Seaweed|junk|10
dead_fish Dead Fish|junk|6
old_boot Old Boot|junk|8
fisherman_hat Fisherman Hat|junk|3
swim_trunks Swim Trunks|junk|3
floating_plastic Floating Plastic|junk|6
submerged_scrap Submerged Scrap|junk|5
floating_log Floating Log|junk|6
message_bottle Bottle with a Message|treasure|10
sunken_treasure Sunken Treasure|treasure|1
gold_coin Gold Coin|treasure|10
broken_phone Broken Phone|junk|1
rusty_can Rusty Can|junk|8
rusty_safe Rusty Safe|treasure|3
jewelry_box Jewelry Box|treasure|4
rusty_key Rusty Key|treasure|6
life_float Life Float|junk|3
rubber_duck Rubber Duck|treasure|2
"""

# Gear: pack index (1-based) -> id, name, shop price, kind, value
GEAR = {
    1: ('wooden_rod', 'Wooden Fishing Rod', 0, 'rod', 1),
    2: ('bamboo_rod', 'Bamboo Fishing Rod', 1500, 'rod', 2),
    3: ('steel_rod', 'Steel Fishing Rod', 6000, 'rod', 3),
    4: ('glassfiber_rod', 'Glass Fiber Fishing Rod', 15000, 'rod', 4),
    5: ('carbon_rod', 'Carbon Fiber Fishing Rod', 40000, 'rod', 5),
    15: ('worm_bait', 'Worm Bait', 20, 'bait', 'fast'),
    18: ('seafood_bait', 'Seafood Bait', 120, 'bait', 'rare'),
}


# Extra gear icons used by the UI only (not items)
UI_GEAR = {21: 'bobber'}


def slice_sheet(sheet, cols, out_dir, ids):
    im = Image.open(PACK / sheet).convert('RGBA')
    out_dir.mkdir(parents=True, exist_ok=True)
    for i, fid in ids:
        r, c = divmod(i, cols)
        im.crop((c * 32, r * 32, c * 32 + 32, r * 32 + 32)).save(out_dir / f'{fid}.png', optimize=True)


def parse(table, ncols):
    rows = []
    for line in table.strip().splitlines():
        head, *rest = line.split('|')
        fid, name = head.split(' ', 1)
        assert len(rest) == ncols, line
        rows.append((fid, name, rest))
    return rows


def main():
    fish = parse(FISH, 7)
    objs = parse(OBJECTS, 2)
    assert len(fish) == 144 and len(objs) == 20
    assert len({f[0] for f in fish}) == 144

    slice_sheet('fishes.png', 12, OUT / 'fish', [(i, f[0]) for i, f in enumerate(fish)])
    slice_sheet('objects.png', 5, OUT / 'catch', [(i, o[0]) for i, o in enumerate(objs)])
    slice_sheet('fishing_gear.png', 6, OUT / 'gear', [(i - 1, g[0]) for i, g in GEAR.items()])
    slice_sheet('fishing_gear.png', 6, OUT / 'gear', [(i - 1, name) for i, name in UI_GEAR.items()])

    season = {'P': 'Spring', 'U': 'Summer', 'A': 'Autumn', 'W': 'Winter'}
    fish_js = []
    for fid, name, (zones, rarity, lvl, time, seasons, beh, size) in fish:
        lo, hi = (float(x) for x in size.split('-'))
        fish_js.append({
            'id': fid, 'name': name, 'image': f'/fishing/fish/{fid}.png',
            'zones': list(zones), 'rarity': {'c': 'common', 'u': 'uncommon', 'r': 'rare', 'l': 'legendary'}[rarity],
            'level': int(lvl), 'time': {'a': 'any', 'd': 'Dawnrise', 'n': 'Duskfall'}[time],
            'seasons': [] if seasons == '-' else [season[s] for s in seasons],
            'behaviour': {'d': 'darter', 's': 'steady', 'k': 'sinker', 'e': 'erratic'}[beh],
            'size': [lo, hi],
        })
    objs_js = [{'id': oid, 'name': name, 'image': f'/fishing/catch/{oid}.png', 'kind': kind, 'weight': int(w)}
               for oid, name, (kind, w) in objs]
    gear_js = [{'id': g[0], 'name': g[1], 'image': f'/fishing/gear/{g[0]}.png', 'price': g[2], 'kind': g[3], 'value': g[4]}
               for g in GEAR.values()]

    ts = ('// GENERATED by tools/fishing/build.py from the HEO fishing icon pack. Edit the\n'
          '// tables in that script and re-run it rather than editing this file.\n\n'
          "import type { FishDef, CatchObjectDef, FishingGearDef } from './fishing';\n\n"
          f'export const FISH: FishDef[] = {json.dumps(fish_js, indent=1)};\n\n'
          f'export const CATCH_OBJECTS: CatchObjectDef[] = {json.dumps(objs_js, indent=1)};\n\n'
          f'export const FISHING_GEAR: FishingGearDef[] = {json.dumps(gear_js, indent=1)};\n')
    (ROOT / 'src/lib/data/fishingRoster.ts').write_text(ts)
    print(f'{len(fish_js)} fish, {len(objs_js)} objects, {len(gear_js)} gear')


if __name__ == '__main__':
    main()
