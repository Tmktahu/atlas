<!-- eslint-disable vue/no-v-html -->
<template>
  <v-navigation-drawer v-model="leftNav" expand-on-hover permanent class="left-nav" @transitionend="onTransitionEnd">
    <v-layout column fill-height>
      <div class="testing" />
      <v-list class="pa-0" style="height: 100%">
        <v-list-item class="pa-0 flex-grow-0">
          <div class="left-nav-logo pa-2">
            <v-img :src="require('@/atlas/assets/Atlas-Logo-Transparent.png')" contain />
          </div>
          <span class="left-nav-logo-label pl-3">Atlas Map</span>
        </v-list-item>

        <v-divider />

        <v-list-item link :class="{ selected: showWaypointWidget }" @click="onManageWaypoint">
          <div class="left-nav-icon">
            <v-icon>mdi-map-marker</v-icon>
          </div>
          <span class="left-nav-label pl-5">Waypoints</span>
        </v-list-item>

        <v-list-item link :class="{ selected: showVectorWidget }" @click="onManageVectors">
          <div class="left-nav-icon">
            <v-icon style="transform: rotate(-45deg)">mdi-ray-start-arrow</v-icon>
          </div>
          <span class="left-nav-label pl-5">Vectors</span>
        </v-list-item>

        <v-tooltip :disabled="!needsToSave" right content-class="left-nav-tooltip">
          <template v-slot:activator="{ on }">
            <v-list-item link :class="{ selected: showSaveWidget }" @click="onSave" v-on="on">
              <div class="left-nav-icon">
                <v-icon>mdi-content-save-outline</v-icon>
                <v-icon v-if="needsToSave" class="notification-icon">mdi-circle</v-icon>
              </div>
              <span class="left-nav-label pl-5">{{ isElectron ? 'Save Data' : 'Download Data' }}</span>
            </v-list-item>
          </template>
          <!-- eslint-disable-next-line prettier/prettier -->
          <div class="d-flex flex-column" v-html="saveText" />
        </v-tooltip>

        <v-list-item link :class="{ selected: showImportWidget }" @click="onImportWaypoints">
          <div class="left-nav-icon">
            <v-icon>mdi-import</v-icon>
          </div>
          <span class="left-nav-label pl-5">Import Waypoints</span>
        </v-list-item>

        <v-list-item link :class="{ selected: showConversionWidget }" @click="onCoordinateConversion">
          <div class="left-nav-icon">
            <v-icon>mdi-swap-horizontal</v-icon>
          </div>
          <span class="left-nav-label pl-5">Coord Conversion</span>
        </v-list-item>
        <v-list-item link :class="{ selected: showCelestialsWidget }" @click="onCelestials">
          <div class="left-nav-icon">
            <v-icon>mdi-earth</v-icon>
          </div>
          <span class="left-nav-label pl-5">Celestial List</span>
        </v-list-item>

        <v-list-item link :class="{ selected: showControlsWidget }" @click="onControls">
          <div class="left-nav-icon">
            <v-icon>mdi-camera-control</v-icon>
          </div>
          <span class="left-nav-label pl-5">Controls</span>
        </v-list-item>

        <v-list-item link @click="onReload">
          <div class="left-nav-icon">
            <v-icon>mdi-refresh</v-icon>
          </div>
          <span class="left-nav-label pl-5">Reload</span>
        </v-list-item>
      </v-list>

      <v-spacer />

      <v-divider />
      <v-list class="pa-0">
        <v-list-item link style="margin-top: auto; margin-bottom: 0" @click="onDiscord">
          <div class="left-nav-icon">
            <v-icon>mdi-discord</v-icon>
          </div>
          <span class="left-nav-label pl-5">Discord</span>
        </v-list-item>

        <v-list-item link style="margin-top: auto; margin-bottom: 0" @click="onGithub">
          <div class="left-nav-icon">
            <v-icon>mdi-github</v-icon>
          </div>
          <span class="left-nav-label pl-5">Github</span>
        </v-list-item>

        <v-tooltip right absolute content-class="left-nav-tooltip about">
          <template v-slot:activator="{ on }">
            <v-list-item style="margin-top: auto; margin-bottom: 0; cursor: pointer" v-on="on">
              <div class="left-nav-icon">
                <v-icon>mdi-progress-question</v-icon>
              </div>
              <span class="left-nav-label pl-5">About</span>
            </v-list-item>
          </template>
          <div class="d-flex flex-column" v-html="aboutText" />
        </v-tooltip>
      </v-list>

      <ControlsWidget ref="controlsWidget" />
    </v-layout>
  </v-navigation-drawer>
</template>

<script>
import { ref, watch, inject, toRefs } from '@vue/composition-api';
import { useCoordinates } from '@/models/useCoordinates.js';

import ControlsWidget from '@/components/widgets/ControlsWidget.vue';

export default {
  name: 'LeftNav',

  components: { ControlsWidget },

  setup() {
    const isElectron = inject('isElectron');
    const leftNav = ref(true);
    const leftNavCondensed = inject('leftNavCondensed');

    const showConversionWidget = inject('showConversionWidget');

    const showControlsWidget = inject('showControlsWidget');
    const masterMapData = inject('masterMapData');

    const showWaypointWidget = inject('showWaypointWidget');
    const showImportWidget = inject('showImportWidget');
    const showSaveWidget = inject('showSaveWidget');
    const showVectorWidget = inject('showVectorWidget');
    const showCelestialsWidget = inject('showCelestialsWidget');

    const needsToSave = inject('needsToSave');

    const { scaleUpCoordinate } = useCoordinates();

    return {
      isElectron,
      leftNav,
      leftNavCondensed,
      showConversionWidget,
      masterMapData,
      showControlsWidget,
      scaleUpCoordinate,
      showWaypointWidget,
      showSaveWidget,
      showImportWidget,
      showVectorWidget,
      showCelestialsWidget,
      needsToSave,
    };
  },

  computed: {
    aboutText() {
      if (this.isElectron) {
        return `
          <div>Coded by <strong>Fryke#0746</strong> on Discord</div>
          <div>Atlas Version: ${process.env.VUE_APP_VERSION}</div>
          <div>Electron: ${process.versions.electron}</div>
          <div>Chrome: ${process.versions.chrome}</div>
          <div>Node.js: ${process.versions.node}</div>
        `;
      } else {
        return `
          <div>Coded by <strong>Fryke#0746</strong> on Discord</div>
          <div>Atlas Version: ${process.env.VUE_APP_VERSION}</div>
        `;
      }
    },

    saveText() {
      if (this.isElectron) {
        return 'Map data has changed.<br />You may want to save.';
      } else {
        return 'Your data has been saved to localstorage.<br />But you may want to save a copy anyway.';
      }
    },
  },

  methods: {
    onTransitionEnd(event) {
      this.leftNavCondensed = !event.srcElement.classList.contains('v-navigation-drawer--mini-variant');
    },

    onManageWaypoint() {
      this.showWaypointWidget = !this.showWaypointWidget;
    },

    onManageVectors() {
      this.showVectorWidget = !this.showVectorWidget;
    },

    onSave() {
      if (this.isElectron) {
        this.needsToSave = false;
        this.showSaveWidget = !this.showSaveWidget;
      } else {
        // The data we pull from masterMapData is scaled down. So we need to scale it up.
        let points = this.masterMapData.points.map((point) => {
          return this.scaleUpCoordinate(point.data);
        });

        let vectors = this.masterMapData.vectors.map((vector) => {
          return this.scaleUpCoordinate(vector.data);
        });

        let data = {
          version: process.env.VUE_APP_VERSION,
          points,
          vectors,
        };

        let stringifiedData = JSON.stringify(data, null, 2);

        let elem = document.createElement('a');
        let file = new Blob([stringifiedData], { type: 'text/plain' });
        elem.href = URL.createObjectURL(file);
        let today = new Date();
        elem.download = `atlas_data_${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}.json`;
        elem.click();

        this.needsToSave = false;
      }
    },

    onImportWaypoints() {
      this.showImportWidget = !this.showImportWidget;
    },

    onCelestials() {
      this.showCelestialsWidget = !this.showCelestialsWidget;
    },

    onCoordinateConversion() {
      this.showConversionWidget = !this.showConversionWidget;
    },

    onReload() {
      window.location.reload(false);
    },

    onControls() {
      this.showControlsWidget = !this.showControlsWidget;
    },

    onGithub() {
      if (this.isElectron) {
        require('electron').shell.openExternal('https://github.com/Tmktahu/atlas');
      } else {
        window.open('https://github.com/Tmktahu/atlas', '_blank').focus();
      }
    },

    onDiscord() {
      if (this.isElectron) {
        require('electron').shell.openExternal('https://discord.gg/Vafdx5JWBh');
      } else {
        window.open('https://discord.gg/Vafdx5JWBh', '_blank').focus();
      }
    },
  },
};
</script>

<style lang="scss">
@use 'sass:color';

@import '@/design/variables/_colors';

.left-nav-tooltip {
  left: 212px !important;
  background-color: color.change($primary-blue, $lightness: 80%) !important;

  div {
    color: black;
  }

  &.about {
    top: unset !important;
    bottom: 12px;
  }
}
</style>

<style lang="scss" scoped>
@use 'sass:color';

@import '@/design/variables/_colors';

.left-nav::v-deep {
  position: absolute;
  z-index: 9000;
  max-width: 200px;
  background-color: transparent !important;
  overflow: visible;

  &:before {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    background-color: color.change($primary-blue, $lightness: 60%, $saturation: 50%) !important;
    clip-path: polygon(
      0px 0px,
      100% 0px,
      100% calc(460px),
      calc(100% - 13px) calc(480px),
      calc(100% - 13px) calc(100% - 164px),
      100% calc(100% - 144px),
      100% 100%,
      0px 100%
    );
  }

  &:after {
    content: '';
    position: absolute;
    margin-left: 4px;
    width: 100%;
    height: 100%;
    background-color: color.change($primary-blue, $lightness: 60%, $saturation: 50%) !important;
    clip-path: polygon(
      0px 0px,
      100% 0px,
      100% calc(460px + 1px),
      calc(100% - 13px) calc(480px + 1px),
      calc(100% - 13px) calc(100% - 164px - 1px),
      100% calc(100% - 144px - 1px),
      100% 100%,
      calc(100% - 2px) 100%,
      calc(100% - 2px) calc(100% - 144px - 1px),
      calc(100% - 13px - 2px) calc(100% - 164px - 1px),
      calc(100% - 13px - 2px) calc(480px + 1px),
      calc(100% - 2px) calc(460px + 1px),
      calc(100% - 2px) 0px
    );
  }

  .selected {
    background: color.change($primary-blue, $lightness: 50%, $saturation: 50%);
  }

  .v-navigation-drawer__border {
    background-color: transparent !important;
  }
}

.left-nav-logo {
  display: flex;
  justify-content: center;
  width: 56px !important;
}

.left-nav-icon {
  position: relative;
  display: flex;
  justify-content: center;
  width: 100px !important;
  max-width: 24px;
  max-height: 24px;

  i {
    font-weight: 800;
    color: black;
  }

  .notification-icon {
    position: absolute;
    right: 0;
    bottom: 0;
    font-size: 10px;
    color: orangered;
  }
}

.left-nav-logo-label {
  font-size: 20px;
  font-weight: 800;
  letter-spacing: 0.03em;
  white-space: nowrap;
}

.left-nav-label {
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 0.03em;
  white-space: nowrap;
}

.testing {
  width: 20px;
  height: 20px;
  background: green;
}
</style>
