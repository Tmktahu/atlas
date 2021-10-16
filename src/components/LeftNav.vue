<template>
  <v-navigation-drawer v-model="leftNav" expand-on-hover permanent app class="left-nav">
    <v-layout column fill-height>
      <v-list class="pa-0" style="height: 100%">
        <v-list-item class="flex-grow-0">
          <div class="left-nav-icon">
            <v-img :src="require('@/assets/logo.png')" contain />
          </div>
          <span class="left-nav-label pl-5">Atlas</span>
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

        <v-list-item link @click="close">
          <div class="left-nav-icon">
            <v-icon>mdi-close</v-icon>
          </div>
          <span class="left-nav-label pl-5">Exit</span>
        </v-list-item>
      </v-list>

      <v-spacer />

      <v-divider />
      <v-list class="pa-0">
        <v-list-item link style="margin-top: auto; margin-bottom: 0">
          <div class="left-nav-icon">
            <v-icon>mdi-github</v-icon>
          </div>
          <span class="left-nav-label pl-5">Github Repo</span>
        </v-list-item>
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

  methods: {
    close() {
      let window = electron.remote.getCurrentWindow();
      if (window.isDevToolsOpened()) {
        window.closeDevTools();
      }
      window.close();
    },
  },
};
</script>

<style lang="scss" scoped>
.left-nav {
  max-width: 200px;
  background-color: #629bbd !important;
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

.left-nav-label {
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 0.03em;
  white-space: nowrap;
}
</style>
