<!-- eslint-disable vue/valid-v-slot */ -->
<template>
  <div class="info-widget py-3 pl-3" :class="{ open: showInfoWidget, 'with-drag-bar': isElectron }">
    <v-row no-gutters>
      <div class="page-title">Point/Object Info</div>
      <v-spacer />
      <v-btn text @click="close"><v-icon>mdi-close</v-icon></v-btn>
    </v-row>

    <div class="page-title--sub"> Click a point or object to view information about it here. </div>

    <v-divider class="my-2 mr-3" />

    <v-row v-if="currentObject && currentObject.data" class="flex-column px-3 pt-5 pb-2">
      <div class="d-flex align-center">
        <div class="image-wrapper mr-2" :style="{ 'background-color': currentObject.data.color }">
          <img :src="ICON_MAP[currentObject.data.icon].workingFilePath" contain width="30px" height="30px" style="filter: invert(1)" />
        </div>
        <span class="info-name">{{ nameText }}</span>
      </div>

      <span class="info-type">{{ typeText }}</span>

      <div class="d-flex mt-3">
        <v-btn dense small outlined class="action-button" @click="onView">View</v-btn>
        <v-btn dense small outlined class="action-button ml-2" @click="onCopy">Copy Coord</v-btn>
        <v-btn v-if="currentObject.mesh && currentObject.mesh.type === 'Points'" dense small outlined class="action-button ml-2" @click="onEdit">Edit</v-btn>
        <v-btn v-if="currentObject.mesh && currentObject.mesh.type === 'Points'" dense small outlined class="action-button ml-2" @click="onDelete">
          Delete
        </v-btn>
      </div>

      <div class="description mt-5 pr-3" v-html="compiledDescription" />
    </v-row>

    <span v-else style="color: black">No data found. Click an object to load information.</span>
  </div>
</template>

<script>
import { ref, inject, watch, toRefs } from '@vue/composition-api';
import { EventBus } from '@/eventBus';
import { marked } from 'marked';

import { ICON_MAP } from '@/models/useIcons.js';
import { useCoordinates } from '@/models/useCoordinates.js';
import { useMap } from '@/models/useMap.js';

export default {
  name: 'InfoWidget',

  setup() {
    const isElectron = inject('isElectron');
    const masterMapData = inject('masterMapData');
    const showInfoWidget = inject('showInfoWidget');

    const currentObject = ref(null);

    const { scaleUpCoordinate, scaleDownCoordinate } = useCoordinates();
    const { viewObject, deletePoint } = useMap(masterMapData);

    const points = toRefs(masterMapData).points;

    return {
      isElectron,
      masterMapData,
      showInfoWidget,
      currentObject,
      ICON_MAP,
      scaleUpCoordinate,
      viewObject,
      deletePoint,
      points,
    };
  },

  computed: {
    nameText() {
      if (this.currentObject?.data) {
        return this.currentObject.data.name;
      } else {
        return 'Unsupported';
      }
    },

    typeText() {
      if (this.currentObject?.data) {
        let scaledUpData = this.scaleUpCoordinate(this.currentObject.data);
        return `${this.currentObject.data.type.replace(/_/g, ' ').toUpperCase()} [${scaledUpData.position.x}, ${scaledUpData.position.y}, ${
          scaledUpData.position.z
        }]`;
      } else {
        return 'Unkown';
      }
    },

    compiledDescription() {
      return marked(this.currentObject.data.description || '');
    },
  },

  watch: {
    points(newPoints) {
      if (this.showInfoWidget && this.currentObject) {
        setTimeout(() => {
          this.currentObject = newPoints.find((point) => {
            return point.id === this.currentObject.data.id;
          });
        }, 200);
      }
    },
  },

  mounted() {
    EventBus.$on('setInfoWidgetData', (object) => {
      if (object.type === 'Points') {
        let pointObject = this.masterMapData.points.find((point) => point.id === object.pointId);
        this.currentObject = pointObject;
      } else {
        this.currentObject = object;
      }
    });
  },

  methods: {
    close() {
      this.showInfoWidget = false;
    },

    onView() {
      this.viewObject(this.currentObject.mesh);
    },

    async onCopy() {
      try {
        let coord = 'Error';
        let scaledUpData = this.scaleUpCoordinate(this.currentObject.data);
        coord = `${scaledUpData.position.x},${scaledUpData.position.y},${scaledUpData.position.z}`;
        await navigator.clipboard.writeText(coord);
      } catch (error) {
        this.$toasted.global.alertError({ message: 'Copy failed' });
        console.error('Failed to copy: ', error);
      }
    },

    onEdit() {
      EventBus.$emit('openEditWidget', this.currentObject);
    },

    onDelete() {
      if (confirm('are you sure?')) {
        this.deletePoint(this.currentObject);
        this.currentObject = null;
        this.showInfoWidget = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@use 'sass:color';

@import '@/design/variables/_colors';

.info-widget {
  z-index: 10;
  background: color.change($primary-blue, $lightness: 60%, $saturation: 50%) !important;
  width: 400px;
  position: fixed;
  top: 0;
  right: -400px;
  transition: right 0.1s ease;
  border-bottom-left-radius: 16px;
  max-height: 635px;

  &.open {
    right: 0px;
  }
}

.with-drag-bar {
  margin-top: 30px;
}

.page-title {
  font-size: 24px;
  color: black;
  letter-spacing: 0.01em;

  &--sub {
    font-size: 14px;
    color: black;
    letter-spacing: 0.02em;
    font-weight: 800;

    a {
      color: black !important;
    }
  }
}

.action-button::v-deep {
  text-transform: none;
  letter-spacing: 0.02em;
  font-weight: 800;
  align-items: center;
  font-size: 12px;

  .v-file-input__text {
    color: black !important;
    line-height: 16px;
  }

  .v-input__slot {
    min-height: 28px !important;
    cursor: pointer;
  }

  fieldset {
    border-color: rgba(0, 0, 0, 0.87);
  }

  .v-text-field__slot {
    text-transform: none;
    letter-spacing: 0.02em;
    font-weight: 800;
  }

  .v-input__append-inner {
    margin: auto 0 !important;
  }
}

.image-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 8px;
}

.info-name {
  color: black;
  font-size: 24px;
}

.info-type {
  color: black;
  font-size: 16px;
  font-weight: 800;
  letter-spacing: 0.04em;
}

.description {
  color: black;
}
</style>
