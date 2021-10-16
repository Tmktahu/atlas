<template>
  <v-navigation-drawer v-model="leftNav" expand-on-hover permanent app class="left-nav">
    <v-layout column fill-height>
      <v-list class="pa-0" style="height: 100%">
        <v-list-item class="pa-0 flex-grow-0">
          <div class="left-nav-logo pa-2">
            <v-img :src="require('@/assets/Atlas-Logo-Large-White-A.png')" contain />
          </div>
          <span class="left-nav-logo-label pl-8">Atlas</span>
        </v-list-item>

        <v-divider />

        <v-list-item link>
          <div class="left-nav-icon">
            <v-icon>mdi-plus</v-icon>
          </div>
          <span class="left-nav-label pl-5">New Waypoint</span>
        </v-list-item>

        <v-list-item link>
          <div class="left-nav-icon">
            <v-icon>mdi-import</v-icon>
          </div>
          <span class="left-nav-label pl-5">Import Waypoints</span>
        </v-list-item>

        <v-list-item link>
          <div class="left-nav-icon">
            <v-icon>mdi-export</v-icon>
          </div>
          <span class="left-nav-label pl-5">Export Waypoints</span>
        </v-list-item>

        <v-list-item link>
          <div class="left-nav-icon">
            <v-icon>mdi-refresh</v-icon>
          </div>
          <span class="left-nav-label pl-5">Refresh</span>
        </v-list-item>
      </v-list>

      <v-spacer />

      <v-divider />
      <v-list class="pa-0">
        <v-list-item link style="margin-top: auto; margin-bottom: 0">
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
  </v-navigation-drawer>
</template>

<script>
import { ref } from '@vue/composition-api';

import electron from 'electron';

export default {
  name: 'LeftNav',

  setup() {
    const leftNav = ref(true);
    const mini = ref(false);

    return {
      leftNav,
      mini,
    };
  },

  computed: {
    aboutText() {
      return `
        <div>Coded by <strong>Fryke#0746</strong> on Discord</div>
        <div>Atlas Version: ${process.env.VUE_APP_VERSION}</div>
        <div>Electron: ${process.versions.electron}</div>
        <div>Chrome: ${process.versions.chrome}</div>
        <div>Node.js: ${process.versions.node}</div>
      `;
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
  background-color: color.change($primary-blue, $lightness: 80) !important;

  div {
    color: black;
  }
}
</style>

<style lang="scss" scoped>
@use 'sass:color';

@import '@/design/variables/_colors';

.left-nav {
  max-width: 200px;
  background-color: color.change($primary-blue, $lightness: 60, $saturation: 50) !important;
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
