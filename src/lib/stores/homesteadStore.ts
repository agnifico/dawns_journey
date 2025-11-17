import { readable } from 'svelte/store';
import homesteadPlots from '../data/homesteadPlots.json';

export interface PlotData {
    id: number;
    plotNumber: number;
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface HomesteadPlots {
    open_field: PlotData[];
    greenhouse: PlotData[];
    forest_floor: PlotData[];
}

const homesteadPlotData: HomesteadPlots = homesteadPlots;

export const homesteadMapStore = readable<HomesteadPlots>(homesteadPlotData);