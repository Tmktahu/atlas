/* eslint-disable id-length */
import safezoneTexture from '@/assets/textures/safezone.png';

import Vue from 'vue';
import * as THREE from 'three';
import { OrbitControls } from '@/custom/OrbitControls.js';

import { useCoordinates, ORIGIN_POINT } from '@/models/useCoordinates.js';
const { scaleUpCoordinate, scaleDownCoordinate } = useCoordinates();

import { ref, watch, reactive, toRefs } from '@vue/composition-api';
import {
  createPointMesh,
  createVectorMesh,
  createRing,
  createSphereMesh,
  createTorus,
  createSphereIntersectionRing,
  createTorusIntersectionRings,
  createSafeZoneMesh,
  createSafeZoneMeshRing,
  createHoverLine,
  createHoverCircle,
} from '@/models/useMapObjects.js';

import { ASTROID_BELTS, MOONS, ORBIT_RINGS, EOS_BELT_ZONES } from './presetMapData/celestialBodies';
import { ELYSIUM_WARP_GATE } from './presetMapData/elysium';

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
    id,
    data,
    mesh,
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

  showEosSafeZone: ref(false),
  eosSafeZoneMesh: null,
  eosSafeZoneMeshRing: null,
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
  previousIntersect: null,

  pointSize: 0.5,

  showGrid: ref(true),
  initialized: false,

  hoverLine: null,
  hoverCircle: null,

  anchors: [ORIGIN_POINT, ELYSIUM_WARP_GATE],
});

export function useMap() {
  const initMasterMapData = (storageData) => {
    masterMapData.initialPointData = storageData.points;
    masterMapData.initialVectorData = storageData.vectors;
  };

  const init = async (inContainerElement) => {
    if (masterMapData === undefined && masterMapData.initialized) {
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

    masterMapData.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
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
    resetVectors(masterMapData.initialVectorData);

    masterMapData.controls.update();
    animate();

    const refs = toRefs(masterMapData);

    watch(refs.panSpeed, () => {
      masterMapData.controls.keyPanSpeed = masterMapData.panSpeed * 50;
      masterMapData.controls.panSpeed = masterMapData.panSpeed;
    });

    masterMapData.initialized = true;
  };

  const animate = () => {
    requestAnimationFrame(animate);
    masterMapData.stats?.begin();

    handleRaycasting();

    if (masterMapData.pointMeshes) {
      for (let i in masterMapData.points) {
        let point = masterMapData.points[i];
        if (point && point.mesh) {
          // Scale autoScale points so they are always visible
          if (point.data.autoScale) {
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

    masterMapData.eosSafeZoneMesh.visible = masterMapData.showEosSafeZone;
    masterMapData.eosSafeZoneMeshRing.visible = masterMapData.showEosSafeZone;

    masterMapData.controls.update();
    masterMapData.renderer.render(masterMapData.scene, masterMapData.camera);
    masterMapData.stats?.end();
  };

  const handleRaycasting = () => {
    // update the picking ray with the camera and mouse position
    let cameraPos = {
      position: {
        x: masterMapData.camera.position.x,
        y: masterMapData.camera.position.y,
        z: masterMapData.camera.position.z,
      },
    };
    let scaledUpCameraPos = scaleUpCoordinate(cameraPos);
    let dist = minDistanceFromAnchors(scaledUpCameraPos);
    let scaledDownDist = scaleDownCoordinate(dist);

    masterMapData.raycaster.params.Points.threshold = 0.3;
    masterMapData.raycaster.params.Line2 = { threshold: Math.max(Math.pow(scaledDownDist, 0.2) / 400, 0.01) };
    masterMapData.raycaster.setFromCamera(masterMapData.mapMouse, masterMapData.camera);

    // TODO we may need to put this back if we hear anything about performance issues
    //if (Date.now() - masterMapData.lastRaycast > masterMapData.raycastInterval) {
    let pointMeshes = masterMapData.points.map((point) => {
      return point.mesh;
    });

    let moonMeshes = masterMapData.moons.map((moon) => {
      return moon.mesh;
    });

    let vectorMeshes = masterMapData.vectors.map((vector) => {
      return vector.mesh;
    });

    let filteredPointMeshes = pointMeshes.filter((mesh) => mesh.visible);
    let filteredVectorMeshes = vectorMeshes.filter((mesh) => mesh.visible);
    let intersectableObjects = [...filteredPointMeshes, ...moonMeshes, ...filteredVectorMeshes]; //, masterMapData.plane];

    masterMapData.intersects = masterMapData.raycaster.intersectObjects(intersectableObjects);
    masterMapData.lastRaycast = Date.now();
    masterMapData.qRaycast = false;
    handleIntersects();
    //}
  };

  const handleIntersects = () => {
    // first we check our current intersect to see if there are things to do
    let currentIntersect = masterMapData.intersects[0];

    // we need to handle the previous case.
    // if there has been a change, we want to reset the PREVIOUS intersect
    if (currentIntersect?.object.id !== masterMapData.previousIntersect?.object.id) {
      if (masterMapData.previousIntersect?.object.type === 'Points') {
        // here we want to reset the point back to default values
        let pointData = masterMapData.points.find((point) => point.mesh.id === masterMapData.previousIntersect.object.id);
        masterMapData.previousIntersect.object.material.size = masterMapData.pointSize;
        masterMapData.previousIntersect.object.material.color = new THREE.Color(pointData.data.color);
      }

      if (masterMapData.previousIntersect?.object.type === 'Line2') {
        let vectorData = masterMapData.vectors.find((vector) => vector.mesh.id === masterMapData.previousIntersect.object.id);
        masterMapData.previousIntersect.object.material.color = new THREE.Color(vectorData?.data.color);
      }

      masterMapData.hoverLine.visible = false;
      masterMapData.hoverCircle.visible = false;
    }

    if (currentIntersect) {
      let lineEnd = null;
      if (currentIntersect.object.type === 'Points') {
        //console.log(currentIntersect);
        currentIntersect.object.material.size = masterMapData.pointSize * 1.25;
        currentIntersect.object.material.color = new THREE.Color(1, 1, 1);
        lineEnd = new THREE.Vector3(
          currentIntersect.object.geometry.attributes.position.array[0],
          currentIntersect.object.geometry.attributes.position.array[1],
          currentIntersect.object.geometry.attributes.position.array[2]
        );

        masterMapData.hoverLine.visible = true;
        masterMapData.hoverCircle.visible = true;
      }

      if (currentIntersect.object.type === 'Line2') {
        currentIntersect.object.material.color = new THREE.Color(1, 1, 1);
        lineEnd = currentIntersect.pointOnLine;
        masterMapData.hoverLine.visible = true;
        masterMapData.hoverCircle.visible = true;
      }

      if (lineEnd) {
        const points = [];
        points.push([lineEnd.x, 0, lineEnd.z]);
        points.push([lineEnd.x, lineEnd.y, lineEnd.z]);

        masterMapData.hoverLine.geometry.setPositions(points.flat());
        masterMapData.hoverCircle.position.set(lineEnd.x, 0, lineEnd.z);
        let distFromIntersect = calcDistance(masterMapData.camera.position, lineEnd);
        let hoverCircleRadius = distFromIntersect / 25;
        masterMapData.hoverCircle.geometry = new THREE.RingGeometry(hoverCircleRadius, hoverCircleRadius * 0.9, 50);
      }
    }

    // and finally we save our current intersect for the next interation
    masterMapData.previousIntersect = currentIntersect;
  };

  const resizeMap = () => {
    if (masterMapData.camera) {
      masterMapData.camera.aspect = window.innerWidth / window.innerHeight;
      masterMapData.camera.updateProjectionMatrix();

      masterMapData.renderer.setSize(window.innerWidth, window.innerHeight);
    }
  };

  const minDistanceFromAnchors = (input) => {
    //console.log('input', input);
    let minDistance = Number.MAX_SAFE_INTEGER;
    //console.log('initial min distance', minDistance);
    masterMapData.anchors.forEach((elem) => {
      //console.log('looping for anchor', elem);
      let dist = Math.sqrt(
        Math.pow(input.position.x - elem.position.x, 2) + Math.pow(input.position.y - elem.position.z, 2) + Math.pow(input.position.z - -elem.position.y, 2)
      );
      //console.log('calculated dist', dist);
      //console.log('bool check', dist < minDistance);
      if (dist < minDistance) {
        //console.log('setting min dist');
        minDistance = dist;
      }
    });
    //console.log('final distance selected', minDistance);
    return minDistance;
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

    // TODO move this definition into some other file and import it
    // probably will do this when I go to add more safezones around other stations?

    let safeZoneOptions = {
      baseRadius: 50000 / 10000,
      scaleX: 1,
      scaleY: 4.4,
      scaleZ: 10,
      texture: safezoneTexture,
      position: {
        x: 10000 / 10000,
        y: 0,
        z: 0,
      },
    };

    masterMapData.eosSafeZoneMesh = await createSafeZoneMesh(safeZoneOptions);
    masterMapData.scene.add(masterMapData.eosSafeZoneMesh);

    masterMapData.eosSafeZoneMeshRing = await createSafeZoneMeshRing(safeZoneOptions);
    masterMapData.scene.add(masterMapData.eosSafeZoneMeshRing);

    // These objects are for the hover functionality
    masterMapData.hoverLine = createHoverLine();
    masterMapData.scene.add(masterMapData.hoverLine);

    masterMapData.hoverCircle = createHoverCircle();
    masterMapData.scene.add(masterMapData.hoverCircle);
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
      plane.name = 'Horizontal Plane';
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
  const resetVectors = (inData) => {
    masterMapData.vectors = [];
    for (let index in inData) {
      createNewVector(inData[index]);
    }
  };

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
    let index = masterMapData.vectors.findIndex((obj) => obj.data.id === vector.id);
    removeVectorFromScene(masterMapData.vectors[index]);
    masterMapData.vectors.splice(index, 1);
  };

  const showHideVector = (id) => {
    let index = masterMapData.vectors.findIndex((vector) => vector.id === id);
    masterMapData.vectors[index].data.hide = !masterMapData.vectors[index].data.hide;
    masterMapData.vectors[index].mesh.visible = !masterMapData.vectors[index].data.hide;
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
        await createNewPoint(pointData);
      }
    }
  };

  const resetDefaultPoints = async () => {
    const { getInitialPoints } = useCoordinates();
    let defaultPoints = getInitialPoints();

    for (let index in defaultPoints) {
      let existingPoint = masterMapData.points.find((elem) => {
        return elem.data.name === defaultPoints[index].name;
      });

      if (existingPoint) {
        deletePoint(existingPoint);
      }

      await createNewPoint(defaultPoints[index]);
    }
  };

  const createPoint = async (data) => {
    let pointMesh = await createPointMesh(data);

    let point = {
      id: data.id,
      data: data,
      mesh: pointMesh,
    };

    return point;
  };

  const addPointToScene = (point) => {
    masterMapData.scene.add(point.mesh);
  };

  const removePointFromScene = (point) => {
    masterMapData.scene.remove(point.mesh);
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
    } else if (object.type === 'Line2') {
      let vector = masterMapData.vectors.find((vector) => {
        return object.vectorId === vector.data.id;
      });

      let midPoint = {
        x: (vector.data.origin.x + vector.data.endPoint.x) / 2,
        y: (vector.data.origin.y + vector.data.endPoint.y) / 2,
        z: (vector.data.origin.z + vector.data.endPoint.z) / 2,
      };

      let dist = calcDistance(midPoint, vector.data.endPoint) * 0.8;

      masterMapData.camera.position.set(midPoint.x + dist + 0.1, midPoint.z + dist + 0.1, -midPoint.y + dist + 0.1);
      masterMapData.controls.target.set(midPoint.x + dist, midPoint.z + dist, -midPoint.y + dist);

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
    let existingPoint = masterMapData.points.find((elem) => elem.id === data.id);
    if (!existingPoint) {
      let newPoint = await createPoint(data);
      masterMapData.points.push(newPoint);
      addPointToScene(newPoint);
    }
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
    resetDefaultPoints,
    updateGrid,
    getPointData,
    getVectorData,
    createNewVector,
    deleteVector,
    saveVector,
    showHideVector,
  };
}
