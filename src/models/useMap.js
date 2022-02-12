/* eslint-disable id-length */
import Vue from 'vue';
import * as THREE from 'three';
import { OrbitControls } from '@/controls/OrbitControls.js';

import { ref, watch, reactive, toRefs } from '@vue/composition-api';
import {
  createPointMesh,
  createVectorMesh,
  createRing,
  createSphereMesh,
  createTorus,
  createSphereIntersectionRing,
  createTorusIntersectionRings,
  createPointIntersectionObjects,
} from '@/models/useMapObjects.js';
import { ORIGIN_POINT } from '@/models/useCoordinates.js';

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

  points: [],
  /*
  point = {
    data,
    mesh,
    intersectionMeshes: [
      ring,
      line,
    ]
  }
  */

  vectors: [],
  /*
  vector = {
    id,
    data: {
      id,
      name,
      hide,
      direction,
      origin,
      length,
      color,
    },
    mesh
  }
  */

  belts: {
    p0: {
      zones: [],
      showZones: ref(false),
    },
    m0: {
      zones: [],
      showZones: ref(false),
    },
    m1: {
      zones: [],
      showZones: ref(false),
    },
    m2: {
      zones: [],
      showZones: ref(false),
    },
    m3: {
      zones: [],
      showZones: ref(false),
    },
    m6: {
      zones: [],
      showZones: ref(false),
    },
  },

  otherBelts: [],

  moons: [],

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

export function useMap() {
  const initMasterMapData = (storageData) => {
    masterMapData.initialPointData = storageData.points;
  };

  const init = async (inContainerElement) => {
    if (masterMapData === undefined) {
      return;
    }

    console.log('Background Map Data, in case you were interested:', masterMapData);
    masterMapData.containerElement = inContainerElement;

    masterMapData.scene = new THREE.Scene();

    const startingCameraPosition = [ORIGIN_POINT.position.x + 10, ORIGIN_POINT.position.y + 10, ORIGIN_POINT.position.z + 10];
    const startingControlsPosition = [startingCameraPosition[0] - 0.1, startingCameraPosition[1] - 0.1, startingCameraPosition[2] - 0.1];

    // PerspectiveCamera(FOV, Aspect Ratio, Near Clipping Plane, Far Clipping Place)
    masterMapData.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000000000);
    masterMapData.camera.position.set(startingCameraPosition[0], startingCameraPosition[1], startingCameraPosition[2]);

    masterMapData.renderer = new THREE.WebGLRenderer({ alpha: true });
    masterMapData.renderer.setSize(window.innerWidth - 56, window.innerHeight);
    masterMapData.renderer.domElement.classList = 'mapCanvas';
    masterMapData.containerElement?.appendChild(masterMapData.renderer.domElement);

    masterMapData.controls = new OrbitControls(masterMapData.camera, masterMapData.renderer.domElement);
    masterMapData.controls.enableZoom = false;
    masterMapData.controls.listenToKeyEvents(window);
    masterMapData.controls.keyPanSpeed = masterMapData.panSpeed * 50;
    masterMapData.controls.panSpeed = masterMapData.panSpeed;
    masterMapData.controls.keys = {
      LEFT: 'KeyA',
      UP: 'Space',
      RIGHT: 'KeyD',
      BOTTOM: 'ShiftLeft',
    };
    masterMapData.controls.mouseButtons = {
      LEFT: null,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: THREE.MOUSE.PAN,
    };
    masterMapData.controls.target.set(startingControlsPosition[0], startingControlsPosition[1], startingControlsPosition[2]);
    masterMapData.controls.update();

    updateGrid(masterMapData);

    await setupObjects(masterMapData);

    addLight(4, 2, 4, masterMapData);
    addLight(-4, -1, -2, masterMapData);

    resetPoints(masterMapData.initialPointData);

    createNewVector({
      id: 1337,
      name: 'testing vector',
      color: '#FF0000',
      origin: {
        x: 0,
        y: 0,
        z: 0,
      },
      direction: {
        x: -20000,
        y: -60000,
        z: 0,
      },
      length: 100000,
    });

    masterMapData.controls.update();
    animate();

    const refs = toRefs(masterMapData);

    watch(refs.panSpeed, () => {
      masterMapData.controls.keyPanSpeed = masterMapData.panSpeed * 50;
      masterMapData.controls.panSpeed = masterMapData.panSpeed;
    });
  };

  const animate = () => {
    requestAnimationFrame(animate);
    masterMapData.stats?.begin();

    // update the picking ray with the camera and mouse position
    masterMapData.raycaster.params.Points.threshold = 0.3;
    masterMapData.raycaster.setFromCamera(masterMapData.mapMouse, masterMapData.camera);

    if (Date.now() - masterMapData.lastRaycast > masterMapData.raycastInterval) {
      let pointMeshes = masterMapData.points.map((point) => {
        return point.mesh;
      });

      let moonMeshes = masterMapData.moons.map((moon) => {
        return moon.mesh;
      });

      let filteredPointMeshes = pointMeshes.filter((mesh) => mesh.visible);
      let intersectableObjects = [...filteredPointMeshes, ...moonMeshes];

      masterMapData.intersects = masterMapData.raycaster.intersectObjects(intersectableObjects);
      masterMapData.lastRaycast = Date.now();
      masterMapData.qRaycast = false;
      handleIntersects();
    }

    if (masterMapData.pointMeshes) {
      for (let i in masterMapData.points) {
        let point = masterMapData.points[i];
        if (point && point.mesh) {
          let hovered = masterMapData.intersects[0]?.object?.id === point?.mesh?.id;
          if (hovered) {
            point.mesh.material.size = masterMapData.pointSize;
            point.mesh.material.color = new THREE.Color(1, 1, 1);
          } else {
            point.mesh.material.color = new THREE.Color(point.data.color);
          }

          point.intersectionMeshes.line.visible = hovered;
          point.intersectionMeshes.ring.visible = hovered;

          // Scale warpgate points so they are always visible
          if (point.data.type === 'gate') {
            let distance = calcDistance(masterMapData.camera.position, {
              x: point.mesh.geometry.attributes.position.array[0],
              y: -point.mesh.geometry.attributes.position.array[1],
              // eslint-disable-next-line id-length
              z: point.mesh.geometry.attributes.position.array[2],
            });

            point.mesh.material.size = distance / 10;
          }
        }
      }
    }

    // Scale the grid based on how high we are from the plane
    let cameraPosition = masterMapData.camera.position;
    masterMapData.gridScale = Math.pow(2, Math.round(Math.log(cameraPosition.y)));
    masterMapData.grid.scale.x = masterMapData.gridScale;
    masterMapData.grid.scale.z = masterMapData.gridScale;

    for (let index in masterMapData.belts) {
      if (masterMapData.belts[index]?.zones !== undefined) {
        for (let zindex in masterMapData.belts[index].zones) {
          masterMapData.belts[index].zones[zindex].mesh.visible = masterMapData.belts[index].showZones;
          masterMapData.belts[index].zones[zindex].intersectionRings.innerRing.visible = masterMapData.belts[index].showZones;
          masterMapData.belts[index].zones[zindex].intersectionRings.outerRing.visible = masterMapData.belts[index].showZones;
        }
      }
      masterMapData.belts[index].belt.mesh.visible = !masterMapData.belts[index].showZones;
      masterMapData.belts[index].belt.intersectionRings.innerRing.visible = !masterMapData.belts[index].showZones;
      masterMapData.belts[index].belt.intersectionRings.outerRing.visible = !masterMapData.belts[index].showZones;
    }

    masterMapData.controls.update();
    masterMapData.renderer.render(masterMapData.scene, masterMapData.camera);
    masterMapData.stats?.end();
  };

  const handleIntersects = () => {
    if (masterMapData.intersects[0]?.object.type === 'Points') {
      let object = masterMapData.intersects[0].object;
      object.material.size = masterMapData.pointSize * 1.25;
    }
  };

  const resizeMap = () => {
    if (masterMapData.camera) {
      masterMapData.camera.aspect = window.innerWidth / window.innerHeight;
      masterMapData.camera.updateProjectionMatrix();

      masterMapData.renderer.setSize(window.innerWidth, window.innerHeight);
    }
  };

  // ============ Object Adding Methods ===============
  const setupObjects = async () => {
    for (let index in ORBIT_RINGS) {
      let ring = createRing(ORBIT_RINGS[index]);
      masterMapData.scene.add(ring);
    }

    for (let index in ASTROID_BELTS) {
      let torusMesh = createTorus(ASTROID_BELTS[index], masterMapData);
      masterMapData.scene.add(torusMesh);

      let { innerRing, outerRing } = createTorusIntersectionRings(ASTROID_BELTS[index]);
      masterMapData.scene.add(innerRing);
      masterMapData.scene.add(outerRing);

      let newBelt = { name: ASTROID_BELTS[index].name, moon: ASTROID_BELTS[index].moon, mesh: torusMesh, intersectionRings: { innerRing, outerRing } };

      masterMapData.belts[ASTROID_BELTS[index].moonId].belt = newBelt;
    }

    for (let index in EOS_BELT_ZONES) {
      let torusMesh = createTorus(EOS_BELT_ZONES[index], masterMapData);
      masterMapData.scene.add(torusMesh);

      let { innerRing, outerRing } = createTorusIntersectionRings(EOS_BELT_ZONES[index]);
      masterMapData.scene.add(innerRing);
      masterMapData.scene.add(outerRing);

      let newZone = {
        name: EOS_BELT_ZONES[index].name,
        moon: EOS_BELT_ZONES[index].moon,
        mesh: torusMesh,
        intersectionRings: { innerRing, outerRing },
      };

      masterMapData.belts[EOS_BELT_ZONES[index].moonId].zones.push(newZone);
    }

    for (let index in MOONS) {
      let moonMesh = await createSphereMesh(MOONS[index]);
      let intersectionRing = createSphereIntersectionRing(MOONS[index]);

      let moon = {
        id: MOONS[index].id,
        data: MOONS[index],
        mesh: moonMesh,
        intersectionRing: intersectionRing,
      };

      masterMapData.moons.push(moon);
      masterMapData.scene.add(moon.mesh);
      masterMapData.scene.add(moon.intersectionRing);
    }
  };

  const updateGrid = () => {
    if (masterMapData.showGrid) {
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
      masterMapData.plane = plane;
      masterMapData.scene.add(plane);

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
      //grid.material.linewidth = 3;
      // grid.material.color = new THREE.Color(0.5, 0.5, 0.5);
      grid.material.opacity = 0.5;
      // grid.material.side = THREE.DoubleSide;
      //grid.position.set(-845, 0, 0);

      masterMapData.grid = grid;
      masterMapData.scene.add(masterMapData.grid);
    } else {
      masterMapData.scene.remove(masterMapData.plane);
      masterMapData.scene.remove(masterMapData.grid);
    }
  };

  const addLight = (xCoord, yCoord, zCoord) => {
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(xCoord, yCoord, zCoord);
    masterMapData.scene.add(light);
  };

  // ============ Vector CRUD ============
  const createVector = async (data) => {
    let vectorMesh = await createVectorMesh(data);

    let vector = {
      id: data.id,
      data: data,
      mesh: vectorMesh,
    };

    return vector;
  };

  const addVectorToScene = (vector) => {
    // add the line to the scene
    masterMapData.scene.add(vector.mesh);
  };

  const removeVectorFromScene = (vector) => {
    // remove line from the scene
    masterMapData.scene.remove(vector.mesh);
  };

  const createNewVector = async (data) => {
    let newVector = await createVector(data);
    masterMapData.vectors.push(newVector);
    addVectorToScene(newVector);
  };

  const saveVector = async (data) => {
    deleteVector(data);
    await createNewVector(data);
  };

  const deleteVector = (vector) => {
    let index = masterMapData.vectors.findIndex((obj) => obj.id === vector.id);
    removeVectorFromScene(masterMapData.vectors[index]);
    masterMapData.vectors.splice(index, 1);
  };

  // ============== Control Handlers =======================
  const panForward = () => {
    if (masterMapData.camera === null) {
      return;
    }

    if (masterMapData.lookAtVector === null) {
      masterMapData.lookAtVector = new THREE.Vector3();
    }
    masterMapData.camera.getWorldDirection(masterMapData.lookAtVector);

    let dist = masterMapData.panSpeed / 100;

    masterMapData.controls.target.set(
      masterMapData.controls.target.x + masterMapData.lookAtVector.x * dist,
      masterMapData.controls.target.y + masterMapData.lookAtVector.y * dist,
      masterMapData.controls.target.z + masterMapData.lookAtVector.z * dist
    );
    masterMapData.controls.update();
    masterMapData.camera.translateZ(-dist);
  };

  const panBackward = () => {
    if (masterMapData.camera === null) {
      return;
    }

    if (masterMapData.lookAtVector === null) {
      masterMapData.lookAtVector = new THREE.Vector3();
    }
    masterMapData.camera.getWorldDirection(masterMapData.lookAtVector);

    let dist = masterMapData.panSpeed / 100;

    masterMapData.controls.target.set(
      masterMapData.controls.target.x + masterMapData.lookAtVector.x * -dist,
      masterMapData.controls.target.y + masterMapData.lookAtVector.y * -dist,
      masterMapData.controls.target.z + masterMapData.lookAtVector.z * -dist
    );
    masterMapData.controls.update();
    masterMapData.camera.translateZ(-dist);
  };

  // ============== Point CRUD =======================
  const resetPoints = async (pointsData) => {
    for (const index in masterMapData.points) {
      removePointFromScene(masterMapData.points[index]);
    }

    masterMapData.points = [];
    if (pointsData.length === 0) {
      return;
    }

    for (const index in pointsData) {
      let pointData = pointsData[index];
      if (pointData) {
        let newPoint = await createPoint(pointData);

        masterMapData.points.push(newPoint);

        addPointToScene(newPoint);
      }
    }
  };

  const createPoint = async (data) => {
    let pointMesh = await createPointMesh(data);
    let intersectionMeshes = createPointIntersectionObjects(data);

    let point = {
      id: data.id,
      data: data,
      mesh: pointMesh,
      intersectionMeshes: intersectionMeshes,
    };

    return point;
  };

  const addPointToScene = (point) => {
    masterMapData.scene.add(point.mesh);
    masterMapData.scene.add(point.intersectionMeshes.line);
    masterMapData.scene.add(point.intersectionMeshes.ring);
  };

  const removePointFromScene = (point) => {
    masterMapData.scene.remove(point.mesh);
    masterMapData.scene.remove(point.intersectionMeshes.line);
    masterMapData.scene.remove(point.intersectionMeshes.ring);
  };

  const viewObject = (object) => {
    if (object.type === 'Points') {
      let coord = {
        x: object.geometry.attributes.position.array[0],
        y: object.geometry.attributes.position.array[2],
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

  const showHidePoint = (id) => {
    let index = masterMapData.points.findIndex((point) => point.id === id);
    masterMapData.points[index].data.hide = !masterMapData.points[index].data.hide;
    masterMapData.points[index].mesh.visible = !masterMapData.points[index].data.hide;
  };

  const showAllPoints = () => {
    for (let index in masterMapData.points) {
      masterMapData.points[index].data.hide = false;
      masterMapData.points[index].mesh.visible = true;
    }
  };

  const createNewPoint = async (data) => {
    let newPoint = await createPoint(data);
    masterMapData.points.push(newPoint);
    addPointToScene(newPoint);
  };

  const savePoint = async (data) => {
    deletePoint(data);
    await createNewPoint(data);
  };

  const deletePoint = (point) => {
    let index = masterMapData.points.findIndex((obj) => obj.id === point.id);
    removePointFromScene(masterMapData.points[index]);
    masterMapData.points.splice(index, 1);
  };

  const mergePoints = async (incomingPointData, shouldReplace = false) => {
    let existingIDs = masterMapData.points.map((obj) => {
      return obj.id;
    });
    let conflictingPoints = [];

    for (const index in incomingPointData) {
      let pointData = incomingPointData[index];

      if (existingIDs.includes(pointData.id)) {
        if (shouldReplace) {
          deletePoint(pointData);
          await createNewPoint(pointData);
        } else {
          conflictingPoints.push(pointData);
        }
      } else {
        await createNewPoint(pointData);
      }
    }

    if (conflictingPoints.length > 0) {
      let names = conflictingPoints.map((obj) => {
        return obj.name;
      });

      if (shouldReplace) {
        Vue.toasted.global.alertError({ message: `${conflictingPoints.length} Points were replaced due to duplicate IDs` });
      } else {
        Vue.toasted.global.alertError({ message: `${conflictingPoints.length} Points were skipped due to duplicate IDs`, description: names.join(', ') });
      }
    }
  };

  // ================= Utilities ========================
  const calcDistance = (positionA, positionB) => {
    return Math.sqrt(Math.pow(positionA.x - positionB.x, 2) + Math.pow(positionA.y - positionB.y, 2) + Math.pow(positionA.z - positionB.z, 2));
  };

  const getPointData = (inMapData) => {
    let data = inMapData.points.map((point) => {
      return point.data;
    });
    return data;
  };

  const getVectorData = (inMapData) => {
    let data = inMapData.vectors.map((vector) => {
      return vector.data;
    });
    return data;
  };

  return {
    initMasterMapData,
    init,
    resizeMap,
    panForward,
    panBackward,
    viewObject,
    showHidePoint,
    showAllPoints,
    createNewPoint,
    savePoint,
    deletePoint,
    mergePoints,
    updateGrid,
    getPointData,
    getVectorData,
    createNewVector,
    deleteVector,
    saveVector,
  };
}
