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
        <div v-if="currentObject.data.icon" class="image-wrapper mr-2" :style="{ 'background-color': currentObject.data.color }">
          <img :src="ICON_MAP[currentObject.data.icon].workingFilePath" contain width="30px" height="30px" style="filter: invert(1)" />
        </div>
        <div v-else-if="currentObject.data.type === 'moon'" class="image-wrapper mr-2" :style="{ 'background-color': currentObject.data.color }">
          <v-icon color="white" width="30px" height="30px">mdi-moon-waning-crescent</v-icon>
        </div>
        <div v-else-if="currentObject.data.type === 'planet'" class="image-wrapper mr-2" :style="{ 'background-color': currentObject.data.color }">
          <v-icon color="white" width="30px" height="30px">mdi-earth</v-icon>
        </div>
        <span class="info-name">{{ nameText }}</span>
      </div>

      <span class="info-type">{{ typeText }}</span>

      <div v-if="currentObject.data && currentObject.data.type === 'moon'" class="info-named-by">
        <span v-if="currentObject.data.namedBy">Named by {{ currentObject.data.namedBy }}</span>
        <span v-if="currentObject.data.namedAt"> on {{ currentObject.data.namedAt }}</span>
      </div>

      <div class="d-flex mt-3">
        <v-btn dense small outlined class="action-button" @click="onView">View</v-btn>
        <v-btn dense small outlined class="action-button ml-2" @click="onCopy">Copy Coord</v-btn>
        <v-btn v-if="currentObject.mesh && currentObject.mesh.type === 'Points'" dense small outlined class="action-button ml-2" @click="onEdit">Edit</v-btn>
        <v-btn v-if="currentObject.mesh && currentObject.mesh.type === 'Points'" dense small outlined class="action-button ml-2" @click="onDelete">
          Delete
        </v-btn>
        <v-btn v-if="beltObject" dense small outlined class="action-button ml-2" @click="onToggleBeltInfo">
          {{ showBeltInfo ? 'View Description' : 'View Belt Info' }}
        </v-btn>
      </div>

      <div v-if="showBeltInfo && currentObject.id === 'p0'" class="pr-3 mt-2">
        <div class="belt-zone-info zone-1 px-1">
          <span class="zone-name">Zone 1</span>
          <div class="ore-info d-flex justify-space-between pb-1">
            <div class="shell-wrapper valkite"><span class="ore-type bastium">Bastium</span>Valkite</div>
            <div class="shell-wrapper ice"><span class="ore-type vokarium">Vokarium</span>Ice</div>
            <div class="shell-wrapper ice"><span class="ore-type nhurgite">Nhurgite</span>Ice</div>
            <div class="shell-wrapper ajatite"><span class="ore-type charodium">Charodium</span>Ajatite</div>
          </div>
        </div>

        <div class="belt-zone-info zone-2 px-1 mt-1">
          <span class="zone-name">Zone 2</span>
          <div class="ore-info d-flex justify-space-between pb-1">
            <div class="shell-wrapper valkite"><span class="ore-type bastium">Bastium</span>Valkite</div>
            <div class="shell-wrapper valkite"><span class="ore-type vokarium">Vokarium</span>Valk/Aja</div>
            <div class="shell-wrapper ajatite"><span class="ore-type nhurgite">Nhurgite</span>Ajatite</div>
            <div class="shell-wrapper valkite"><span class="ore-type exorium">Exorium</span>Valk/Aja</div>
            <div class="shell-wrapper valkite"><span class="ore-type aegisium">Aegisium</span>Valkite</div>
          </div>
        </div>

        <div class="belt-zone-info zone-3 px-1 mt-1">
          <span class="zone-name">Zone 3</span>
          <div class="ore-info d-flex justify-space-between pb-1">
            <div class="shell-wrapper ice"><span class="ore-type nhurgite">Nhurgite</span>Ice</div>
            <div class="shell-wrapper ice"><span class="ore-type exorium">Exorium</span>Ice</div>
            <div class="shell-wrapper ice"><span class="ore-type aegisium">Aegisium</span>Ice</div>
            <div class="shell-wrapper ice"><span class="ore-type arkanium">Arkanium</span>Ice</div>
          </div>
        </div>

        <div class="belt-zone-info zone-4 px-1 mt-1">
          <span class="zone-name">Zone 4</span>
          <div class="ore-info d-flex justify-space-between pb-1">
            <div class="shell-wrapper ajatite"><span class="ore-type bastium">Bastium</span>Ajatite</div>
            <div class="shell-wrapper ajatite"><span class="ore-type arkanium">Arkanium</span>Ajatite</div>
            <div class="shell-wrapper ajatite"><span class="ore-type karnite">Karnite</span>Ajatite</div>
            <div class="shell-wrapper ajatite"><span class="ore-type kutonium">Kutonium</span>Ajatite</div>
          </div>
        </div>

        <div class="belt-zone-info zone-5 px-1 mt-1">
          <span class="zone-name">Zone 5</span>
          <div class="ore-info d-flex justify-space-between pb-1">
            <div class="shell-wrapper valkite"><span class="ore-type charodium">Charodium</span>Valkite</div>
            <div class="shell-wrapper valkite"><span class="ore-type karnite">Karnite</span>Valkite</div>
            <div class="shell-wrapper valkite"><span class="ore-type kutonium">Kutonium</span>Valkite</div>
            <div class="shell-wrapper valkite"><span class="ore-type corazium">Corazium</span>Valkite</div>
          </div>
        </div>
      </div>

      <div v-else-if="showBeltInfo" class="pt-3 pr-3" style="color: black">
        No belt data prepared for this moon.<br /><br />
        Check back later or contact <strong>Fryke#0746</strong> on Discord if you have information to contribute.
      </div>

      <div v-else class="description mt-3 pr-3" v-html="compiledDescription" />
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
    const beltObject = ref(null);
    const showBeltInfo = ref(false);

    const { scaleUpCoordinate, scaleDownCoordinate } = useCoordinates();
    const { viewObject, deletePoint } = useMap(masterMapData);

    const points = toRefs(masterMapData).points;

    return {
      isElectron,
      masterMapData,
      showInfoWidget,
      currentObject,
      beltObject,
      showBeltInfo,
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
      return marked(this.currentObject.data.description || 'No description set.');
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
      if (object) {
        this.showBeltInfo = false;
        this.beltObject = null;
        if (object.type === 'Points') {
          let pointObject = this.masterMapData.points.find((point) => point.id === object.pointId);
          this.currentObject = pointObject;
        } else if (object.celestialType === 'moon' || object.celestialType === 'planet') {
          let moonObject = this.masterMapData.moons.find((moon) => moon.id === object.objectId);
          this.currentObject = moonObject;
          this.beltObject = this.masterMapData.belts[this.currentObject.data.id];
        } else {
          this.currentObject = object;
        }
      }
    });

    EventBus.$on('viewBeltInfo', () => {
      this.showBeltInfo = true;
      this.showInfoWidget = true;
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
      EventBus.$emit('editPoint', this.currentObject);
    },

    onDelete() {
      if (confirm('Are you sure you want to delete this waypoint?')) {
        this.deletePoint(this.currentObject);
        this.currentObject = null;
        this.showInfoWidget = false;
      }
    },

    onToggleBeltInfo() {
      this.showBeltInfo = !this.showBeltInfo;
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

.info-named-by {
  color: black;
  font-size: 14px;
}

.description {
  color: black;
}

.belt-zone-info {
  display: flex;
  flex-direction: column;
  border-radius: 4px;
  border: 1px solid black;

  .zone-name {
    color: black;
    font-size: 20px;
    font-weight: 600;
    width: 100%;
    text-align: center;
  }

  .ore-info {
    color: black;
    font-size: 14px;

    .shell-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 2px 2px 0px 2px;
      border-radius: 4px;
      font-weight: 600;
      border: 1px solid black;
    }

    .valkite {
      background-color: #b67b41;
    }

    .ice {
      background-color: #4bd8ff;
    }

    .ajatite {
      background-color: #b3accc;
    }

    .ore-type {
      font-weight: 600;
      border: 1px solid black;
      border-radius: 4px;
      padding: 0 4px;

      &.bastium {
        background-color: #8a8616;
      }

      &.vokarium {
        background-color: #7a98b9;
      }

      &.nhurgite {
        background-color: #0d9275;
      }

      &.charodium {
        background-color: #da3820;
      }

      &.exorium {
        background-color: #e06411;
      }

      &.aegisium {
        background-color: #90a35f;
      }

      &.arkanium {
        background-color: #03b864;
      }

      &.karnite {
        background-color: #6a8bec;
      }

      &.kutonium {
        background-color: #f5b732;
      }

      &.corazium {
        background-color: #a0bd14;
      }
    }
  }

  &.zone-1 {
    background-color: color.change(#2eff66, $alpha: 0.7);
  }

  &.zone-2 {
    background-color: color.change(#2e74ff, $alpha: 0.7);
  }

  &.zone-3 {
    background-color: color.change(#ff902e, $alpha: 0.7);
  }

  &.zone-4 {
    background-color: color.change(#ff2121, $alpha: 0.6);
  }

  &.zone-5 {
    background-color: color.change(#931fff, $alpha: 0.6);
  }
}
</style>
