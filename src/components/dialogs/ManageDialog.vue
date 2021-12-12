<!-- eslint-disable vue/valid-v-slot */ -->
<template>
  <v-dialog v-model="showDialog" content-class="manage-dialog">
    <v-btn text class="close-button pa-2" @click="close"><v-icon>mdi-close</v-icon></v-btn>
    <div class="page-title px-6 pt-5">Waypoint Management</div>
    <div class="page-title--sub px-6">Add a new waypoint with the form below. Manage waypoints with the list.</div>
    <div class="page-title--sub px-6">!!! Note this map uses <a href="https://github.com/Tmktahu/IPS" target="_blank">IPS</a> Coordinates !!!</div>
    <v-divider color="primary-blue" class="mt-4" />

    <div class="d-flex flex-column px-6 my-6">
      <div class="d-flex align-center">
        <v-select
          v-model="newIcon"
          :menu-props="{ auto: true, contentClass: 'new-waypoint-icon-select' }"
          class="icon-select mr-2"
          dense
          hide-details
          :items="icons"
          background-color="transparent"
          flat
          solo
        >
          <template v-slot:item="{ item }">
            <v-tooltip top>
              <template v-slot:activator="{ on }">
                <img :src="item.text" contain width="24px" style="margin-right: auto; margin-left: auto" v-on="on" />
              </template>
              <div class="icon-tooltip-text">{{ item.value.replaceAll('_', ' ') }}</div>
            </v-tooltip>
          </template>
          <template v-slot:selection="{ item }">
            <img :src="item.text" contain width="34px" />
          </template>
        </v-select>
        <v-color-picker v-model="newColor" class="color-picker mr-3" flat hide-canvas mode="hexa" hide-inputs />
        <v-text-field
          v-model="newName"
          outlined
          label="Name"
          class="name-input mr-5"
          hide-details
          flat
          solo
          :error="$v.newName.$invalid"
          @input="$v.newName.$touch"
        />
        <v-text-field
          v-model="newGroup"
          outlined
          label="Group"
          class="name-input"
          hide-details
          flat
          solo
          :error="$v.newGroup.$invalid"
          @input="$v.newGroup.$touch"
        />
      </div>
      <div class="d-flex mt-3 new-coord-form align-center">
        <v-text-field
          v-model="xCoord"
          type="number"
          label="X"
          class="coord-input mr-5"
          outlined
          hide-details
          flat
          solo
          :error="$v.xCoord.$invalid"
          @input="$v.xCoord.$touch"
        />
        <v-text-field
          v-model="yCoord"
          type="number"
          outlined
          label="Y"
          class="coord-input mr-5"
          hide-details
          solo
          flat
          :error="$v.yCoord.$invalid"
          @input="$v.yCoord.$touch"
        />
        <v-text-field
          v-model="zCoord"
          outlined
          type="number"
          label="Z"
          class="coord-input mr-5"
          hide-details
          flat
          solo
          :error="$v.zCoord.$invalid"
          @input="$v.zCoord.$touch"
        />
        <v-btn class="add-new-button" dense outlined :class="{ disabled: $v.$invalid }" @click="onAdd"><v-icon>mdi-plus</v-icon>Add</v-btn>
      </div>
    </div>
    <v-divider color="primary-blue" />

    <v-data-table
      class="waypoint-list"
      :items="masterPointsArray"
      :items-per-page="-1"
      fixed-header
      hide-default-footer
      disable-pagination
      :headers="tableHeaders"
      group-by="group"
    >
      <template v-slot:item.name="{ item }">
        <div class="d-flex align-center">
          <div class="image-wrapper" :style="{ 'background-color': item.color }">
            <img :src="ICON_MAP[item.icon].workingFilePath" contain width="20px" height="20px" style="filter: invert(1)" />
          </div>
          <span class="pl-3"> {{ item.name }}</span>
        </div>
      </template>
      <template v-slot:item.position="{ item }">
        <div class="d-flex">
          {{ `[${scaleUpCoordinate(item.position.x)}, ${scaleUpCoordinate(item.position.y)}, ${scaleUpCoordinate(item.position.z)}]` }}
        </div>
      </template>
      <template v-slot:item.actions="{ item }">
        <div class="d-flex">
          <v-btn class="action-button view mr-2" small dense outlined @click="onView(item)">View</v-btn>
          <v-btn class="action-button mr-2" :class="{ show: item.hide, hide: !item.hide }" small dense outlined @click="onShowHide(item)">{{
            item.hide ? 'Show' : 'Hide'
          }}</v-btn>
          <v-btn class="action-button delete" small dense outlined @click="onDelete(item)">Delete</v-btn>
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
  </v-dialog>
</template>

<script>
import { ref, watch, inject, toRefs } from '@vue/composition-api';
import { v4 as uuidv4 } from 'uuid';

import { required } from 'vuelidate/lib/validators';

import { useMap } from '@/models/useMap.js';
import { ICON_MAP } from '@/models/useIcons.js';
import { useCoordinates } from '@/models/useCoordinates.js';

export default {
  name: 'ManageDialog',

  validations: {
    newName: { required },
    newGroup: { required },
    xCoord: { required },
    yCoord: { required },
    zCoord: { required },
  },

  setup() {
    const masterMapData = inject('masterMapData');
    const showDialog = inject('showManageDialog');
    const masterPointsArray = inject('masterPointsArray');

    const newIcon = ref(ICON_MAP.pin1.name);
    const newColor = ref(null);
    const newName = ref('');
    const xCoord = ref(null);
    const yCoord = ref(null);
    const zCoord = ref(null);
    const newGroup = ref('');

    const { scaleUpCoordinate } = useCoordinates();

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

    let icons = Object.values(ICON_MAP).map((value) => {
      return { text: value.workingFilePath, value: value.name };
    });

    const { viewObject, showHidePoint, addPoint, deletePoint } = useMap(masterMapData, masterPointsArray);

    return {
      masterPointsArray,
      showDialog,
      newIcon,
      newColor,
      newName,
      xCoord,
      yCoord,
      zCoord,
      tableHeaders,
      icons,
      newGroup,
      ICON_MAP,
      viewObject,
      showHidePoint,
      addPoint,
      deletePoint,
      scaleUpCoordinate,
    };
  },

  methods: {
    onAdd() {
      let color = this.newColor.hexa.substring(0, this.newColor.hexa.length - 2);

      let newPoint = {
        id: uuidv4(),
        name: this.newName,
        type: 'custom',
        position: {
          x: parseInt(this.xCoord),
          y: parseInt(this.yCoord),
          // eslint-disable-next-line id-length
          z: parseInt(this.zCoord),
        },
        color: color,
        hide: false,
        icon: this.newIcon,
        group: this.newGroup,
      };

      this.addPoint(newPoint);
    },

    onView(point) {
      this.viewObject(point);
    },

    onShowHide(point) {
      this.showHidePoint(point.id);
    },

    onDelete(point) {
      this.deletePoint(point);
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
.manage-dialog {
  position: relative;
  max-width: 60vw;
  height: 90vh;
  overflow: hidden !important;
  background: #333;
}
</style>

<style lang="scss" scoped>
@use 'sass:color';

@import '@/design/variables/_colors';

.close-button {
  position: absolute;
  top: 16px;
  right: 16px;
  width: fit-content;
  color: white;
}

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

.new-coord-form::v-deep {
  .v-input__control {
    min-height: 0 !important;
  }

  .v-label {
    color: #aaa !important;
  }

  input {
    color: #ddd !important;
  }

  .v-input__slot {
    min-height: 0 !important;
    background-color: #333 !important;
  }

  .add-new-button {
    height: 32px !important;
    min-height: 0 !important;
    color: $primary-blue;

    &.disabled {
      color: red;
      pointer-events: none;
      opacity: 0.6;
    }
  }
}

.name-input::v-deep {
  .v-input__control {
    min-height: 0 !important;
  }

  input {
    color: #ddd !important;
  }

  .v-label {
    color: #aaa !important;
  }

  .v-input__slot {
    min-height: 0 !important;
    background-color: #333 !important;
  }
}

.waypoint-list::v-deep {
  max-height: calc(100vh - 135px);
  background-color: transparent !important;

  .v-data-table__wrapper {
    height: calc(90vh - 277px);
  }

  .image-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 8px;
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
      background: #444 !important;
    }
  }

  td {
    height: 32px !important;
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
    height: 26px !important;
    padding: 0 !important;

    &:hover {
      cursor: pointer;
      background: color.change($primary-blue, $lightness: 40%, $saturation: 50%) !important;
    }
  }
}

.action-button {
  height: 20px !important;

  text-transform: none;

  &.view {
    color: $primary-blue;
  }

  &.delete {
    color: red;
  }

  &.show {
    color: green;
  }

  &.hide {
    color: orange;
  }
}

.hideable-scrollbar {
  overflow-y: hidden !important;

  &:hover {
    overflow-y: overlay !important;
  }
}
</style>
