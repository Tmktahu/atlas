<template>
  <div ref="mapContainer" v-resize="onResize" class="mapContainer" />
</template>

<script>
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import Stats from 'stats.js';

import { ref } from '@vue/composition-api';

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

    const stats = ref(null);

    const cube = ref(null);

    return {
      scene,
      camera,
      renderer,
      stats,
      cube,
    };
  },

  mounted() {
    this.$nextTick(() => {
      this.initMap();
    });
  },

  methods: {
    initMap() {
      this.scene = new THREE.Scene();

      // PerspectiveCamera(FOV, Aspect Ratio, Near Clipping Plane, Far Clipping Place)
      this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      this.camera.position.set(0, 0, 5);
      this.camera.lookAt(0, 0, 0);

      this.renderer = new THREE.WebGLRenderer({ alpha: true });
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.$refs.mapContainer.appendChild(this.renderer.domElement);

      // const material = new THREE.LineBasicMaterial({ color: 0x0000ff });

      // const points = [];
      // points.push(new THREE.Vector3(-10, 0, 0));
      // points.push(new THREE.Vector3(0, 10, 0));
      // points.push(new THREE.Vector3(10, 0, 0));
      // const geometry = new THREE.BufferGeometry().setFromPoints(points);
      // const line = new THREE.Line(geometry, material);
      //this.scene.add(line);

      const geometry = new THREE.BoxGeometry();
      const material = new THREE.MeshBasicMaterial({ wireframe: true });
      this.cube = new THREE.Mesh(geometry, material);
      this.scene.add(this.cube);

      // eslint-disable-next-line id-length
      //this.camera.position.z = 5;

      this.createStats();

      this.animate();
    },

    animate() {
      requestAnimationFrame(this.animate);
      this.stats.begin();
      this.cube.rotation.x += 0.01;
      this.cube.rotation.y += 0.01;
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
