<template>
  <v-app>
    <LeftNav v-if="showLeftNav" />
    <ConversionWidget ref="conversionWidget" />
    <WaypointManagementWidget ref="waypointManagementWidget" />
    <v-main>
      <div class="draggable-area-bar" />
      <router-view />
    </v-main>
  </v-app>
</template>

<script>
import { onMounted, ref, watch, provide, computed, inject, toRefs } from '@vue/composition-api';
import { LANDING_ROUTE } from '@/router/routes';

import { useMap } from '@/models/useMap.js';
import { useCoordinates } from '@/models/useCoordinates.js';
import { useStorage } from '@/models/useStorage.js';
import { useToasts } from '@/models/useToasts.js';

import LeftNav from '@/components/LeftNav.vue';
import ConversionWidget from '@/components/widgets/ConversionWidget.vue';
import WaypointManagementWidget from '@/components/widgets/WaypointManagementWidget.vue';

export default {
  metaInfo: {
    // All subcomponent titles will be injected into this template.
    titleTemplate(title) {
      return `Atlas | ${title}`;
    },
  },

  components: { LeftNav, ConversionWidget, WaypointManagementWidget },

  setup() {
    const showLeftNav = ref(true);
    const showControls = ref(false);
    const leftNavCondensed = ref(false);

    const showManageDialog = ref(false);
    const showSaveDialog = ref(false);
    const showImportDialog = ref(false);

    const showConversionWidget = ref(false);
    const showWaypointWidget = ref(false);
    const showWaypointCRUDWidget = ref(false);

    onMounted(() => {
      console.log(
        '%cAtlas Started',
        'border: 2px solid white; background-color: #527cbf; border-radius: 5px; color: #cbdaf2; font-size: 2rem; font-weight: 800; padding: 4px; margin: 5px 0;'
      );
    });

    useToasts();

    const { init: initStorage, pointStorage } = useStorage();

    const { init: initCoordinates } = useCoordinates();
    const { masterPointsArray } = initCoordinates();

    const { saveToLocalStorage } = useStorage();

    const { initMasterMapData, getPointData } = useMap();
    const masterMapData = initMasterMapData();

    let points = toRefs(masterMapData).points;
    watch(points, () => {
      let pointData = getPointData(masterMapData);
      saveToLocalStorage(pointData);
    });

    provide('masterMapData', masterMapData);
    provide('masterPointsArray', masterPointsArray);

    initStorage(masterPointsArray);

    watch(masterPointsArray, () => {
      masterMapData.pointsArray = masterPointsArray.value;
    });

    provide('masterMapData', masterMapData);
    provide('showControls', showControls);
    provide('leftNavCondensed', leftNavCondensed);

    provide('showManageDialog', showManageDialog);
    provide('showSaveDialog', showSaveDialog);
    provide('showImportDialog', showImportDialog);

    provide('showConversionWidget', showConversionWidget);
    provide('showWaypointWidget', showWaypointWidget);
    provide('showWaypointCRUDWidget', showWaypointCRUDWidget);

    return {
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
</style>
