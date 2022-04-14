<!-- eslint-disable vue/valid-v-slot */ -->
<template>
  <div class="import-widget pa-3" :class="{ open: showImportWidget, 'with-drag-bar': isElectron }">
    <v-row no-gutters>
      <div class="page-title">Import Waypoints</div>
      <v-spacer />
      <v-btn icon @click="close"><v-icon>mdi-close</v-icon></v-btn>
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

    <v-row v-if="loadedData && needsMigration" no-gutters class="d-flex flex-column mt-2">
      <div class="import-info">
        <span class="field-title">JSON Import Version: </span>
        <span class="needs-migration">!! {{ loadedData.version || '1.0.0' }} !!</span>
      </div>
      <div class="import-info">
        <span class="field-title">Current Atlas Version: {{ currentAppVersion }}</span>
      </div>
      <div class="import-info"> The data in this JSON file is from an outdated version of Atlas. You must migrate it before you import. </div>
    </v-row>

    <v-row v-else-if="loadedData && !needsMigration" no-gutters class="import-info mt-2 d-flex flex-column">
      <div class="field-title mb-2">JSON Import Version: {{ loadedData.version }}</div>

      <div class="d-flex import-info-wrapper pa-2">
        <div class="d-flex flex-column flex-grow-0">
          <div class="area-title mb-2">Points</div>
          <v-btn :disabled="numPoints === 0" dense class="action-button" small outlined @click="onSelectPoints">Select Points to Import</v-btn>
          <v-btn :disabled="numPoints === 0" dense class="action-button mt-2" small outlined @click="onResetPointSelection">Reset Selected Points</v-btn>
        </div>
        <div class="ml-3 pl-3" style="border-left: 1px solid black">
          <div>{{ numPoints }} Points in Total</div>
          <div>{{ numUserPoints }} User-Made Points</div>
          <div>{{ pointSelection.length }} Points Selected for Import</div>
        </div>
      </div>

      <div class="d-flex import-info-wrapper pa-2 mt-2">
        <div class="d-flex flex-column flex-grow-0">
          <div class="area-title mb-2">Vectors</div>
          <v-btn :disabled="numVectors === 0" dense class="action-button" small outlined @click="onSelectVectors">Select Vectors to Import</v-btn>
          <v-btn :disabled="numVectors === 0" dense class="action-button mt-2" small outlined @click="onResetVectorSelection">Reset Selected Vectors</v-btn>
        </div>
        <div class="ml-3 pl-3" style="border-left: 1px solid black">
          <div>{{ numVectors }} Vectors in Total</div>
        </div>
      </div>
    </v-row>

    <v-row v-else no-gutters class="mt-2"> Select and load a JSON file above to see information about it. </v-row>

    <v-row v-if="loadedData && needsMigration" no-gutters class="align-center mt-2">
      <v-btn dense class="action-button" small outlined @click="onMigrate">Migrate Data</v-btn>
    </v-row>

    <v-row v-else-if="loadedData && !needsMigration" no-gutters class="align-center mt-2">
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
      <v-btn dense class="action-button" small outlined @click="onImport">Import</v-btn>
    </v-row>
    <ImportSelectionWidget ref="importSelectionWidget" @save="onSelectionSave" />
    <ConfirmationDialog ref="confirmationDialog" />
  </div>
</template>

<script>
import { ref, inject } from '@vue/composition-api';

import { useStorage } from '@/models/useStorage.js';
import { useMap } from '@/models/useMap.js';
import { useCoordinates } from '@/models/useCoordinates';

import { ICON_MAP } from '@/models/useIcons.js';
import ConfirmationDialog from '@/components/dialogs/ConfirmationDialog.vue';
import ImportSelectionWidget from './ImportSelectionWidget.vue';

export default {
  name: 'ImportWidget',
  components: { ConfirmationDialog, ImportSelectionWidget },

  setup() {
    const isElectron = inject('isElectron');
    const masterMapData = inject('masterMapData');
    const showImportWidget = inject('showImportWidget');

    const uploadedFile = ref(null);
    const loadedData = ref(null);
    const mode = ref('skip');

    const { readFromJSON, saveToJSON, migrateData, dataStoragePath } = useStorage(isElectron);
    const { scaleDownCoordinate, getInitialPoints } = useCoordinates();
    const { mergePoints } = useMap(masterMapData);

    const needsMigration = ref(false);

    const pointSelection = ref([]);

    return {
      isElectron,
      showImportWidget,
      uploadedFile,
      loadedData,
      mode,
      dataStoragePath,
      readFromJSON,
      saveToJSON,
      ICON_MAP,
      scaleDownCoordinate,
      getInitialPoints,
      mergePoints,
      needsMigration,
      migrateData,
      pointSelection,
    };
  },

  computed: {
    currentAppVersion() {
      return process.env.VUE_APP_VERSION;
    },

    numPoints() {
      return this.loadedData?.points?.length;
    },

    numUserPoints() {
      let initialPoints = this.getInitialPoints();
      let userPoints = this.loadedData.points.filter((importedPoint) => {
        let matchingPoint = initialPoints.filter((defaultPoint) => {
          return importedPoint.name === defaultPoint.name;
        });
        return matchingPoint.length === 0;
      });
      return userPoints.length;
    },

    numVectors() {
      return this.loadedData?.vectors?.length;
    },
  },

  methods: {
    close() {
      this.showImportWidget = false;
    },

    async onLoadData() {
      let storageData = await this.readFromJSON(null, this.uploadedFile.path, this.uploadedFile);
      this.needsMigration = storageData.version !== process.env.VUE_APP_VERSION;
      if (this.needsMigration) {
        this.$toasted.global.alertWarning({
          message: 'That JSON file is from an outdated Atlas version',
          description: 'You will need to migrate your old data to the new version in order to import.',
        });
      }
      this.loadedData = storageData;

      this.pointSelection = this.loadedData?.points?.map((point) => {
        return point.id;
      });
    },

    async onImport() {
      this.$refs.confirmationDialog.open({
        titleText: 'Are you sure?',
        descriptionText:
          this.mode === 'replace'
            ? 'You are set to replace points with the imported ones. This action cannot be undone.'
            : 'You are set to skip conflicting points. This action cannot be undone.',
        yesText: 'Yes',
        noText: 'No',
        onYes: () => {
          let selectedPoints = this.loadedData.filter((obj) => {
            return this.checkedWaypoints.includes(obj.id);
          });

          let scaledDownPoints = selectedPoints.map((obj) => {
            return this.scaleDownCoordinate(obj);
          });

          this.mergePoints(scaledDownPoints, this.mode === 'replace');
          this.close();
          this.$refs.confirmationDialog.close();
        },
      });
    },

    async onMigrate() {
      let newData = this.migrateData(this.loadedData);
      this.loadedData = newData;
      this.needsMigration = this.loadedData.version !== process.env.VUE_APP_VERSION;

      this.pointSelection = this.loadedData?.points?.map((point) => {
        return point.id;
      });

      this.$toasted.global.alertInfo({
        message: 'Data Migration Successful',
        description: 'The imported JSON data was migrated successfully.<br />If you want to save a local JSON copy, click the button in this popup.',
        timeout: null,
        actionText: 'Save Migrated Data',
        action: () => {
          this.downloadData(newData);
        },
      });
    },

    async downloadData(data) {
      if (this.isElectron) {
        let filePath = this.dataStoragePath.replace('atlas_data.json', `atlas_data_${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}.json`);
        const errors = await this.saveToJSON(data, this.filePath);
        if (errors) {
          console.error('File Save Error: ', errors);
          this.$toasted.global.alertError({ message: 'Error saving JSON file', description: errors });
        } else {
          this.$toasted.global.alertInfo({ message: `Data saved to ${filePath}` });
        }
      } else {
        let stringifiedData = JSON.stringify(data, null, 2);

        let elem = document.createElement('a');
        let file = new Blob([stringifiedData], { type: 'text/plain' });
        elem.href = URL.createObjectURL(file);
        let today = new Date();
        elem.download = `atlas_data_${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}.json`;
        elem.click();
      }
    },

    onSelectPoints() {
      this.$refs.importSelectionWidget.open(this.loadedData.points, 'points', this.pointSelection);
    },

    onResetPointSelection() {
      this.pointSelection = this.loadedData.points.map((point) => {
        return point.id;
      });
    },

    onSelectVectors() {
      console.log('we want to display point selection widget');
    },

    onResetVectorSelection() {
      console.log('we want to reset selected points');
    },

    onSelectionSave(data) {
      if (data.mode === 'points') {
        this.pointSelection = data.selection;
        console.log('got point selection back', this.pointSelection);
      } else if (data.mode === 'vectors') {
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

.import-widget {
  z-index: 10;
  background: transparent !important;
  width: 400px;
  position: fixed;
  top: 0;
  right: -400px;
  transition: right 0.1s ease;
  max-height: 635px;
  overflow: visible;

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

.with-drag-bar {
  margin-top: 30px;
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

.import-info-wrapper {
  border: 1px solid black;
  border-radius: 8px;
}

.import-info {
  font-size: 14px;
  color: black;

  .field-title {
    font-size: 14px;
    font-weight: 700;
  }

  .area-title {
    font-size: 16px;
    font-weight: 700;
  }

  .needs-migration {
    color: red;
    font-weight: 800;
    font-size: 14px;
  }
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
