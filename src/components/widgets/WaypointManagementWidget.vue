<!-- eslint-disable vue/valid-v-slot */ -->
<template>
  <div>
    <div class="waypoint-widget py-3 pl-3" :class="{ open: showWaypointWidget }">
      <v-row no-gutters>
        <div class="page-title">Waypoint Management</div>
        <v-spacer />
        <v-btn text class="close-button" @click="close"><v-icon>mdi-close</v-icon></v-btn>
      </v-row>

      <div class="page-title--sub">!!! Note this map uses <a href="https://github.com/Tmktahu/IPS" target="_blank">IPS Coordinates</a> !!!</div>

      <v-row no-gutters class="mt-2">
        <v-btn class="action-button mr-2" small outlined @click="onCreateWaypoint">Create Waypoint</v-btn>
        <v-btn class="action-button" small outlined @click="onResetDefaults">Reset Default Points</v-btn>
      </v-row>

      <v-row no-gutters class="mt-2">
        <v-data-table
          class="waypoint-list"
          :items="masterMapData.points"
          :items-per-page="-1"
          fixed-header
          hide-default-footer
          disable-pagination
          :headers="tableHeaders"
          group-by="data.group"
        >
          <template v-slot:item.name="{ item }">
            <div class="d-flex align-center">
              <div class="image-wrapper" :style="{ 'background-color': item.data.color }">
                <img :src="ICON_MAP[item.data.icon].workingFilePath" contain width="20px" height="20px" style="filter: invert(1)" />
              </div>
              <span class="waypoint-name px-2"> {{ item.data.name }}</span>
            </div>
          </template>
          <template v-slot:item.position="{ item }">
            <div style="font-size: 10px">
              {{ `[${scaleUpCoordinate(item.data.position.x)}, ${scaleUpCoordinate(item.data.position.y)}, ${scaleUpCoordinate(item.data.position.z)}]` }}
            </div>
          </template>
          <template v-slot:item.actions="{ item }">
            <div class="d-flex">
              <v-btn small dense icon @click="onEdit(item)"><v-icon>mdi-pencil-outline</v-icon></v-btn>
              <v-btn small dense icon @click="onView(item)"><v-icon>mdi-magnify</v-icon></v-btn>
              <v-btn small dense icon @click="onShowHide(item)">
                <v-icon>{{ item.mesh.visible ? 'mdi-eye-off-outline' : 'mdi-eye' }}</v-icon>
              </v-btn>
              <v-btn class="action-button delete" small dense icon @click="onDelete(item)"><v-icon>mdi-trash-can-outline</v-icon></v-btn>
            </div>
          </template>
          <template v-slot:no-data>
            <div class="d-flex flex-column">
              <div class="pt-2">There was a problem.</div>
              <div class="pt-2 pb-4">Please try going back to the main Atlas window and <br />clicking the "Waypoints" navigation button again.</div>
            </div>
          </template>
          <template v-slot:group.header="{ group, toggle, isOpen }">
            <td colspan="3" class="group-header-row" @click="toggle">
              <div class="d-flex justify-center align-center group-header-text">
                <v-icon size="20" class="mr-3">{{ isOpen ? 'mdi-arrow-expand-up' : 'mdi-arrow-expand-down' }}</v-icon>
                <div class="group-header"> "{{ group }}" Waypoints </div>
                <v-icon size="20" class="ml-3">{{ isOpen ? 'mdi-arrow-expand-up' : 'mdi-arrow-expand-down' }}</v-icon>
              </div>
            </td>
          </template>
        </v-data-table>
      </v-row>
    </div>
    <WaypointCRUDWidget ref="waypointCRUDWidget" />
  </div>
</template>

<script>
import { ref, inject } from '@vue/composition-api';
import { v4 as uuidv4 } from 'uuid';

import { required } from 'vuelidate/lib/validators';

import { useMap } from '@/models/useMap.js';
import { ICON_MAP } from '@/models/useIcons.js';
import { useCoordinates } from '@/models/useCoordinates.js';

import WaypointCRUDWidget from '@/components/widgets/WaypointCRUDWidget.vue';

export default {
  name: 'WaypointManagementWidget',
  components: { WaypointCRUDWidget },

  setup() {
    const showWaypointWidget = inject('showWaypointWidget');
    const masterMapData = inject('masterMapData');

    const { scaleUpCoordinate, setupInitialPoints } = useCoordinates();

    const tableHeaders = [
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
        text: 'Actions',
        align: 'start',
        sortable: false,
        value: 'actions',
      },
    ];

    const { viewObject, showHidePoint, addPoint, deletePoint, mergePoints } = useMap(masterMapData);

    return {
      showWaypointWidget,
      masterMapData,
      tableHeaders,
      viewObject,
      showHidePoint,
      deletePoint,
      mergePoints,
      ICON_MAP,
      scaleUpCoordinate,
      setupInitialPoints,
    };
  },

  methods: {
    open() {
      this.showWaypointWidget = true;
    },

    close() {
      this.showWaypointWidget = false;
      this.$refs.waypointCRUDWidget.close();
    },

    onCreateWaypoint() {
      this.$refs.waypointCRUDWidget.open('create', null);
    },

    onView(point) {
      this.viewObject(point.mesh);
    },

    onEdit(point) {
      this.$refs.waypointCRUDWidget.open('edit', point);
    },

    onShowHide(point) {
      this.showHidePoint(point.id);
    },

    onDelete(point) {
      this.deletePoint(point);
    },

    onResetDefaults() {
      let defaultPoints = this.setupInitialPoints();
      this.mergePoints(defaultPoints);
      this.close();
    },
  },
};
</script>

<style lang="scss">
.new-waypoint-icon-select {
  .v-select-list {
    display: flex !important;
    flex-wrap: wrap;
    background: #444 !important;

    .v-list-item {
      max-width: 40px;
      padding: 0;
    }
  }
}
</style>

<style lang="scss" scoped>
@use 'sass:color';

@import '@/design/variables/_colors';

.waypoint-widget {
  z-index: 10;
  background: color.change($primary-blue, $lightness: 60%, $saturation: 50%) !important;
  width: 400px;
  position: fixed;
  top: 0;
  right: -400px;
  transition: right 0.1s ease;
  border-bottom-left-radius: 16px;
  max-height: 80vh;

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

.action-button {
  text-transform: none;
  letter-spacing: 0.02em;
  font-weight: 800;
}

.waypoint-list::v-deep {
  width: 100%;
  background-color: transparent !important;

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
    width: 24px;
    height: 24px;
    border-radius: 8px;
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
