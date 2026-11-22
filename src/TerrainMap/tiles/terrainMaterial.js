import * as THREE from "three/webgpu";
import {
  Fn,
  clamp,
  color,
  dot,
  float,
  int,
  ivec2,
  max,
  min,
  mix,
  normalize,
  positionLocal,
  select,
  texture,
  textureLoad,
  uv,
  varying,
  vec3,
} from "three/tsl";

// Light comes from the north-west and a bit above
const LIGHT_DIRECTION = new THREE.Vector3(-1, 1.2, -1).normalize();

export function createTerrainMaterial({
  heightTexture,
  satelliteTexture,
  size,
  tileWorld,
  metersToWorld,
  exaggeration,
  // 1 shows the hillshade instead of the satellite photo
  shaded,
}) {
  const lastTexel = size - 1;
  // Distance between two points of the grid, in scene units
  const texelWorld = tileWorld / lastTexel;

  // Each point of the grid has its own pixel in the height image, row 0 is the north edge
  const texelX = int(uv().x.mul(lastTexel).round());
  const texelY = int(float(1).sub(uv().y).mul(lastTexel).round());

  // Height in meters of one exact pixel, any blending with its neighbors would scramble the height
  const elevationAt = (pixelX, pixelY) => {
    const pixel = textureLoad(heightTexture, ivec2(pixelX, pixelY))
      .rgb.mul(255)
      .round();

    // Mapbox hides the height in meters inside the red, green and blue values
    // height = -10000 + ((R × 256 × 256 + G × 256 + B) × 0.1), same as decodeHeight in heights.js
    return pixel.r
      .mul(65536)
      .add(pixel.g.mul(256))
      .add(pixel.b)
      .mul(0.1)
      .sub(10000);
  };

  // Turns meters into scene units, the relief slider included
  const heightScale = exaggeration.mul(metersToWorld);

  // Vertex shader
  const vertexShader = Fn(() => {
    const lift = elevationAt(texelX, texelY).mul(heightScale);
    return positionLocal.add(vec3(0, lift, 0));
  });

  // Which way the ground faces, from the slope between the neighbors on each side
  const groundNormal = Fn(() => {
    // On the tile border there's no neighbor outside, so the point itself is used instead
    const westX = max(texelX.sub(1), int(0));
    const eastX = min(texelX.add(1), int(lastTexel));
    const northY = max(texelY.sub(1), int(0));
    const southY = min(texelY.add(1), int(lastTexel));

    const slopeX = elevationAt(eastX, texelY)
      .sub(elevationAt(westX, texelY))
      .mul(heightScale)
      .div(float(eastX.sub(westX)).mul(texelWorld));
    const slopeZ = elevationAt(texelX, southY)
      .sub(elevationAt(texelX, northY))
      .mul(heightScale)
      .div(float(southY.sub(northY)).mul(texelWorld));

    return normalize(vec3(slopeX.negate(), 1, slopeZ.negate()));
  });

  // Fragment shader
  const fragmentShader = Fn(() => {
    const satellite = texture(satelliteTexture, uv()).rgb;

    // Slopes facing the light are bright, the ones facing away are dark
    const light = clamp(dot(varying(groundNormal()), LIGHT_DIRECTION), 0, 1);
    const hillshade = mix(color(0x4a4640), color(0xf4f1ea), light);

    return select(shaded.greaterThan(0.5), hillshade, satellite);
  });

  const material = new THREE.MeshBasicNodeMaterial();
  material.positionNode = vertexShader();
  material.colorNode = fragmentShader();

  return material;
}
