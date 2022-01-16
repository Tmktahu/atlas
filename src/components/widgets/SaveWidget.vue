<!-- eslint-disable vue/valid-v-slot */ -->
<template>
  <div class="save-widget py-3 pl-3" :class="{ open: showSaveWidget, 'with-drag-bar': isElectron }">
    <v-row no-gutters>
      <div class="page-title">Save Waypoints</div>
      <v-spacer />
      <v-btn text @click="close"><v-icon>mdi-close</v-icon></v-btn>
    </v-row>

    <div class="page-title--sub"> Save waypoints to the standard storage JSON or to a specific JSON of your choice. </div>

    <v-radio-group v-model="storageOption">
      <v-radio class="radio-option" value="storage" label="Standard Storage (waypoint_data.json)" />
      <v-radio class="radio-option" value="custom" label="">
        <template v-slot:label>
          Save To:
          <v-btn dense :disabled="storageOption !== 'custom'" class="select-path-button ml-2" outlined @click="onSelectPath">{{ buttonText }}</v-btn>
        </template>
      </v-radio>
    </v-radio-group>
    <v-btn dense class="action-button" small outlined @click="onSave"><v-icon class="pr-2">mdi-content-save-outline</v-icon>Save</v-btn>
  </div>
</template>

<script>
import { ref, inject } from '@vue/composition-api';

import { useStorage } from '@/models/useStorage.js';
import { useMap } from '@/models/useMap.js';
import { useCoordinates } from '@/models/useCoordinates';

import { ICON_MAP } from '@/models/useIcons.js';

export default {
  name: 'SaveWidget',

  setup() {
    const isElectron = inject('isElectron');
    const masterMapData = inject('masterMapData');
    const showSaveWidget = inject('showSaveWidget');

    const storageOption = ref('storage');
    const filePath = ref('');

    const { saveToJSON, dataStoragePath } = useStorage();

    return {
      isElectron,
      masterMapData,
      showSaveWidget,
      storageOption,
      filePath,
      saveToJSON,
      dataStoragePath,
    };
  },

  computed: {
    buttonText() {
      if (this.filePath === '') {
        return 'Choose File Path';
      } else {
        return this.filePath;
      }
    },
  },

  methods: {
    onSelectPath() {
      const { dialog } = require('electron').remote;
      dialog
        .showSaveDialog({
          properties: ['selectFile'],
          filters: [{ name: 'JSON', extensions: ['json'] }],
        })
        .then((result) => {
          if (result !== undefined) {
            this.filePath = result.filePath;
          }
        });
    },

    async onSave() {
      if (this.storageOption === 'storage') {
        const errors = await this.saveToJSON(this.masterMapData.pointsArray, this.dataStoragePath);
        if (errors) {
          console.log('File Save Error: ', errors);
          this.$toasted.global.alertError({ message: 'Error saving JSON file', description: errors });
        } else {
          this.close();
        }
      } else {
        const errors = await this.saveToJSON(this.masterMapData.pointsArray, this.filePath);
        if (errors) {
          console.log('File Save Error: ', errors);
          this.$toasted.global.alertError({ message: 'Error saving JSON file', description: errors });
        } else {
          this.close();
        }
      }
    },

    close() {
      this.showSaveWidget = false;
    },
  },
};
</script>

<style lang="scss" scoped>
@use 'sass:color';

@import '@/design/variables/_colors';

.save-widget {
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
</style>
