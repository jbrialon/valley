import * as THREE from "three/webgpu";

// Each satellite image is 512px (the @2x version)
const SATELLITE_IMAGE_SIZE = 512;

// The satellite photo of one terrain tile, sharper by fetching the smaller tiles of a deeper zoom
// zoomOffset 1 stitches 2x2 images (1024px), 2 stitches 4x4 (2048px)
export async function loadSatelliteTexture({
  zoom,
  tileX,
  tileY,
  accessToken,
  zoomOffset,
  anisotropy,
}) {
  const perSide = 2 ** zoomOffset;
  const size = SATELLITE_IMAGE_SIZE * perSide;
  const canvas = new OffscreenCanvas(size, size);
  const context = canvas.getContext("2d");
  // Shows instead of a hole if one image fails
  context.fillStyle = "#808080";
  context.fillRect(0, 0, size, size);

  const loadings = [];
  for (let row = 0; row < perSide; row++) {
    for (let column = 0; column < perSide; column++) {
      const imageZoom = zoom + zoomOffset;
      const imageX = tileX * perSide + column;
      const imageY = tileY * perSide + row;

      const loading = fetch(
        `https://api.mapbox.com/v4/mapbox.satellite/${imageZoom}/${imageX}/${imageY}@2x.jpg90?access_token=${accessToken}`,
      )
        .then((response) => {
          if (!response.ok) throw new Error(`status ${response.status}`);
          return response.blob();
        })
        .then((blob) => createImageBitmap(blob))
        .then((bitmap) => {
          context.drawImage(
            bitmap,
            column * SATELLITE_IMAGE_SIZE,
            row * SATELLITE_IMAGE_SIZE,
          );
          bitmap.close();
        })
        .catch((error) => {
          console.warn(
            `Satellite image ${imageZoom}/${imageX}/${imageY} failed (${error.message})`,
          );
        });
      loadings.push(loading);
    }
  }
  await Promise.all(loadings);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  // Mipmaps and anisotropy keep it sharp without shimmering when seen from a low angle
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.generateMipmaps = true;
  texture.anisotropy = anisotropy;
  // Stops the edge pixels from blending with the opposite side of the image
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}
