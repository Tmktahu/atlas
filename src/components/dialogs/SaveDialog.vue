<template>
  <v-dialog v-model="showDialog" content-class="save-dialog">
    <div class="pa-6">
      <div>Save Waypoints</div>
      <div>Select whether you want to save your current set of waypoints to the standard storage JSON or to a specific JSON of your choice.</div>
      <v-radio-group v-model="storageOption">
        <v-radio class="radio-option" value="storage" label="Standard Storage (waypoint_data.json)" />
        <v-radio class="radio-option" value="custom" label="">
          <template v-slot:label>
            Save To:
            <v-btn dense :disabled="storageOption !== 'custom'" class="select-path-button ml-2" outlined @click="onSelectPath">{{ buttonText }}</v-btn>
          </template>
        </v-radio>
      </v-radio-group>
      <v-btn class="save-button px-8" large @click="onSave"><v-icon class="pr-2">mdi-content-save-outline</v-icon>Save</v-btn>
    </div>
  </v-dialog>
</template>

<script>
import { ref, watch, inject } from '@vue/composition-api';

const { dialog } = require('electron').remote;

import { useStorage } from '@/models/useStorage.js';

export default {
  name: 'SaveDialog',
  setup() {
    const mapData = inject('mapData');

    const showDialog = ref(false);
    const storageOption = ref('storage');
    const filePath = ref('');

    const { saveToJSON, dataStoragePath } = useStorage();

    return {
      mapData,
      showDialog,
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
        const errors = await this.saveToJSON(this.mapData.pointsArray, this.dataStoragePath);
        if (errors) {
          console.log('File Save Error: ', errors);
        } else {
          this.close();
        }
      } else {
        const errors = await this.saveToJSON(this.mapData.pointsArray, this.filePath);
        if (errors) {
          console.log('File Save Error: ', errors);
        } else {
          this.close();
        }
      }
    },

    open() {
      this.showDialog = true;
    },

    close() {
      this.showDialog = false;
    },
  },
};
</script>

<style lang="scss">
@use 'sass:color';

@import '@/design/variables/_colors';

.save-dialog {
  max-width: 60vw;
  background: color.change($primary-blue, $lightness: 30%, $saturation: 20%);
}
</style>

<style lang="scss" scoped>
@import '@/design/variables/_colors';

.select-path-button {
  color: $primary-blue !important;
  text-transform: none;
  letter-spacing: 0.01em;
}

.radio-option::v-deep {
  label {
    color: white;
  }
}

.save-button {
  color: $primary-blue !important;
  text-transform: none;
  letter-spacing: 0.01em;
  background-color: #222 !important;
}
</style>
