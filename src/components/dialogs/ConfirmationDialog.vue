<template>
  <v-dialog ref="dialog" v-model="showDialog" max-width="250">
    <v-card class="confirmation-dialog py-2">
      <v-card-title class="text-h6 py-0">
        {{ options.titleText }}
      </v-card-title>
      <v-card-text class="description py-0">{{ options.descriptionText }}</v-card-text>
      <v-card-actions class="mx-2 mt-2">
        <v-btn class="action-button" color="primary" @click="options.onYes">
          {{ options.yesText }}
        </v-btn>
        <v-spacer />
        <v-btn class="action-button" color="error" @click="close">
          {{ options.noText }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { ref } from '@vue/composition-api';
import Mousetrap from 'mousetrap';

export default {
  name: 'ConfirmationDialog',

  setup() {
    const showDialog = ref(false);
    const options = ref({});

    const open = (inOptions) => {
      options.value = inOptions;
      showDialog.value = true;

      Mousetrap.bind('enter', () => {
        options.value.onYes();
      });
    };

    const close = () => {
      Mousetrap.unbind('enter');
      showDialog.value = false;
    };

    return {
      showDialog,
      options,
      open,
      close,
    };
  },
};
</script>

<style lang="scss" scoped>
@use 'sass:color';

@import '@/design/variables/_colors';

.confirmation-dialog {
  background: color.change($primary-blue, $lightness: 60%, $saturation: 50%) !important;
}

.description {
  font-size: 16px;
  line-height: 20px;
  font-weight: 500;
}

.action-button {
  color: black !important;
  text-transform: none;
}
</style>
