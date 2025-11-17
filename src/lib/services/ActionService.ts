import { get } from 'svelte/store';
import { playerStore } from '../stores/playerStore';
import { mapStore } from '../stores/mapStore';
import { npcStore } from '../stores/npcStore';
import { handleNpcRankUpAction } from './NpcService';

export function getAvailableActions() {
    const player = get(playerStore);
    const map = get(mapStore);

    if (!map.mapData) return [];

    const playerTile = map.mapData.tiles.find(tile => tile.x === player.position.x && tile.y === player.position.y);

    if (playerTile) {
        if (playerTile.npcId) {
            return [
                { label: 'Chat', action: 'C' },
                { label: 'Sword Quest', action: 'Z' },
                { label: 'Heart Quest', action: 'X' },
                { label: 'Combat', action: 'V' },
            ];
        }

        if (playerTile.eventId) {
            // TODO: Add event actions
        }
    }

    return [];
}

export function handleAction(action: string) {
    const player = get(playerStore);
    const map = get(mapStore);
    const npcs = get(npcStore);

    if (!map.mapData) return;

    const playerTile = map.mapData.tiles.find(tile => tile.x === player.position.x && tile.y === player.position.y);

    if (playerTile && playerTile.npcId) {
        const npc = npcs.globalNpcs[playerTile.npcId];
        if (npc) {
            handleNpcRankUpAction(action, npc, player);
        }
    }
}
