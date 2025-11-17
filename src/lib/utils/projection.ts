// These constants will likely need tweaking based on the actual size of your tile assets
export const TILE_WIDTH = 64;
export const TILE_HEIGHT = 32;

/**
 * Converts 2D world coordinates (from a grid) to 2D screen coordinates for an isometric view.
 * @param worldX The x-coordinate on the grid.
 * @param worldY The y-coordinate on the grid.
 * @returns An object with x and y properties representing the pixel position on the screen.
 */
export function worldToScreen(worldX: number, worldY: number): { x: number; y: number } {
    const screenX = (worldX - worldY) * (TILE_WIDTH / 2);
    const screenY = (worldX + worldY) * (TILE_HEIGHT / 2);
    return { x: screenX, y: screenY };
}

/**
 * Converts 2D screen coordinates (e.g., from a mouse click) back to 2D world coordinates.
 * This is useful for figuring out which tile was clicked.
 * @param screenX The x-pixel coordinate on the screen.
 * @param screenY The y-pixel coordinate on the screen.
 * @returns An object with x and y properties representing the grid coordinate.
 */
export function screenToWorld(screenX: number, screenY: number): { x: number; y: number } {
    const worldX = Math.round(screenX / (TILE_WIDTH / 2) + screenY / (TILE_HEIGHT / 2)) / 2;
    const worldY = Math.round(screenY / (TILE_HEIGHT / 2) - screenX / (TILE_WIDTH / 2)) / 2;
    return { x: worldX, y: worldY };
}
