/* eslint-disable id-length */
import Vue from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import { ref, watch, reactive, toRefs } from '@vue/composition-api';
import { createSphere, createTorus } from '@/models/useMapObjects.js';
import { useCoordinates, ORIGIN_POINT } from '@/models/useCoordinates.js';

import { ICON_MAP } from '@/models/useIcons.js';

import { ASTROID_BELTS, PLANETS } from './presetMapData/celestialBodies';

export const EOS_OFFSET = {
  x: -8450000,
  y: 0,
  z: 0,
};

export const MIN_PAN_SPEED = 1;
export const MAX_PAN_SPEED = 1000;

export const masterMapData = reactive({
  containerElement: null,
  stats: null,
  scene: null,
  camera: ref(null),
  renderer: null,
  controls: null,

  sphereMesh: null,
  torusMesh: null,
  pointMeshes: [],
  pointsArray: ref([]),

  belts: [],

  lookAtVector: new THREE.Vector3(),

  panSpeed: ref(100),

  raycaster: new THREE.Raycaster(),
  lastRaycast: null,
  raycastInterval: 100,
  qRaycast: true,

  mapMouse: new THREE.Vector2(),
  intersects: null,

  pointSize: 0.5,

  showGrid: ref(true),
});

export function useMap(mapData) {
  const init = (inContainerElement, initialPoints) => {
    mapData.containerElement = inContainerElement;

    mapData.scene = new THREE.Scene();

    const startingCameraPosition = [ORIGIN_POINT.position.x + 10, ORIGIN_POINT.position.y + 10, ORIGIN_POINT.position.z + 10];
    const startingControlsPosition = [startingCameraPosition[0] - 0.1, startingCameraPosition[1] - 0.1, startingCameraPosition[2] - 0.1];

    // PerspectiveCamera(FOV, Aspect Ratio, Near Clipping Plane, Far Clipping Place)
    mapData.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000000000);
    mapData.camera.position.set(startingCameraPosition[0], startingCameraPosition[1], startingCameraPosition[2]);

    mapData.renderer = new THREE.WebGLRenderer({ alpha: true });
    mapData.renderer.setSize(window.innerWidth - 56, window.innerHeight);
    mapData.renderer.domElement.classList = 'mapCanvas';
    mapData.containerElement.appendChild(mapData.renderer.domElement);

    mapData.controls = new OrbitControls(mapData.camera, mapData.renderer.domElement);
    mapData.controls.enableZoom = false;
    mapData.controls.listenToKeyEvents(window);
    mapData.controls.keyPanSpeed = mapData.panSpeed * 50;
    mapData.controls.panSpeed = mapData.panSpeed;
    mapData.controls.keys = {
      LEFT: 'KeyA',
      UP: 'Space',
      RIGHT: 'KeyD',
      BOTTOM: 'ShiftLeft',
    };
    mapData.controls.target.set(startingControlsPosition[0], startingControlsPosition[1], startingControlsPosition[2]);
    mapData.controls.update();

    updateGrid(mapData);

    setupObjects(mapData);

    addLight(4, 2, 4, mapData);
    addLight(-4, -1, -2, mapData);

    addPoints(initialPoints);

    mapData.controls.update();
    animate(mapData);

    const refs = toRefs(mapData);

    watch(refs.panSpeed, () => {
      mapData.controls.keyPanSpeed = mapData.panSpeed * 50;
      mapData.controls.panSpeed = mapData.panSpeed;
    });
  };

  const animate = () => {
    requestAnimationFrame(animate);
    mapData.stats.begin();

    for (let index in mapData.belts) {
      mapData.belts[index].front.lookAt(mapData.camera.position.x, 0, mapData.camera.position.z);
      mapData.belts[index].front.rotateX(Math.PI / 2);

      mapData.belts[index].back.lookAt(mapData.camera.position.x, 0, mapData.camera.position.z);
      mapData.belts[index].back.rotateX(Math.PI / 2);
      mapData.belts[index].back.rotateZ(Math.PI);
    }

    if (mapData.pointMeshes) {
      for (let i = 0; i < mapData.pointMeshes.length; i++) {
        if (mapData.intersects[0]?.object.id !== mapData.pointMeshes[i].id) {
          mapData.pointMeshes[i].material.size = mapData.pointSize;
        }
      }
    }

    // update the picking ray with the camera and mouse position
    mapData.raycaster.params.Points.threshold = 0.3;
    mapData.raycaster.setFromCamera(mapData.mapMouse, mapData.camera);

    if (Date.now() - mapData.lastRaycast > mapData.raycastInterval) {
      mapData.intersects = mapData.raycaster.intersectObjects(mapData.pointMeshes);
      mapData.lastRaycast = Date.now();
      mapData.qRaycast = false;
      handleIntersects(mapData);
    }

    // calculate objects intersecting the picking ray

    mapData.controls.update();
    mapData.renderer.render(mapData.scene, mapData.camera);
    mapData.stats.end();
  };

  const handleIntersects = (mapData) => {
    if (mapData.intersects[0]?.object.type === 'Points') {
      mapData.intersects[0].object.material.size = mapData.pointSize * 1.25;
    }
  };

  const resizeMap = (mapData) => {
    if (mapData.camera) {
      mapData.camera.aspect = window.innerWidth / window.innerHeight;
      mapData.camera.updateProjectionMatrix();

      mapData.renderer.setSize(window.innerWidth, window.innerHeight);
    }
  };

  // ============ Object Adding Methods ===============
  const setupObjects = (mapData) => {
    for (let index in ASTROID_BELTS) {
      let { torusFrontMesh: front, torusBackMesh: back } = createTorus(ASTROID_BELTS[index], mapData);

      let newBelt = { front, back };
      mapData.scene.add(front);
      mapData.scene.add(back);

      mapData.belts.push(newBelt);
    }

    for (let index in PLANETS) {
      let planet = createSphere(PLANETS[index]);
      mapData.scene.add(planet);
    }
  };

  const updateGrid = (mapData) => {
    if (mapData.showGrid) {
      const gridMaterial = new THREE.MeshLambertMaterial({
        color: '#111111',
        opacity: 0.5,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthFunc: THREE.LessDepth,
      });
      gridMaterial.renderOrder = -1;
      //gridMaterial.depthTest = false;

      const grid = new THREE.GridHelper(10000, 3000);
      grid.material = gridMaterial;

      mapData.grid = grid;
      mapData.scene.add(mapData.grid);
    } else {
      mapData.scene.remove(mapData.grid);
    }
  };

  const addPoints = async (points) => {
    for (const index in mapData.pointMeshes) {
      mapData.scene.remove(mapData.pointMeshes[index]);
    }
    mapData.pointMeshes = [];

    if (points.length === 0) {
      return;
    }

    mapData.pointsArray = points;

    for (const index in points) {
      let point = points[index];
      if (point.hide) {
        continue;
      }
      const sprite = await new THREE.TextureLoader().load(ICON_MAP[point.icon].workingFilePath);
      let color = new THREE.Color(point.color);
      const pointMaterial = new THREE.PointsMaterial({
        color: color,
        size: mapData.pointSize,
        map: sprite,
        sizeAttenuation: true,
        alphaTest: 0.5,
      });
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute([point.position.x, point.position.z, -point.position.y], 3));
      //geometry.setAttribute('offsets', new THREE.Float32BufferAttribute([1000, 1000], 2));
      const pointMesh = new THREE.Points(geometry, pointMaterial);
      pointMesh.name = point.name;
      mapData.pointMeshes.push(pointMesh);
      mapData.scene.add(pointMesh);
    }
  };

  const addLight = (xCoord, yCoord, zCoord, mapData) => {
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(xCoord, yCoord, zCoord);
    mapData.scene.add(light);
  };

  // ============== Control Handlers =======================
  const panForward = () => {
    if (mapData.camera === null) {
      return;
    }

    if (mapData.lookAtVector === null) {
      mapData.lookAtVector = new THREE.Vector3();
    }
    mapData.camera.getWorldDirection(mapData.lookAtVector);

    let dist = mapData.panSpeed / 50;

    mapData.controls.target.set(
      mapData.controls.target.x + mapData.lookAtVector.x * dist,
      mapData.controls.target.y + mapData.lookAtVector.y * dist,
      mapData.controls.target.z + mapData.lookAtVector.z * dist
    );
    mapData.controls.update();
    mapData.camera.translateZ(-dist);
  };

  const panBackward = () => {
    if (mapData.camera === null) {
      return;
    }

    if (mapData.lookAtVector === null) {
      mapData.lookAtVector = new THREE.Vector3();
    }
    mapData.camera.getWorldDirection(mapData.lookAtVector);

    let dist = mapData.panSpeed / 50;

    mapData.controls.target.set(
      mapData.controls.target.x + mapData.lookAtVector.x * -dist,
      mapData.controls.target.y + mapData.lookAtVector.y * -dist,
      mapData.controls.target.z + mapData.lookAtVector.z * -dist
    );
    mapData.controls.update();
    mapData.camera.translateZ(-dist);
  };

  const viewPoint = (point) => {
    let dist = 4;
    masterMapData.camera.position.set(point.position.x + dist + 0.1, point.position.z + dist + 0.1, point.position.y + dist + 0.1);
    masterMapData.controls.target.set(point.position.x + dist, point.position.z + dist, point.position.y + dist);

    masterMapData.controls.update();
  };

  const showHidePoint = (point) => {
    let index = mapData.pointsArray.findIndex((obj) => obj.id === point.id);
    mapData.pointsArray[index].hide = !mapData.pointsArray[index].hide;
    addPoints(mapData.pointsArray, mapData);
  };

  const addPoint = (point) => {
    const { scaleDownCoordinate } = useCoordinates();
    let newPoint = scaleDownCoordinate(point);
    mapData.pointsArray.push(newPoint);
    addPoints(mapData.pointsArray, mapData);
  };

  const deletePoint = (point) => {
    mapData.pointsArray = mapData.pointsArray.filter((obj) => {
      return obj.id !== point.id;
    });
    addPoints(mapData.pointsArray, mapData);
  };

  const mergePoints = (points) => {
    const { scaleDownCoordinate } = useCoordinates();
    let newPoint = scaleDownCoordinate(point);

    let existingIDs = mapData.pointsArray.map((obj) => {
      return obj.id;
    });
    let skippedPoints = [];

    for (const index in points) {
      let point = points[index];

      if (existingIDs.includes(point.id)) {
        skippedPoints.push(point);
        continue;
      } else {
        mapData.pointsArray.push(newPoint);
      }
    }

    if (mapData.scene) {
      addPoints(mapData.pointsArray, mapData);
    }

    if (skippedPoints.length > 0) {
      let names = skippedPoints.map((obj) => {
        return obj.name;
      });
      Vue.toasted.global.alertError({ message: `${skippedPoints.length} Points were skipped due to duplicate IDs`, description: names.join(', ') });
    }
  };

  // ================= Utilities ========================
  const calcDistance = (positionA, positionB) => {
    return Math.sqrt(Math.pow(positionA.x - positionB.x, 2) + Math.pow(positionA.y - positionB.y, 2) + Math.pow(positionA.z - positionB.z, 2));
  };

  return {
    init,
    resizeMap,
    panForward,
    panBackward,
    viewPoint,
    showHidePoint,
    addPoint,
    deletePoint,
    mergePoints,
    updateGrid,
  };
}
