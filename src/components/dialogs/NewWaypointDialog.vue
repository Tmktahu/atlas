<!-- eslint-disable vue/valid-v-slot */ -->
<template>
  <div class="d-flex flex-column" style="height: 100vh">
    <div class="page-title px-6 pt-5">Waypoint Management</div>
    <div class="page-title--sub px-6">Add a new waypoint with the form below. Manage waypoints with the list.</div>
    <v-divider color="primary-blue" class="mt-4" />
    <div class="d-flex align-center new-coord-form px-6 my-6">
      <v-text-field v-model="newName" label="Name" class="name-input mr-5" hide-details solo />
      <v-text-field v-model="xCoord" type="number" label="X" class="coord-input mr-5" hide-details solo />
      <v-text-field v-model="yCoord" type="number" label="Y" class="coord-input mr-5" hide-details solo />
      <v-text-field v-model="zCoord" type="number" label="Z" class="coord-input mr-5" hide-details solo />
      <v-btn class="add-new-button" dense outlined @click="onAdd"><v-icon>mdi-plus</v-icon>Add</v-btn>
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
import { ref } from '@vue/composition-api';
import { v4 as uuidv4 } from 'uuid';

export default {
  setup() {
    const newName = ref('');
    const xCoord = ref(0);
    const yCoord = ref(0);
    const zCoord = ref(0);

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
      newName,
      xCoord,
      yCoord,
      zCoord,
      tableHeaders,
      allWaypoints,
      parentWindow,
    };
  },

  methods: {
    onAdd() {
      console.log('trying to add point', this.newName, this.xCoord, this.yCoord, this.zCoord);
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
            color: 'red',
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

  .v-input__slot {
    background-color: #ccc !important;
  }

  .add-new-button {
    color: $primary-blue;
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
</style>
