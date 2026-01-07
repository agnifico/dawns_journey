import type { Item } from '../types';
import { generalItems } from './generalItems';
import { homesteadItems } from './homesteadItems';

export const items: Item[] = [...generalItems, ...homesteadItems];
