<template>
  <v-app>
    <LeftNav v-if="showLeftNav" />
    <ConversionWidget ref="conversionWidget" />
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script>
import { onMounted, ref, watch, provide, computed, inject } from '@vue/composition-api';
import { LANDING_ROUTE } from '@/router/routes';

import { masterMapData } from '@/models/useMap.js';
import { useCoordinates } from '@/models/useCoordinates.js';
import { useToasts } from '@/models/useToasts.js';

import LeftNav from '@/components/LeftNav.vue';
import ConversionWidget from '@/components/widgets/ConversionWidget.vue';

export default {
  metaInfo: {
    // All subcomponent titles will be injected into this template.
    titleTemplate(title) {
      return `Atlas | ${title}`;
    },
  },

  components: { LeftNav, ConversionWidget },

  setup() {
    const showLeftNav = ref(true);
    const showControls = ref(false);
    const leftNavCondensed = ref(false);

    const showManageDialog = ref(false);
    const showSaveDialog = ref(false);
    const showImportDialog = ref(false);

    const conversionWidgetOpen = ref(false);

    onMounted(() => {
      console.log(
        '%cAtlas Started',
        'border: 2px solid white; background-color: #527cbf; border-radius: 5px; color: #cbdaf2; font-size: 2rem; font-weight: 800; padding: 4px; margin: 5px 0;'
      );
    });

    useToasts();

    const { init: initCoordinates } = useCoordinates();
    const { masterPointsArray } = initCoordinates();

    provide('masterPointsArray', masterPointsArray);

    provide('masterMapData', masterMapData);
    provide('showControls', showControls);
    provide('leftNavCondensed', leftNavCondensed);

    provide('showManageDialog', showManageDialog);
    provide('showSaveDialog', showSaveDialog);
    provide('showImportDialog', showImportDialog);

    provide('conversionWidgetOpen', conversionWidgetOpen);

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
</style>
