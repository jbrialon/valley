import * as THREE from "three/webgpu";
import { uniform } from "three/tsl";

import {
  EARTH_CIRCUMFERENCE,
  latToMercatorY,
  lngLatToTile,
  lngToMercatorX,
  mercatorXToLng,
  mercatorYToLat,
} from "./utils/mercator.js";
import { loadTerrainTexture } from "./tiles/loadTerrain.js";
import { loadWaterTexture } from "./tiles/loadWater.js";
import { CELLS, computeCellHeights, sampleHeight } from "./tiles/heights.js";
import { createReliefTexture, updateReliefTexture } from "./tiles/relief.js";
import { stitchAround } from "./tiles/stitchEdges.js";
import { createTerrainMaterial } from "./tiles/terrainMaterial.js";
import TopoStyle from "./style/TopoStyle.js";

// Width of one tile in scene units
export const TILE_WORLD = 100;

export default class TerrainMap extends THREE.Group {
  constructor({
    accessToken,
    center,
    zoom = 12,
    // How many tiles are shown on each side of the center one: 2 means a 5x5 square
    radius = 2,
    exaggeration = 1.5,
    // Width of small rivers in pixels of the water image, 0 hides them
    riverWidth = 4,
    // How far to look around, in meters, for the lowest and highest ground that set the colors
    reliefRadius = 4000,
    // TopoStyle options: matcap, palette, contour lines…
    style = {},
  } = {}) {
    super();

    this.accessToken = accessToken;
    this.zoom = zoom;
    this.radius = radius;
    this.riverWidth = riverWidth;
    this.reliefRadius = reliefRadius;
    this.exaggeration = uniform(exaggeration);
    this.boundsExaggeration = exaggeration;
    // Shared by every tile material, so a change restyles the whole map at once
    this.style = new TopoStyle(style);

    this.tileCount = 2 ** zoom;
    this.worldSize = this.tileCount * TILE_WORLD;

    // The starting spot becomes 0,0,0 so positions stay small numbers, the GPU gets wobbly with huge ones
    const [lng, lat] = center;
    this.origin = {
      mercatorX: lngToMercatorX(lng),
      mercatorY: latToMercatorY(lat),
    };
    this.tileMeters =
      (EARTH_CIRCUMFERENCE * Math.cos((lat * Math.PI) / 180)) / this.tileCount;
    this.metersToWorld = TILE_WORLD / this.tileMeters;

    this.geometries = new Map();
    this.tiles = new Map();
    this.forward = new THREE.Vector3();
    this.focusPoint = new THREE.Vector3();
    // Counts every time the ground changes, so things sitting on it know to check their height again
    this.heightsVersion = 0;
    // Markers, polylines… anything added with addTo(map) that sits on the ground
    this.overlays = new Set();
    this.overlaysHeightsVersion = 0;

    const { tileX, tileY } = lngLatToTile(center, zoom);
    this.centerTile = { tileX, tileY };
    this.ready = Promise.all(this.updateTiles(tileX, tileY));
  }

  lngLatToWorld([lng, lat], altitudeMeters = 0) {
    return new THREE.Vector3(
      (lngToMercatorX(lng) - this.origin.mercatorX) * this.worldSize,
      altitudeMeters * this.exaggeration.value * this.metersToWorld,
      (latToMercatorY(lat) - this.origin.mercatorY) * this.worldSize,
    );
  }

  worldToLngLat(position) {
    return [
      mercatorXToLng(position.x / this.worldSize + this.origin.mercatorX),
      mercatorYToLat(position.z / this.worldSize + this.origin.mercatorY),
    ];
  }

  // How high the ground is in meters, or null when that piece of map hasn't arrived yet
  getElevation(lngLat) {
    return this.getElevationAt(this.lngLatToWorld(lngLat));
  }

  // Same height in scene units, ready to use as a position.y
  getGroundHeight(position) {
    const elevation = this.getElevationAt(position);
    if (elevation === null) return null;
    return elevation * this.exaggeration.value * this.metersToWorld;
  }

  getElevationAt(position) {
    const tileFloatX =
      (position.x / this.worldSize + this.origin.mercatorX) * this.tileCount;
    const tileFloatY =
      (position.z / this.worldSize + this.origin.mercatorY) * this.tileCount;
    const tileX = Math.floor(tileFloatX);
    const tileY = Math.floor(tileFloatY);

    const tile = this.tiles.get(`${tileX}/${tileY}`);
    if (!tile?.data) return null;

    const lastTexel = tile.size - 1;
    return sampleHeight(
      tile,
      (tileFloatX - tileX) * lastTexel,
      (tileFloatY - tileY) * lastTexel,
    );
  }

  // The colors go from the lowest to the highest ground within this many meters
  setReliefRadius(meters) {
    this.reliefRadius = meters;
    for (const tile of this.tiles.values()) this.updateRelief(tile);
  }

  updateRelief(tile) {
    if (!tile.reliefTexture) return;

    // The search circle plus the blur must fit in the next tile, since we only look one tile away
    const cellMeters = this.tileMeters / CELLS;
    const radiusCells = THREE.MathUtils.clamp(
      this.reliefRadius / cellMeters,
      1,
      CELLS * 0.66,
    );
    const smoothCells = radiusCells * 0.5;

    updateReliefTexture(
      tile.reliefTexture,
      (offsetX, offsetY) =>
        this.tiles.get(`${tile.tileX + offsetX}/${tile.tileY + offsetY}`)
          ?.cellHeights ?? null,
      radiusCells,
      smoothCells,
    );
  }

  // A new tile adds valleys and peaks, so the 8 tiles around it redo their colors too
  updateReliefAround(tile) {
    for (let offsetY = -1; offsetY <= 1; offsetY++) {
      for (let offsetX = -1; offsetX <= 1; offsetX++) {
        const neighbor = this.tiles.get(
          `${tile.tileX + offsetX}/${tile.tileY + offsetY}`,
        );
        if (neighbor) this.updateRelief(neighbor);
      }
    }
  }

  // Runs every frame with the camera, so the tiles around where it's heading get loaded
  update(camera) {
    // The exaggeration changed, so the tile bounding spheres need a new size
    if (this.exaggeration.value !== this.boundsExaggeration) {
      this.boundsExaggeration = this.exaggeration.value;
      for (const tile of this.tiles.values()) {
        if (tile.mesh) this.updateBounds(tile);
      }
      this.heightsVersion++;
    }

    // Overlays only move when the ground under them changed
    if (this.overlaysHeightsVersion !== this.heightsVersion) {
      this.overlaysHeightsVersion = this.heightsVersion;
      for (const overlay of this.overlays) overlay.update();
    }

    // Loads tiles around a spot half a tile ahead, so they're ready before we get there
    camera.getWorldDirection(this.forward);
    this.forward.y = 0;
    this.forward.normalize();
    this.focusPoint
      .copy(camera.position)
      .addScaledVector(this.forward, TILE_WORLD * 0.5);

    const tileX = Math.floor(
      (this.focusPoint.x / this.worldSize + this.origin.mercatorX) *
        this.tileCount,
    );
    const tileY = Math.floor(
      (this.focusPoint.z / this.worldSize + this.origin.mercatorY) *
        this.tileCount,
    );
    if (tileX === this.centerTile.tileX && tileY === this.centerTile.tileY) {
      return;
    }

    this.centerTile = { tileX, tileY };
    this.updateTiles(tileX, tileY);
  }

  updateTiles(centerX, centerY) {
    const loadings = [];

    for (let offsetY = -this.radius; offsetY <= this.radius; offsetY++) {
      for (let offsetX = -this.radius; offsetX <= this.radius; offsetX++) {
        const tileX = centerX + offsetX;
        const tileY = centerY + offsetY;

        // The map stops at the top and bottom of the world
        if (tileY < 0 || tileY >= this.tileCount) continue;
        if (this.tiles.has(`${tileX}/${tileY}`)) continue;

        loadings.push(this.loadTile(tileX, tileY));
      }
    }

    // Tiles just past the edge are kept, so going back and forth over a border doesn't download them again
    // They stay hidden until they're close again
    //
    // With radius 2:
    // . . . . . . .     . = loaded but hidden (distance 3)
    // . # # # # # .     # = loaded and shown (distance ≤ 2)
    // . # # # # # .     F = focus tile
    // . # # F # # .
    // . # # # # # .
    // . # # # # # .
    // . . . . . . .
    for (const [key, tile] of this.tiles) {
      if (this.getTileDistance(tile) > this.radius + 1) {
        this.disposeTile(tile);
        this.tiles.delete(key);
      } else if (tile.mesh) {
        tile.mesh.visible = this.isWithinRadius(tile);
      }
    }

    return loadings;
  }

  // How many tiles away from the middle tile, the 8 touching it count as 1
  getTileDistance(tile) {
    return Math.max(
      Math.abs(tile.tileX - this.centerTile.tileX),
      Math.abs(tile.tileY - this.centerTile.tileY),
    );
  }

  isWithinRadius(tile) {
    return this.getTileDistance(tile) <= this.radius;
  }

  // Bounding sphere around the tile's mountains, three.js uses it to know if the tile is on screen
  updateBounds(tile) {
    let lowest = Infinity;
    let highest = -Infinity;
    for (let index = 0; index < tile.cellHeights.length; index += 2) {
      lowest = Math.min(lowest, tile.cellHeights[index]);
      highest = Math.max(highest, tile.cellHeights[index + 1]);
    }

    const heightScale = this.exaggeration.value * this.metersToWorld;
    const bottom = lowest * heightScale;
    const top = highest * heightScale;
    const halfHeight = (top - bottom) / 2;
    // A bit bigger just in case, the edges can still move a little when a neighbor arrives
    const margin = 1;

    tile.mesh.boundingSphere.center.set(0, bottom + halfHeight, 0);
    tile.mesh.boundingSphere.radius =
      Math.hypot(TILE_WORLD / 2, TILE_WORLD / 2, halfHeight) + margin;
  }

  // All tiles reuse the same flat grid, so it's made once and never thrown away with a tile
  getGeometry(size) {
    if (!this.geometries.has(size)) {
      const geometry = new THREE.PlaneGeometry(
        TILE_WORLD,
        TILE_WORLD,
        size - 1,
        size - 1,
      );
      geometry.rotateX(-Math.PI / 2);
      this.geometries.set(size, geometry);
    }
    return this.geometries.get(size);
  }

  async loadTile(tileX, tileY) {
    const key = `${tileX}/${tileY}`;
    const tile = { tileX, tileY, mesh: null };
    this.tiles.set(key, tile);

    // Going past the edge of the world comes back on the other side, only the download address wraps around
    const wrappedX =
      ((tileX % this.tileCount) + this.tileCount) % this.tileCount;

    try {
      const [terrain, waterTexture] = await Promise.all([
        loadTerrainTexture(this.zoom, wrappedX, tileY, this.accessToken),
        loadWaterTexture({
          zoom: this.zoom,
          tileX: wrappedX,
          tileY,
          accessToken: this.accessToken,
          riverWidth: this.riverWidth,
        }),
      ]);

      // The camera moved away while this was downloading, so it's not needed anymore
      if (this.tiles.get(key) !== tile) {
        terrain.texture.dispose();
        waterTexture.dispose();
        return;
      }

      const reliefTexture = createReliefTexture();
      const material = createTerrainMaterial({
        heightTexture: terrain.texture,
        waterTexture,
        reliefTexture,
        size: terrain.size,
        tileWorld: TILE_WORLD,
        metersToWorld: this.metersToWorld,
        exaggeration: this.exaggeration,
        style: this.style,
      });

      const mesh = new THREE.Mesh(this.getGeometry(terrain.size), material);
      mesh.position.set(
        ((tileX + 0.5) / this.tileCount - this.origin.mercatorX) *
          this.worldSize,
        0,
        ((tileY + 0.5) / this.tileCount - this.origin.mercatorY) *
          this.worldSize,
      );
      // Three.js thinks the grid is flat, so each tile gets a bounding sphere big enough for its mountains
      mesh.boundingSphere = new THREE.Sphere();

      tile.mesh = mesh;
      tile.heightTexture = terrain.texture;
      tile.waterTexture = waterTexture;
      tile.reliefTexture = reliefTexture;
      tile.size = terrain.size;
      tile.data = terrain.data;
      // A clean copy of the heights, so the edges can be fixed again when another neighbor arrives
      tile.sourceData = terrain.data.slice();
      stitchAround(this.tiles, tile);
      tile.cellHeights = computeCellHeights(tile);
      this.updateBounds(tile);
      this.updateReliefAround(tile);
      this.heightsVersion++;
      mesh.visible = this.isWithinRadius(tile);
      this.add(mesh);
    } catch (error) {
      // The broken tile stays in the list so it isn't downloaded again every frame
      console.warn(error);
    }
  }

  disposeTile(tile) {
    if (tile.mesh) {
      this.remove(tile.mesh);
      tile.mesh.material.dispose();
      tile.heightTexture.dispose();
      tile.waterTexture.dispose();
      tile.reliefTexture.dispose();
      this.heightsVersion++;
    }
  }

  // Overlays are only taken off the map, they belong to whoever made them
  dispose() {
    for (const overlay of this.overlays) overlay.remove();

    for (const tile of this.tiles.values()) this.disposeTile(tile);
    this.tiles.clear();

    for (const geometry of this.geometries.values()) geometry.dispose();
    this.geometries.clear();

    this.style.dispose();
  }
}
