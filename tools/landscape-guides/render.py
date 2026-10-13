"""
Landscape composition guides for the main map (dragon_island / NEW_WORLD.png).

Builds a rough 3D world from the flat map (map art as ground texture + a
heightmap from landscape elevations and the collision grid), then renders an
eye-level view per landscape region with a voxel-space raycaster. The renders
are composition guides for image generation: every view comes from the same
world, so what's on the left/right/horizon agrees across regions.

    pip install pillow numpy
    python tools/landscape-guides/render.py            # all views in views.json
    python tools/landscape-guides/render.py --probe    # N/E/S/W contact sheet per region
    python tools/landscape-guides/render.py arrival_plains north_beach

Inputs:  views.json (camera per landscape, elevations)  — edit this to tune
Outputs: docs/art/landscape-guides/<landscape>.png (+ briefs.json)
"""

import json
import math
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[2]
HERE = Path(__file__).resolve().parent
OUT = ROOT / 'docs/art/landscape-guides'

MAP_JSON = ROOT / 'src/lib/data/maps/final/dragon_island.json'
COLLISION = ROOT / 'src/lib/data/maps/collision/dragon_island.json'
TEXTURE = ROOT / 'static/maps/NEW_WORLD.png'
TILE = 32

RENDER_W, RENDER_H = 480, 270  # 16:9 on the target pixel grid
FOV = math.radians(70)
EYE = 7.0                      # camera height above ground, in tiles: a raised vantage, like standing on a rise
NEAR = 4.0                     # skip the first tiles so an adjacent tree doesn't fill the frame
VSCALE = 0.4                   # vertical exaggeration; the map is small, so keep relief modest
FAR = 120.0                    # view distance, in tiles
SKY_TOP = np.array([86, 140, 214], float)
SKY_HORIZON = np.array([196, 222, 240], float)
HEADINGS = {'north': 0, 'northeast': 45, 'east': 90, 'southeast': 135,
            'south': 180, 'southwest': 225, 'west': 270, 'northwest': 315}


def load_world(cfg):
    m = json.loads(MAP_JSON.read_text())
    W, H = m['width'], m['height']

    # Landscape per tile — first matching rect wins, same as the game.
    names, lgrid = [], np.full((H, W), -1)
    for r in m['landscapes']:
        n = r['landscape']
        if n not in names:
            names.append(n)
        i = names.index(n)
        sub = lgrid[r['y']:r['y'] + r['height'], r['x']:r['x'] + r['width']]
        sub[sub == -1] = i
    default = m.get('defaultLandscape')
    if default not in names:
        names.append(default)
    lgrid[lgrid == -1] = names.index(default)

    tex = np.asarray(Image.open(TEXTURE).convert('RGB')).astype(np.float32)

    # Water vs land per tile, from colour (blue-dominant pixels).
    tiles = tex.reshape(H, TILE, W, TILE, 3).transpose(0, 2, 1, 3, 4).reshape(H, W, TILE * TILE, 3)
    r, g, b = tiles[..., 0], tiles[..., 1], tiles[..., 2]
    water_frac = (((b - r) > 45) & ((b - g) > 5) & (r < 140)).mean(axis=2)
    water = water_frac > 0.85
    mean = tiles.mean(axis=2)

    # Base elevation from the landscape table; water sits at 0.
    elev = cfg['elevation']
    base = np.array([[elev.get(names[lgrid[y, x]], 1.0) for x in range(W)] for y in range(H)], float)
    base[water] = 0.0

    # Objects on top: blocked tiles become trees (green) or rocks/buildings.
    rows = json.loads(COLLISION.read_text())['rows']
    blocked = np.array([[c == '#' for c in row] for row in rows])
    greenish = (mean[..., 1] > mean[..., 0] + 8) & (mean[..., 1] > mean[..., 2])
    objects = np.where(blocked & greenish, 2.0, np.where(blocked, 1.0, 0.0))
    objects[water] = 0.0

    # Upsample to 8px resolution: ground stays stepped (cliffs), objects get rounded.
    # Region rectangles don't follow the painted cliffs, so stepped elevations
    # put walls in the wrong places. Smooth the land into slopes instead and
    # keep the sea flat with a hard drop at the coastline.
    S = 4  # samples per tile
    sea = np.kron(water.astype(float), np.ones((S, S))) > 0.5
    ground = np.kron(base, np.ones((S, S)))
    ground = box_blur(box_blur(ground, 6), 4)
    ground[sea] = 0.0
    obj = np.kron(objects, np.ones((S, S)))
    obj = box_blur(obj, 2)
    height = ground + obj

    return {
        'W': W, 'H': H, 'S': S, 'names': names, 'lgrid': lgrid, 'water': water,
        'tex': tex, 'height': height, 'ground': ground, 'objects': m['objects'],
    }


def box_blur(a, r):
    k = 2 * r + 1
    p = np.pad(a, r, mode='edge')
    c = p.cumsum(0).cumsum(1)
    c = np.pad(c, ((1, 0), (1, 0)))
    return (c[k:, k:] - c[:-k, k:] - c[k:, :-k] + c[:-k, :-k]) / (k * k)


def sample(world, px, py):
    """Height (tiles) and colour at map positions given in tile units (arrays)."""
    W, H, S = world['W'], world['H'], world['S']
    inside = (px >= 0) & (py >= 0) & (px < W) & (py < H)
    hx = np.clip((px * S).astype(int), 0, W * S - 1)
    hy = np.clip((py * S).astype(int), 0, H * S - 1)
    h = np.where(inside, world['height'][hy, hx], 0.0)
    tx = np.clip((px * TILE).astype(int), 0, W * TILE - 1)
    ty = np.clip((py * TILE).astype(int), 0, H * TILE - 1)
    col = world['tex'][ty, tx]
    sea = np.array([70, 110, 170], np.float32)
    col = np.where(inside[..., None], col, sea)
    return h, col


def render(world, cx, cy, heading_deg, eye=EYE, pitch=0.12):
    """Voxel-space raycast. Camera at tile (cx, cy); heading 0 = north (map up)."""
    w, h = RENDER_W, RENDER_H
    horizon = int(h * (0.42 - pitch * 0))
    focal = (w / 2) / math.tan(FOV / 2)

    S = world['S']
    gy = min(max(int(cy * S), 0), world['H'] * S - 1)
    gx = min(max(int(cx * S), 0), world['W'] * S - 1)
    cam_h = float(world['ground'][gy, gx]) + eye  # ground only, so a tree tile doesn't lift the camera

    # Sky gradient
    t = np.clip(np.arange(h) / max(horizon, 1), 0, 1)[:, None]
    img = (SKY_TOP * (1 - t) + SKY_HORIZON * t)[:, None, :].repeat(w, axis=1)
    ybuf = np.full(w, h, int)

    ang = math.radians(heading_deg)
    fwd = np.array([math.sin(ang), -math.cos(ang)])
    right = np.array([math.cos(ang), math.sin(ang)])
    cols = (np.arange(w) - w / 2) / focal
    dirs = fwd[None, :] + cols[:, None] * right[None, :]  # per-column ray, unnormalised (planar)

    z, dz = NEAR, 0.03
    fog = SKY_HORIZON
    while z < FAR:
        px = cx + dirs[:, 0] * z
        py = cy + dirs[:, 1] * z
        hh, col = sample(world, px, py)
        scr = (horizon + (cam_h - hh) / z * focal * VSCALE).astype(int)
        f = min(1.0, (z / FAR) ** 1.3) * 0.85
        col = col * (1 - f) + fog * f
        top = np.clip(scr, 0, h)
        for x in np.nonzero(top < ybuf)[0]:
            img[top[x]:ybuf[x], x] = col[x]
        ybuf = np.minimum(ybuf, top)
        z += dz
        dz *= 1.012
    return Image.fromarray(img.clip(0, 255).astype(np.uint8))


def brief(world, cx, cy, heading_deg):
    """What lies where in the view cone: landscapes and named map features by
    left/centre/right and near/mid/far, for the text prompt."""
    names, lgrid, water = world['names'], world['lgrid'], world['water']
    ang = math.radians(heading_deg)
    fwd = (math.sin(ang), -math.cos(ang))
    right = (math.cos(ang), math.sin(ang))
    bands = {'near': (1, 8), 'mid': (8, 22), 'far': (22, 60)}
    sides = {'left': (-1, -0.33), 'centre': (-0.33, 0.33), 'right': (0.33, 1)}
    half = math.tan(FOV / 2)
    out = {}
    for bname, (d0, d1) in bands.items():
        for sname, (s0, s1) in sides.items():
            counts = {}
            for d in np.linspace(d0, d1, 12):
                for s in np.linspace(s0, s1, 6):
                    x = cx + fwd[0] * d + right[0] * s * half * d
                    y = cy + fwd[1] * d + right[1] * s * half * d
                    xi, yi = int(x), int(y)
                    if not (0 <= xi < world['W'] and 0 <= yi < world['H']):
                        key = 'open sea'
                    elif water[yi, xi]:
                        key = 'water'
                    else:
                        key = names[lgrid[yi, xi]]
                    counts[key] = counts.get(key, 0) + 1
            top = sorted(counts.items(), key=lambda kv: -kv[1])
            out[f'{bname} {sname}'] = [k for k, n in top if n >= 8][:2] or [top[0][0]]

    feats = []
    for o in world['objects']:
        if o['type'] not in ('event', 'npc'):
            continue
        dx, dy = o['x'] - cx, o['y'] - cy
        d = dx * fwd[0] + dy * fwd[1]
        s = dx * right[0] + dy * right[1]
        if 1 < d < 30 and abs(s) < half * d:
            side = 'left' if s < -0.33 * half * d else 'right' if s > 0.33 * half * d else 'centre'
            dist = 'near' if d < 8 else 'mid' if d < 22 else 'far'
            feats.append({'id': o.get('eventId') or o.get('npcId'), 'type': o['type'], 'where': f'{dist} {side}'})
    return {'layout': out, 'features': feats}


def label(img, text):
    d = ImageDraw.Draw(img)
    try:
        f = ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial.ttf', 13)
    except OSError:
        f = ImageFont.load_default()
    d.text((5, 4), text, fill=(255, 255, 255), font=f, stroke_width=2, stroke_fill=(0, 0, 0))
    return img


def main():
    cfg = json.loads((HERE / 'views.json').read_text())
    world = load_world(cfg)
    OUT.mkdir(parents=True, exist_ok=True)
    args = [a for a in sys.argv[1:] if not a.startswith('--')]

    if '--probe' in sys.argv:
        # 4 directions per landscape, for picking headings
        probe_dir = OUT / 'probe'
        probe_dir.mkdir(exist_ok=True)
        for name, v in cfg['views'].items():
            if args and name not in args:
                continue
            tiles = [label(render(world, v['x'] + .5, v['y'] + .5, HEADINGS[hd]), f'{name}  {hd}')
                     for hd in ('north', 'east', 'south', 'west')]
            sheet = Image.new('RGB', (tiles[0].width * 2, tiles[0].height * 2))
            for i, t in enumerate(tiles):
                sheet.paste(t, ((i % 2) * t.width, (i // 2) * t.height))
            sheet.save(probe_dir / f'{name}.png')
            print('probe', name)
        return

    briefs = {}
    for name, v in cfg['views'].items():
        if args and name not in args:
            continue
        hd = v['heading']
        deg = HEADINGS[hd] if isinstance(hd, str) else hd
        img = render(world, v['x'] + .5, v['y'] + .5, deg, eye=v.get('eye', EYE))
        img.resize((RENDER_W * 2, RENDER_H * 2), Image.NEAREST).save(OUT / f'{name}.png')
        briefs[name] = {'camera': {'x': v['x'], 'y': v['y'], 'heading': hd}, **brief(world, v['x'] + .5, v['y'] + .5, deg)}
        print('rendered', name)

    existing = {}
    bpath = OUT / 'briefs.json'
    if bpath.exists() and args:
        existing = json.loads(bpath.read_text())
    existing.update(briefs)
    bpath.write_text(json.dumps(existing, indent=1))


STYLE = ('16-bit SNES-era pixel art landscape, crisp hard-edged pixels, limited palette (~48 colours), '
         'soft atmospheric depth, JRPG overworld mood, seen from a slightly raised vantage point, '
         'no characters, no people, no text, no UI, no watermark, 16:9')

IMG2IMG = ('Repaint this rough 3D layout as a finished, detailed pixel art landscape. Keep the composition exactly: '
           'the horizon height, and where the sea, cliffs, forest, buildings and islands sit in the frame. '
           'Replace the blocky shapes and stretched textures with proper detailed art.')


def write_prompts(cfg):
    """docs/art/landscape-prompts.md + the landscape entries of asset-manifest.json."""
    world = '\n'.join(f'- **{k}**: {v}.' for k, v in cfg['world'].items()) + f"\n- **Palette**: {cfg['palette']}." 
    lines = [
        '# Main-map landscape prompts (map-accurate)',
        '',
        'Generated by `tools/landscape-guides/render.py --prompts` from `views.json`. Edit cameras and text there, not here.',
        '',
        'Each landscape is the view from a real spot on the main map, so the sea, cliffs, islands and buildings are where the map says they are, and neighbouring regions agree with each other.',
        '',
        '## How to use',
        '',
        '1. **With image input (preferred):** attach the region\'s guide render (`landscape-guides/<id>.png`) and paste:',
        f'   > {IMG2IMG}',
        '   Then paste the region\'s prompt below.',
        '2. **Text only:** paste the region\'s prompt. The composition text describes the same layout as the guide.',
        '3. Ship as **960×540 JPG** (generated on a 480×270 pixel grid) at `static/locations/<id>.jpg`. Each region gets its own file; `landscapeDefinitions.ts` gets repointed once they exist.',
        '',
        '## World bible (keep these consistent across every image)',
        '',
        world,
        '',
        '## Regions',
        '',
    ]
    entries = []
    for name, v in cfg['views'].items():
        mood = cfg['moods'][v['mood']]
        # Spell out every named landmark so the prompt also works without the guide image
        named = [f'{k} is {d}' for k, d in cfg['world'].items() if k.lower() in v['composition'].lower()]
        where = f" ({'; '.join(named)}.)" if named else ''
        prompt = f"{STYLE}. {v['composition']}{where} Palette: {cfg['palette']}. Lighting: {mood}."
        lines += [
            f'### {name}',
            '',
            f'![{name} guide](landscape-guides/{name}.png)',
            '',
            f"Camera: tile ({v['x']}, {v['y']}), facing {v['heading']}. Mood: {v['mood']}.",
            '',
            '```',
            prompt,
            '```',
            '',
        ]
        entries.append({'group': 'A-main', 'file': f'{name}.jpg', 'target': f'static/locations/{name}.jpg',
                        'size': [960, 540], 'background': 'opaque', 'guide': f'docs/art/landscape-guides/{name}.png',
                        'subject': v['composition']})
    (ROOT / 'docs/art/landscape-prompts.md').write_text('\n'.join(lines))

    mpath = ROOT / 'docs/art/asset-manifest.json'
    manifest = json.loads(mpath.read_text())
    manifest['items'] = [i for i in manifest['items'] if i['group'] != 'A-main'] + entries
    mpath.write_text(json.dumps(manifest, indent=1))
    print(f'wrote {len(entries)} landscape prompts')


if __name__ == '__main__':
    if '--prompts' in sys.argv:
        write_prompts(json.loads((HERE / 'views.json').read_text()))
        sys.exit()
    main()
