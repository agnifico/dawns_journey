import { writable, get } from 'svelte/store';

// Per-map terrain grids, one string per row, one character per tile (see
// TILE_KINDS). Source files live in src/lib/data/maps/collision/<mapId>.json
// as { width, height, rows: string[] }. They're kept apart from maps/final so
// a re-export from Tiled can't wipe them.
//
// Water, mountains etc. stay gated by regions; NPC footprints are blocked
// dynamically (NPCs move between tags).

type CollisionFile = { width: number; height: number; rows: string[] };

export interface TileKind {
    name: string;
    /** Can't be walked onto. */
    blocks: boolean;
    /** Player is drawn as a tile cursor here (inside a forest / up a tree). */
    cursor?: boolean;
    /** Facing it offers fishing. */
    water?: boolean;
    /** Editor overlay colour. */
    color: string;
}

// Behaviour per tile category. Change a line here to change it everywhere,
// e.g. set R.blocks = false to let the hero clamber over boulders.
export const TILE_KINDS: Record<string, TileKind> = {
    '.': { name: 'Open',   blocks: false,               color: 'transparent' },
    '#': { name: 'Solid',  blocks: true,                color: 'rgba(255, 40, 60, 0.45)' },
    'T': { name: 'Tree',   blocks: false, cursor: true, color: 'rgba(40, 220, 90, 0.45)' },
    'S': { name: 'Bush',   blocks: false,               color: 'rgba(230, 230, 40, 0.5)' },
    'R': { name: 'Rock',   blocks: true,                color: 'rgba(80, 140, 255, 0.55)' },
    'W': { name: 'Water',  blocks: false, water: true,  color: 'rgba(120, 200, 255, 0.25)' },
};
export const TILE_KIND_KEYS = Object.keys(TILE_KINDS);

const files = import.meta.glob('$lib/data/maps/collision/*.json', { eager: true, import: 'default' }) as Record<string, CollisionFile>;

function initialGrids(): Record<string, string[]> {
    const grids: Record<string, string[]> = {};
    for (const [path, file] of Object.entries(files)) {
        const mapId = path.split('/').pop()!.replace('.json', '');
        grids[mapId] = file.rows;
    }
    return grids;
}

export const collisionStore = writable<Record<string, string[]>>(initialGrids());

export function getCellKind(mapId: string, x: number, y: number): TileKind {
    const ch = get(collisionStore)[mapId]?.[y]?.[x] ?? '.';
    return TILE_KINDS[ch] ?? TILE_KINDS['.'];
}

export function isCellBlocked(mapId: string, x: number, y: number): boolean {
    return getCellKind(mapId, x, y).blocks;
}

// ── Dev editing ──────────────────────────────────────────────────────────────

export function getCellChar(mapId: string, x: number, y: number): string {
    return get(collisionStore)[mapId]?.[y]?.[x] ?? '.';
}

export function setCell(mapId: string, x: number, y: number, ch: string, width: number, height: number) {
    if (getCellChar(mapId, x, y) === ch) return;
    collisionStore.update(grids => {
        const rows = grids[mapId]
            ? [...grids[mapId]]
            : Array.from({ length: height }, () => '.'.repeat(width));
        const row = (rows[y] ?? '').padEnd(width, '.');
        rows[y] = row.slice(0, x) + ch + row.slice(x + 1);
        return { ...grids, [mapId]: rows };
    });
}

export function exportCollision(mapId: string, width: number, height: number): string {
    const rows = get(collisionStore)[mapId] ?? [];
    const full = Array.from({ length: height }, (_, y) => (rows[y] ?? '').padEnd(width, '.').slice(0, width));
    return JSON.stringify({ width, height, rows: full }, null, 1);
}
