<!-- eslint-disable id-length -->
<template>
  <div style="height: 100%; display: flex; align-items: center">
    <v-progress-circular v-show="mapLoading || !masterMapData.initialized" size="100" indeterminate style="margin: auto" />
    <div v-show="!mapLoading || masterMapData.initialized" ref="mapContainer" v-resize="onResize" class="mapContainer" @keypress="onWDown" />
    <v-row no-gutters class="bottom-controls">
      <v-checkbox v-model="showEosZones" hide-details reverse class="hide-grid-checkbox mr-2" label="Eos Zones" />
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
      <v-tooltip top nudge-left="40" nudge-bottom="10">
        <template v-slot:activator="{ on }">
          <v-btn class="mr-2" icon v-on="on" @click="resetPan"><v-icon color="white">mdi-refresh</v-icon></v-btn>
        </template>
        <div>Reset Pan Speed</div>
      </v-tooltip>
    </v-row>
    <div ref="pointInfoContainer" class="point-info">
      <div ref="pointName" class="name">Point Name</div>
      <div ref="pointCoord" class="coord">[Coordinate]</div>
    </div>
    <ContextMenu ref="contextMenu" />
  </div>
</template>

<script>
import Stats from 'stats.js';
import Mousetrap from 'mousetrap';
import ContextMenu from './ContextMenu.vue';

import { ref, inject, toRefs } from '@vue/composition-api';
import { EventBus } from '@/eventBus';

import { useMap, MIN_PAN_SPEED, MAX_PAN_SPEED } from '@/models/useMap.js';
import { useCoordinates } from '@/models/useCoordinates.js';

export default {
  metaInfo() {
    return {
      title: 'Interactive Map',
      description: 'The Atlas Interactive Map',
      meta: [{ name: 'description', content: 'Atlas Interactive Map' }],
    };
  },

  name: 'InteractiveMap',
  components: { ContextMenu },

  setup() {
    const masterMapData = inject('masterMapData');
    const showInfoWidget = inject('showInfoWidget');
    let stats = null;

    const { init: initMap, resizeMap, panForward, panBackward, viewObject, updateGrid } = useMap(masterMapData);

    const intersects = toRefs(masterMapData).intersects;
    const showGrid = toRefs(masterMapData).showGrid;
    const showEosZones = toRefs(masterMapData.belts['p0']).showZones;

    const { scaleUpCoordinate } = useCoordinates();

    const focusedObject = ref(null);
    const mouseMoved = false;

    const hoveredElement = ref(null);

    const mapLoading = ref(true);

    return {
      stats,
      initMap,
      resizeMap,
      panForward,
      panBackward,
      masterMapData,
      showInfoWidget,
      MIN_PAN_SPEED,
      MAX_PAN_SPEED,
      intersects,
      scaleUpCoordinate,
      showGrid,
      showEosZones,
      updateGrid,
      mouseMoved,
      viewObject,
      hoveredElement,
      mapLoading,
    };
  },

  watch: {
    intersects() {
      if (this.hoveredElement?.tagName.toLowerCase() === 'canvas') {
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
        } else if (this.focusedObject.type === 'Mesh' && (this.focusedObject.celestialType === 'moon' || this.focusedObject.celestialType === 'planet')) {
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
    EventBus.$on('initMap', () => {
      this.createStats();
      this.initMap(this.$refs.mapContainer);
      this.mapLoading = false;
    });

    this.$nextTick(() => {
      // set up keybinds
      Mousetrap.bind('w', (event) => {
        if (this.hoveredElement?.tagName.toLowerCase() === 'canvas') {
          this.onWDown();
        }
      });

      Mousetrap.bind('s', (event) => {
        if (this.hoveredElement?.tagName.toLowerCase() === 'canvas') {
          this.onSDown();
        }
      });

      Mousetrap.bind('s', (event) => {
        if (this.hoveredElement?.tagName.toLowerCase() === 'canvas') {
          this.onSDown();
        }
      });

      // mouse events need to be handled vanilla
      window.addEventListener('mousemove', (event) => {
        if (this.$refs.pointInfoContainer) {
          this.$refs.pointInfoContainer.style.left = `${event.pageX + 25}px`;
          this.$refs.pointInfoContainer.style.top = `${event.pageY - 10}px`;
        }

        // eslint-disable-next-line prettier/prettier
        if(this.masterMapData?.mapMouse) {
          this.masterMapData.mapMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
          this.masterMapData.mapMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        }

        this.mouseMoved = true;

        this.hoveredElement = document.elementFromPoint(event.clientX, event.clientY);
      });

      window.addEventListener('wheel', (event) => {
        if (this.hoveredElement?.tagName.toLowerCase() !== 'canvas') {
          return;
        }

        if (event.deltaY > 0) {
          this.onSDown();
        } else {
          this.onWDown();
        }
      });

      window.addEventListener('mousedown', () => {
        if (this.hoveredElement?.tagName.toLowerCase() !== 'canvas') {
          return;
        }

        this.$refs.contextMenu?.close();
        this.mouseMoved = false;
      });

      window.addEventListener('mouseup', (event) => {
        if (this.hoveredElement?.tagName.toLowerCase() !== 'canvas') {
          return;
        }

        if (event.button === 2 && !this.mouseMoved) {
          this.handleRightClick();
        }

        if (event.button === 0 && !this.mouseMoved) {
          this.handleMouseClick();
        }
      });

      window.addEventListener('dblclick', () => {
        if (this.hoveredElement?.tagName.toLowerCase() !== 'canvas') {
          return;
        }
        this.handleDoubleClick();
      });
    });
  },

  methods: {
    createStats() {
      this.stats = new Stats();
      this.stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
      this.stats.domElement.classList = 'fps-tracker';
      this.$refs.mapContainer?.appendChild(this.stats.dom);
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
      this.panForward();
    },

    onSDown() {
      this.panBackward();
    },

    // Click action and context menu handlers
    handleMouseClick() {
      if (this.focusedObject !== undefined) {
        EventBus.$emit('setInfoWidgetData', this.focusedObject);
        this.showInfoWidget = true;
      }
    },

    handleRightClick() {
      if (this.focusedObject) {
        this.$refs.contextMenu.open(this.focusedObject);
      } else {
        this.$refs.contextMenu.open(null);
      }
    },

    handleDoubleClick() {
      if (this.focusedObject) {
        this.viewObject(this.focusedObject);
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
  width: calc(100vw);
  overflow: hidden;

  .mapCanvas {
    width: calc(100vw) !important;
  }
}

.bottom-controls {
  position: absolute;
  right: 90px;
  bottom: 0;
  width: calc(100% - 90px);
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
  pointer-events: none;

  .name {
    font-size: 16px;
  }

  .coord {
    font-size: 12px;
  }
}
</style>
