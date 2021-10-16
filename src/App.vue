<template>
  <v-app>
    <LeftNav />
    <v-main>
      <div class="draggable-area-bar" />
      <router-view />
    </v-main>
  </v-app>
</template>

<script>
import { onMounted, ref, watch, provide, computed, inject } from '@vue/composition-api';

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
    onMounted(() => {
      console.log(
        '%cAtlas Started',
        'border: 2px solid white; background-color: #527cbf; border-radius: 5px; color: #cbdaf2; font-size: 2rem; font-weight: 800; padding: 4px; margin: 5px 0;'
      );
    });

    return {};
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
  z-index: 20000;
  width: 100%;
  height: 30px;
  -webkit-user-select: none;
  -webkit-app-region: drag;
}
</style>
