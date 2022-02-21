<template>
  <div ref="container" class="context-menu" :class="{ hide: !showMenu }">
    <v-btn v-if="meshObject" small text @click="onView">View</v-btn>
    <v-btn v-if="meshObject" small text @click="onCopy">Copy Coordinate</v-btn>
    <v-btn v-if="meshObject && isPoint" small text @click="onEditPoint">Edit Point</v-btn>
    <v-btn v-if="meshObject && isPoint" small text @click="onHidePoint">Hide Point</v-btn>
    <v-btn v-if="meshObject && isPoint" small text @click="onDeletePoint">Delete Point</v-btn>
    <v-btn v-if="!meshObject" small text @click="onViewOrigin">View Origin</v-btn>
    <v-btn v-if="!meshObject" small text @click="onShowAll">Show All Points</v-btn>
    <v-btn v-if="!meshObject" small text @click="onResetDefaults">Reset Default Points</v-btn>
    <ConfirmationDialog ref="confirmationDialog" />
  </div>
</template>

<script>
import { ref, inject } from '@vue/composition-api';
import { EventBus } from '@/eventBus';

import { useCoordinates } from '@/models/useCoordinates.js';
import { useMap } from '@/models/useMap.js';

import ConfirmationDialog from '@/components/dialogs/ConfirmationDialog.vue';

export default {
  name: 'ContextMenu',
  components: { ConfirmationDialog },

  setup() {
    const showMenu = ref(false);
    const meshObject = ref(null);

    const masterMapData = inject('masterMapData');

    const { scaleUpCoordinate } = useCoordinates();

    const { viewObject, showHidePoint, deletePoint, showAllPoints, resetDefaultPoints } = useMap(masterMapData);

    return {
      showMenu,
      meshObject,
      masterMapData,
      scaleUpCoordinate,
      resetDefaultPoints,
      viewObject,
      showHidePoint,
      showAllPoints,
      deletePoint,
    };
  },

  computed: {
    isPoint() {
      return this.meshObject.type === 'Points';
    },
  },

  methods: {
    open(meshObject) {
      this.meshObject = meshObject;
      if (this.meshObject?.type === 'Points') {
        this.pointObject = this.masterMapData.points.find((point) => {
          return this.meshObject.pointId === point.data.id;
        });
      }

      this.$refs.container.style.left = `${event.pageX + 25}px`;
      this.$refs.container.style.top = `${event.pageY + 35}px`;

      this.showMenu = true;
    },

    close() {
      this.showMenu = false;
      this.meshObject = null;
    },

    // Actions

    onView() {
      this.viewObject(this.meshObject);
      this.close();
    },

    onHidePoint() {
      this.showHidePoint(this.meshObject.pointId);
      this.close();
    },

    onEditPoint() {
      EventBus.$emit('editPoint', this.pointObject);
      this.close();
    },

    onDeletePoint() {
      this.$refs.confirmationDialog.open({
        titleText: 'Are you sure?',
        descriptionText: 'You will be unable to recover deleted points.',
        yesText: 'Yes',
        noText: 'No',
        onYes: () => {
          this.deletePoint(this.pointObject);
          this.$refs.confirmationDialog.close();
        },
      });
      this.close();
    },

    async onCopy() {
      try {
        if (this.meshObject && this.meshObject.position) {
          let coord = null;
          if (this.meshObject.type === 'Mesh') {
            coord = { position: this.meshObject.position };
          } else if (this.meshObject.type === 'Points') {
            coord = {
              position: {
                x: this.meshObject.geometry.attributes.position.array[0],
                y: -this.meshObject.geometry.attributes.position.array[2],
                // eslint-disable-next-line id-length
                z: this.meshObject.geometry.attributes.position.array[1],
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

    onViewOrigin() {
      // eslint-disable-next-line id-length
      this.viewObject({ position: { x: 0, y: 0, z: 0 } });
    },

    onShowAll() {
      this.showAllPoints();
      this.close();
    },

    onResetDefaults() {
      this.$refs.confirmationDialog.open({
        titleText: 'Are you sure?',
        descriptionText: 'This deletes and re-adds the default waypoints based on their name. Any changes you have made will be overridden.',
        yesText: 'Yes',
        noText: 'No',
        onYes: () => {
          this.resetDefaultPoints();
          this.close();
          this.$refs.confirmationDialog.close();
        },
      });
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
