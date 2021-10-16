<template>
  <div ref="mapContainer" v-resize="onResize" class="mapContainer" @keypress="onWDown" />
</template>

<script>
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import Stats from 'stats.js';

import { ref } from '@vue/composition-api';

import pointSprint from '@/assets/disc.png';

export default {
  metaInfo() {
    return {
      title: 'Interactive Map',
      description: 'The Atlas Interactive Map',
      meta: [{ name: 'description', content: 'Atlas Interactive Map' }],
    };
  },

  name: 'InteractiveMap',
  setup() {
    const scene = ref(null);
    const camera = ref(null);
    const renderer = ref(null);
    const constrols = ref(null);

    const stats = ref(null);

    const sphere = ref(null);
    const torus = ref(null);
    const points = ref(null);

    const moveFoward = ref(false);
    const moveBackward = ref(false);

    const panSpeed = ref(1000000);

    const lookAtVector = ref(new THREE.Vector3());

    const torusFillFront = ref(null);
    const torusFillBack = ref(null);
    const torusFrameFront = ref(null);
    const torusFrameBack = ref(null);

    return {
      scene,
      camera,
      renderer,
      constrols,
      stats,
      sphere,
      torus,
      points,
      moveFoward,
      moveBackward,
      lookAtVector,
      panSpeed,
      torusFillFront,
      torusFillBack,
      torusFrameFront,
      torusFrameBack,
    };
  },

  mounted() {
    this.$nextTick(() => {
      this.initMap();

      window.addEventListener('keydown', (event) => {
        if (event.keyCode === 87) {
          this.onWDown();
        }

        if (event.keyCode === 83) {
          this.onSDown();
        }
      });
    });
  },

  methods: {
    initMap() {
      this.scene = new THREE.Scene();

      // PerspectiveCamera(FOV, Aspect Ratio, Near Clipping Plane, Far Clipping Place)
      this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000000000);
      this.camera.position.set(20000000, 20000000, 20000000);

      this.renderer = new THREE.WebGLRenderer({ alpha: true });
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.$refs.mapContainer.appendChild(this.renderer.domElement);

      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableZoom = false;
      this.controls.listenToKeyEvents(window);
      this.controls.keyPanSpeed = this.panSpeed * 200;
      this.controls.panSpeed = this.panSpeed * 10;
      this.controls.keys = {
        LEFT: 'KeyA',
        UP: 'Space',
        RIGHT: 'KeyD',
        BOTTOM: 'ShiftLeft',
      };
      this.controls.target.set(20000000 - 1, 20000000 - 1, 20000000 - 1);
      this.controls.update();

      const gridMaterial = new THREE.MeshBasicMaterial({ color: '#111111', opacity: 0.6, blending: THREE.AdditiveBlending });
      gridMaterial.renderOrder = -1;
      gridMaterial.depthTest = false;

      const grid = new THREE.GridHelper(1000000000, 300);

      grid.material = gridMaterial;
      this.scene.add(grid);

      this.addTorus();
      this.addSphere();

      this.addLight(-1, 2, 4);
      //this.addLight(1, -1, -2);

      const vertices = [];
      vertices.push(15000000, 10000, 10000);

      this.addPoints(vertices);

      this.createStats();

      this.controls.update();
      this.animate();
    },

    addSphere() {
      let radius = 11000000;
      let widthSegments = 50;
      let heightSegments = 50;

      const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);

      const materialFill = new THREE.MeshLambertMaterial({ color: '#234672', opacity: 0.4 });
      const sphere = new THREE.Mesh(geometry, materialFill);
      this.scene.add(sphere);

      const materialFrame = new THREE.MeshLambertMaterial({ color: '#234672', opacity: 0.6, wireframe: true, blending: THREE.AdditiveBlending });
      const sphereFrame = new THREE.Mesh(geometry, materialFrame);
      sphereFrame.lookAt(0, 0, 0);
      this.scene.add(sphereFrame);
    },

    addTorus() {
      let overalRadius = 9050000;
      let innerRadius = 1100000;
      let radialSegments = 20;
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

      this.torusFillFront = new THREE.Mesh(geometry, materialFillFront);
      this.torusFillFront.scale.set(2, 2);
      this.torusFillFront.lookAt(this.camera.position.x, 0, this.camera.position.z);
      this.torusFillFront.rotateX(Math.PI / 2);
      this.scene.add(this.torusFillFront);

      this.torusFillBack = new THREE.Mesh(geometry, materialFillBack);
      this.torusFillBack.scale.set(2, 2);
      this.torusFillBack.lookAt(-this.camera.position.x, 0, -this.camera.position.z);
      this.torusFillBack.rotateX(Math.PI / 2);
      this.scene.add(this.torusFillBack);

      this.torusFrameFront = new THREE.Mesh(geometry, materialFrameFront);
      this.torusFrameFront.scale.set(2, 2);
      this.torusFrameFront.lookAt(-this.camera.position.x, 0, -this.camera.position.z);
      this.torusFrameFront.rotateX(Math.PI / 2);
      this.scene.add(this.torusFrameFront);

      this.torusFrameBack = new THREE.Mesh(geometry, materialFrameBack);
      this.torusFrameBack.scale.set(2, 2);
      this.torusFrameBack.lookAt(-this.camera.position.x, 0, -this.camera.position.z);
      this.torusFrameBack.rotateX(Math.PI / 2);
      this.scene.add(this.torusFrameBack);
    },

    addLight(xCoord, yCoord, zCoord) {
      const light = new THREE.DirectionalLight(0xffffff, 1);
      light.position.set(xCoord, yCoord, zCoord);
      this.scene.add(light);
    },

    async addPoints(vertices) {
      const sprite = await new THREE.TextureLoader().load(pointSprint);
      console.log(sprite);
      const pointMaterial = new THREE.PointsMaterial({ color: 'red', size: 200000, map: sprite, sizeAttenuation: true, alphaTest: 0.5, transparent: true });

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

      this.points = new THREE.Points(geometry, pointMaterial);
      this.scene.add(this.points);
    },

    animate() {
      requestAnimationFrame(this.animate);
      this.stats.begin();

      let angle = Math.atan(this.camera.position.y / this.camera.position.x);
      //console.log(angle + Math.PI / 2);
      // eslint-disable-next-line id-length
      this.torusFillFront.lookAt(this.camera.position.x, 0, this.camera.position.z);
      this.torusFillFront.rotateX(Math.PI / 2);

      this.torusFillBack.lookAt(-this.camera.position.x, 0, -this.camera.position.z);
      this.torusFillBack.rotateX(Math.PI / 2);

      this.torusFrameFront.lookAt(this.camera.position.x, 0, this.camera.position.z);
      this.torusFrameFront.rotateX(Math.PI / 2);

      this.torusFrameBack.lookAt(-this.camera.position.x, 0, -this.camera.position.z);
      this.torusFrameBack.rotateX(Math.PI / 2);

      //console.log(this.points.material.size);
      if (this.points) {
        this.points.material.size =
          0.01 * Math.sqrt(Math.pow(this.camera.position.x, 2) + Math.pow(this.camera.position.y, 2) + Math.pow(this.camera.position.z, 2));
      }

      this.controls.update();
      this.renderer.render(this.scene, this.camera);
      this.stats.end();
    },

    createStats() {
      this.stats = new Stats();
      this.stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
      this.stats.domElement.classList = 'fps-tracker';
      this.$refs.mapContainer.appendChild(this.stats.dom);
    },

    onResize() {
      if (this.camera) {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(window.innerWidth, window.innerHeight);
      }
    },

    // Key Handlers
    onWDown() {
      let distance = 100000;

      if (this.lookAtVector === null) {
        this.lookAtVector = new THREE.Vector3();
      }
      this.camera.getWorldDirection(this.lookAtVector);

      this.controls.target.set(
        this.controls.target.x + this.lookAtVector.x * this.panSpeed,
        this.controls.target.y + this.lookAtVector.y * this.panSpeed,
        this.controls.target.z + this.lookAtVector.z * this.panSpeed
      );
      this.controls.update();
      this.camera.translateZ(-this.panSpeed);
    },

    onSDown() {
      let distance = -100000;

      if (this.lookAtVector === null) {
        this.lookAtVector = new THREE.Vector3();
      }
      this.camera.getWorldDirection(this.lookAtVector);

      this.controls.target.set(
        this.controls.target.x + this.lookAtVector.x * -this.panSpeed,
        this.controls.target.y + this.lookAtVector.y * -this.panSpeed,
        this.controls.target.z + this.lookAtVector.z * -this.panSpeed
      );
      this.controls.update();
      this.camera.translateZ(-this.panSpeed);
    },
  },
};
</script>

<style lang="scss">
.fps-tracker {
  top: unset !important;
  right: 0 !important;
  bottom: 0 !important;
  left: unset !important;
}
</style>

<style lang="scss" scoped>
.mapContainer {
  overflow: hidden;
}
</style>
