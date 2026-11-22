import * as THREE from "three/webgpu";

// Each tile is cut into this many cells per side
export const CELLS = 16;

// Mapbox stores the height in meters inside the red, green and blue values of a pixel
// Same formula as terrainMaterial.js, they must stay identical or things float or sink
export function decodeHeight(red, green, blue) {
  return -10000 + (red * 65536 + green * 256 + blue) * 0.1;
}

// Height in meters of one pixel of a tile
export function getTexelHeight(tile, texelX, texelY) {
  const index = (texelY * tile.size + texelX) * 4;
  return decodeHeight(
    tile.data[index],
    tile.data[index + 1],
    tile.data[index + 2],
  );
}

// Height in meters at a spot between pixels, the 4 pixels around it get mixed by how close each one is
export function sampleHeight(tile, texelFloatX, texelFloatY) {
  const lastTexel = tile.size - 1;
  const left = Math.floor(texelFloatX);
  const top = Math.floor(texelFloatY);
  const right = Math.min(left + 1, lastTexel);
  const bottom = Math.min(top + 1, lastTexel);
  const blendX = texelFloatX - left;
  const blendY = texelFloatY - top;

  const topHeight = THREE.MathUtils.lerp(
    getTexelHeight(tile, left, top),
    getTexelHeight(tile, right, top),
    blendX,
  );
  const bottomHeight = THREE.MathUtils.lerp(
    getTexelHeight(tile, left, bottom),
    getTexelHeight(tile, right, bottom),
    blendX,
  );
  return THREE.MathUtils.lerp(topHeight, bottomHeight, blendY);
}

// Three.js thinks each tile is flat since the vertices move in the shader, so this finds how low and high it really goes
// Lowest and highest height of each cell of a tile, in meters
export function computeCellHeights(tile) {
  const lastTexel = tile.size - 1;
  const cellHeights = new Float32Array(CELLS * CELLS * 2);

  for (let cellY = 0; cellY < CELLS; cellY++) {
    for (let cellX = 0; cellX < CELLS; cellX++) {
      const startX = Math.floor((cellX * lastTexel) / CELLS);
      const endX = Math.floor(((cellX + 1) * lastTexel) / CELLS);
      const startY = Math.floor((cellY * lastTexel) / CELLS);
      const endY = Math.floor(((cellY + 1) * lastTexel) / CELLS);

      let low = Infinity;
      let high = -Infinity;
      for (let texelY = startY; texelY <= endY; texelY++) {
        for (let texelX = startX; texelX <= endX; texelX++) {
          const height = getTexelHeight(tile, texelX, texelY);
          low = Math.min(low, height);
          high = Math.max(high, height);
        }
      }

      const cellIndex = (cellY * CELLS + cellX) * 2;
      cellHeights[cellIndex] = low;
      cellHeights[cellIndex + 1] = high;
    }
  }

  return cellHeights;
}
