<!-- eslint-disable vue/valid-v-slot */ -->
<template>
  <div class="d-flex flex-column" style="height: 100vh">
    <div class="page-title px-6 pt-5">Waypoint Management</div>
    <div class="page-title--sub px-6">Add a new waypoint with the form below. Manage waypoints with the list.</div>
    <v-divider color="primary-blue" class="mt-4" />
    <div class="d-flex flex-column px-6 my-6">
      <div class="d-flex align-center">
        <v-select
          v-model="newIcon"
          :menu-props="{ bottom: true, offsetY: true }"
          class="icon-select"
          dense
          hide-details
          :items="icons"
          :item-color="newColor && newColor.hexa"
          background-color="transparent"
          flat
          solo
        >
          <template v-slot:item="{ item }">
            <img :src="item.text" contain width="24px" style="margin-right: auto; margin-left: auto" />
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
          class="name-input"
          hide-details
          flat
          solo
          :error="$v.newName.$invalid"
          @input="$v.newName.$touch"
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

    <v-data-table class="waypoint-list" :items="allWaypoints" :items-per-page="-1" fixed-header hide-default-footer disable-pagination :headers="tableHeaders">
      <template v-slot:item.name="{ item }">
        <div class="d-flex">
          <v-icon :color="item.color">mdi-circle</v-icon>
          <span class="pl-3"> {{ item.name }}</span>
        </div>
      </template>
      <template v-slot:item.position="{ item }">
        <div class="d-flex">
          {{ `[${item.position.x}, ${item.position.y}, ${item.position.z}]` }}
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
          <div class="pt-2">There was a problem.</div>
          <div class="pt-2 pb-4">Please try going back to the main Atlas window and <br />clicking the "Waypoints" navigation button again.</div>
        </div>
      </template>
    </v-data-table>
  </div>
</template>

<script>
import { ref, watch } from '@vue/composition-api';
import { v4 as uuidv4 } from 'uuid';

import { required } from 'vuelidate/lib/validators';

import diamond1 from '@/assets/map_icons/diamond1.png';
import diamond2 from '@/assets/map_icons/diamond2.png';
import dot from '@/assets/map_icons/dot.png';
import pin1 from '@/assets/map_icons/pin1.png';
import pin2 from '@/assets/map_icons/pin2.png';
import pin3 from '@/assets/map_icons/pin3.png';
import satellite from '@/assets/map_icons/satellite.png';
import shield from '@/assets/map_icons/shield.png';
import ship1 from '@/assets/map_icons/ship1.png';
import ship2 from '@/assets/map_icons/ship2.png';
import ship3 from '@/assets/map_icons/ship3.png';
import ship4 from '@/assets/map_icons/ship4.png';
import stargate from '@/assets/map_icons/stargate.png';
import station1 from '@/assets/map_icons/station1.png';
import station2 from '@/assets/map_icons/station2.png';
import station3 from '@/assets/map_icons/station3.png';
import target from '@/assets/map_icons/target.png';

export default {
  name: 'NewWaypointDialog',

  validations: {
    newName: { required },
    xCoord: { required },
    yCoord: { required },
    zCoord: { required },
  },

  setup() {
    const newIcon = ref(pin1);
    const newColor = ref(null);
    const newName = ref('');
    const xCoord = ref(null);
    const yCoord = ref(null);
    const zCoord = ref(null);

    const allWaypoints = ref();

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

    const icons = [
      { text: diamond1, value: diamond1 },
      { text: diamond2, value: diamond2 },
      { text: dot, value: dot },
      { text: pin1, value: pin1 },
      { text: pin2, value: pin2 },
      { text: pin3, value: pin3 },
      { text: target, value: target },
      { text: shield, value: shield },
      { text: satellite, value: satellite },
      { text: ship1, value: ship1 },
      { text: ship2, value: ship2 },
      { text: ship3, value: ship3 },
      { text: ship4, value: ship4 },
      { text: stargate, value: stargate },
      { text: station1, value: station1 },
      { text: station2, value: station2 },
      { text: station3, value: station3 },
    ];

    watch(newColor, () => {
      console.log(newColor.value);
    });

    const parentWindow = ref(null);
    window.addEventListener(
      'message',
      (event) => {
        if (event.data.points) {
          parentWindow.value = event.source;
          allWaypoints.value = event.data.points;
        }
      },
      false
    );

    return {
      newIcon,
      newColor,
      newName,
      xCoord,
      yCoord,
      zCoord,
      tableHeaders,
      allWaypoints,
      parentWindow,
      icons,
    };
  },

  methods: {
    onAdd() {
      if (this.parentWindow !== null) {
        this.parentWindow.postMessage({
          command: 'add',
          point: {
            id: uuidv4(),
            name: this.newName,
            position: {
              x: parseInt(this.xCoord),
              y: parseInt(this.yCoord),
              // eslint-disable-next-line id-length
              z: parseInt(this.zCoord),
            },
            color: this.newColor.hexa,
            hide: false,
            icon: this.newIcon,
          },
        });
      }
    },

    onView(point) {
      if (this.parentWindow !== null) {
        this.parentWindow.postMessage({
          command: 'view',
          point: point,
        });
      }
    },

    onShowHide(point) {
      if (this.parentWindow !== null) {
        this.parentWindow.postMessage({
          command: 'showHide',
          point: point,
        });
      }
    },

    onDelete(point) {
      if (this.parentWindow !== null) {
        this.parentWindow.postMessage({
          command: 'delete',
          point: point,
        });
      }
    },
  },
};
</script>

<style lang="scss">
.v-select-list {
  display: flex;
  flex-wrap: wrap;
  background: #444 !important;

  .v-list-item {
    max-width: 40px;
    padding: 0;
  }
}
</style>

<style lang="scss" scoped>
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
    height: calc(100vh - 195px);
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
    color: white;
    border-bottom: 1px solid #666 !important;
  }
}

.action-button {
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

.color-picker::v-deep {
  width: 200px;
  background: transparent;

  .v-color-picker__controls {
    padding: 10px 10px 10px 0 !important;
  }

  .v-slider__thumb {
    cursor: pointer;
  }

  .v-color-picker__hue {
    margin-top: 2px;
    margin-bottom: 0 !important;
  }

  .v-slider__thumb::after {
    width: 12px;
    height: 12px;
  }

  .v-color-picker__alpha {
    display: none;
  }

  .v-slider__thumb::before {
    top: -6px;
    left: -6px;
    width: 24px !important;
    height: 24px !important;
  }

  .v-slider__thumb-container--active {
    .v-slider__thumb::before {
      transform: scale(1) !important;
    }
  }
}

.icon-select {
  width: 30px;
}
</style>
