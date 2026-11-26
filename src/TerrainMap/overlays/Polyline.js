import * as THREE from "three/webgpu";
import {
  Fn,
  If,
  Discard,
  attribute,
  uniform,
  mod,
  abs,
  min,
  max,
  length,
  vec2,
  materialColor,
} from "three/tsl";

// Polyline().setLngLats(lngLats).addTo(map), sizes in world units
export default class Polyline {
  constructor({
    width = 0.15,
    // How high above the ground the line floats
    lift = 0.03,
    // Distance between two points of the smoothed line
    spacing = 0.1,
    dashLength = 0.5,
    gapLength = 0.35,
    // 0 gives square dash ends, 1 fully round ones
    roundness = 0,
    color = 0xdd5532,
  } = {}) {
    this.options = { width, lift, spacing };
    this.map = null;
    this.lngLats = [];

    this.uniforms = {
      width: uniform(width),
      dashLength: uniform(dashLength),
      gapLength: uniform(gapLength),
      roundness: uniform(roundness),
    };

    this.material = new THREE.MeshBasicNodeMaterial({
      color,
      side: THREE.DoubleSide,
      // Drawn slightly in front of the ground to prevent z-fighting
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2,
    });
    this.material.colorNode = this.createDashNode();
    this.mesh = new THREE.Mesh(new THREE.BufferGeometry(), this.material);
  }

  // The line is one long ribbon, this cuts it into dashes by throwing away the pixels in the gaps
  createDashNode() {
    const { width, dashLength, gapLength, roundness } = this.uniforms;

    return Fn(() => {
      // How far along the line, starting again from 0 at every dash
      const along = mod(
        attribute("lineDistance", "float"),
        dashLength.add(gapLength),
      );
      // How far sideways from the middle of the line
      const across = attribute("across", "float").mul(width).mul(0.5);

      // A dash is a rectangle, the pixel's distance from its center is the same on all 4 sides
      const halfSize = vec2(dashLength, width).mul(0.5);
      const fromCenter = abs(vec2(along.sub(halfSize.x), across));

      // Round corners: a smaller rectangle, plus everything closer to it than the radius
      const radius = roundness.mul(min(halfSize.x, halfSize.y));
      const smallerHalfSize = halfSize.sub(radius);
      const outsideBy = max(fromCenter.sub(smallerHalfSize), 0);

      If(length(outsideBy).greaterThan(radius), () => {
        Discard();
      });

      return materialColor;
    })();
  }

  setLngLats(lngLats) {
    this.lngLats = lngLats;
    this.build();
    return this;
  }

  getLngLats() {
    return this.lngLats;
  }

  addTo(map) {
    this.remove();
    this.map = map;
    map.overlays.add(this);
    map.add(this.mesh);
    this.build();
    return this;
  }

  remove() {
    if (!this.map) return this;
    this.map.overlays.delete(this);
    this.map.remove(this.mesh);
    this.map = null;
    return this;
  }

  // The GPS points are far apart, so a smooth curve goes through them and gets cut into many close points
  getSmoothPoints() {
    const { spacing } = this.options;
    const points = this.lngLats.map((lngLat) => this.map.lngLatToWorld(lngLat));
    if (points.length < 2) return points;

    const curve = new THREE.CatmullRomCurve3(points, false, "centripetal");
    const count = Math.max(Math.ceil(curve.getLength() / spacing), 1);
    return curve.getSpacedPoints(count);
  }

  // Turns the points into a flat ribbon: each point gets a vertex on its left and one on its right
  build() {
    this.mesh.geometry.dispose();
    this.mesh.geometry = new THREE.BufferGeometry();
    if (!this.map || this.lngLats.length < 2) return;

    const points = this.getSmoothPoints();
    if (points.length < 2) return;

    const { width } = this.options;
    this.uniforms.width.value = width;

    const vertexCount = points.length * 2;
    const positions = new THREE.BufferAttribute(
      new Float32Array(vertexCount * 3),
      3,
    );
    // How far along the line each vertex is, for the dashes
    const lineDistances = new THREE.BufferAttribute(
      new Float32Array(vertexCount),
      1,
    );
    // 1 on the left edge, -1 on the right edge
    const acrosses = new THREE.BufferAttribute(
      new Float32Array(vertexCount),
      1,
    );
    const indices = [];

    const direction = new THREE.Vector3();
    const side = new THREE.Vector3();
    let lineDistance = 0;

    points.forEach((point, index) => {
      const previous = points[Math.max(index - 1, 0)];
      const next = points[Math.min(index + 1, points.length - 1)];

      // Which way the line goes here, flat on the ground
      direction.subVectors(next, previous).setY(0).normalize();
      // Turned a quarter, so it points to the left of the line, half the width long
      side.set(-direction.z, 0, direction.x).multiplyScalar(width / 2);

      if (index > 0) {
        lineDistance += Math.hypot(point.x - previous.x, point.z - previous.z);
      }

      // The height is set later by drape()
      const left = index * 2;
      const right = index * 2 + 1;
      positions.setXYZ(left, point.x + side.x, 0, point.z + side.z);
      positions.setXYZ(right, point.x - side.x, 0, point.z - side.z);
      lineDistances.setX(left, lineDistance);
      lineDistances.setX(right, lineDistance);
      acrosses.setX(left, 1);
      acrosses.setX(right, -1);

      // Two triangles fill the gap up to the next point
      if (index < points.length - 1) {
        const nextLeft = left + 2;
        const nextRight = right + 2;
        indices.push(left, right, nextLeft, right, nextRight, nextLeft);
      }
    });

    const geometry = this.mesh.geometry;
    geometry.setAttribute("position", positions);
    geometry.setAttribute("lineDistance", lineDistances);
    geometry.setAttribute("across", acrosses);
    geometry.setIndex(indices);
    this.drape();
  }

  // Puts every vertex on the ground, one by one, so the ribbon also tilts on slopes
  drape() {
    const positions = this.mesh.geometry.attributes.position;
    if (!positions) return;
    const vertex = new THREE.Vector3();

    for (let index = 0; index < positions.count; index++) {
      vertex.fromBufferAttribute(positions, index);
      const groundHeight = this.map.getGroundHeight(vertex);
      // No ground loaded here yet, so it stays where it was
      if (groundHeight !== null) {
        positions.setY(index, groundHeight + this.options.lift);
      }
    }

    positions.needsUpdate = true;
    this.mesh.geometry.computeBoundingSphere();
  }

  // Called by the map when the ground changed
  update() {
    this.drape();
  }

  dispose() {
    this.remove();
    this.mesh.geometry.dispose();
    this.material.dispose();
  }
}
