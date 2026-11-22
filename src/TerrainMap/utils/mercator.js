// Web Mercator: the whole world fits in a 0 → 1 square, x grows east, y grows south
export const EARTH_CIRCUMFERENCE = 40075016.686;

export function lngToMercatorX(lng) {
  return (lng + 180) / 360;
}

export function latToMercatorY(lat) {
  const sinLat = Math.sin((lat * Math.PI) / 180);
  return 0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI);
}

export function mercatorXToLng(mercatorX) {
  return mercatorX * 360 - 180;
}

export function mercatorYToLat(mercatorY) {
  return (
    (360 / Math.PI) * Math.atan(Math.exp(Math.PI * (1 - 2 * mercatorY))) - 90
  );
}

export function lngLatToTile([lng, lat], zoom) {
  const tileCount = 2 ** zoom;
  return {
    tileX: Math.floor(lngToMercatorX(lng) * tileCount),
    tileY: Math.floor(latToMercatorY(lat) * tileCount),
  };
}
