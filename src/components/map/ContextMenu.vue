<template>
  <div ref="container" class="context-menu" :class="{ hide: !showMenu }">
    <v-btn v-if="meshObject && !isVector" small text @click="onView">View</v-btn>
    <v-btn v-if="meshObject && !isVector" small text @click="onCopy">Copy Coordinate</v-btn>
    <v-btn v-if="meshObject && isVector" small text @click="onCopyOnVector">Copy Coordinate Here</v-btn>
    <v-btn v-if="meshObject && isVector" small text @click="onEditVector">Edit Vector</v-btn>
    <v-btn v-if="meshObject && isVector" small text @click="onDeleteVector">Delete Vector</v-btn>
    <v-btn v-if="meshObject && isPoint" small text @click="onEditPoint">Edit Point</v-btn>
    <v-btn v-if="meshObject && isPoint" small text @click="onHidePoint">Hide Point</v-btn>
    <v-btn v-if="meshObject && isPoint" small text @click="onDeletePoint">Delete Point</v-btn>
    <v-btn v-if="meshObject && isMoon && hasBelt" small text @click="onViewBeltInfo">View Belt Info</v-btn>
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
    const intersect = ref(null);
    const meshObject = ref(null);
    const pointObject = ref(null);
    const vectorObject = ref(null);
    const moonObject = ref(null);

    const masterMapData = inject('masterMapData');

    const { scaleUpCoordinate } = useCoordinates();

    const { viewObject, showHidePoint, deletePoint, showAllPoints, resetDefaultPoints, deleteVector } = useMap(masterMapData);

    return {
      showMenu,
      intersect,
      meshObject,
      pointObject,
      vectorObject,
      moonObject,
      masterMapData,
      scaleUpCoordinate,
      resetDefaultPoints,
      viewObject,
      showHidePoint,
      showAllPoints,
      deletePoint,
      deleteVector,
    };
  },

  computed: {
    isPoint() {
      return this.meshObject.type === 'Points';
    },

    isMoon() {
      return this.meshObject.celestialType === 'planet' || this.meshObject.celestialType === 'moon';
    },

    isVector() {
      return this.meshObject.type === 'Line2';
    },

    hasBelt() {
      let moonsWithBelts = [];
      if (this.isMoon && this.moonObject) {
        return this.masterMapData.belts[this.moonObject.data.id] !== undefined;
      } else {
        return false;
      }
    },
  },

  methods: {
    open(intersect) {
      this.intersect = intersect;
      this.meshObject = intersect?.object;

      if (this.meshObject?.type === 'Points') {
        this.pointObject = this.masterMapData.points.find((point) => {
          return this.meshObject.pointId === point.data.id;
        });
      }

      if (this.meshObject?.type === 'Line2') {
        this.vectorObject = this.masterMapData.vectors.find((vector) => {
          return this.meshObject.vectorId === vector.data.id;
        });
      }

      if (this.meshObject?.celestialType === 'planet' || this.meshObject?.celestialType === 'moon') {
        this.moonObject = this.masterMapData.moons.find((moon) => {
          return this.meshObject.objectId === moon.data.id;
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

    async onCopyOnVector() {
      try {
        if (this.intersect && this.intersect.point) {
          let coord = { position: this.intersect.pointOnLine };

          let scaledCoord = this.scaleUpCoordinate(coord);
          let output = `${scaledCoord.position.x},${-scaledCoord.position.z},${scaledCoord.position.y}`;
          await navigator.clipboard.writeText(output);
          this.$toasted.global.alertInfo({ message: 'Copied Coordinate to Clipboard', timeout: 1000 });
          this.close();
        }
      } catch (error) {
        this.$toasted.global.alertError({ message: 'Copy failed' });
        console.error('Failed to copy: ', error);
      }
    },

    onEditVector() {
      EventBus.$emit('editVector', this.vectorObject);
      this.close();
    },

    onDeleteVector() {
      let vectorToRemove = this.masterMapData.vectors.find((vector) => vector.data.id === this.intersect.object.vectorId);
      this.$refs.confirmationDialog.open({
        titleText: 'Are you sure?',
        descriptionText: 'You will be unable to recover deleted vectors.',
        yesText: 'Yes',
        noText: 'No',
        onYes: () => {
          this.deleteVector(vectorToRemove);
          this.$refs.confirmationDialog.close();
        },
      });
      this.close();
    },

    onViewOrigin() {
      // eslint-disable-next-line id-length
      this.viewObject({ position: { x: 0, y: 0, z: 0 } });
      this.close();
    },

    onViewBeltInfo() {
      EventBus.$emit('setInfoWidgetData', this.meshObject);
      EventBus.$emit('viewBeltInfo');
      this.close();
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
