import * as THREE from "three/webgpu";
import { VectorTile } from "@mapbox/vector-tile";
import { PbfReader } from "pbf";

const WATER_MASK_SIZE = 512;
const WATER_MASK_PADDING = 8;
const WATER_EDGE_BLUR = 2;
const RIVER_CLASSES = new Set(["river", "canal"]);

// Draws a black and white image of a tile: white for lakes and rivers, black for land
// The lakes and rivers come from the Mapbox street map
export async function loadWaterTexture({
  zoom,
  tileX,
  tileY,
  accessToken,
  riverWidth,
}) {
  // Drawn a bit bigger than the tile, so the blur at the edge doesn't fade the water to black
  const paddedSize = WATER_MASK_SIZE + WATER_MASK_PADDING * 2;
  const shapesCanvas = new OffscreenCanvas(paddedSize, paddedSize);
  const context = shapesCanvas.getContext("2d");
  context.fillStyle = "#000";
  context.fillRect(0, 0, paddedSize, paddedSize);
  context.translate(WATER_MASK_PADDING, WATER_MASK_PADDING);

  const response = await fetch(
    `https://api.mapbox.com/v4/mapbox.mapbox-streets-v8/${zoom}/${tileX}/${tileY}.vector.pbf?access_token=${accessToken}`,
  );

  // If the download fails the tile just has no water, the ground still shows
  if (response.ok) {
    const vectorTile = new VectorTile(
      new PbfReader(await response.arrayBuffer()),
    );
    context.fillStyle = "#fff";
    context.strokeStyle = "#fff";
    context.lineWidth = riverWidth;
    context.lineCap = "round";
    context.lineJoin = "round";

    // Lakes and wide rivers are shapes to fill
    const water = vectorTile.layers.water;
    for (let index = 0; index < (water?.length ?? 0); index++) {
      const feature = water.feature(index);
      context.beginPath();
      traceRings(context, feature.loadGeometry(), water.extent, true);
      // "evenodd" leaves holes for the islands, so they stay land
      context.fill("evenodd");
    }

    // Small rivers are only lines, so they get drawn as thick strokes
    const waterways = riverWidth > 0 ? vectorTile.layers.waterway : null;
    for (let index = 0; index < (waterways?.length ?? 0); index++) {
      const feature = waterways.feature(index);
      if (!RIVER_CLASSES.has(feature.properties.class)) continue;
      context.beginPath();
      traceRings(context, feature.loadGeometry(), waterways.extent, false);
      context.stroke();
    }
  } else {
    console.warn(
      `Water tile ${zoom}/${tileX}/${tileY} failed (${response.status})`,
    );
  }

  // A slightly blurry shore lets the shader place the shoreline between pixels, so it looks smooth instead of blocky
  const canvas = new OffscreenCanvas(WATER_MASK_SIZE, WATER_MASK_SIZE);
  const maskContext = canvas.getContext("2d");
  maskContext.filter = `blur(${WATER_EDGE_BLUR}px)`;
  maskContext.drawImage(shapesCanvas, -WATER_MASK_PADDING, -WATER_MASK_PADDING);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.NoColorSpace;
  return texture;
}

// Follows the points of each shape on the canvas, scaled from map units to pixels
function traceRings(context, rings, extent, closed) {
  const scale = WATER_MASK_SIZE / extent;
  for (const ring of rings) {
    ring.forEach((point, index) => {
      if (index === 0) context.moveTo(point.x * scale, point.y * scale);
      else context.lineTo(point.x * scale, point.y * scale);
    });
    if (closed) context.closePath();
  }
}
