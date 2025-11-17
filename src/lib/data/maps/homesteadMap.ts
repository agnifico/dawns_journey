import type { MapData } from '$lib/types';

export const homesteadMap: MapData = {
    width: 15,
    height: 15,
    image: '/maps/homestead_background.png', // User will provide this image
    defaultRegion: 'homestead',
    regions: [],
    unwalkable: [],
    playerStart: { x: 0, y: 0 }, // Not used, but required by type
    objects: [
        // These are the clickable hotspots for the farm plots
        { type: 'farm_plot', plotId: 'plot_1', x: 5, y: 5, width: 1, height: 1 },
        { type: 'farm_plot', plotId: 'plot_2', x: 6, y: 5, width: 1, height: 1 },
        { type: 'farm_plot', plotId: 'plot_3', x: 7, y: 5, width: 1, height: 1 },
        { type: 'farm_plot', plotId: 'plot_4', x: 5, y: 6, width: 1, height: 1 },
        { type: 'farm_plot', plotId: 'plot_5', x: 6, y: 6, width: 1, height: 1 },
        { type: 'farm_plot', plotId: 'plot_6', x: 7, y: 6, width: 1, height: 1 },
    ]
};
