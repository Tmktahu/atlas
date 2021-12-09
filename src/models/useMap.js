/* eslint-disable id-length */
import Vue from 'vue';
import * as THREE from 'three';
import { OrbitControls } from '@/controls/OrbitControls.js';

import { ref, watch, reactive, toRefs } from '@vue/composition-api';
import {
  createRing,
  createSphere,
  createTorus,
  createSphereIntersectionRing,
  createTorusIntersectionRings,
  createPointIntersectionObjects,
} from '@/models/useMapObjects.js';
import { useCoordinates, ORIGIN_POINT } from '@/models/useCoordinates.js';

import { ICON_MAP } from '@/models/useIcons.js';

import { ASTROID_BELTS, MOONS, ORBIT_RINGS, EOS_BELT_ZONES } from './presetMapData/celestialBodies';

export const EOS_OFFSET = {
  x: -8450000,
  y: 0,
  z: 0,
};

export const MIN_PAN_SPEED = 1;
export const MAX_PAN_SPEED = 5000;

export const masterMapData = reactive({
  containerElement: null,
  stats: null,
  scene: null,
  camera: ref(null),
  renderer: null,
  controls: null,

  pointMeshes: [],
  pointsArray: ref([]),
  pointIntersectionObjects: [],
  warpGatePointMeshes: [],

  belts: {
    eos: {
      zones: [],
      showZones: ref(false),
    },
    elysium: {
      zones: [],
      showZones: ref(false),
    },
    chemosh: {
      zones: [],
      showZones: ref(false),
    },
    kumi: {
      zones: [],
      showZones: ref(false),
    },
    szellem: {
      zones: [],
      showZones: ref(false),
    },
    alstel: {
      zones: [],
      showZones: ref(false),
    },
  },

  otherBelts: [],

  moons: [],
  moonIntersectionRings: [],

  lookAtVector: new THREE.Vector3(),

  panSpeed: ref(100),
  gridScale: 1,

  raycaster: new THREE.Raycaster(),
  lastRaycast: null,
  raycastInterval: 100,
  qRaycast: true,

  mapMouse: new THREE.Vector2(),
  intersects: null,

  pointSize: 0.5,

  showGrid: ref(true),
});

export function useMap(mapData, pointArray = ref(null)) {
  const masterPointsArray = pointArray;

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
    mapData.controls.mouseButtons = {
      LEFT: null,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: THREE.MOUSE.PAN,
    };
    mapData.controls.target.set(startingControlsPosition[0], startingControlsPosition[1], startingControlsPosition[2]);
    mapData.controls.update();

    updateGrid(mapData);

    await setupObjects(mapData);

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

    // update the picking ray with the camera and mouse position
    mapData.raycaster.params.Points.threshold = 0.3;
    mapData.raycaster.setFromCamera(mapData.mapMouse, mapData.camera);

    if (Date.now() - mapData.lastRaycast > mapData.raycastInterval) {
      let points = mapData.pointMeshes.filter((point) => point.visible);
      let intersectableObjects = [...mapData.warpGatePointMeshes, ...points, ...mapData.moons];

      mapData.intersects = mapData.raycaster.intersectObjects(intersectableObjects);
      mapData.lastRaycast = Date.now();
      mapData.qRaycast = false;
      handleIntersects(mapData);
    }

    if (mapData.pointMeshes) {
      for (let i = 0; i < mapData.pointMeshes.length; i++) {
        let hovered = mapData.intersects[0]?.object.id === mapData.pointMeshes[i].id;
        if (hovered) {
          mapData.pointMeshes[i].material.size = mapData.pointSize;
        }

        if (mapData.pointMeshes[i].selected) {
          mapData.pointMeshes[i].material.color = new THREE.Color(1, 1, 1);
        } else {
          let index = masterPointsArray.value.findIndex((obj) => obj.id === mapData.pointMeshes[i].pointId);
          mapData.pointMeshes[i].material.color = new THREE.Color(masterPointsArray.value[index].color);
        }

        let intersectionObjectIndex = mapData.pointIntersectionObjects.findIndex((obj) => obj.pointId === mapData.pointMeshes[i].pointId);
        mapData.pointIntersectionObjects[intersectionObjectIndex].line.visible = !!mapData.pointMeshes[i].selected || hovered;
        mapData.pointIntersectionObjects[intersectionObjectIndex].ring.visible = !!mapData.pointMeshes[i].selected || hovered;
      }
    }

    let cameraPosition = mapData.camera.position;

    mapData.gridScale = Math.pow(2, Math.round(Math.log(cameraPosition.y)));
    mapData.grid.scale.x = mapData.gridScale;
    mapData.grid.scale.z = mapData.gridScale;

    for (let index in mapData.warpGatePointMeshes) {
      let point = mapData.warpGatePointMeshes[index];

      let distance = calcDistance(mapData.camera.position, {
        x: point.geometry.attributes.position.array[0],
        y: -point.geometry.attributes.position.array[1],
        // eslint-disable-next-line id-length
        z: point.geometry.attributes.position.array[2],
      });

      point.material.size = distance / 10;
    }

    for (let index in mapData.belts) {
      if (mapData.belts[index]?.zones !== undefined) {
        for (let zindex in mapData.belts[index].zones) {
          mapData.belts[index].zones[zindex].mesh.visible = mapData.belts[index].showZones;
          mapData.belts[index].zones[zindex].intersectionRings.innerRing.visible = mapData.belts[index].showZones;
          mapData.belts[index].zones[zindex].intersectionRings.outerRing.visible = mapData.belts[index].showZones;
        }
      }
      mapData.belts[index].belt.mesh.visible = !mapData.belts[index].showZones;
      mapData.belts[index].belt.intersectionRings.innerRing.visible = !mapData.belts[index].showZones;
      mapData.belts[index].belt.intersectionRings.outerRing.visible = !mapData.belts[index].showZones;
    }

    mapData.controls.update();
    mapData.renderer.render(mapData.scene, mapData.camera);
    mapData.stats.end();
  };

  const handleIntersects = (mapData) => {
    if (mapData.intersects[0]?.object.type === 'Points') {
      let object = mapData.intersects[0].object;
      object.material.size = mapData.pointSize * 1.25;
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
  const setupObjects = async (mapData) => {
    for (let index in ORBIT_RINGS) {
      let ring = createRing(ORBIT_RINGS[index]);
      mapData.scene.add(ring);
    }

    for (let index in ASTROID_BELTS) {
      let torusMesh = createTorus(ASTROID_BELTS[index], mapData);
      mapData.scene.add(torusMesh);

      let { innerRing, outerRing } = createTorusIntersectionRings(ASTROID_BELTS[index]);
      mapData.scene.add(innerRing);
      mapData.scene.add(outerRing);

      let newBelt = { name: ASTROID_BELTS[index].name, moon: ASTROID_BELTS[index].moon, mesh: torusMesh, intersectionRings: { innerRing, outerRing } };

      mapData.belts[ASTROID_BELTS[index].moon].belt = newBelt;
    }

    for (let index in EOS_BELT_ZONES) {
      let torusMesh = createTorus(EOS_BELT_ZONES[index], mapData);
      mapData.scene.add(torusMesh);

      let { innerRing, outerRing } = createTorusIntersectionRings(EOS_BELT_ZONES[index]);
      mapData.scene.add(innerRing);
      mapData.scene.add(outerRing);

      let newZone = {
        name: EOS_BELT_ZONES[index].name,
        moon: EOS_BELT_ZONES[index].moon,
        mesh: torusMesh,
        intersectionRings: { innerRing, outerRing },
      };

      mapData.belts[EOS_BELT_ZONES[index].moon].zones.push(newZone);
    }

    for (let index in MOONS) {
      let moon = await createSphere(MOONS[index]);
      mapData.moons.push(moon);
      mapData.scene.add(moon);

      let intersectionRing = createSphereIntersectionRing(MOONS[index]);
      mapData.moonIntersectionRings.push(intersectionRing);
      mapData.scene.add(intersectionRing);
    }
  };

  const updateGrid = (mapData) => {
    if (mapData.showGrid) {
      const planeMaterial = new THREE.MeshLambertMaterial({
        color: '#ffeda3',
        opacity: 0.1,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthFunc: THREE.LessDepth,
        side: THREE.DoubleSide,
      });
      const plainGeometry = new THREE.CircleGeometry(14000, 500);
      const plane = new THREE.Mesh(plainGeometry, planeMaterial);
      plane.rotateX(Math.PI / 2);
      mapData.plane = plane;
      mapData.scene.add(plane);

      const gridMaterial = new THREE.LineBasicMaterial({
        color: new THREE.Color(0.5, 0.5, 0.5),
        linewidth: 10,
        opacity: 0.6,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthFunc: THREE.LessDepth,
        side: THREE.DoubleSide,
      });
      gridMaterial.renderOrder = -1;
      //gridMaterial.depthTest = false;

      const grid = new THREE.PolarGridHelper(500, 4, 100, 200, '#000000', '#000000');
      //grid.material = gridMaterial;
      console.log(grid);
      //grid.material.linewidth = 3;
      // grid.material.color = new THREE.Color(0.5, 0.5, 0.5);
      grid.material.opacity = 0.5;
      // grid.material.side = THREE.DoubleSide;
      //grid.position.set(-845, 0, 0);

      mapData.grid = grid;
      mapData.scene.add(mapData.grid);
    } else {
      mapData.scene.remove(mapData.plane);
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
      pointMesh.pointId = point.id;
      if (point.type === 'gate') {
        mapData.warpGatePointMeshes.push(pointMesh);
      } else {
        mapData.pointMeshes.push(pointMesh);
      }

      mapData.scene.add(pointMesh);

      // Set up the intersection object for storage
      let { line, ring } = createPointIntersectionObjects(point);
      let pointIntersectionObject = { pointId: point.id, line, ring };
      mapData.scene.add(pointIntersectionObject.line);
      mapData.scene.add(pointIntersectionObject.ring);
      mapData.pointIntersectionObjects.push(pointIntersectionObject);
    }
  };

  const addLight = (xCoord, yCoord, zCoord, mapData) => {
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(xCoord, yCoord, zCoord);
    mapData.scene.add(light);
  };

  // ============== Control Handlers =======================
  const panForward = (mapData) => {
    if (mapData.camera === null) {
      return;
    }

    if (mapData.lookAtVector === null) {
      mapData.lookAtVector = new THREE.Vector3();
    }
    mapData.camera.getWorldDirection(mapData.lookAtVector);

    let dist = mapData.panSpeed / 100;

    mapData.controls.target.set(
      mapData.controls.target.x + mapData.lookAtVector.x * dist,
      mapData.controls.target.y + mapData.lookAtVector.y * dist,
      mapData.controls.target.z + mapData.lookAtVector.z * dist
    );
    mapData.controls.update();
    mapData.camera.translateZ(-dist);
  };

  const panBackward = (mapData) => {
    if (mapData.camera === null) {
      return;
    }

    if (mapData.lookAtVector === null) {
      mapData.lookAtVector = new THREE.Vector3();
    }
    mapData.camera.getWorldDirection(mapData.lookAtVector);

    let dist = mapData.panSpeed / 100;

    mapData.controls.target.set(
      mapData.controls.target.x + mapData.lookAtVector.x * -dist,
      mapData.controls.target.y + mapData.lookAtVector.y * -dist,
      mapData.controls.target.z + mapData.lookAtVector.z * -dist
    );
    mapData.controls.update();
    mapData.camera.translateZ(-dist);
  };

  // ============== Point CRUD =======================
  const viewObject = (object) => {
    if (object.type === 'Points') {
      let coord = {
        x: object.geometry.attributes.position.array[0],
        y: -object.geometry.attributes.position.array[2],
        // eslint-disable-next-line id-length
        z: object.geometry.attributes.position.array[1],
      };

      let dist = 4;
      masterMapData.camera.position.set(coord.x + dist + 0.1, coord.z + dist + 0.1, coord.y + dist + 0.1);
      masterMapData.controls.target.set(coord.x + dist, coord.z + dist, coord.y + dist);

      masterMapData.controls.update();
    } else if (object.type === 'Mesh') {
      let dist = object.geometry.boundingSphere.radius * 1.5;
      masterMapData.camera.position.set(object.position.x + dist + 0.1, object.position.y + dist + 0.1, object.position.z + dist + 0.1);
      masterMapData.controls.target.set(object.position.x + dist, object.position.y + dist, object.position.z + dist);

      masterMapData.controls.update();
    } else if (object.position) {
      let dist = 4;
      masterMapData.camera.position.set(object.position.x + dist + 0.1, object.position.z + dist + 0.1, object.position.y + dist + 0.1);
      masterMapData.controls.target.set(object.position.x + dist, object.position.z + dist, object.position.y + dist);

      masterMapData.controls.update();
    }
  };

  const selectPoint = (id) => {
    let index = masterPointsArray.value.findIndex((obj) => obj.id === id);
    masterPointsArray.value[index].selected = !masterPointsArray.value[index].selected;

    let meshIndex = masterMapData.pointMeshes.findIndex((obj) => obj.pointId === id);
    masterMapData.pointMeshes[meshIndex].selected = masterPointsArray.value[index].selected;
  };

  const showHidePoint = (id) => {
    let index = masterPointsArray.value.findIndex((obj) => obj.id === id);
    masterPointsArray.value[index].hide = !masterPointsArray.value[index].hide;

    let meshIndex = masterMapData.pointMeshes.findIndex((obj) => obj.pointId === id);
    masterMapData.pointMeshes[meshIndex].visible = !masterPointsArray.value[index].hide;
  };

  const showAllPoints = () => {
    for (let index in masterPointsArray.value) {
      masterPointsArray.value[index].hide = false;
    }

    for (let index in masterMapData.pointMeshes) {
      masterMapData.pointMeshes[index].visible = true;
    }
  };

  const addPoint = (point) => {
    const { scaleDownCoordinate } = useCoordinates();
    let newPoint = scaleDownCoordinate(point);
    mapData.pointsArray.push(newPoint);
    addPoints(mapData.pointsArray, mapData);
  };

  const deletePoint = (point, mapData) => {
    mapData.pointsArray = mapData.pointsArray.filter((obj) => {
      return obj.id !== point.id;
    });
    addPoints(mapData.pointsArray, mapData);
  };

  const mergePoints = (points) => {
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
    viewObject,
    selectPoint,
    showHidePoint,
    showAllPoints,
    addPoint,
    deletePoint,
    mergePoints,
    updateGrid,
  };
}
