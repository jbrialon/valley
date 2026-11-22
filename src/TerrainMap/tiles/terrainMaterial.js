import * as THREE from "three/webgpu";
import {
  Fn,
  abs,
  clamp,
  dot,
  exp2,
  float,
  floor,
  fract,
  fwidth,
  int,
  ivec2,
  log2,
  max,
  mix,
  mod,
  normalize,
  positionLocal,
  positionView,
  positionViewDirection,
  positionWorld,
  screenCoordinate,
  sin,
  smoothstep,
  step,
  texture,
  textureLoad,
  time,
  transformNormalToView,
  uv,
  varying,
  vec2,
  vec3,
} from "three/tsl";

import { CELLS } from "./heights.js";
import { PALETTE_WIDTH } from "../style/TopoStyle.js";

// Fast random number per ground cell, without sin so far away cells don't start repeating
const randomFromCell = Fn(([cell]) => {
  const scrambled = fract(vec3(cell.x, cell.y, cell.x).mul(0.1031)).toVar();
  scrambled.addAssign(dot(scrambled, scrambled.yzx.add(33.33)));
  return fract(scrambled.x.add(scrambled.y).mul(scrambled.z));
});

// 1 on lakes and rivers, 0 on land
function getWetness(waterTexture) {
  // The water image is blurry and the half gray line is the shore, fwidth keeps it one screen pixel soft at any zoom
  const mask = texture(waterTexture, uv()).r;
  const edgeWidth = fwidth(mask).max(0.001);
  return smoothstep(float(0.5).sub(edgeWidth), float(0.5).add(edgeWidth), mask);
}

// Topographic look: a color per height, contour lines, light and grain
export function createTerrainMaterial({
  heightTexture,
  waterTexture,
  reliefTexture,
  size,
  tileWorld,
  metersToWorld,
  exaggeration,
  style,
}) {
  const settings = style.uniforms;
  const lastTexel = size - 1;
  // Distance between two points of the grid, in scene units
  const texelWorld = tileWorld / lastTexel;

  // Turns meters into scene units, the relief slider included
  const heightScale = exaggeration.mul(metersToWorld);

  // Height in meters of one exact pixel, any blending with its neighbors would scramble the height
  const elevationAt = Fn(([pixelX, pixelY]) => {
    // On the tile border there's no neighbor outside, so the closest pixel is used instead
    const coordinates = ivec2(
      clamp(pixelX, int(0), int(lastTexel)),
      clamp(pixelY, int(0), int(lastTexel)),
    );
    const pixel = textureLoad(heightTexture, coordinates).rgb.mul(255).round();

    // Mapbox hides the height in meters inside the red, green and blue values
    // height = -10000 + ((R × 256 × 256 + G × 256 + B) × 0.1), same as decodeHeight in heights.js
    return pixel.r
      .mul(65536)
      .add(pixel.g.mul(256))
      .add(pixel.b)
      .mul(0.1)
      .sub(10000);
  });

  // Each point of the grid has its own pixel in the height image, row 0 is the north edge
  const texelX = int(uv().x.mul(lastTexel).round());
  const texelY = int(float(1).sub(uv().y).mul(lastTexel).round());

  // Which way the ground faces, from the slope between the neighbors on each side
  // "Down" is the next row so it's further south (+z)
  const heightLeft = elevationAt(texelX.sub(1), texelY);
  const heightRight = elevationAt(texelX.add(1), texelY);
  const heightUp = elevationAt(texelX, texelY.sub(1));
  const heightDown = elevationAt(texelX, texelY.add(1));
  const terrainNormal = normalize(
    vec3(
      heightLeft.sub(heightRight).mul(heightScale),
      2 * texelWorld,
      heightUp.sub(heightDown).mul(heightScale),
    ),
  );

  // Height in real meters, before the relief slider stretches it
  const elevation = varying(elevationAt(texelX, texelY));
  const groundNormal = varying(terrainNormal).normalize();

  const material = new THREE.MeshBasicNodeMaterial();
  material.positionNode = positionLocal.add(
    vec3(0, elevation.mul(heightScale), 0),
  );

  // Works like three's matcap: ground facing the camera takes its color from the middle of the image
  const shadingFromMatcap = Fn(() => {
    const viewNormal = transformNormalToView(groundNormal).normalize();
    const sideAxis = vec3(
      positionViewDirection.z,
      0,
      positionViewDirection.x.negate(),
    ).normalize();
    const upAxis = positionViewDirection.cross(sideAxis);
    const matcapCoordinates = vec2(
      sideAxis.dot(viewNormal),
      upAxis.dot(viewNormal),
    )
      .mul(0.495)
      .add(0.5);
    return texture(style.options.matcap, matcapCoordinates).rgb;
  });

  // Light from a fixed sun, it doesn't move with the camera so there's no shine
  const shadingFromSun = Fn(() => {
    const facingSun = dot(groundNormal, settings.sunDirection);
    const light = clamp(
      facingSun.add(settings.lightWrap).div(float(1).add(settings.lightWrap)),
      0,
      1,
    );
    return mix(settings.shadowColor, settings.lightColor, light);
  });

  const shading = mix(shadingFromMatcap(), shadingFromSun(), settings.matte);

  // The valley floor gets the first color, the peaks around get the last
  const landColor = Fn(() => {
    // The relief texture has one pixel per cell corner, so the tile edges land on pixel centers
    const reliefCoordinates = vec2(uv().x, float(1).sub(uv().y))
      .mul(CELLS)
      .add(0.5)
      .div(CELLS + 1);
    const relief = texture(reliefTexture, reliefCoordinates);
    const valley = relief.r;
    const range = relief.g.sub(valley).max(settings.reliefMinRange);

    // 0 at the valley floor, 1 at the highest summit around
    const position = clamp(elevation.sub(valley).div(range), 0, 1).pow(
      settings.paletteCurve,
    );

    // Read the middle of each pixel so the first and last colors don't blend with their neighbor
    const paletteCoordinates = vec2(
      position
        .mul(PALETTE_WIDTH - 1)
        .add(0.5)
        .div(PALETTE_WIDTH),
      0.5,
    );
    return texture(style.paletteTexture, paletteCoordinates).rgb;
  });

  material.colorNode = Fn(() => {
    const spacing = settings.lineSpacing;
    const height = elevation.add(settings.lineOffset);

    // How much the height changes from one pixel to the next, never 0 since we divide by it
    const heightPerPixel = fwidth(elevation).max(0.0001);

    // 1 close to the camera, 0 past fadeStart + fadeDistance
    const cameraDistance = positionView.z.negate();
    const fade = clamp(
      cameraDistance.sub(settings.fadeStart).div(settings.fadeDistance),
      0,
      1,
    ).oneMinus();

    // 1 on the first line of each group of emphasisEvery lines
    const distanceToEmphasis = abs(
      mod(height, spacing.mul(settings.emphasisEvery)).sub(spacing),
    );
    const isEmphasized = step(distanceToEmphasis, spacing.mul(0.5));

    // Main lines are thicker, and lines get thicker where they bunch up so they don't flicker into odd patterns
    const packing = smoothstep(spacing.mul(0.5), spacing, heightPerPixel);
    const thickness = isEmphasized
      .mul(2)
      .mul(fade)
      .add(packing)
      .add(settings.lineThickness);

    // 1 right on a line, 0 halfway between two lines
    const progress = mod(height, spacing).div(spacing);
    const closeness = max(progress, progress.oneMinus()).mul(2).sub(1);

    const pixelSize = heightPerPixel.div(spacing);
    const line = smoothstep(
      float(1).sub(pixelSize.mul(2)),
      1,
      closeness.add(pixelSize.mul(thickness)),
    );
    // Water should be flat, so its height noise would only draw stray lines
    const wetness = getWetness(waterTexture);
    const visibleLine = line
      .mul(max(fade, isEmphasized))
      .mul(wetness.oneMinus());

    const groundColor = mix(landColor(), settings.water, wetness);

    // Film grain, a new random value per pixel that shimmers over time
    const filmGrain = fract(
      sin(
        dot(screenCoordinate.xy.add(time.mul(0.0002)), vec2(12.9898, 78.233)),
      ).mul(43758.5453),
    ).sub(0.5);

    // Mesh grain sticks to the ground, its dots stay about grainScale pixels big at any zoom
    const groundPosition = positionWorld.xz;
    const groundPerPixel = fwidth(groundPosition.x)
      .mul(fwidth(groundPosition.y))
      .sqrt()
      .max(0.000001);
    const level = log2(groundPerPixel.mul(settings.grainScale));
    const smallLevel = floor(level);
    const blend = level.sub(smallLevel);

    // Grain dots double in size at each zoom level, and each level gets its own random pattern
    // A new pattern grainSpeed times per second, it loops after 64 so the numbers stay small
    const pattern = mod(floor(time.mul(settings.grainSpeed)), 64);
    const patternOffset = vec2(131, 71).mul(pattern);

    const grainAtLevel = (cellLevel) =>
      randomFromCell(
        floor(groundPosition.div(exp2(cellLevel)))
          .add(cellLevel.mul(17))
          .add(patternOffset),
      ).sub(0.5);
    const smallGrain = grainAtLevel(smallLevel);
    const bigGrain = grainAtLevel(smallLevel.add(1));

    // Mixing two random patterns makes them grayer, dividing brings the contrast back
    const meshGrain = mix(smallGrain, bigGrain, blend).div(
      blend.mul(blend).add(blend.oneMinus().mul(blend.oneMinus())).sqrt(),
    );

    // Water stays smooth
    const grain = mix(filmGrain, meshGrain, settings.meshGrain)
      .mul(settings.grain)
      .mul(wetness.oneMinus());

    return mix(groundColor, settings.lineColor, visibleLine)
      .mul(shading)
      .add(grain);
  })();

  return material;
}
