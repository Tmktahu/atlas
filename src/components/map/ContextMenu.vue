<template>
  <div ref="container" class="context-menu" :class="{ hide: !showMenu }">
    <v-btn v-if="object" small text @click="onCopy">Copy Coordinate</v-btn>
    <v-btn v-if="object && isPoint" small text @click="onHide">Hide Point</v-btn>
    <v-btn v-if="!object" small text @click="onResetDefaults">Reset Default Points</v-btn>
  </div>
</template>

<script>
import { ref, inject } from '@vue/composition-api';

import { useCoordinates } from '@/models/useCoordinates.js';
import { useMap } from '@/models/useMap.js';

export default {
  name: 'ContextMenu',

  setup() {
    const showMenu = ref(false);
    const object = ref(null);

    const masterMapData = inject('masterMapData');
    const masterPointsArray = inject('masterPointsArray');

    const { scaleUpCoordinate, setupInitialPoints } = useCoordinates();

    const { showHidePoint, mergePoints } = useMap(masterMapData, masterPointsArray);

    return {
      showMenu,
      object,
      scaleUpCoordinate,
      setupInitialPoints,
      mergePoints,
      showHidePoint,
    };
  },

  computed: {
    isPoint() {
      return this.object.type === 'Points';
    },
  },

  methods: {
    open(object) {
      this.object = object;

      this.$refs.container.style.left = `${event.pageX + 25}px`;
      this.$refs.container.style.top = `${event.pageY + 35}px`;

      this.showMenu = true;
    },

    close() {
      this.showMenu = false;
      this.object = null;
    },

    // Actions

    async onCopy() {
      try {
        if (this.object && this.object.position) {
          let coord = null;
          if (this.object.type === 'Mesh') {
            coord = { position: this.object.position };
          } else if (this.object.type === 'Points') {
            // eslint-disable-next-line id-length
            coord = {
              position: {
                x: this.object.geometry.attributes.position.array[0],
                y: -this.object.geometry.attributes.position.array[2],
                // eslint-disable-next-line id-length
                z: this.object.geometry.attributes.position.array[1],
              },
            };
          }
          let scaledCoord = this.scaleUpCoordinate(coord);
          let output = `${scaledCoord.position.x},${scaledCoord.position.y},${scaledCoord.position.z}`;
          await navigator.clipboard.writeText(output);
          this.$toasted.global.alertInfo({ message: 'Copied Coordinate to Clipboard', timeout: 1000 });
          this.close();
        }
      } catch (error) {
        this.$toasted.global.alertError({ message: 'Copy failed' });
        console.error('Failed to copy: ', error);
      }
    },

    onHide() {
      this.showHidePoint(this.object.pointId);
    },

    onResetDefaults() {
      console.log('trying to reset defaults');
      let defaultPoints = this.setupInitialPoints();
      this.mergePoints(defaultPoints);
      this.close();
    },
  },
};
</script>

<style lang="scss" scoped>
@use 'sass:color';

@import '@/design/variables/_colors';

.context-menu {
  display: flex;
  flex-direction: column;
  border: 1px solid black;
  background: color.change($primary-blue, $lightness: 60%, $saturation: 60%);
  top: 0;
  position: fixed;
  z-index: 10;

  button {
    justify-content: flex-start;
  }

  &.hide {
    display: none;
  }
}
</style>
