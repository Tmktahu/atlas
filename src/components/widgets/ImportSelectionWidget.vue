<!-- eslint-disable vue/valid-v-slot */ -->
<template>
  <div class="import-selection-widget pa-3" :class="{ open: showImportSelectionWidget }">
    <v-row no-gutters>
      <div class="widget-title">{{ widgetTitle }}</div>
      <v-spacer />
      <v-btn dense class="action-button" small outlined @click="onSaveSelection">Save Selection ({{ treeSelection.length }})</v-btn>
    </v-row>
    <v-row style="height: 200px">
      <v-treeview v-model="treeSelection" selected-color="black" class="selection-list pb-3" dense selectable :items="treeData">
        <template v-slot:label="{ item, leaf }">
          <div v-if="leaf" class="d-flex flex-column">
            <span>
              {{ item.name }} <small>(Type "{{ item.type }}")</small>
            </span>
            <small>[{{ item.position.x }}, {{ item.position.y }}, {{ item.position.z }}]</small>
          </div>
          <div v-else> "{{ item.name }}" Group </div>
        </template>
      </v-treeview>
    </v-row>
  </div>
</template>

<script>
import { ref, inject, watch } from '@vue/composition-api';

import { useCoordinates } from '@/models/useCoordinates';
import { ICON_MAP } from '@/models/useIcons.js';

export default {
  name: 'ImportSelectionWidget',

  setup() {
    const isElectron = inject('isElectron');
    const showImportSelectionWidget = inject('showImportSelectionWidget');

    const mode = ref('points');

    const { scaleDownCoordinate } = useCoordinates();

    const treeData = ref([]);
    const treeSelection = ref([]);

    return {
      isElectron,
      showImportSelectionWidget,
      treeData,
      treeSelection,
      mode,
      ICON_MAP,
      scaleDownCoordinate,
    };
  },

  computed: {
    widgetTitle() {
      if (this.mode === 'points') {
        return 'Select Points';
      } else if (this.mode === 'vectors') {
        return 'Select Vectors';
      } else {
        return '';
      }
    },
  },

  methods: {
    open(inData, mode, currentSelection) {
      this.data = inData;
      this.mode = mode;

      if (this.mode === 'points') {
        let groupObjects = {};
        for (let index in this.data) {
          let point = this.data[index];
          if (groupObjects[point.group] === undefined) {
            groupObjects[point.group] = [];
          }
          groupObjects[point.group].push(point);
        }

        this.treeData = [];
        for (let group in groupObjects) {
          this.treeData.push({
            id: group,
            name: group,
            children: groupObjects[group],
          });
        }
      } else if (this.mode === 'vectors') {
      }

      this.treeSelection = currentSelection;
      this.showImportSelectionWidget = true;
    },

    onSaveSelection() {
      this.showImportSelectionWidget = false;
      this.$emit('save', { mode: this.mode, selection: this.treeSelection });
    },
  },
};
</script>

<style lang="scss" scoped>
@use 'sass:color';

@import '@/design/variables/_colors';

.import-selection-widget {
  z-index: 10;
  background: transparent !important;
  width: 350px;
  position: fixed;
  top: 400px;
  right: -400px;
  transition: right 0.1s ease;

  &.open {
    right: 0px;
  }

  &:before {
    content: '';
    z-index: -1;
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    right: 0;
    background-color: color.change($primary-blue, $lightness: 60%, $saturation: 50%) !important;
    clip-path: polygon(0px 0px, 100% 0px, 100% 100%, 15px 100%, 0px calc(100% - 15px));
  }

  &:after {
    content: '';
    position: absolute;
    margin-top: 5px;
    top: 0;
    right: 0;
    width: 100%;
    height: 100%;
    background-color: color.change($primary-blue, $lightness: 60%, $saturation: 50%) !important;
    clip-path: polygon(
      0px 0px,
      0px calc(100% - 15px + 2px),
      14px 100%,
      100% 100%,
      100% calc(100% - 2px),
      15px calc(100% - 2px),
      2px calc(100% - 14px),
      2px 0px
    );
  }
}

.widget-title {
  font-size: 18px;
  color: black;
  letter-spacing: 0.01em;

  &--sub {
    font-size: 14px;
    color: black;
    letter-spacing: 0.02em;
    font-weight: 800;

    a {
      color: black !important;
    }
  }
}

.action-button::v-deep {
  text-transform: none;
  letter-spacing: 0.02em;
  font-weight: 800;
  align-items: center;
  font-size: 12px;

  .v-file-input__text {
    color: black !important;
    line-height: 16px;
  }

  .v-input__slot {
    min-height: 28px !important;
    cursor: pointer;
  }

  fieldset {
    border-color: rgba(0, 0, 0, 0.87);
  }

  .v-text-field__slot {
    text-transform: none;
    letter-spacing: 0.02em;
    font-weight: 800;
  }

  .v-input__append-inner {
    margin: auto 0 !important;
  }
}

.selection-list::v-deep {
  overflow-y: auto;
  height: 98%;
  width: 100%;

  .v-treeview-node__root {
    min-height: 30px !important;
  }

  .v-treeview-node__level {
    width: 18px !important;
  }
}
</style>
