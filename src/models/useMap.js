/* eslint-disable id-length */
import * as THREE from 'three';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';

import pointSprite from '@/assets/disc.png';
import pointFont from '@/assets/helvetiker_regular.typeface.json';

import { ref, watch, reactive, toRefs } from '@vue/composition-api';

export const ORIGIN_POINT = { name: 'Origin', color: 'red', position: { x: 0, y: 0, z: 0 } };

export const ORIGIN_STATIONS = [
  { name: 'Origin Station 1', color: 'red', position: { x: 0, y: 0, z: 0 } },
  { name: 'Origin Station 2', color: 'red', position: { x: 0, y: 1000, z: 0 } },
  { name: 'Origin Station 3', color: 'red', position: { x: 0, y: -1000, z: 0 } },
  { name: 'Origin Station 4', color: 'red', position: { x: 0, y: 0, z: 1000 } },
  { name: 'Origin Station 5', color: 'red', position: { x: 0, y: 0, z: -1000 } },
  { name: 'Origin Station 6', color: 'red', position: { x: 0, y: 0, z: 0 } },
  { name: 'Origin Station 7', color: 'red', position: { x: 0, y: 0, z: 0 } },
  { name: 'Origin Station 8', color: 'red', position: { x: 0, y: 0, z: 0 } },
  { name: 'Origin Station 9', color: 'red', position: { x: 0, y: 0, z: 0 } },
  { name: 'Origin Station 10', color: 'red', position: { x: 0, y: 0, z: 0 } },
  { name: 'Origin Station 11', color: 'red', position: { x: 0, y: 0, z: 0 } },
  { name: 'Origin Station 12', color: 'red', position: { x: 0, y: 0, z: 0 } },
  { name: 'Origin Station 13', color: 'red', position: { x: 0, y: 0, z: 0 } },
  { name: 'Origin Station 14', color: 'red', position: { x: 0, y: 0, z: 0 } },
  { name: 'Origin Station 15', color: 'red', position: { x: 0, y: 0, z: 0 } },
  { name: 'Origin Station 16', color: 'red', position: { x: 0, y: 0, z: 0 } },
  { name: 'Origin Station 17', color: 'red', position: { x: 0, y: 0, z: 0 } },
  { name: 'Origin Station 18', color: 'red', position: { x: 0, y: 0, z: 0 } },
  { name: 'Origin Station 19', color: 'red', position: { x: 0, y: 0, z: 0 } },
  { name: 'Origin Station 20', color: 'red', position: { x: 0, y: 0, z: 0 } },
  { name: 'Origin Station 21', color: 'red', position: { x: 0, y: 0, z: 0 } },
  { name: 'Origin Station 22', color: 'red', position: { x: 0, y: 0, z: 0 } },
  { name: 'Origin Station 23', color: 'red', position: { x: 0, y: 0, z: 0 } },
  { name: 'Origin Station 24', color: 'red', position: { x: 0, y: 0, z: 0 } },
  { name: 'Origin Station 25', color: 'red', position: { x: 0, y: 0, z: 0 } },
  { name: 'Origin Station 26', color: 'red', position: { x: 0, y: 0, z: 0 } },
  { name: 'Origin Station 27', color: 'red', position: { x: 0, y: 0, z: 0 } },
  { name: 'Origin Station 28', color: 'red', position: { x: 0, y: 0, z: 0 } },
  { name: 'Origin Station 29', color: 'red', position: { x: 0, y: 0, z: 0 } },
  { name: 'Origin Station 30', color: 'red', position: { x: 0, y: 0, z: 0 } },
];

export const TRANSMITTER_STATIONS = [
  { name: 'North', color: 'red', position: { x: 0, y: 0, z: 0 } },
  { name: 'South', color: 'red', position: { x: 0, y: 0, z: 0 } },
  { name: 'East', color: 'red', position: { x: 0, y: 0, z: 0 } },
  { name: 'West', color: 'red', position: { x: 0, y: 0, z: 0 } },
];

export const EOS_OFFSET = {
  x: -8450000,
  y: 0,
  z: 0,
};

export const MIN_PAN_SPEED = 1;
export const MAX_PAN_SPEED = 10000;

export function useMap(inMapData) {
  const mapData =
    inMapData ||
    reactive({
      containerElement: null,
      stats: null,
      scene: null,
      camera: null,
      renderer: null,
      controls: null,

      sphereMesh: null,
      torusMesh: null,
      pointsMesh: null,
      pointsArray: ref(null),

      torusFillFrontMesh: null,
      torusFillBackMesh: null,
      torusFrameFrontMesh: null,
      torusFrameBackMesh: null,

      lookAtVector: new THREE.Vector3(),

      panSpeed: ref(1),
    });

  const init = (inContainerElement, inStats) => {
    mapData.containerElement = inContainerElement;
    mapData.stats = inStats;

    mapData.scene = new THREE.Scene();

    const startingCameraPosition = [ORIGIN_POINT.position.x + 1000, ORIGIN_POINT.position.y + 1000, ORIGIN_POINT.position.z + 1000];
    const startingControlsPosition = [startingCameraPosition[0] - 1, startingCameraPosition[1] - 1, startingCameraPosition[2] - 1];

    // PerspectiveCamera(FOV, Aspect Ratio, Near Clipping Plane, Far Clipping Place)
    mapData.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000000000);
    mapData.camera.position.set(startingCameraPosition[0], startingCameraPosition[1], startingCameraPosition[2]);

    mapData.renderer = new THREE.WebGLRenderer({ alpha: true });
    mapData.renderer.setSize(window.innerWidth, window.innerHeight);
    mapData.containerElement.appendChild(mapData.renderer.domElement);

    mapData.controls = new OrbitControls(mapData.camera, mapData.renderer.domElement);
    mapData.controls.enableZoom = false;
    mapData.controls.listenToKeyEvents(window);
    mapData.controls.keyPanSpeed = mapData.panSpeed * 100 * 200;
    mapData.controls.panSpeed = mapData.panSpeed * 100 * 10;
    mapData.controls.keys = {
      LEFT: 'KeyA',
      UP: 'Space',
      RIGHT: 'KeyD',
      BOTTOM: 'ShiftLeft',
    };
    mapData.controls.target.set(startingControlsPosition[0], startingControlsPosition[1], startingControlsPosition[2]);
    mapData.controls.update();

    const gridMaterial = new THREE.MeshLambertMaterial({ color: '#111111', opacity: 0.8, transparent: true, blending: THREE.AdditiveBlending });
    gridMaterial.renderOrder = -1;
    gridMaterial.depthTest = false;

    const grid = new THREE.GridHelper(1000000000, 300);

    grid.material = gridMaterial;
    mapData.scene.add(grid);

    addTorus();
    addSphere();

    addLight(4, 2, 4);
    addLight(-4, -1, -2);

    mapData.pointsArray = [ORIGIN_POINT, ...ORIGIN_STATIONS];

    addPoints(mapData.pointsArray);

    mapData.controls.update();
    animate();

    const refs = toRefs(mapData);

    watch(refs.panSpeed, () => {
      mapData.controls.keyPanSpeed = mapData.panSpeed * 100 * 200;
      mapData.controls.panSpeed = mapData.panSpeed * 100 * 10;
    });
  };

  const animate = () => {
    requestAnimationFrame(animate);
    mapData.stats.begin();

    mapData.torusFillFrontMesh.lookAt(mapData.camera.position.x, 0, mapData.camera.position.z);
    mapData.torusFillFrontMesh.rotateX(Math.PI / 2);

    mapData.torusFillBackMesh.lookAt(mapData.camera.position.x, 0, mapData.camera.position.z);
    mapData.torusFillBackMesh.rotateX(Math.PI / 2);
    mapData.torusFillBackMesh.rotateZ(Math.PI);

    mapData.torusFrameFrontMesh.lookAt(mapData.camera.position.x, 0, mapData.camera.position.z);
    mapData.torusFrameFrontMesh.rotateX(Math.PI / 2);

    mapData.torusFrameBackMesh.lookAt(mapData.camera.position.x, 0, mapData.camera.position.z);
    mapData.torusFrameBackMesh.rotateX(Math.PI / 2);
    mapData.torusFrameBackMesh.rotateZ(Math.PI);

    mapData.controls.update();
    mapData.renderer.render(mapData.scene, mapData.camera);
    mapData.stats.end();
  };

  const resizeMap = () => {
    if (mapData.camera) {
      mapData.camera.aspect = window.innerWidth / window.innerHeight;
      mapData.camera.updateProjectionMatrix();

      mapData.renderer.setSize(window.innerWidth, window.innerHeight);
    }
  };

  // ============ Object Adding Methods ===============
  const addSphere = () => {
    let radius = 5500000;
    let widthSegments = 50;
    let heightSegments = 50;

    const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);

    const materialFill = new THREE.MeshLambertMaterial({ color: '#234672', opacity: 0.8 });
    const sphere = new THREE.Mesh(geometry, materialFill);
    mapData.scene.add(sphere);
    sphere.position.set(EOS_OFFSET.x, EOS_OFFSET.y, EOS_OFFSET.z);

    const materialFrame = new THREE.MeshLambertMaterial({ color: '#234672', opacity: 0.3, wireframe: true, blending: THREE.AdditiveBlending });
    const sphereFrame = new THREE.Mesh(geometry, materialFrame);
    sphereFrame.lookAt(0, 0, 0);
    mapData.scene.add(sphereFrame);
    sphereFrame.position.set(EOS_OFFSET.x, EOS_OFFSET.y, EOS_OFFSET.z);
  };

  const addTorus = () => {
    let overalRadius = 2618229.42235;
    let innerRadius = 300000;
    let radialSegments = 100;
    let tubularSegments = 100;

    const geometry = new THREE.TorusGeometry(overalRadius, innerRadius, radialSegments, tubularSegments, Math.PI);
    const materialFillFront = new THREE.MeshLambertMaterial({ color: '#2c809b', opacity: 0.5, transparent: true, blending: THREE.AdditiveBlending });
    const materialFillBack = new THREE.MeshLambertMaterial({ color: '#2c809b', opacity: 0.5, blending: THREE.AdditiveBlending });
    const materialFrameFront = new THREE.MeshLambertMaterial({
      color: '#2c809b',
      wireframe: true,
      opacity: 0.1,
      transparent: true,
      blending: THREE.AdditiveBlending,
    });
    const materialFrameBack = new THREE.MeshLambertMaterial({ color: '#2c809b', wireframe: true, opacity: 0.1, blending: THREE.AdditiveBlending });

    mapData.torusFillFrontMesh = new THREE.Mesh(geometry, materialFillFront);
    mapData.torusFillFrontMesh.scale.set(3.6666, 3.6666);
    mapData.torusFillFrontMesh.lookAt(mapData.camera.position.x, 0, mapData.camera.position.z);
    mapData.torusFillFrontMesh.rotateX(Math.PI / 2);
    mapData.scene.add(mapData.torusFillFrontMesh);
    mapData.torusFillFrontMesh.position.set(EOS_OFFSET.x, EOS_OFFSET.y, EOS_OFFSET.z);

    mapData.torusFillBackMesh = new THREE.Mesh(geometry, materialFillBack);
    mapData.torusFillBackMesh.scale.set(3.6666, 3.6666);
    mapData.torusFillBackMesh.lookAt(-mapData.camera.position.x, 0, -mapData.camera.position.z);
    mapData.torusFillBackMesh.rotateX(Math.PI / 2);
    mapData.scene.add(mapData.torusFillBackMesh);
    mapData.torusFillBackMesh.position.set(EOS_OFFSET.x, EOS_OFFSET.y, EOS_OFFSET.z);

    mapData.torusFrameFrontMesh = new THREE.Mesh(geometry, materialFrameFront);
    mapData.torusFrameFrontMesh.scale.set(3.6666, 3.6666);
    mapData.torusFrameFrontMesh.lookAt(-mapData.camera.position.x, 0, -mapData.camera.position.z);
    mapData.torusFrameFrontMesh.rotateX(Math.PI / 2);
    mapData.scene.add(mapData.torusFrameFrontMesh);
    mapData.torusFrameFrontMesh.position.set(EOS_OFFSET.x, EOS_OFFSET.y, EOS_OFFSET.z);

    mapData.torusFrameBackMesh = new THREE.Mesh(geometry, materialFrameBack);
    mapData.torusFrameBackMesh.scale.set(3.6666, 3.6666);
    mapData.torusFrameBackMesh.lookAt(-mapData.camera.position.x, 0, -mapData.camera.position.z);
    mapData.torusFrameBackMesh.rotateX(Math.PI / 2);
    mapData.scene.add(mapData.torusFrameBackMesh);
    mapData.torusFrameBackMesh.position.set(EOS_OFFSET.x, EOS_OFFSET.y, EOS_OFFSET.z);
  };

  const addPoints = async (points) => {
    const sprite = await new THREE.TextureLoader().load(pointSprite);
    const pointMaterial = new THREE.PointsMaterial({ color: 'red', size: 100, map: sprite, sizeAttenuation: true, alphaTest: 0.5, transparent: true });

    const geometry = new THREE.BufferGeometry();
    let formattedVertices = points
      .map((element) => {
        return [element.position.x, element.position.y, element.position.z];
      })
      .flat();

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(formattedVertices, 3));

    mapData.pointsMesh = new THREE.Points(geometry, pointMaterial);
    mapData.scene.add(mapData.pointsMesh);

    const loader = new FontLoader();
    const font = loader.parse(pointFont);

    // for (const index in vertices) {
    //   const textGeometry = new TextGeometry('test', { font: font, size: 100, height: 0 });
    //   textGeometry.computeBoundingBox();
    //   const centerOffset = -0.5 * (textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x);

    //   const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, flatShading: true });

    //   const textMesh = new THREE.Mesh(textGeometry, textMaterial);
    //   textMesh.position.set(vertices[index].position.x, vertices[index].position.y + 100, vertices[index].position.z);

    //   textMeshes.push(textMesh);

    //   scene.add(textMesh);
    // }
  };

  const addLight = (xCoord, yCoord, zCoord) => {
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(xCoord, yCoord, zCoord);
    mapData.scene.add(light);
  };

  // ============== Control Handlers =======================
  const panForward = () => {
    if (mapData.lookAtVector === null) {
      mapData.lookAtVector = new THREE.Vector3();
    }
    mapData.camera.getWorldDirection(mapData.lookAtVector);

    let dist = mapData.panSpeed * 100;

    mapData.controls.target.set(
      mapData.controls.target.x + mapData.lookAtVector.x * dist,
      mapData.controls.target.y + mapData.lookAtVector.y * dist,
      mapData.controls.target.z + mapData.lookAtVector.z * dist
    );
    mapData.controls.update();
    mapData.camera.translateZ(-dist);
  };

  const panBackward = () => {
    if (mapData.lookAtVector === null) {
      mapData.lookAtVector = new THREE.Vector3();
    }
    mapData.camera.getWorldDirection(mapData.lookAtVector);

    let dist = mapData.panSpeed * 100;

    mapData.controls.target.set(
      mapData.controls.target.x + mapData.lookAtVector.x * -dist,
      mapData.controls.target.y + mapData.lookAtVector.y * -dist,
      mapData.controls.target.z + mapData.lookAtVector.z * -dist
    );
    mapData.controls.update();
    mapData.camera.translateZ(-dist);
  };

  const viewPoint = (point) => {
    console.log(point);
    mapData.controls.target.set(point.position.x + 1000, point.position.y + 1000, point.position.z + 1000);
    mapData.camera.position.set(point.position.x + 1000 + 1, point.position.y + 1000 + 1, point.position.z + 1000 + 1);
    mapData.controls.update();
  };

  // ================= Utilities ========================
  const calcDistance = (positionA, positionB) => {
    return Math.sqrt(Math.pow(positionA.x - positionB.x, 2) + Math.pow(positionA.y - positionB.y, 2) + Math.pow(positionA.z - positionB.z, 2));
  };

  return {
    mapData,
    init,
    resizeMap,
    panForward,
    panBackward,
    viewPoint,
  };
}
