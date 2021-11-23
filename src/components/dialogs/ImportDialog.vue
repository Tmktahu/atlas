<!-- eslint-disable vue/valid-v-slot -->
<template>
  <div class="d-flex flex-column" style="height: 100vh">
    <div class="page-title px-6 pt-5">Import Waypoints</div>
    <div class="page-title--sub px-6">{{ subText }}</div>
    <v-divider color="primary-blue" class="mt-4" />

    <div v-if="parentWindow === null" class="error-state-mask" />

    <div class="d-flex align-center my-4 mx-6">
      <v-btn dense class="select-path-button mr-2" outlined @click="onSelectPath">{{ buttonText }}</v-btn>
      <v-btn dense class="select-path-button mr-2" outlined @click="onLoadData">Load Data</v-btn>
      <div class="import-info">{{ importInfoText }}</div>
    </div>

    <v-data-table
      v-model="loadedData"
      :items="loadedData"
      class="waypoint-list"
      :items-per-page="-1"
      fixed-header
      hide-default-footer
      disable-pagination
      :headers="tableHeaders"
    >
      <template v-slot:item.name="{ item }">
        <div class="d-flex align-center">
          <div class="image-wrapper" :style="{ 'background-color': item.color }">
            <img :src="ICON_MAP[item.icon].workingFilePath" contain width="32px" height="32px" style="filter: invert(1)" />
          </div>
          <span class="pl-3"> {{ item.name }}</span>
        </div>
      </template>
      <template v-slot:header.select>
        <div class="d-flex align-center"> <v-checkbox v-model="allChecked" @change="flipAllChecked" /> Select </div>
      </template>
      <template v-slot:item.select="{ item }">
        <div class="d-flex justify-center">
          <v-checkbox v-model="checkedWaypoints" multiple :value="item.id" />
        </div>
      </template>
      <template v-slot:item.position="{ item }">
        <div class="d-flex">
          {{ `[${scaleUpCoordinate(item.position.x)}, ${scaleUpCoordinate(item.position.y)}, ${scaleUpCoordinate(item.position.z)}]` }}
        </div>
      </template>
      <template v-slot:item.actions="{ item }">
        <div class="d-flex">
          <v-btn class="action-button view mr-2" dense outlined @click="onView(item)">View</v-btn>
          <v-btn class="action-button mr-2" :class="{ show: item.hide, hide: !item.hide }" dense outlined @click="onShowHide(item)">{{
            item.hide ? 'Show' : 'Hide'
          }}</v-btn>
          <v-btn class="action-button delete" dense outlined @click="onDelete(item)">Delete</v-btn>
        </div>
      </template>
      <template v-slot:no-data>
        <div class="d-flex flex-column">
          <div class="pt-2">Load a JSON file.</div>
          <div class="pt-2 pb-4">If you have already loaded one, the JSON file may be bad.</div>
        </div>
      </template>
      <template v-slot:group.header="{ group, toggle, isOpen }">
        <td colspan="3" class="group-header-row" @click="toggle">
          <div class="d-flex justify-center align-center group-header-text">
            <v-icon size="32" class="mr-3">{{ isOpen ? 'mdi-minus' : 'mdi-plus' }}</v-icon>
            <div class="group-header"> "{{ group }}" Waypoints </div>
            <v-icon size="32" class="ml-3">{{ isOpen ? 'mdi-minus' : 'mdi-plus' }}</v-icon>
          </div>
        </td>
      </template>
    </v-data-table>
    <v-divider color="primary-blue" />

    <div class="d-flex align-center my-4 mx-6">
      <div class="import-info">
        When you import waypoints, they will be <strong>merged</strong> into your current set. Waypoints that have duplicate IDs will be skippped.
      </div>
      <v-btn dense class="select-path-button px-10 py-5" outlined @click="onImport">Import</v-btn>
    </div>
  </div>
</template>

<script>
import { ref, watch, inject } from '@vue/composition-api';
const { dialog } = require('electron').remote;

import { useStorage } from '@/models/useStorage.js';
import { useCoordinates } from '@/models/useCoordinates.js';
import { useMap } from '@/models/useMap.js';

import { ICON_MAP } from '@/models/useIcons.js';

export default {
  name: 'ImportWaypointsModalVue',
  setup() {
    const filePath = ref('');
    const dataContainer = ref([]);
    const loadedData = ref([]);
    const allChecked = ref(true);

    const { readFromJSON } = useStorage();
    const { scaleUpCoordinate } = useCoordinates();

    const tableHeaders = [
      {
        text: 'Select',
        align: 'start',
        sortable: false,
        value: 'select',
      },
      {
        text: 'Name',
        align: 'start',
        sortable: true,
        value: 'name',
      },
      {
        text: 'Coordinate',
        align: 'start',
        sortable: false,
        value: 'position',
      },
      {
        text: 'Group',
        align: 'start',
        sortable: true,
        value: 'group',
      },
    ];

    const checkedWaypoints = ref(null);

    const parentWindow = ref(null);
    window.addEventListener(
      'message',
      (event) => {
        if (event.data.points) {
          parentWindow.value = event.source;
        }
      },
      false
    );

    return {
      parentWindow,
      filePath,
      dataContainer,
      loadedData,
      readFromJSON,
      tableHeaders,
      allChecked,
      ICON_MAP,
      checkedWaypoints,
      scaleUpCoordinate,
    };
  },

  computed: {
    buttonText() {
      if (this.filePath === '') {
        return 'Select JSON File';
      } else {
        return this.filePath;
      }
    },

    importInfoText() {
      return `${this.loadedData ? this.loadedData.length : '0'} Loaded Waypoints`;
    },

    subText() {
      if (this.parentWindow === null) {
        return '!!! ERROR: Go back to the main window and press the Import Waypoints option again !!!';
      } else {
        return 'Use the UI below to import and merge waypoints into your working set.';
      }
    },
  },

  watch: {
    dataContainer() {
      if (this.dataContainer !== undefined) {
        this.loadedData = this.dataContainer;
        this.checkedWaypoints = this.loadedData.map((obj) => {
          return obj.id;
        });
      }
    },

    checkedWaypoints() {
      this.allChecked = this.checkedWaypoints?.length === this.loadedData?.length;
    },
  },

  methods: {
    onSelectPath() {
      dialog
        .showOpenDialog({
          properties: ['openFile'],
          filters: [{ name: 'JSON', extensions: ['json'] }],
        })
        .then((result) => {
          if (result !== undefined) {
            this.filePath = result.filePaths[0];
          }
        });
    },

    async onLoadData() {
      this.dataContainer = await this.readFromJSON(null, this.filePath);
    },

    onImport() {
      let selectedPoints = this.loadedData.filter((obj) => {
        return this.checkedWaypoints.includes(obj.id);
      });
      if (this.parentWindow !== null) {
        this.parentWindow.postMessage({
          command: 'import',
          points: selectedPoints,
        });
      }
    },

    flipAllChecked() {
      if (this.allChecked) {
        this.checkedWaypoints = this.loadedData.map((obj) => {
          return obj.id;
        });
      } else {
        this.checkedWaypoints = [];
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@use 'sass:color';

@import '@/design/variables/_colors';

.page-title {
  font-size: 32px;
  color: white;
  letter-spacing: 0.04em;

  &--sub {
    font-size: 16px;
    color: white;
    letter-spacing: 0.02em;
  }
}

.error-state-mask {
  position: fixed;
  top: 110px;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 100000;
  pointer-events: all;
  background: rgba(100, 0, 0, 0.5);
}

.select-path-button {
  color: $primary-blue !important;
  text-transform: none;
  letter-spacing: 0.01em;
}

.waypoint-list::v-deep {
  max-height: calc(100vh - 135px);
  background-color: transparent !important;

  .v-data-table__wrapper {
    height: calc(100vh - 270px);
  }

  .image-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 16px;
  }

  th {
    color: white !important;
    background: #222 !important;

    i {
      margin-left: 4px;
      color: white !important;
      opacity: 0.5;
    }
  }

  tr {
    background-color: transparent !important;

    &:hover {
      background: #444 !important;
    }
  }

  td {
    color: white;
    border-bottom: 1px solid #666 !important;
  }

  .v-row-group__header {
    background: color.change($primary-blue, $lightness: 60%, $saturation: 50%) !important;
  }

  .group-header-text {
    height: 24px;
    font-size: 18px;
    font-weight: 600;
    color: black;
    letter-spacing: 0.03em;
  }

  .group-header-row {
    height: 26px;
    padding: 0 !important;

    &:hover {
      cursor: pointer;
      background: color.change($primary-blue, $lightness: 40%, $saturation: 50%) !important;
    }
  }
}
</style>
