<template>
  <div class="controls-widget py-3 px-2" :class="{ open: showControlsWidget }">
    <div v-if="isElectron">
      Local Storage File:
      <span>{{ localStorageText }}</span>
    </div>
    <div>W: <span>Pan Forward</span></div>
    <div>S: <span>Pan Backward</span></div>
    <div>A: <span>Pan Left</span></div>
    <div>D: <span>Pan Right</span></div>
    <div>Space: <span>Pan Up</span></div>
    <div>L-Shift: <span>Pan Down</span></div>
    <div>L-Click Hold + R-Click Hold: <span>Rotate Camera</span></div>
    <div>R-Click Hold: <span>Pan Camera</span></div>
    <div>R-Click: <span>Context Menu</span></div>
    <div>L-Click: <span>Select Point</span></div>
  </div>
</template>

<script>
import { inject } from '@vue/composition-api';
import { useStorage } from '@/models/useStorage.js';

export default {
  setup() {
    const isElectron = inject('isElectron');
    const showControlsWidget = inject('showControlsWidget');

    const { dataStoragePath } = useStorage(isElectron);

    return {
      isElectron,
      showControlsWidget,
      dataStoragePath,
    };
  },

  computed: {
    localStorageText() {
      let path = require('path');
      let absolutePath = path.resolve(this.dataStoragePath);
      return absolutePath;
    },
  },

  methods: {
    toggle() {
      this.showControlsWidget = !this.showControlsWidget;
    },
  },
};
</script>

<style lang="scss" scoped>
@use 'sass:color';

@import '@/design/variables/_colors';

.controls-widget {
  pointer-events: none !important;
  background: transparent;
  pointer-events: none;
  width: 70vw;
  position: absolute;
  top: 50vh;
  left: -400px;
  transition: left 0.1s ease;
  padding-left: 70px !important;
  z-index: -1;

  div {
    pointer-events: none !important;
  }

  &.open {
    left: 100%;
  }

  div {
    width: fit-content;
    font-size: 14px;
    color: white;
    pointer-events: all;

    span {
      color: color.change($primary-blue, $lightness: 60%, $saturation: 80%);
    }
  }

  &:after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    margin-left: -60px;
    width: 100%;
    height: 100%;
    z-index: -1;
    background-color: color.change($primary-blue, $lightness: 60%, $saturation: 50%) !important;
    clip-path: polygon(
      0px 0px,
      63px 10px,
      63px calc(100% - 10px),
      0px 100%,
      0px calc(100% - 3px),
      calc(63px - 10px) calc(100% - 10px - 3px),
      calc(63px - 10px) calc(100% - 10px - 20px),
      calc(63px - 4px) calc(100% - 10px - 35px),
      calc(63px - 4px) calc(10px + 35px),
      calc(63px - 10px) calc(10px + 20px),
      calc(63px - 10px) calc(10px + 3px),
      0px 3px
    );
  }
}
</style>
