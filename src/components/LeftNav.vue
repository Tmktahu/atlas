<template>
  <v-navigation-drawer v-model="leftNav" expand-on-hover permanent app class="left-nav" @transitionend="onTransitionEnd">
    <v-layout column fill-height>
      <v-list class="pa-0" style="height: 100%">
        <v-list-item class="pa-0 flex-grow-0">
          <div class="left-nav-logo pa-2">
            <v-img :src="require('@/assets/Atlas-Logo-Transparent.png')" contain />
          </div>
          <span class="left-nav-logo-label pl-3">Atlas Map</span>
        </v-list-item>

        <v-divider />

        <v-list-item link @click="onManageWaypoint">
          <div class="left-nav-icon">
            <v-icon>mdi-map-marker</v-icon>
          </div>
          <span class="left-nav-label pl-5">Waypoints</span>
        </v-list-item>

        <v-list-item link @click="onSave">
          <div class="left-nav-icon">
            <v-icon>mdi-content-save-outline</v-icon>
          </div>
          <span class="left-nav-label pl-5">Save Waypoints</span>
        </v-list-item>

        <v-list-item link @click="onImportWaypoints">
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

        <v-list-item link :class="{ selected: showControls }" @click="onControls">
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

        <v-tooltip right absolute content-class="about-tooltip">
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
    </v-layout>
    <SaveDialog ref="saveDialog" />
    <ImportDialog ref="importDialog" />
  </v-navigation-drawer>
</template>

<script>
import { ref, watch, inject, toRefs } from '@vue/composition-api';
import { MANAGE_WAYPOINT_ROUTE, IMPORT_WAYPOINTS_ROUTE } from '@/router/routes';

import ImportDialog from '@/components/dialogs/ImportDialog.vue';
import SaveDialog from '@/components/dialogs/SaveDialog.vue';

import { useCoordinates } from '@/models/useCoordinates.js';

export default {
  name: 'LeftNav',
  components: { ImportDialog, SaveDialog },

  setup() {
    const isElectron = inject('isElectron');
    const leftNav = ref(true);
    const leftNavCondensed = inject('leftNavCondensed');

    const showConversionWidget = inject('showConversionWidget');

    const showControls = inject('showControls');
    const masterMapData = inject('masterMapData');

    const showWaypointWidget = inject('showWaypointWidget');

    const { scaleUpCoordinate } = useCoordinates();

    return {
      isElectron,
      leftNav,
      leftNavCondensed,
      showConversionWidget,
      masterMapData,
      showControls,
      scaleUpCoordinate,
      showWaypointWidget,
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
  },

  methods: {
    onTransitionEnd(event) {
      this.leftNavCondensed = !event.srcElement.classList.contains('v-navigation-drawer--mini-variant');
    },

    onManageWaypoint() {
      this.showWaypointWidget = true;
    },

    onSave() {
      if (this.isElectron) {
        this.$refs.saveDialog.open();
      } else {
        let points = this.masterMapData.points.map((point) => {
          return point.data;
        });

        let data = JSON.stringify(points, null, 2);

        let elem = document.createElement('a');
        let file = new Blob([data], { type: 'text/plain' });
        elem.href = URL.createObjectURL(file);
        let today = new Date();
        elem.download = `waypoint_data_${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}.json`;
        elem.click();
      }
    },

    onImportWaypoints() {
      this.$refs.importDialog.open();
    },

    onCoordinateConversion() {
      this.showConversionWidget = !this.showConversionWidget;
    },

    onReload() {
      window.location.reload(false);
    },

    onControls() {
      this.showControls = !this.showControls;
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

.about-tooltip {
  top: unset !important;
  bottom: 12px;
  left: 212px !important;
  background-color: color.change($primary-blue, $lightness: 80%) !important;

  div {
    color: black;
  }
}
</style>

<style lang="scss" scoped>
@use 'sass:color';

@import '@/design/variables/_colors';

.left-nav::v-deep {
  max-width: 200px;
  background-color: color.change($primary-blue, $lightness: 60%, $saturation: 50%) !important;

  .selected {
    background: color.change($primary-blue, $lightness: 50%, $saturation: 50%);
  }
}

.left-nav-logo {
  display: flex;
  justify-content: center;
  width: 56px !important;
}

.left-nav-icon {
  display: flex;
  justify-content: center;
  width: 100px !important;
  max-width: 24px;
  max-height: 24px;

  i {
    font-weight: 800;
    color: black;
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
</style>
