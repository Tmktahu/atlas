<!-- eslint-disable vue/valid-v-slot */ -->
<template>
  <div class="import-selection-widget pa-3" :class="{ open: showImportSelectionWidget }">
    <v-row no-gutters>
      <div class="widget-title">{{ widgetTitle }}</div>
      <v-spacer />
      <v-btn icon @click="close"><v-icon>mdi-close</v-icon></v-btn>
    </v-row>

    <v-row v-if="mode === 'points' && conflicts.pointConflicts && conflicts.pointConflicts.length > 0" no-gutters class="conflicts-tag mb-2">
      {{ conflicts.pointConflicts.length }} Point Conflicts
    </v-row>

    <v-row v-if="mode === 'vectors' && conflicts.vectorConflicts && conflicts.vectorConflicts.length > 0" no-gutters class="conflicts-tag mb-2">
      {{ conflicts.vectorConflicts.length }} Vector Conflicts
    </v-row>

    <v-row no-gutters style="height: 200px">
      <v-treeview
        v-if="mode === 'points'"
        v-model="pointTreeSelection"
        selected-color="black"
        class="selection-list pb-3"
        dense
        selectable
        :items="pointTreeData"
        @input="onPointInput"
      >
        <template v-slot:label="{ item, leaf }">
          <div v-if="mode === 'points' && leaf" class="d-flex flex-column" :class="{ conflict: hasConflict(item) }">
            <div class="conflict-line" />
            <span>
              {{ item.name }} <small>(Type "{{ item.type }}")</small>
            </span>
            <small>[{{ item.position.x }}, {{ item.position.y }}, {{ item.position.z }}]</small>
          </div>
          <div v-else-if="mode === 'points'"> "{{ item.name }}" Group </div>
          <div v-else-if="mode === 'vectors' && leaf" class="d-flex flex-column" :class="{ conflict: hasConflict(item) }">
            <div class="conflict-line" />
            <span>
              {{ item.name }}
            </span>
          </div>
        </template>
      </v-treeview>

      <v-treeview
        v-else-if="mode === 'vectors'"
        v-model="vectorTreeSelection"
        selected-color="black"
        class="selection-list pb-3"
        dense
        selectable
        :items="vectorTreeData"
        @input="onVectorInput"
      >
        <template v-slot:label="{ item }">
          <div class="d-flex flex-column" :class="{ conflict: hasConflict(item) }">
            <div class="conflict-line vectors" />
            <span>
              {{ item.name }}
            </span>
          </div>
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

  props: {
    loadedData: {
      type: Object,
      default: () => {},
    },
    pointSelection: {
      type: Array,
      default: () => [],
    },
    vectorSelection: {
      type: Array,
      default: () => [],
    },
    conflicts: {
      type: Object,
      default: () => {},
    },
  },

  setup(props) {
    const isElectron = inject('isElectron');
    const showImportSelectionWidget = inject('showImportSelectionWidget');

    const mode = ref('points');

    const { scaleDownCoordinate } = useCoordinates();

    const pointTreeSelection = ref([]);
    const vectorTreeSelection = ref([]);

    const pointTreeData = ref([]);
    const vectorTreeData = ref([]);

    watch(props, () => {
      setTreeData();
    });

    watch(mode, () => {
      setTreeData();
    });

    const setTreeData = () => {
      if (props.loadedData && mode.value === 'points') {
        let groupObjects = {};
        for (let index in props.loadedData.points) {
          let point = props.loadedData.points[index];
          if (groupObjects[point.group] === undefined) {
            groupObjects[point.group] = [];
          }
          groupObjects[point.group].push(point);
        }

        pointTreeData.value = [];
        for (let group in groupObjects) {
          pointTreeData.value.push({
            id: group,
            name: group,
            children: groupObjects[group],
          });
        }
      } else if (props.loadedData && mode.value === 'vectors') {
        vectorTreeData.value = [];
        vectorTreeData.value = props.loadedData.vectors;
      }
    };

    return {
      isElectron,
      showImportSelectionWidget,
      pointTreeSelection,
      vectorTreeSelection,
      pointTreeData,
      vectorTreeData,
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
    open(mode) {
      this.mode = mode;
      this.showImportSelectionWidget = true;
    },

    close() {
      this.showImportSelectionWidget = false;
    },

    hasConflict(item) {
      if (this.mode === 'points') {
        return this.conflicts?.pointConflicts?.includes(item.id);
      } else if (this.mode === 'vectors') {
        return this.conflicts?.vectorConflicts?.includes(item.id);
      }
    },

    onPointInput() {
      this.$emit('update:pointSelection', this.pointTreeSelection);
    },

    onVectorInput() {
      this.$emit('update:vectorSelection', this.vectorTreeSelection);
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

  .v-treeview-node__label {
    overflow: visible;
  }

  .conflict-line {
    background: red;
    height: 5px;
    width: 35px;
    left: -70px;
    position: absolute;
    display: none;
    top: 19px;
    border-radius: 4px;

    &.vectors {
      top: 9px;
    }
  }

  .conflict {
    color: red;
    position: relative;

    .conflict-line {
      display: block;
    }
  }
}

.conflicts-tag {
  width: fit-content;
  padding: 2px 6px 0px 6px;
  background: rgba($color: red, $alpha: 0.6);
  border-radius: 8px;
  font-size: 12px;
  color: black;
  font-weight: 800;
}
</style>
