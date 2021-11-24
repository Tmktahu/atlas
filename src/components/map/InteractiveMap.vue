<!-- eslint-disable id-length -->
<template>
  <div>
    <div ref="mapContainer" v-resize="onResize" class="mapContainer" @keypress="onWDown" />
    <v-row no-gutters class="bottom-controls">
      <v-checkbox v-model="showGrid" hide-details reverse class="hide-grid-checkbox mr-2" label="Grid" />
      <v-slider
        v-model="masterMapData.panSpeed"
        hide-details
        :min="MIN_PAN_SPEED"
        :max="MAX_PAN_SPEED"
        class="pan-speed-slider mr-2"
        thumb-label="always"
        label="Pan Speed:"
      />
      <v-btn class="mr-2" icon @click="resetPan"><v-icon color="white">mdi-refresh</v-icon></v-btn>
    </v-row>
    <div ref="pointInfoContainer" class="point-info">
      <div ref="pointName" class="name">Point Name</div>
      <div ref="pointCoord" class="coord">[Coordinate]</div>
    </div>
    <div v-if="showControls" class="controls-info" :class="{ out: leftNavCondensed, 'with-conversion-widget': conversionWidgetOpen }">
      <div>
        Local Storage File:
        <span>{{ localStorageText }}</span>
      </div>
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
import { useCoordinates } from '@/models/useCoordinates.js';

import { useStorage } from '@/models/useStorage.js';

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
    const masterPointsArray = inject('masterPointsArray');
    const showControls = inject('showControls');
    const leftNavCondensed = inject('leftNavCondensed');
    const conversionWidgetOpen = inject('conversionWidgetOpen');
    let stats = null;

    const {
      init: initMap,
      resizeMap,
      panForward,
      panBackward,
      viewPoint,
      showHidePoint,
      addPoint,
      deletePoint,
      mergePoints,
      updateGrid,
    } = useMap(masterMapData);

    const { dataStoragePath } = useStorage();

    window.addEventListener(
      'message',
      (event) => {
        if (event.data.command) {
          if (event.data.command === 'view') {
            viewPoint(event.data.point, masterMapData);
          }

          if (event.data.command === 'showHide') {
            showHidePoint(event.data.point, masterMapData);
            event.source.postMessage({ points: masterMapData.pointsArray });
          }

          if (event.data.command === 'add') {
            addPoint(event.data.point, masterMapData);
            event.source.postMessage({ points: masterMapData.pointsArray });
          }

          if (event.data.command === 'delete') {
            deletePoint(event.data.point, masterMapData);
            event.source.postMessage({ points: masterMapData.pointsArray });
          }

          if (event.data.command === 'import') {
            mergePoints(event.data.points, masterMapData);
            event.source.postMessage({ points: masterMapData.pointsArray });
          }
        }
      },
      false
    );

    const intersects = toRefs(masterMapData).intersects;
    const showGrid = toRefs(masterMapData).showGrid;

    const { scaleUpCoordinate } = useCoordinates();

    const focusedObject = ref(null);

    return {
      stats,
      initMap,
      resizeMap,
      panForward,
      panBackward,
      masterMapData,
      masterPointsArray,
      showControls,
      leftNavCondensed,
      conversionWidgetOpen,
      MIN_PAN_SPEED,
      MAX_PAN_SPEED,
      intersects,
      dataStoragePath,
      scaleUpCoordinate,
      showGrid,
      updateGrid,
    };
  },

  computed: {
    localStorageText() {
      let path = require('path');
      let absolutePath = path.resolve(this.dataStoragePath);
      return absolutePath;
    },
  },

  watch: {
    masterPointsArray() {
      this.initMap(this.$refs.mapContainer, this.masterPointsArray);
    },

    intersects() {
      this.focusedObject = this.masterMapData.intersects[0]?.object;
      if (!this.focusedObject) {
        this.$refs.pointInfoContainer.style.display = 'none';
        this.$refs.mapContainer.style.cursor = 'auto';
        return;
      }

      if (this.focusedObject.type === 'Points') {
        let coordinate = {
          position: {
            x: this.focusedObject.geometry.attributes.position.array[0],
            y: -this.focusedObject.geometry.attributes.position.array[2],
            // eslint-disable-next-line id-length
            z: this.focusedObject.geometry.attributes.position.array[1],
          },
        };
        let expandedCoordinates = this.scaleUpCoordinate(coordinate);

        this.$refs.pointName.innerHTML = this.focusedObject.name;
        this.$refs.pointCoord.innerHTML = `[${expandedCoordinates.position.x}, ${expandedCoordinates.position.y}, ${expandedCoordinates.position.z}]`;
        this.$refs.pointInfoContainer.style.display = 'block';

        this.$refs.mapContainer.style.cursor = 'pointer';
      } else if (this.focusedObject.type === 'Mesh' && this.focusedObject.celestialType === 'moon') {
        let coordinate = {
          position: {
            x: this.focusedObject.position.x,
            y: -this.focusedObject.position.z,
            // eslint-disable-next-line id-length
            z: this.focusedObject.position.y,
          },
        };
        let expandedCoordinates = this.scaleUpCoordinate(coordinate);

        this.$refs.pointName.innerHTML = this.focusedObject.name;
        this.$refs.pointCoord.innerHTML = `Estimated [${expandedCoordinates.position.x}, ${expandedCoordinates.position.y}, ${expandedCoordinates.position.z}]`;
        this.$refs.pointInfoContainer.style.display = 'block';

        this.$refs.mapContainer.style.cursor = 'pointer';
      } else {
        this.$refs.pointInfoContainer.style.display = 'none';
        this.$refs.mapContainer.style.cursor = 'auto';
      }
    },

    showGrid(value) {
      this.updateGrid(this.masterMapData);
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
        if (event.deltaY > 0) {
          this.onSDown();
        } else {
          this.onWDown();
        }
      });

      window.addEventListener('click', (event) => {
        if (event.target.className === 'mapCanvas') {
          this.handleMouseClick();
        }
      });

      window.addEventListener('contextmenu', (event) => {
        if (event.target.className === 'mapCanvas') {
          this.handleRightClick();
        }
      });

      this.createStats();
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

    resetPan() {
      this.masterMapData.panSpeed = 100;
    },

    // Key Handlers
    onWDown() {
      this.panForward(this.masterMapData);
    },

    onSDown() {
      this.panBackward(this.masterMapData);
    },

    // Click action and context menu handlers
    handleMouseClick() {
      if (this.focusedObject && this.focusedObject.position) {
        this.onCopy();
      }
    },

    handleRightClick() {
      if (this.focusedObject) {
        console.log('right clicked an object');
      } else {
        console.log('right clicked empty space');
      }
    },

    async onCopy() {
      try {
        if (this.focusedObject && this.focusedObject.position) {
          let coord = null;
          if (this.focusedObject.type === 'Mesh') {
            coord = { position: this.focusedObject.position };
          } else if (this.focusedObject.type === 'Points') {
            // eslint-disable-next-line id-length
            coord = {
              position: {
                x: this.focusedObject.geometry.attributes.position.array[0],
                y: -this.focusedObject.geometry.attributes.position.array[2],
                // eslint-disable-next-line id-length
                z: this.focusedObject.geometry.attributes.position.array[1],
              },
            };
          }
          let scaledCoord = this.scaleUpCoordinate(coord);
          let output = `${scaledCoord.position.x},${scaledCoord.position.y},${scaledCoord.position.z}`;
          await navigator.clipboard.writeText(output);
          this.$toasted.global.alertInfo({ message: 'Copied Coordinate to Clipboard', timeout: 1000 });
        }
      } catch (error) {
        this.$toasted.global.alertError({ message: 'Copy failed' });
        console.error('Failed to copy: ', error);
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
@use 'sass:color';

@import '@/design/variables/_colors';

.mapContainer::v-deep {
  width: calc(100vw - 56px);
  overflow: hidden;

  .mapCanvas {
    width: calc(100vw - 56px) !important;
  }
}

.bottom-controls {
  position: absolute;
  right: 90px;
  bottom: 0;
  width: calc(100% - 56px - 90px);
  align-items: center;
  justify-content: flex-end;

  .pan-speed-slider::v-deep {
    max-width: 500px;

    .v-label {
      font-weight: 400;
      color: white;
      letter-spacing: 0.03em;
    }
  }

  .hide-grid-checkbox::v-deep {
    margin: 0;
    padding: 0;

    .v-label {
      font-weight: 400;
      color: white;
      letter-spacing: 0.03em;
      padding-right: 8px;
    }

    .v-input__slot {
      flex-direction: row-reverse;
    }
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
  top: 36px;
  left: 15px;
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
</style>
