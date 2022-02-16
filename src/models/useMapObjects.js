import * as THREE from 'three';
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
  let origin = new THREE.Vector3(data.origin.x, data.origin.z, -data.origin.y);
  let direction = new THREE.Vector3(data.direction.x, data.direction.z, -data.direction.y);
  direction.normalize();

  let mesh = new THREE.ArrowHelper(direction, origin, data.length, color, Math.min([0.1 * data.length], 0.5), Math.min([0.1 * data.length], 0.5));

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

// ============= Plane Intersection Objects =============

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
