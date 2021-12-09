import * as THREE from 'three';
import { useCoordinates } from '@/models/useCoordinates.js';

export function useMapObjects() {
  return {};
}

export function createRing(options) {
  const { scaleDownCoordinate } = useCoordinates();
  let scaledDownMeasurements = scaleDownCoordinate(options);

  const geometry = new THREE.RingGeometry(scaledDownMeasurements.radius - 2, scaledDownMeasurements.radius + 2, 200);
  const material = new THREE.MeshLambertMaterial({ color: options.color, side: THREE.DoubleSide, blending: THREE.AdditiveBlending });
  const ring = new THREE.Mesh(geometry, material);
  ring.rotateX(Math.PI / 2);

  ring.position.set(-845, 0, 0);
  return ring;
}

export function createSphere(options) {
  const { scaleDownCoordinate } = useCoordinates();
  let scaledDownMeasurements = scaleDownCoordinate(options);

  const geometry = new THREE.SphereGeometry(scaledDownMeasurements.radius, options.widthSegments, options.heightSegments);
  const material = new THREE.MeshLambertMaterial({ color: options.color, opacity: options.opacity });
  const sphere = new THREE.Mesh(geometry, material);

  if (options.name) {
    sphere.name = options.name;
  }

  if (options.celestialType) {
    sphere.celestialType = options.celestialType;
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
    options.tubularSegments,
    Math.PI
  );
  const materialFront = new THREE.MeshLambertMaterial({
    color: options.color,
    opacity: options.opacity,
    transparent: true,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });
  const materialBack = new THREE.MeshLambertMaterial({
    color: options.color,
    opacity: options.opacity,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });

  let torusFrontMesh = new THREE.Mesh(geometry, materialFront);
  torusFrontMesh.scale.set(options.scaleX, options.scaleY);
  torusFrontMesh.lookAt(mapData.camera.position.x, 0, mapData.camera.position.z);
  torusFrontMesh.rotateX(Math.PI / 2);
  torusFrontMesh.position.set(scaledDownMeasurements.position.x, scaledDownMeasurements.position.z, -scaledDownMeasurements.position.y);

  let torusBackMesh = new THREE.Mesh(geometry, materialBack);
  torusBackMesh.scale.set(options.scaleX, options.scaleY);
  torusBackMesh.lookAt(-mapData.camera.position.x, 0, -mapData.camera.position.z);
  torusBackMesh.rotateX(Math.PI / 2);
  torusBackMesh.position.set(scaledDownMeasurements.position.x, scaledDownMeasurements.position.z, -scaledDownMeasurements.position.y);

  return { torusFrontMesh, torusBackMesh };
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
