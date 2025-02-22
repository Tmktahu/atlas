import * as THREE from 'three';
import { Line2 } from '@/custom/Line2.js';
import { LineMaterial } from '@/custom/LineMaterial.js';
import { LineGeometry } from '@/custom/LineGeometry.js';

import { useCoordinates } from '@/models/useCoordinates.js';

import { ICON_MAP } from '@/models/useIcons.js';

const POINT_SIZE = 0.5;

export function useMapObjects() {
  return {};
}

export async function createPointMesh(data) {
  let sprite = await new THREE.TextureLoader().load(ICON_MAP[data.icon].workingFilePath);
  let color = new THREE.Color(data.color);

  let material = new THREE.PointsMaterial({ color: color, size: POINT_SIZE, map: sprite, sizeAttenuation: true, alphaTest: 0.5 });
  let geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute([data.position.x, data.position.z, -data.position.y], 3));
  const mesh = new THREE.Points(geometry, material);

  mesh.name = data.name;
  mesh.pointId = data.id;

  return mesh;
}

export async function createVectorMesh(data) {
  let color = new THREE.Color(data.color);
  let startPoint = [data.startPoint.x, data.startPoint.z, -data.startPoint.y];
  let endPoint = [data.endPoint.x, data.endPoint.z, -data.endPoint.y];

  let points = [startPoint, endPoint];

  const lineGeometry = new LineGeometry();
  lineGeometry.setPositions(points.flat());

  const lineMaterial = new LineMaterial({
    color: color,
    linewidth: 0.001,
    dashed: false,
    blending: THREE.AdditiveBlending,
  });
  let mesh = new Line2(lineGeometry, lineMaterial);
  mesh.name = data.name;
  mesh.vectorId = data.id;

  return mesh;
}

export function createRing(options) {
  const { scaleDownCoordinate } = useCoordinates();
  let scaledDownRadius = scaleDownCoordinate(options.radius);

  const geometry = new THREE.RingGeometry(scaledDownRadius - 3, scaledDownRadius + 3, 200);
  const material = new THREE.MeshStandardMaterial({ color: options.color, side: THREE.DoubleSide, blending: THREE.NoBlending });
  const ring = new THREE.Mesh(geometry, material);
  ring.rotateX(Math.PI / 2);

  ring.position.set(-845, 0, 0);
  return ring;
}

export async function createSphereMesh(options) {
  let texture = null;
  if (options.texture) {
    let textureLoader = new THREE.TextureLoader();
    texture = await textureLoader.load(options.texture);
  }

  const { scaleDownCoordinate } = useCoordinates();
  let scaledDownMeasurements = scaleDownCoordinate(options);

  const geometry = new THREE.SphereGeometry(scaledDownMeasurements.radius, options.widthSegments, options.heightSegments);
  const material = new THREE.MeshLambertMaterial({ opacity: options.opacity });

  if (texture) {
    material.map = texture;
  } else {
    material.color = new THREE.Color(options.color);
  }

  const sphere = new THREE.Mesh(geometry, material);

  if (options.name) {
    sphere.name = options.name;
  }

  if (options.type) {
    sphere.celestialType = options.type;
  }

  if (options.id) {
    sphere.objectId = options.id;
  }

  sphere.position.set(scaledDownMeasurements.position.x, scaledDownMeasurements.position.z, -scaledDownMeasurements.position.y);
  return sphere;
}

export function createSphereFrame(options) {
  const { scaleDownCoordinate } = useCoordinates();
  let scaledDownMeasurements = scaleDownCoordinate(options);

  const geometry = new THREE.SphereGeometry(scaledDownMeasurements.radius, options.widthSegments, options.heightSegments);
  const material = new THREE.MeshLambertMaterial({ color: options.color, opacity: options.opacity, wireframe: true, blending: THREE.AdditiveBlending });
  const sphere = new THREE.Mesh(geometry, material);
  sphere.lookAt(0, 0, 0);

  sphere.position.set(scaledDownMeasurements.position.x, scaledDownMeasurements.position.y, scaledDownMeasurements.position.z);
  return sphere;
}

export function createTorus(options, mapData) {
  const { scaleDownCoordinate } = useCoordinates();
  let scaledDownMeasurements = scaleDownCoordinate(options);

  const geometry = new THREE.TorusGeometry(
    scaledDownMeasurements.overalRadius,
    scaledDownMeasurements.innerRadius,
    options.radialSegments,
    options.tubularSegments
  );
  const material = new THREE.MeshLambertMaterial({
    color: options.color,
    opacity: options.opacity,
    transparent: true,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });

  let torusMesh = new THREE.Mesh(geometry, material);
  torusMesh.scale.set(options.scaleX, options.scaleY);
  torusMesh.lookAt(mapData.camera.position.x, 0, mapData.camera.position.z);
  torusMesh.rotateX(Math.PI / 2);
  torusMesh.position.set(scaledDownMeasurements.position.x, scaledDownMeasurements.position.z, -scaledDownMeasurements.position.y);

  return torusMesh;
}

export function createTorusFrame(options, mapData) {
  const { scaleDownCoordinate } = useCoordinates();
  let scaledDownMeasurements = scaleDownCoordinate(options);

  const geometry = new THREE.TorusGeometry(
    scaledDownMeasurements.overalRadius,
    scaledDownMeasurements.innerRadius,
    options.radialSegments,
    options.tubularSegments,
    Math.PI
  );
  const materialFront = new THREE.MeshLambertMaterial({
    color: options.color,
    wireframe: true,
    opacity: options.opacity,
    transparent: true,
    blending: THREE.AdditiveBlending,
  });
  const materialBack = new THREE.MeshLambertMaterial({ color: options.color, wireframe: true, opacity: options.opacity, blending: THREE.AdditiveBlending });

  let torusFrontMesh = new THREE.Mesh(geometry, materialFront);
  torusFrontMesh.scale.set(options.scaleX, options.scaleY);
  torusFrontMesh.lookAt(mapData.camera.position.x, 0, mapData.camera.position.z);
  torusFrontMesh.rotateX(Math.PI / 2);
  torusFrontMesh.position.set(scaledDownMeasurements.position.x, scaledDownMeasurements.position.y, scaledDownMeasurements.position.z);

  let torusBackMesh = new THREE.Mesh(geometry, materialBack);
  torusBackMesh.scale.set(3.6666, 3.6666);
  torusBackMesh.lookAt(-mapData.camera.position.x, 0, -mapData.camera.position.z);
  torusBackMesh.rotateX(Math.PI / 2);
  torusBackMesh.position.set(scaledDownMeasurements.position.x, scaledDownMeasurements.position.y, scaledDownMeasurements.position.z);

  return { torusFrontMesh, torusBackMesh };
}

export async function createSafeZoneMesh(options) {
  let scaledRadiusX = options.baseRadius * options.scaleX;
  let scaledRadiusY = options.baseRadius * options.scaleY;
  let scaledRadiusZ = options.baseRadius * options.scaleZ;

  let horzThing = Math.pow(scaledRadiusX - scaledRadiusZ, 2) / Math.pow(scaledRadiusX + scaledRadiusZ, 2);
  let elypsisHorzCir = Math.PI * (scaledRadiusX + scaledRadiusZ) * (1 + (3 * horzThing) / (10 + Math.sqrt(4 - 3 * horzThing)));

  let vertThing = Math.pow(scaledRadiusZ - scaledRadiusY, 2) / Math.pow(scaledRadiusZ + scaledRadiusY, 2);
  let elypsisVertCir = Math.PI * (scaledRadiusZ + scaledRadiusY) * (1 + (3 * vertThing) / (10 + Math.sqrt(4 - 3 * vertThing)));

  let textureLoader = new THREE.TextureLoader();
  let texture = await textureLoader.load(options.texture);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat = new THREE.Vector2(elypsisHorzCir * 2, elypsisVertCir / 2);

  const geometry = new THREE.SphereGeometry(options.baseRadius, 100, 100);
  const material = new THREE.MeshLambertMaterial({
    transparent: true,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    opacity: 0.99,
    color: '#00FF00',
  });

  material.map = texture;
  material.alphaMap = texture;
  //material.depthTest = false;
  material.depthFunc = THREE.AlwaysDepth;

  const sphere = new THREE.Mesh(geometry, material);

  sphere.position.set(options.position.x, options.position.z, -options.position.y);
  sphere.scale.set(options.scaleX, options.scaleY, options.scaleZ);

  return sphere;
}

export async function createSafeZoneMeshRing(options) {
  const geometry = new THREE.RingGeometry(options.baseRadius, options.baseRadius + options.baseRadius / 200, 100);
  const material = new THREE.MeshBasicMaterial({ color: '#00FF00', side: THREE.DoubleSide, blending: THREE.AdditiveBlending });
  const ring = new THREE.Mesh(geometry, material);
  ring.rotateX(Math.PI / 2);

  ring.position.set(options.position.x, options.position.z, -options.position.y);
  ring.scale.set(options.scaleX, options.scaleZ, options.scaleY);
  return ring;
}

// ============= Plane Intersection Objects =============

export function createOrbitRing(options) {
  // the idea behind an orbit ring is you have a center point and then a point on the ring that should determine the ring's orrientation
  const { scaleDownCoordinate } = useCoordinates();

  // target point = object coordinate
  // center point = provided (either origin or a parent object coordinate)
  let centerPoint = scaleDownCoordinate({ position: options.centerPoint });
  let targetPoint = scaleDownCoordinate({ position: options.targetPoint });

  let radius = Math.sqrt(
    Math.pow(centerPoint.position.x - targetPoint.position.x, 2) +
      Math.pow(centerPoint.position.y - targetPoint.position.y, 2) +
      Math.pow(centerPoint.position.z - targetPoint.position.z, 2)
  );

  const geometry = new THREE.RingGeometry(radius, radius + radius / 100, options.widthSegments); //, 1, 0, 3.5); // debug for ring rotation
  const material = new THREE.MeshBasicMaterial({ color: options.color, side: THREE.DoubleSide, blending: THREE.AdditiveBlending });
  const ring = new THREE.Mesh(geometry, material);

  // we initially rotate the ring so it lays flat on the horizontal plane
  ring.rotateX(Math.PI / 2);

  // this rotate pulls the starting point of the ring onto the same vertical plane as the target point
  let angle1 = Math.atan((targetPoint.position.y - centerPoint.position.y) / (centerPoint.position.x - targetPoint.position.x));
  if (Math.sign(centerPoint.position.x - targetPoint.position.x) === 1) {
    ring.rotateZ(Math.PI + angle1);
  } else {
    ring.rotateZ(angle1);
  }

  // now we rotate the ring to intersect with the target point
  let angle2 = Math.atan(
    Math.abs(centerPoint.position.z - targetPoint.position.z) /
      Math.sqrt(Math.pow(targetPoint.position.y - centerPoint.position.y, 2) + Math.pow(centerPoint.position.x - targetPoint.position.x, 2))
  );

  ring.rotateY(angle2);

  ring.position.set(centerPoint.position.x, centerPoint.position.z, -centerPoint.position.y);
  //ring.scale.set(options.scaleX, options.scaleZ, options.scaleY);
  return ring;
}

export function createSphereIntersectionRing(options) {
  const { scaleDownCoordinate } = useCoordinates();
  let scaledDownMeasurements = scaleDownCoordinate(options);

  const geometry = new THREE.RingGeometry(
    scaledDownMeasurements.radius,
    scaledDownMeasurements.radius + scaledDownMeasurements.radius / 100,
    options.widthSegments
  );
  const material = new THREE.MeshBasicMaterial({ color: options.color, side: THREE.DoubleSide, blending: THREE.AdditiveBlending });
  const ring = new THREE.Mesh(geometry, material);
  ring.rotateX(Math.PI / 2);

  ring.position.set(scaledDownMeasurements.position.x, scaledDownMeasurements.position.z, -scaledDownMeasurements.position.y);
  return ring;
}

export function createTorusIntersectionRings(options) {
  const { scaleDownCoordinate } = useCoordinates();
  let scaledDownMeasurements = scaleDownCoordinate(options);

  let outerRingRadius = (scaledDownMeasurements.overalRadius + scaledDownMeasurements.innerRadius) * scaledDownMeasurements.scaleX;
  let innerRingRadius = (scaledDownMeasurements.overalRadius - scaledDownMeasurements.innerRadius) * scaledDownMeasurements.scaleX;

  const material = new THREE.MeshBasicMaterial({ color: options.color, side: THREE.DoubleSide, blending: THREE.AdditiveBlending });

  const innerGeometry = new THREE.RingGeometry(innerRingRadius, innerRingRadius + innerRingRadius / 3000, options.tubularSegments * 2);
  const innerRing = new THREE.Mesh(innerGeometry, material);
  innerRing.rotateX(Math.PI / 2);

  innerRing.position.set(scaledDownMeasurements.position.x, scaledDownMeasurements.position.z, -scaledDownMeasurements.position.y);

  const outerGeometry = new THREE.RingGeometry(outerRingRadius, outerRingRadius - outerRingRadius / 3000, options.tubularSegments);
  const outerRing = new THREE.Mesh(outerGeometry, material);
  outerRing.rotateX(Math.PI / 2);

  outerRing.position.set(scaledDownMeasurements.position.x, scaledDownMeasurements.position.z, -scaledDownMeasurements.position.y);

  return { innerRing, outerRing };
}

export function createHoverLine() {
  const lineGeometry = new LineGeometry();
  const lineMaterial = new LineMaterial({
    color: 0xffffff,
    linewidth: 0.001,
    dashed: false,
    blending: THREE.AdditiveBlending,
  });
  let hoverLine = new Line2(lineGeometry, lineMaterial);
  hoverLine.visible = false;
  return hoverLine;
}

export function createHoverCircle() {
  const ringMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, blending: THREE.AdditiveBlending });
  const ringGeometry = new THREE.RingGeometry(0.3, 0.35, 50);
  let hoverCircle = new THREE.Mesh(ringGeometry, ringMaterial);
  hoverCircle.rotateX(Math.PI / 2);
  hoverCircle.visible = false;
  return hoverCircle;
}

export function createPointIntersectionObjects(options) {
  const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, blending: THREE.AdditiveBlending });
  const points = [];
  points.push(new THREE.Vector3(options.position.x, options.position.z, -options.position.y));
  points.push(new THREE.Vector3(options.position.x, 0, -options.position.y));

  const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
  const line = new THREE.Line(lineGeometry, lineMaterial);
  line.visible = false;

  const ringMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, blending: THREE.AdditiveBlending });

  const ringGeometry = new THREE.RingGeometry(0.3, 0.35, 50);
  const ring = new THREE.Mesh(ringGeometry, ringMaterial);
  ring.rotateX(Math.PI / 2);
  ring.position.set(options.position.x, 0, -options.position.y);
  ring.visible = false;

  return { line, ring };
}
