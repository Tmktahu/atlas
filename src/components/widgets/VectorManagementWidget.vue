<!-- eslint-disable vue/valid-v-slot */ -->
<template>
  <div>
    <div class="vector-widget py-3 pl-3" :class="{ open: showVectorWidget, 'with-drag-bar': isElectron }">
      <v-row no-gutters>
        <div class="page-title">Vector Management</div>
        <v-spacer />
        <v-btn text class="close-button" @click="close"><v-icon>mdi-close</v-icon></v-btn>
      </v-row>

      <div class="page-title--sub">!!! Note this map uses <a href="https://github.com/Tmktahu/IPS" target="_blank">IPS Coordinates</a> !!!</div>

      <v-row no-gutters class="mt-2">
        <v-btn class="action-button" small outlined @click="onCreateVector">Create Vector</v-btn>
      </v-row>

      <v-row no-gutters class="mt-2">
        <v-data-table
          class="vector-list"
          :items="masterMapData.vectors"
          :items-per-page="-1"
          fixed-header
          hide-default-footer
          disable-pagination
          :headers="tableHeaders"
        >
          <template v-slot:item.name="{ item }">
            <div class="d-flex align-center">
              <div class="image-wrapper" :style="{ 'background-color': item.data.color }" />
              <span class="vector-name pl-2"> {{ item.data.name }}</span>
            </div>
          </template>
          <template v-slot:item.startPoint="{ item }">
            <div style="font-size: 10px">
              {{
                `[${Math.round(scaleUpCoordinate(item.data.startPoint.x))}, ` +
                `${Math.round(scaleUpCoordinate(item.data.startPoint.y))}, ` +
                `${Math.round(scaleUpCoordinate(item.data.startPoint.z))}]`
              }}
            </div>
          </template>
          <template v-slot:item.direction="{ item }">
            <div style="font-size: 10px">
              {{ `[${Math.round(item.data.direction.x)}, ${Math.round(item.data.direction.y)}, ${Math.round(item.data.direction.z)}]` }}
            </div>
          </template>
          <template v-slot:item.length="{ item }">
            <div style="font-size: 10px">
              {{ Math.round(scaleUpCoordinate(item.data.length)) + 'm' }}
            </div>
          </template>
          <template v-slot:item.actions="{ item }">
            <div class="d-flex">
              <v-btn small dense icon @click="onEdit(item)"><v-icon>mdi-pencil-outline</v-icon></v-btn>
              <v-btn small dense icon @click="onShowHide(item)">
                <v-icon>{{ item.mesh.visible ? 'mdi-eye-off-outline' : 'mdi-eye' }}</v-icon>
              </v-btn>
              <v-btn class="action-button delete" small dense icon @click="onDelete(item)"><v-icon>mdi-trash-can-outline</v-icon></v-btn>
            </div>
          </template>
        </v-data-table>
      </v-row>
    </div>
    <VectorCRUDWidget ref="vectorCRUDWidget" />
    <ConfirmationDialog ref="confirmationDialog" />
  </div>
</template>

<script>
import { ref, inject } from '@vue/composition-api';
import { v4 as uuidv4 } from 'uuid';
import { EventBus } from '@/eventBus';

import { required } from 'vuelidate/lib/validators';

import { useMap } from '@/models/useMap.js';
import { ICON_MAP } from '@/models/useIcons.js';
import { useCoordinates } from '@/models/useCoordinates.js';

import VectorCRUDWidget from '@/components/widgets/VectorCRUDWidget.vue';
import ConfirmationDialog from '@/components/dialogs/ConfirmationDialog.vue';

export default {
  name: 'VectorManagementWidget',
  components: { VectorCRUDWidget, ConfirmationDialog },

  setup() {
    const isElectron = inject('isElectron');
    const showVectorWidget = inject('showVectorWidget');
    const masterMapData = inject('masterMapData');

    const { scaleUpCoordinate } = useCoordinates();

    const tableHeaders = [
      {
        text: 'Name',
        align: 'start',
        sortable: true,
        value: 'name',
      },
      {
        text: 'Start Point',
        align: 'start',
        sortable: false,
        value: 'startPoint',
      },
      {
        text: 'Direction',
        align: 'start',
        sortable: false,
        value: 'direction',
      },
      {
        text: 'Length',
        align: 'start',
        sortable: false,
        value: 'length',
      },
      {
        text: 'Actions',
        align: 'start',
        sortable: false,
        value: 'actions',
      },
    ];

    const { showHideVector, deleteVector } = useMap(masterMapData);

    return {
      isElectron,
      showVectorWidget,
      masterMapData,
      tableHeaders,
      showHideVector,
      deleteVector,
      ICON_MAP,
      scaleUpCoordinate,
    };
  },

  mounted() {
    EventBus.$on('editVector', (data) => {
      this.open();
      this.onEdit(data);
    });
  },

  methods: {
    open() {
      this.showVectorWidget = true;
    },

    close() {
      this.showVectorWidget = false;
      this.$refs.vectorCRUDWidget.close();
    },

    onCreateVector() {
      this.$refs.vectorCRUDWidget.open('create', null);
    },

    onEdit(vector) {
      this.$refs.vectorCRUDWidget.open('edit', vector);
    },

    onShowHide(vector) {
      this.showHideVector(vector.id);
    },

    onDelete(vector) {
      this.$refs.confirmationDialog.open({
        titleText: 'Are you sure?',
        descriptionText: 'You will be unable to recover deleted vectors.',
        yesText: 'Yes',
        noText: 'No',
        onYes: () => {
          this.deleteVector(vector);
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

.vector-widget {
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

.action-button {
  text-transform: none;
  letter-spacing: 0.02em;
  font-weight: 800;
}

.vector-list::v-deep {
  width: 100%;
  background-color: transparent !important;
  height: calc(100vh - 277px);
  max-height: 500px;

  .v-data-table__wrapper {
    height: 100%;
    max-height: 500px;
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
    min-width: 24px;
    height: 24px;
    border-radius: 8px;
  }

  .vector-name {
    font-size: 12px;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: wrap;
    max-width: 80px;
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
</style>
