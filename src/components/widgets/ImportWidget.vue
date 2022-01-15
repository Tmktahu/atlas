<!-- eslint-disable vue/valid-v-slot */ -->
<template>
  <div class="import-widget py-3 pl-3" :class="{ open: showImportWidget }">
    <v-row no-gutters>
      <div class="page-title">Import Waypoints</div>
      <v-spacer />
      <v-btn text @click="close"><v-icon>mdi-close</v-icon></v-btn>
    </v-row>

    <v-row no-gutters class="align-center mt-1">
      <v-file-input
        v-model="uploadedFile"
        small
        outlined
        show-size
        hide-details
        dense
        accept=".json"
        class="action-button flex-grow-0 mr-3"
        placeholder="Select JSON File"
      />
      <v-btn dense class="action-button" small outlined @click="onLoadData">Load Data</v-btn>
    </v-row>

    <v-row no-gutters class="mt-1">
      <div class="import-info">{{ importInfoText }}</div>
    </v-row>

    <v-row no-gutters class="mt-2">
      <v-data-table
        v-model="loadedData"
        :items="loadedData"
        class="import-list"
        :items-per-page="-1"
        fixed-header
        hide-default-footer
        disable-pagination
        :headers="tableHeaders"
      >
        <template v-slot:item.name="{ item }">
          <div class="d-flex align-center">
            <div class="image-wrapper" :style="{ 'background-color': item.color }">
              <img :src="ICON_MAP[item.icon].workingFilePath" contain width="16px" height="16px" style="filter: invert(1)" />
            </div>
            <span class="waypoint-name pl-2"> {{ item.name }}</span>
          </div>
        </template>
        <template v-slot:header.select>
          <div class="d-flex align-center"> <v-checkbox v-model="allChecked" hide-details dense @change="flipAllChecked" /> </div>
        </template>
        <template v-slot:item.select="{ item }">
          <div class="d-flex justify-center flex-grow-0">
            <v-checkbox v-model="checkedWaypoints" class="pa-0 ma-0" hide-details dense multiple :value="item.id" />
          </div>
        </template>
        <template v-slot:item.position="{ item }">
          <div class="d-flex" style="font-size: 10px">
            {{ `[${item.position.x}, ${item.position.y}, ${item.position.z}]` }}
          </div>
        </template>
        <template v-slot:no-data>
          <div class="d-flex flex-column">
            <div class="pt-2">Load a JSON file.</div>
            <div class="pt-2 pb-4">If you have already loaded one, the JSON file may be bad.</div>
          </div>
        </template>
      </v-data-table>
    </v-row>

    <v-row no-gutters class="align-center mt-1 pr-3">
      <v-tooltip left>
        <template v-slot:activator="{ on }">
          <div class="mode-wrapper d-flex flex-grow-0 px-2 mr-1 align-center" v-on="on">
            <span>Skip</span>
            <v-switch v-model="mode" hide-details dense true-value="replace" class="ma-0 pl-2" style="padding-top: 2px" false-value="skip" />
            <span style="margin-left: -2px">Replace</span>
          </div>
        </template>
        <div>
          <div>This switch controls how conflicts are handled during merges.<br />Conflicts are identified by waypoint ID.</div>
          <div><strong>Skip</strong> : This option skips conflicts, keeping the originals.</div>
          <div><strong>Replace</strong> : This option replaces conflicts with the new waypoints.</div>
        </div>
      </v-tooltip>

      <v-spacer />
      <v-btn dense class="action-button" small outlined @click="onLoadData">Import</v-btn>
    </v-row>
  </div>
</template>

<script>
import { ref, inject } from '@vue/composition-api';

import { useStorage } from '@/models/useStorage.js';

import { ICON_MAP } from '@/models/useIcons.js';

export default {
  name: 'ImportWidget',

  setup() {
    const isElectron = inject('isElectron');
    const showImportWidget = inject('showImportWidget');

    const uploadedFile = ref(null);
    const loadedData = ref([]);
    const checkedWaypoints = ref([]);
    const allChecked = ref(true);
    const mode = ref('skip');

    const { readFromJSON } = useStorage(isElectron);

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

    return {
      showImportWidget,
      uploadedFile,
      loadedData,
      checkedWaypoints,
      allChecked,
      mode,
      readFromJSON,
      tableHeaders,
      ICON_MAP,
    };
  },

  computed: {
    importInfoText() {
      if (this.loadedData) {
        let numGroups = this.loadedData.map((item) => item.group).filter((value, index, self) => self.indexOf(value) === index).length;
        return `From File: ${this.loadedData.length} Waypoints | ${numGroups} Groups`;
      } else {
        return 'Load a file to see information.';
      }
    },
  },

  methods: {
    close() {
      this.showImportWidget = false;
    },

    async onLoadData() {
      this.loadedData = await this.readFromJSON(null, null, this.uploadedFile);
      this.checkedWaypoints = this.loadedData.map((obj) => {
        return obj.id;
      });
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

.import-widget {
  z-index: 10;
  background: color.change($primary-blue, $lightness: 60%, $saturation: 50%) !important;
  width: 400px;
  position: fixed;
  top: 0;
  right: -400px;
  transition: right 0.1s ease;
  border-bottom-left-radius: 16px;
  max-height: 635px;

  &.open {
    right: 0px;
  }
}

.page-title {
  font-size: 24px;
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

.import-info {
  color: black;
  font-size: 14px;
}

.import-list::v-deep {
  width: 100%;
  background-color: transparent !important;
  height: calc(100vh - 277px);
  max-height: 470px;

  .v-data-table__wrapper {
    height: 100%;
    max-height: 470px;
    overflow-x: hidden;
  }

  thead {
    th {
      background: color.change($primary-blue, $lightness: 20%, $saturation: 20%) !important;
      height: 30px !important;
      padding: 0 0 0 10px !important;
    }
  }

  .image-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border-radius: 4px;
  }

  .waypoint-name {
    font-size: 12px;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    max-width: 120px;
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
    &.v-data-table__selected {
      background: transparent !important;
    }

    &:hover {
      background: color.change($primary-blue, $lightness: 50%, $saturation: 30%) !important;
    }
  }

  td {
    padding: 0 0 0 10px !important;
    height: 32px !important;
    color: black;
    font-weight: 600;
    border-bottom: 1px solid #666 !important;
  }

  .v-row-group__header {
    background: color.change($primary-blue, $lightness: 50%, $saturation: 40%) !important;
  }

  .group-header-text {
    height: 24px;
    font-size: 18px;
    font-weight: 600;
    color: black;
    letter-spacing: 0.03em;
  }

  .group-header-row {
    height: 26px !important;
    padding: 0 !important;

    &:hover {
      cursor: pointer;
      background: color.change($primary-blue, $lightness: 40%, $saturation: 50%) !important;
    }
  }
}

.mode-wrapper {
  border: thin solid black;
  border-radius: 4px;

  span {
    color: black;
    font-weight: 500;
    font-size: 14px;
  }
}
</style>
