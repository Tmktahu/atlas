<template>
  <v-app>
    <LeftNav v-if="showLeftNav" />
    <v-main>
      <div class="draggable-area-bar" />
      <router-view />
    </v-main>
  </v-app>
</template>

<script>
import { onMounted, ref, watch, provide, computed, inject } from '@vue/composition-api';
import { LANDING_ROUTE } from '@/router/routes';

import { useMap } from '@/models/useMap.js';
import { useStorage } from '@/models/useStorage.js';
import { useToasts } from '@/models/useToasts.js';

import LeftNav from '@/components/LeftNav.vue';

export default {
  metaInfo: {
    // All subcomponent titles will be injected into this template.
    titleTemplate(title) {
      return `Atlas | ${title}`;
    },
  },

  components: { LeftNav },

  setup() {
    const showLeftNav = ref(true);
    const showControls = ref(false);
    const leftNavCondensed = ref(false);

    onMounted(() => {
      console.log(
        '%cAtlas Started',
        'border: 2px solid white; background-color: #527cbf; border-radius: 5px; color: #cbdaf2; font-size: 2rem; font-weight: 800; padding: 4px; margin: 5px 0;'
      );
    });

    useToasts();

    const { mapData } = useMap();

    const { init: initStorage, pointStorage } = useStorage();

    mapData.pointsArray = initStorage();

    watch(pointStorage, () => {
      mapData.pointsArray = pointStorage.value;
      mapData.isReady = true;
    });

    provide('mapData', mapData);
    provide('showControls', showControls);
    provide('leftNavCondensed', leftNavCondensed);

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
