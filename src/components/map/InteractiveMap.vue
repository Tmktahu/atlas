<!-- eslint-disable id-length -->
<template>
  <div>
    <div ref="mapContainer" v-resize="onResize" class="mapContainer" @keypress="onWDown" />
    <v-slider
      v-model="masterMapData.panSpeed"
      hide-details
      :min="MIN_PAN_SPEED"
      :max="MAX_PAN_SPEED"
      class="pan-speed-slider pb-1"
      thumb-label="always"
      label="Pan Speed:"
    />
    <div ref="pointInfoContainer" class="point-info">
      <div ref="pointName" class="name">Point Name</div>
      <div ref="pointCoord" class="coord">[Coordinate]</div>
    </div>
    <div class="hardware-accel-info">
      You must have Hardware Acceleration enabled in your browser, or else this website will max out your CPU trying to render.
    </div>
    <div v-if="showControls" class="controls-info" :class="{ out: leftNavCondensed, 'with-conversion-widget': conversionWidgetOpen }">
      <div>W: <span>Pan Forward</span></div>
      <div>S: <span>Pan Backward</span></div>
      <div>A: <span>Pan Left</span></div>
      <div>D: <span>Pan Right</span></div>
      <div>Space: <span>Pan Up</span></div>
      <div>Left-Shift: <span>Pan Down</span></div>
      <div>Left-Click: <span>Rotate Camera</span></div>
      <div>Right-Click: <span>Pan Camera</span></div>
    </div>
  </div>
</template>

<script>
import Stats from 'stats.js';

import { ref, inject, watch, toRefs } from '@vue/composition-api';

import { useMap, MIN_PAN_SPEED, MAX_PAN_SPEED } from '@/models/useMap.js';

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
    const masterMapData = inject('masterMapData');
    const showControls = inject('showControls');
    const leftNavCondensed = inject('leftNavCondensed');
    const conversionWidgetOpen = inject('conversionWidgetOpen');
    let stats = null;

    const { init: initMap, resizeMap, panForward, panBackward } = useMap(masterMapData);

    const intersects = toRefs(masterMapData).intersects;

    const showManageDialog = inject('showManageDialog');
    const showSaveDialog = inject('showSaveDialog');
    const showImportDialog = inject('showImportDialog');

    return {
      stats,
      initMap,
      resizeMap,
      panForward,
      panBackward,
      masterMapData,
      showControls,
      leftNavCondensed,
      conversionWidgetOpen,
      MIN_PAN_SPEED,
      MAX_PAN_SPEED,
      intersects,
      showManageDialog,
      showSaveDialog,
      showImportDialog,
    };
  },

  watch: {
    intersects() {
      if (this.masterMapData.intersects[0]?.object.type === 'Points') {
        this.$refs.pointName.innerHTML = this.masterMapData.intersects[0].object.name;
        this.$refs.pointCoord.innerHTML = `[${this.masterMapData.intersects[0].object.geometry.attributes.position.array[0]}, ${-this.masterMapData
          .intersects[0].object.geometry.attributes.position.array[2]}, ${this.masterMapData.intersects[0].object.geometry.attributes.position.array[1]}]`;
        this.$refs.pointInfoContainer.style.display = 'block';
      } else {
        this.$refs.pointInfoContainer.style.display = 'none';
      }
    },
  },

  mounted() {
    this.$nextTick(() => {
      window.addEventListener('keydown', (event) => {
        if (event.keyCode === 87) {
          this.onWDown();
        }

        if (event.keyCode === 83) {
          this.onSDown();
        }
      });

      window.addEventListener('mousemove', (event) => {
        if (this.$refs.pointInfoContainer) {
          this.$refs.pointInfoContainer.style.left = `${event.pageX - 30}px`;
          this.$refs.pointInfoContainer.style.top = `${event.pageY - 10}px`;
        }

        // eslint-disable-next-line prettier/prettier
        this.masterMapData.mapMouse.x = ((event.clientX - 56) / (window.innerWidth - 56))* 2 - 1;
        this.masterMapData.mapMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      });

      window.addEventListener('wheel', (event) => {
        if (!this.showSaveDialog && !this.showManageDialog && !this.showImportDialog && document.activeElement.tagName !== 'INPUT') {
          if (event.deltaY > 0) {
            this.onSDown();
          } else {
            this.onWDown();
          }
        }
      });

      this.createStats();
      this.initMap(this.$refs.mapContainer);
    });
  },

  methods: {
    createStats() {
      this.stats = new Stats();
      this.stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
      this.stats.domElement.classList = 'fps-tracker';
      this.$refs.mapContainer.appendChild(this.stats.dom);
      this.masterMapData.stats = this.stats;
    },

    onResize() {
      this.resizeMap(this.masterMapData);
    },

    // Key Handlers
    onWDown() {
      this.panForward();
    },

    onSDown() {
      this.panBackward();
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
@use 'sass:color';

@import '@/design/variables/_colors';

.mapContainer::v-deep {
  width: calc(100vw - 56px);
  overflow: hidden;

  .mapCanvas {
    width: calc(100vw - 56px) !important;
  }
}

.pan-speed-slider::v-deep {
  position: absolute;
  right: 90px;
  bottom: 0;
  width: 30%;

  .v-label {
    font-weight: 400;
    color: white;
    letter-spacing: 0.03em;
  }
}

.point-info {
  position: absolute;
  display: none;

  .name {
    font-size: 16px;
  }

  .coord {
    font-size: 12px;
  }
}

.controls-info {
  position: absolute;
  top: 16px;
  left: 16px;
  width: 100%;
  pointer-events: none;
  background: transparent;
  transition: left 0.05s ease;

  div {
    width: fit-content;
    font-size: 14px;
    color: white;
    pointer-events: all;

    span {
      color: color.change($primary-blue, $lightness: 60%, $saturation: 80%);
    }
  }

  &.out {
    left: 160px !important;
  }

  &.with-conversion-widget {
    top: 170px !important;
  }
}

.hardware-accel-info {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 30vw;
  text-align: right;
  pointer-events: none;
}
</style>
