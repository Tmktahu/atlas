/* eslint-disable id-length */
import Vue from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import { ref, watch, reactive, toRefs } from '@vue/composition-api';
import { ICON_MAP } from '@/models/useIcons.js';

import stargate from '@/assets/map_icons/stargate.png';
import isan from '@/assets/map_icons/isan.png';

export const ORIGIN_POINT = {
  name: 'Origin / WarpGate',
  color: 'aqua',
  position: { x: 0, y: 0, z: 0 },
  id: '0',
  hide: false,
  icon: 'stargate',
  group: 'Origins',
};
export const ISAN_ORIGIN_POINT = {
  name: 'ISAN Origin',
  color: 'orange',
  position: { x: 15046, y: 3474, z: 1416 },
  id: '1234',
  hide: false,
  icon: 'isan',
  group: 'Origins',
};

export const EOS_OFFSET = {
  x: -8450000,
  y: 0,
  z: 0,
};

export const MIN_PAN_SPEED = 1;
export const MAX_PAN_SPEED = 10000;

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

  torusFillFrontMesh: null,
  torusFillBackMesh: null,
  torusFrameFrontMesh: null,
  torusFrameBackMesh: null,

  lookAtVector: new THREE.Vector3(),

  panSpeed: ref(40),

  raycaster: new THREE.Raycaster(),
  lastRaycast: null,
  raycastInterval: 100,
  qRaycast: true,

  mapMouse: new THREE.Vector2(),
  intersects: null,

  pointSize: 7000,

  isReady: ref(false),
});

export function useMap(mapData) {
  const init = (inContainerElement) => {
    console.log(mapData);
    mapData.containerElement = inContainerElement;

    mapData.scene = new THREE.Scene();

    const startingCameraPosition = [ORIGIN_POINT.position.x + 70000, ORIGIN_POINT.position.y + 70000, ORIGIN_POINT.position.z + 70000];
    const startingControlsPosition = [startingCameraPosition[0] - 1, startingCameraPosition[1] - 1, startingCameraPosition[2] - 1];

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

    addTorus(mapData);
    addSphere(mapData);

    addLight(4, 2, 4, mapData);
    addLight(-4, -1, -2, mapData);

    //mapData.pointsArray = [ORIGIN_POINT, ...ORIGIN_STATIONS];

    addPoints(mapData.pointsArray, mapData);

    mapData.controls.update();
    animate(mapData);

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

    if (mapData.pointMeshes) {
      for (let i = 0; i < mapData.pointMeshes.length; i++) {
        if (mapData.intersects[0]?.object.id !== mapData.pointMeshes[i].id) {
          mapData.pointMeshes[i].material.size = mapData.pointSize;
        }
      }
    }

    // update the picking ray with the camera and mouse position
    mapData.raycaster.params.Points.threshold = 3000;
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
    //for (let i = 0; i < mapData.intersects.length; i++) {
    //mapData.intersects[i].object.material.color.set(0xffff00);
    //}
  };

  const resizeMap = (mapData) => {
    if (mapData.camera) {
      mapData.camera.aspect = window.innerWidth / window.innerHeight;
      mapData.camera.updateProjectionMatrix();

      mapData.renderer.setSize(window.innerWidth, window.innerHeight);
    }
  };

  // ============ Object Adding Methods ===============
  const addSphere = (mapData) => {
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

  const addTorus = (mapData) => {
    let overalRadius = 2618229.42235;
    let innerRadius = 300000;
    let radialSegments = 100;
    let tubularSegments = 100;

    const geometry = new THREE.TorusGeometry(overalRadius, innerRadius, radialSegments, tubularSegments, Math.PI);
    const materialFillFront = new THREE.MeshLambertMaterial({
      color: '#2c809b',
      opacity: 0.5,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    const materialFillBack = new THREE.MeshLambertMaterial({ color: '#2c809b', opacity: 0.5, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
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
    for (const index in mapData.pointMeshes) {
      mapData.scene.remove(mapData.pointMeshes[index]);
    }
    mapData.pointMeshes = [];

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

    // const sprite = await new THREE.TextureLoader().load(pointSprite);
    // const pointMaterial = new THREE.PointsMaterial({ color: 'red', size: 100, map: sprite, sizeAttenuation: true, alphaTest: 0.5, transparent: true });

    // const geometry = new THREE.BufferGeometry();
    // let formattedVertices = points
    //   .filter((element) => {
    //     return !element.hide;
    //   })
    //   .map((element) => {
    //     return [element.position.x, element.position.y, element.position.z];
    //   })
    //   .flat();

    // geometry.setAttribute('position', new THREE.Float32BufferAttribute(formattedVertices, 3));

    // mapData.pointsMesh = new THREE.Points(geometry, pointMaterial);
    // mapData.scene.add(mapData.pointsMesh);

    // const loader = new FontLoader();
    // const font = loader.parse(pointFont);

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

  const addLight = (xCoord, yCoord, zCoord, mapData) => {
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(xCoord, yCoord, zCoord);
    mapData.scene.add(light);
  };

  // ============== Control Handlers =======================
  const panForward = (mapData) => {
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

  const panBackward = (mapData) => {
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
    console.log(masterMapData);
    let dist = 10000;
    masterMapData.camera.position.set(point.position.x + dist + 1, point.position.z + dist + 1, -(point.position.y + dist + 1));
    masterMapData.controls.target.set(point.position.x + dist, point.position.z + dist, -(point.position.y + dist));

    masterMapData.controls.update();
  };

  const showHidePoint = (point) => {
    let index = mapData.pointsArray.findIndex((obj) => obj.id === point.id);
    mapData.pointsArray[index].hide = !mapData.pointsArray[index].hide;
    addPoints(mapData.pointsArray, mapData);
  };

  const addPoint = (point) => {
    mapData.pointsArray.push(point);
    addPoints(mapData.pointsArray, mapData);
  };

  const deletePoint = (point) => {
    mapData.pointsArray = mapData.pointsArray.filter((obj) => {
      return obj.id !== point.id;
    });
    addPoints(mapData.pointsArray, mapData);
  };

  const mergePoints = (points) => {
    console.log('trying to merge points', points);
    console.log(mapData);
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
        mapData.pointsArray.push(point);
      }
    }

    if (mapData.scene && mapData.isReady) {
      addPoints(mapData.pointsArray, mapData);
    } else {
      mapData.isReady = mapData.pointsArray.length > 0;
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
  };
}
