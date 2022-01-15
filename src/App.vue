<template>
  <v-app>
    <LeftNav v-if="showLeftNav" />
    <ConversionWidget ref="conversionWidget" />
    <WaypointManagementWidget ref="waypointManagementWidget" />
    <ImportWidget ref="importWidget" />
    <v-main>
      <div v-if="isElectron" class="draggable-area-bar" />
      <router-view />
    </v-main>
  </v-app>
</template>

<script>
import { onMounted, ref, watch, provide, computed, inject, toRefs } from '@vue/composition-api';
import { LANDING_ROUTE } from '@/router/routes';
import { debounce } from 'lodash';

import { useMap } from '@/models/useMap.js';
import { useCoordinates } from '@/models/useCoordinates.js';
import { useStorage } from '@/models/useStorage.js';
import { useToasts } from '@/models/useToasts.js';

import LeftNav from '@/components/LeftNav.vue';
import ConversionWidget from '@/components/widgets/ConversionWidget.vue';
import WaypointManagementWidget from '@/components/widgets/WaypointManagementWidget.vue';
import ImportWidget from '@/components/widgets/ImportWidget.vue';

export default {
  metaInfo: {
    // All subcomponent titles will be injected into this template.
    titleTemplate(title) {
      return `Atlas | ${title}`;
    },
  },

  components: { LeftNav, ConversionWidget, WaypointManagementWidget, ImportWidget },

  setup() {
    let userAgent = navigator.userAgent.toLowerCase();
    const isElectron = userAgent.indexOf(' electron/') > -1;
    provide('isElectron', isElectron);

    const showLeftNav = ref(true);
    const showControls = ref(false);
    const leftNavCondensed = ref(false);

    const showSaveDialog = ref(false);

    const showConversionWidget = ref(false);
    const showWaypointWidget = ref(false);
    const showWaypointCRUDWidget = ref(false);
    const showImportWidget = ref(false);

    onMounted(() => {
      if (isElectron) {
        console.log(
          '%cAtlas Electron Version Started',
          'border: 2px solid white; background-color: #527cbf; border-radius: 5px; color: #cbdaf2; font-size: 2rem; font-weight: 800; padding: 4px; margin: 5px 0;'
        );
      } else {
        console.log(
          '%cAtlas Web Version Started',
          'border: 2px solid white; background-color: #527cbf; border-radius: 5px; color: #cbdaf2; font-size: 2rem; font-weight: 800; padding: 4px; margin: 5px 0;'
        );
      }
      console.log(
        // eslint-disable-next-line quotes
        "%cIf you're reading this, then I may be able to use your help! Come check out the Discord server and say hi: https://discord.gg/Vafdx5JWBh",
        'font-size: 0.7rem; font-weight: 500;'
      );
    });

    useToasts();

    const { init: initCoordinates } = useCoordinates();
    const { masterPointsArray } = initCoordinates(isElectron);

    const { initMasterMapData, getPointData } = useMap();
    const masterMapData = initMasterMapData(masterPointsArray);

    if (!isElectron) {
      const { saveToLocalStorage } = useStorage();

      let points = toRefs(masterMapData).points;
      watch(
        points,
        debounce(() => {
          let pointData = getPointData(masterMapData);
          saveToLocalStorage(pointData);
        }, 1000)
      );
    } else {
      const { init: initStorage } = useStorage();
      initStorage(masterPointsArray);
    }

    provide('masterMapData', masterMapData);
    provide('showControls', showControls);
    provide('leftNavCondensed', leftNavCondensed);

    provide('showSaveDialog', showSaveDialog);

    provide('showConversionWidget', showConversionWidget);
    provide('showWaypointWidget', showWaypointWidget);
    provide('showWaypointCRUDWidget', showWaypointCRUDWidget);
    provide('showImportWidget', showImportWidget);

    return {
      isElectron,
      showLeftNav,
    };
  },

  watch: {
    $route: {
      handler() {
        this.showLeftNav = this.$route.name === LANDING_ROUTE;
      },
      immediate: true,
    },
  },
};
</script>

<style lang="scss">
@use 'sass:color';

@import '@/design/variables/_colors';

html {
  overflow: hidden;
}

#app {
  color: white;
  background: #333;
}

.draggable-area-bar {
  position: absolute;
  width: 100%;
  height: 30px;
  -webkit-user-select: none;
  -webkit-app-region: drag;
  background: #333;
}

/* width */
::-webkit-scrollbar {
  width: 5px;
}

/* Track */
::-webkit-scrollbar-track {
  background: #444;
  border-radius: 10px;
}

/* Handle */
::-webkit-scrollbar-thumb {
  background: $primary-blue;
  border-radius: 10px;
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: white;
}
</style>
