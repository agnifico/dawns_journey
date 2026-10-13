"""
Key out the flat magenta/hot-pink background that generated sprites and
vignettes come back on, keeping soft drop shadows.

    python tools/keyout.py in.png out.png [more pairs...]

- Background = pink pixels connected to the image border, plus enclosed
  gaps that closely match the background colour. Reds and violets in the
  subject (a red mushroom cap, purple crystals) are never touched.
- Small non-pink specks floating in the background (noisy backgrounds) are
  treated as background too.
- Darker pink under the subject becomes a translucent black shadow.
- Pink fringe on the subject's edge is despilled.
"""

import sys
from collections import deque

import numpy as np
from PIL import Image


def is_pink(rgb):
    """Magenta-family hue at any brightness (dark pink shadows included).
    Reds (low blue) and violets (blue well above red) don't qualify."""
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    return (r > 50) & (g < 0.45 * r) & (b > 0.45 * r) & (b < 1.3 * r)


def border_flood(mask):
    """Pixels of `mask` connected to the image border (4-connected)."""
    h, w = mask.shape
    seen = np.zeros_like(mask)
    q = deque()
    for x in range(w):
        for y in (0, h - 1):
            if mask[y, x] and not seen[y, x]:
                seen[y, x] = True
                q.append((y, x))
    for y in range(h):
        for x in (0, w - 1):
            if mask[y, x] and not seen[y, x]:
                seen[y, x] = True
                q.append((y, x))
    while q:
        y, x = q.popleft()
        for ny, nx in ((y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)):
            if 0 <= ny < h and 0 <= nx < w and mask[ny, nx] and not seen[ny, nx]:
                seen[ny, nx] = True
                q.append((ny, nx))
    return seen


def components(mask):
    """Label 4-connected components of a boolean mask; returns (labels, sizes)."""
    h, w = mask.shape
    labels = np.zeros((h, w), int)
    sizes = [0]
    n = 0
    for sy, sx in zip(*np.nonzero(mask)):
        if labels[sy, sx]:
            continue
        n += 1
        size = 0
        q = deque([(sy, sx)])
        labels[sy, sx] = n
        while q:
            y, x = q.popleft()
            size += 1
            for ny, nx in ((y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)):
                if 0 <= ny < h and 0 <= nx < w and mask[ny, nx] and not labels[ny, nx]:
                    labels[ny, nx] = n
                    q.append((ny, nx))
        sizes.append(size)
    return labels, np.array(sizes)


def keyout(src, dst):
    im = Image.open(src).convert('RGB')
    rgb = np.asarray(im).astype(np.float32)
    h, w, _ = rgb.shape

    pink = is_pink(rgb)
    bg = border_flood(pink)

    # Enclosed gaps (between branches, inside a ring) keep the background colour
    # but aren't reachable from the border: take pink areas that match it closely.
    bg_col = np.median(rgb[bg & (rgb.max(axis=2) > 180)], axis=0) if (bg & (rgb.max(axis=2) > 180)).any() else np.array([255, 0, 255])
    close = pink & (np.abs(rgb - bg_col).sum(axis=2) < 70)
    labels, sizes = components(close & ~bg)
    bg |= labels > 0

    # Specks: small foreground islands fully inside the background
    fg = ~bg
    labels, sizes = components(fg)
    biggest = sizes[1:].max() if len(sizes) > 1 else 0
    speck_limit = max(40, biggest * 0.002)
    specks = np.isin(labels, np.nonzero((sizes < speck_limit) & (np.arange(len(sizes)) > 0))[0])
    bg |= specks

    # Reference background brightness: the brightest pink along the border
    border = np.concatenate([rgb[0], rgb[-1], rgb[:, 0], rgb[:, -1]])
    bmask = is_pink(border)
    ref = np.percentile(border[bmask].max(axis=1), 75) if bmask.any() else 255.0

    out = np.zeros((h, w, 4), np.float32)
    out[..., :3] = rgb
    out[..., 3] = 255

    # Background → transparent, with darker pink kept as a soft black shadow
    v = rgb.max(axis=2)
    shadow = np.clip((1 - v / ref) * 1.6, 0, 0.55)
    shadow[specks] = 0
    out[bg, :3] = 0
    out[bg, 3] = shadow[bg] * 255

    # Despill a 2px fringe of the subject next to the background
    near = np.zeros_like(bg)
    for dy in (-2, -1, 0, 1, 2):
        for dx in (-2, -1, 0, 1, 2):
            near |= np.roll(np.roll(bg, dy, 0), dx, 1)
    fringe = near & ~bg
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    spill = np.clip(np.minimum(r, b) - g, 0, None)
    k = 0.6
    out[fringe, 0] = (r - spill * k)[fringe]
    out[fringe, 2] = (b - spill * k)[fringe]

    Image.fromarray(out.clip(0, 255).astype(np.uint8), 'RGBA').save(dst, optimize=True)
    return bg.mean()


if __name__ == '__main__':
    args = sys.argv[1:]
    for src, dst in zip(args[::2], args[1::2]):
        frac = keyout(src, dst)
        print(f'{src} -> {dst}  background {frac:.0%}')
