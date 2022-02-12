<template>
  <v-dialog v-model="showDialog" persistent content-class="old-data-dialog">
    <div class="pa-6">
      <div class="dialog-title">Migrate Old Data</div>
      <div class="dialog-title--sub mt-2"> An old storage data structure has been detected and it must be updated before you can use the app. </div>
      <div class="dialog-title--sub mb-6"> Once the update is complete, this page will reload. </div>

      <div class="dialog-title--sub mb-6">
        You can find more information about this and future data restructures on the Github repository page or on Discord. You'll find links to both at the
        bottom left of this app.
      </div>

      <div class="dialog-title--sub mb-6">
        It is highly reccomended that you backup your current data before attempting to update it to the new structure. I do my best to try and automatically
        handle this for you, but there is always a chance that something goes wrong with the update.
      </div>

      <div class="dialog-title--sub mb-6">
        If the update fails to work and you lose your data, don't worry. As long as you have a backup JSON you can recover everything. Feel free to reach out to
        me directly on Discord for assistance, or try to tackle a manual data structure update based on the information you find in the Github repository.
      </div>

      <div v-if="isElectron">
        Save To:
        <v-btn dense :disabled="storageOption !== 'custom'" class="select-path-button ml-2" outlined @click="onSelectPath">{{ buttonText }}</v-btn>
      </div>

      <div class="d-flex">
        <v-btn color="primary" class="px-8 mt-4" large @click="onSave"> <v-icon class="pr-2">mdi-content-save-outline</v-icon>Save/Backup Current Data </v-btn>
        <v-spacer />
        <v-btn :loading="updateLoading" color="error" class="px-8 mt-4" large @click="onUpdate">
          <v-icon class="pr-2">mdi-content-save-outline</v-icon>Update Data to New Structure
        </v-btn>
      </div>
    </div>
  </v-dialog>
</template>

<script>
import { ref, watch, inject } from '@vue/composition-api';

import { useStorage } from '@/models/useStorage.js';

export default {
  name: 'OldDataDialog',
  setup() {
    const isElectron = inject('isElectron');

    const showDialog = inject('showOldDataDialog');
    const filePath = ref('');

    const { saveToJSON, updateDataStructure } = useStorage();

    const oldData = ref(null);
    const updateLoading = ref(false);

    return {
      isElectron,
      showDialog,
      filePath,
      saveToJSON,
      updateDataStructure,
      oldData,
      updateLoading,
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
      if (this.isElectron) {
        const errors = await this.saveToJSON(this.masterMapData.pointsArray, this.filePath);
        if (errors) {
          console.error('File Save Error: ', errors);
          this.$toasted.global.alertError({ message: 'Error saving JSON file', description: errors });
        } else {
          this.close();
        }
      } else {
        let data = JSON.stringify(this.oldData, null, 2);

        let elem = document.createElement('a');
        let file = new Blob([data], { type: 'text/plain' });
        elem.href = URL.createObjectURL(file);
        let today = new Date();
        elem.download = `OLD_atlas_data_${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}.json`;
        elem.click();
      }
    },

    onUpdate() {
      this.updateLoading = true;
      this.updateDataStructure(this.oldData);

      setTimeout(() => {
        window.location.reload(false);
      }, 2000);
    },

    open(data) {
      this.showDialog = true;
      this.oldData = data;
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

.old-data-dialog {
  max-width: 50vw;
  background: color.change($primary-blue, $lightness: 70%, $saturation: 70%);
}
</style>

<style lang="scss" scoped>
@import '@/design/variables/_colors';

.dialog-title {
  color: black;
  font-size: 32px;
  letter-spacing: 0.04em;
  font-weight: 700;

  &--sub {
    color: black;
    font-size: 18px;
    font-weight: 500;
  }
}

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
