// A new tile touches 8 neighbors, so all their edges get fixed
export function stitchAround(tiles, tile) {
  for (let offsetY = -1; offsetY <= 1; offsetY++) {
    for (let offsetX = -1; offsetX <= 1; offsetX++) {
      const neighbor = tiles.get(
        `${tile.tileX + offsetX}/${tile.tileY + offsetY}`,
      );
      if (neighbor?.sourceData) stitchEdges(tiles, neighbor);
    }
  }
}

// Two tiles share their border points, so both get the same average height and no crack shows
function stitchEdges(tiles, tile) {
  const lastTexel = tile.size - 1;
  for (let index = 0; index <= lastTexel; index++) {
    stitchVertex(tiles, tile, index, 0);
    stitchVertex(tiles, tile, index, lastTexel);
    stitchVertex(tiles, tile, 0, index);
    stitchVertex(tiles, tile, lastTexel, index);
  }
  tile.heightTexture.needsUpdate = true;
}

function stitchVertex(tiles, tile, texelX, texelY) {
  const lastTexel = tile.size - 1;
  const sidesX = texelX === 0 ? [0, -1] : texelX === lastTexel ? [0, 1] : [0];
  const sidesY = texelY === 0 ? [0, -1] : texelY === lastTexel ? [0, 1] : [0];

  // Added as whole numbers so both tiles get exactly the same result
  let total = 0;
  let count = 0;
  for (const sideY of sidesY) {
    for (const sideX of sidesX) {
      const other = tiles.get(`${tile.tileX + sideX}/${tile.tileY + sideY}`);
      if (!other?.sourceData || other.size !== tile.size) continue;

      // The left edge of a tile is the right edge of the tile before it
      const otherX = texelX - sideX * lastTexel;
      const otherY = texelY - sideY * lastTexel;
      const index = (otherY * other.size + otherX) * 4;
      total +=
        other.sourceData[index] * 65536 +
        other.sourceData[index + 1] * 256 +
        other.sourceData[index + 2];
      count++;
    }
  }

  const value = Math.round(total / count);
  const index = (texelY * tile.size + texelX) * 4;
  tile.data[index] = (value >> 16) & 255;
  tile.data[index + 1] = (value >> 8) & 255;
  tile.data[index + 2] = value & 255;
}
