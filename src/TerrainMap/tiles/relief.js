import * as THREE from "three/webgpu";

import { CELLS } from "./heights.js";

const CORNERS = CELLS + 1;
// Width of a tile plus its 8 neighbors, in cells
const AREA_CELLS = CELLS * 3;

// Tells the shader if a spot sits low (valley) or high (peak) compared to the land around it
// One pixel per cell corner: red is the lowest ground nearby, green the highest
export function createReliefTexture() {
  const texture = new THREE.DataTexture(
    new Uint16Array(CORNERS * CORNERS * 4),
    CORNERS,
    CORNERS,
    THREE.RGBAFormat,
    THREE.HalfFloatType,
  );
  texture.colorSpace = THREE.NoColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  return texture;
}

// For each corner: find the lowest and highest ground in a circle around it, then blur it so it doesn't jump
// neighborCells(offsetX, offsetY) gives the heights of a neighbor tile, or null if it isn't loaded yet
export function updateReliefTexture(
  texture,
  neighborCells,
  radiusCells,
  smoothCells,
) {
  // Put the tile and its neighbors in one big grid, so the circle can look past the tile edge
  // Empty spots (NaN) where a neighbor isn't loaded
  const areaHeights = new Float32Array(AREA_CELLS * AREA_CELLS * 2).fill(NaN);
  for (let offsetY = -1; offsetY <= 1; offsetY++) {
    for (let offsetX = -1; offsetX <= 1; offsetX++) {
      const cellHeights = neighborCells(offsetX, offsetY);
      if (!cellHeights) continue;

      for (let cellY = 0; cellY < CELLS; cellY++) {
        for (let cellX = 0; cellX < CELLS; cellX++) {
          const areaX = (offsetX + 1) * CELLS + cellX;
          const areaY = (offsetY + 1) * CELLS + cellY;
          const from = (cellY * CELLS + cellX) * 2;
          const to = (areaY * AREA_CELLS + areaX) * 2;
          areaHeights[to] = cellHeights[from];
          areaHeights[to + 1] = cellHeights[from + 1];
        }
      }
    }
  }

  // Lowest and highest ground in the circle around a corner of the big grid
  const rangeAroundCorner = (cornerX, cornerY) => {
    let low = Infinity;
    let high = -Infinity;
    const reach = Math.ceil(radiusCells);
    for (let cellY = cornerY - reach; cellY < cornerY + reach; cellY++) {
      for (let cellX = cornerX - reach; cellX < cornerX + reach; cellX++) {
        if (cellX < 0 || cellY < 0 || cellX >= AREA_CELLS) continue;
        if (cellY >= AREA_CELLS) continue;
        const distanceX = cellX + 0.5 - cornerX;
        const distanceY = cellY + 0.5 - cornerY;
        if (distanceX ** 2 + distanceY ** 2 > radiusCells ** 2) continue;

        const index = (cellY * AREA_CELLS + cellX) * 2;
        if (Number.isNaN(areaHeights[index])) continue;
        low = Math.min(low, areaHeights[index]);
        high = Math.max(high, areaHeights[index + 1]);
      }
    }
    return low === Infinity ? null : { low, high };
  };

  // The blur asks for the same corner many times, so each one is computed once and remembered
  const ranges = new Map();
  const cachedRange = (cornerX, cornerY) => {
    const key = cornerY * (AREA_CELLS + 1) + cornerX;
    if (!ranges.has(key)) ranges.set(key, rangeAroundCorner(cornerX, cornerY));
    return ranges.get(key);
  };

  const data = texture.image.data;
  const reach = Math.floor(smoothCells);
  for (let cornerY = 0; cornerY < CORNERS; cornerY++) {
    for (let cornerX = 0; cornerX < CORNERS; cornerX++) {
      // Our tile is the middle one of the big grid
      const centerX = CELLS + cornerX;
      const centerY = CELLS + cornerY;

      let lowTotal = 0;
      let highTotal = 0;
      let count = 0;
      for (let offsetY = -reach; offsetY <= reach; offsetY++) {
        for (let offsetX = -reach; offsetX <= reach; offsetX++) {
          if (offsetX ** 2 + offsetY ** 2 > smoothCells ** 2) continue;
          const range = cachedRange(centerX + offsetX, centerY + offsetY);
          if (!range) continue;
          lowTotal += range.low;
          highTotal += range.high;
          count++;
        }
      }

      // Average of the nearby corners, the top row is north like the height map
      const index = (cornerY * CORNERS + cornerX) * 4;
      data[index] = THREE.DataUtils.toHalfFloat(lowTotal / count);
      data[index + 1] = THREE.DataUtils.toHalfFloat(highTotal / count);
    }
  }

  texture.needsUpdate = true;
}
