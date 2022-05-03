<template>
  <div class="celestials-widget py-3" :class="{ open: showCelestialsWidget }">
    <div v-for="moon in moons" :key="moon.id" class="d-flex align-center pr-3" @click="onView(moon)">
      <v-icon :size="14" class="mr-1">mdi-eye-outline</v-icon>
      <span>{{ moon.data.name }}</span>
    </div>
  </div>
</template>

<script>
import { inject, toRefs } from '@vue/composition-api';
import { useMap } from '@/models/useMap.js';
import { EventBus } from '@/eventBus';

export default {
  setup() {
    const isElectron = inject('isElectron');
    const showCelestialsWidget = inject('showCelestialsWidget');
    const masterMapData = inject('masterMapData');

    const { moons } = toRefs(masterMapData);
    const { viewObject } = useMap(masterMapData);

    const onView = (celestial) => {
      EventBus.$emit('setInfoWidgetData', celestial.mesh);
      viewObject(celestial.mesh);
    };

    return {
      showCelestialsWidget,
      moons,
      onView,
    };
  },
};
</script>

<style lang="scss" scoped>
@use 'sass:color';

@import '@/design/variables/_colors';

.celestials-widget {
  pointer-events: none;
  background: transparent;
  width: 500px;
  position: absolute;
  top: 0;
  left: -400px;
  transition: left 0.1s ease;
  padding-left: 0px !important;
  z-index: 1;

  &.open {
    left: 0;
  }

  div {
    width: fit-content;
    font-size: 14px;
    color: white;
    pointer-events: all;
    padding-left: 70px;

    i {
      color: white;
    }

    &:hover {
      background: color.change($primary-blue, $lightness: 50%, $saturation: 50%);
      cursor: pointer;
      border-top-right-radius: 8px;
      border-bottom-right-radius: 8px;
    }
  }
}
</style>
