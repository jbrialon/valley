import * as THREE from "three/webgpu";

// Downloads the height map of a tile, its colors are altitudes
// Heights are stored in the RGB bytes, so the texture must stay raw: no color conversion, no filtering
export async function loadTerrainTexture(zoom, tileX, tileY, accessToken) {
  const response = await fetch(
    `https://api.mapbox.com/v4/mapbox.mapbox-terrain-dem-v1/${zoom}/${tileX}/${tileY}.pngraw?access_token=${accessToken}`,
  );
  if (!response.ok)
    throw new Error(
      `Terrain tile ${zoom}/${tileX}/${tileY} failed (${response.status})`,
    );

  const blob = await response.blob();
  const bitmap = await createImageBitmap(blob, {
    colorSpaceConversion: "none",
    premultiplyAlpha: "none",
  });
  const size = bitmap.width;

  const canvas = new OffscreenCanvas(size, size);
  const context = canvas.getContext("2d", { willReadFrequently: true });
  context.drawImage(bitmap, 0, 0);
  bitmap.close();

  const data = new Uint8Array(
    context.getImageData(0, 0, size, size).data.buffer,
  );

  const texture = new THREE.DataTexture(
    data,
    size,
    size,
    THREE.RGBAFormat,
    THREE.UnsignedByteType,
  );
  texture.colorSpace = THREE.NoColorSpace;
  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;

  return { texture, size, data };
}
