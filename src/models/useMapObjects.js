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
