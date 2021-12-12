<template>
  <div class="waypoint-crud-widget pa-3 pr-4" :class="{ open: showWaypointCRUDWidget }">
    <div v-if="type === 'create'" class="widget-title">Create Waypoint (Uses <a href="https://github.com/Tmktahu/IPS" target="_blank">IPS Coordinates</a>)</div>
    <div v-if="type === 'edit'" class="widget-title">Edit Waypoint</div>

    <v-row no-gutters class="mt-2">
      <v-select
        v-model="formInfo.icon"
        :menu-props="{ contentClass: 'new-waypoint-icon-select', nudgeBottom: 40, zIndex: 30 }"
        class="icon-select pl-1 mr-2"
        dense
        hide-details
        :items="icons"
        background-color="transparent"
        flat
        solo
        bottom
        nudge-bottom="100px"
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
          <img :src="item.text" contain width="24px" />
        </template>
      </v-select>
      <v-col>
        <v-text-field
          v-model="formInfo.name"
          outlined
          label="Name"
          class="name-input mr-1"
          hide-details
          flat
          solo
          :error="$v.formInfo.name.$invalid"
          @input="$v.formInfo.name.$touch"
        />
      </v-col>
      <v-col>
        <v-text-field
          v-model="formInfo.group"
          outlined
          label="Group"
          class="name-input ml-1"
          hide-details
          flat
          solo
          :error="$v.formInfo.group.$invalid"
          @input="$v.formInfo.group.$touch"
        />
      </v-col>
    </v-row>

    <v-row no-gutters class="mt-2">
      <v-col class="flex-grow-0 mr-2">
        <v-menu v-model="colorPickerMenu" left offset-x nudge-left="10" :close-on-content-click="false">
          <template v-slot:activator="{ on }">
            <div :style="swatchStyle" v-on="on" />
          </template>
          <v-card>
            <v-card-text class="pa-0">
              <v-color-picker v-model="formInfo.color" mode="hexa" flat />
            </v-card-text>
          </v-card>
        </v-menu>
      </v-col>
      <v-col>
        <v-text-field
          v-model="formInfo.position.x"
          type="number"
          label="X"
          class="coord-input"
          outlined
          hide-details
          flat
          solo
          :error="$v.formInfo.position.x.$invalid"
          @input="$v.formInfo.position.x.$touch"
        />
      </v-col>
      <v-col class="px-2">
        <v-text-field
          v-model="formInfo.position.y"
          type="number"
          outlined
          label="Y"
          class="coord-input"
          hide-details
          solo
          flat
          :error="$v.formInfo.position.y.$invalid"
          @input="$v.formInfo.position.y.$touch"
        />
      </v-col>
      <v-col>
        <v-text-field
          v-model="formInfo.position.z"
          outlined
          type="number"
          label="Z"
          class="coord-input"
          hide-details
          flat
          solo
          :error="$v.formInfo.position.z.$invalid"
          @input="$v.formInfo.position.z.$touch"
        />
      </v-col>
    </v-row>

    <v-row no-gutters class="mt-2">
      <v-btn class="form-button mr-2" dense small outlined @click="onPaste"><v-icon size="16" class="mr-1">mdi-content-paste</v-icon>Paste Coord</v-btn>
      <v-spacer />
      <v-btn v-if="type === 'create'" class="form-button mr-2" dense small outlined :disabled="$v.$invalid" @click="onCreate">Create</v-btn>
      <v-btn v-if="type === 'edit'" class="form-button mr-2" dense small outlined :disabled="$v.$invalid" @click="onSave">Save</v-btn>
      <v-btn class="form-button" dense small outlined @click="close">Cancel</v-btn>
    </v-row>
  </div>
</template>

<script>
import { ref, inject, reactive } from '@vue/composition-api';
import { v4 as uuidv4 } from 'uuid';

import { required } from 'vuelidate/lib/validators';

import { useMap } from '@/models/useMap.js';
import { ICON_MAP } from '@/models/useIcons.js';
import { useCoordinates } from '@/models/useCoordinates.js';

export default {
  validations: {
    formInfo: {
      name: { required },
      group: { required },
      position: {
        x: { required },
        y: { required },
        // eslint-disable-next-line id-length
        z: { required },
      },
    },
  },

  setup() {
    const showWaypointCRUDWidget = inject('showWaypointCRUDWidget');
    const masterMapData = inject('masterMapData');
    const masterPointsArray = inject('masterPointsArray');

    const type = ref('create');

    const formInfo = ref({
      name: '',
      group: '',
      icon: ICON_MAP.pin1.name,
      color: '#FF0000',
      position: {
        x: null,
        y: null,
        // eslint-disable-next-line id-length
        z: null,
      },
    });

    const colorPickerMenu = ref(false);

    let icons = Object.values(ICON_MAP).map((value) => {
      return { text: value.workingFilePath, value: value.name };
    });

    const { createNewPoint, savePoint } = useMap(masterMapData, masterPointsArray);
    const { scaleUpCoordinate, scaleDownCoordinate } = useCoordinates();

    return {
      showWaypointCRUDWidget,
      type,
      formInfo,
      colorPickerMenu,
      icons,
      createNewPoint,
      savePoint,
      scaleUpCoordinate,
      scaleDownCoordinate,
    };
  },

  computed: {
    swatchStyle() {
      let ctx = document.createElement('canvas').getContext('2d');
      ctx.fillStyle = this.formInfo.color;

      return {
        'background-color': ctx.fillStyle || '#FF0000',
        cursor: 'pointer',
        height: '30px',
        width: '30px',
        borderRadius: this.colorPickerMenu ? '50%' : '4px',
        transition: 'border-radius 200ms ease-in-out',
      };
    },
  },

  methods: {
    open(type, point = null) {
      this.type = type;

      if (point) {
        let scaledUpPoint = this.scaleUpCoordinate(point.data);
        this.formInfo = scaledUpPoint;
        console.log(this.formInfo.color);
      }

      this.showWaypointCRUDWidget = true;
      this.$v.formInfo.$reset();
    },

    close() {
      this.showWaypointCRUDWidget = false;
      this.formInfo = {
        name: '',
        group: '',
        icon: ICON_MAP.pin1.name,
        color: '#FF0000',
        position: {
          x: null,
          y: null,
          // eslint-disable-next-line id-length
          z: null,
        },
      };
    },

    async onPaste() {
      try {
        let content = await navigator.clipboard.readText();
        if (content) {
          let coord = content.split(',');

          if (coord.length !== 3) {
            this.$toasted.global.alertError({ message: 'Paste Format Invalid', description: 'Please use the format x,y,z' });
            return;
          }

          this.formInfo.position.x = parseFloat(coord[0]);
          this.formInfo.position.y = parseFloat(coord[1]);
          // eslint-disable-next-line id-length
          this.formInfo.position.z = parseFloat(coord[2]);
        } else {
          this.$toasted.global.alertError({ message: 'Paste failed' });
          console.error('Failed to paste: ', error);
        }
      } catch (error) {
        this.$toasted.global.alertError({ message: 'Paste failed' });
        console.error('Failed to paste: ', error);
      }
    },

    onCreate() {
      let color = '';
      if (this.formInfo.color.length > 7) {
        color = this.formInfo.color.substring(0, this.formInfo.color.length - 2);
      } else {
        color = this.formInfo.color;
      }

      let newPointData = {
        id: uuidv4(),
        name: this.formInfo.name,
        type: 'custom',
        position: {
          x: parseInt(this.formInfo.position.x),
          y: parseInt(this.formInfo.position.y),
          // eslint-disable-next-line id-length
          z: parseInt(this.formInfo.position.z),
        },
        color: color,
        hide: false,
        icon: this.formInfo.icon,
        group: this.formInfo.group,
      };

      let scaledDownPoint = this.scaleDownCoordinate(newPointData);
      this.createNewPoint(scaledDownPoint);
      this.close();
    },

    onSave() {
      let color = '';
      if (this.formInfo.color.length > 7) {
        color = this.formInfo.color.substring(0, this.formInfo.color.length - 2);
      } else {
        color = this.formInfo.color;
      }

      let pointData = {
        id: this.formInfo.id,
        name: this.formInfo.name,
        type: this.formInfo.type,
        position: {
          x: parseInt(this.formInfo.position.x),
          y: parseInt(this.formInfo.position.y),
          // eslint-disable-next-line id-length
          z: parseInt(this.formInfo.position.z),
        },
        color: color,
        icon: this.formInfo.icon,
        group: this.formInfo.group,
      };

      let scaledDownPoint = this.scaleDownCoordinate(pointData);
      this.savePoint(scaledDownPoint);
      this.close();
    },
  },
};
</script>

<style lang="scss" scoped>
@use 'sass:color';

@import '@/design/variables/_colors';

.waypoint-crud-widget {
  z-index: 5;
  background: color.change($primary-blue, $lightness: 50%, $saturation: 50%);
  width: 400px;
  position: fixed;
  top: 0;
  right: -400px;
  transition: right 0.1s ease;
  border-bottom-left-radius: 16px;
  max-height: 80vh;

  &.open {
    right: 395px;
  }
}

.widget-title {
  font-size: 18px;
  letter-spacing: 0.03em;
  font-weight: 600;
  color: black;

  a {
    color: black !important;
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
}

.name-input::v-deep {
  .v-input__control {
    min-height: 0 !important;
  }

  input {
    color: black !important;
    font-weight: 500;
    letter-spacing: 0.02em;
  }

  .v-label {
    color: black !important;
  }

  .v-input__slot {
    min-height: 0 !important;
    background-color: color.change($primary-blue, $lightness: 80%, $saturation: 80%) !important;
  }
}

.coord-input::v-deep {
  .v-input__control {
    min-height: 20px;
  }

  .v-input__slot {
    min-height: 20px;
  }

  input {
    color: black !important;
    font-weight: 500;
  }

  .v-label {
    color: black !important;
  }

  .v-input__slot {
    min-height: 0 !important;
    background-color: color.change($primary-blue, $lightness: 80%, $saturation: 80%) !important;
  }
}

.icon-select::v-deep {
  height: 32px;
  min-width: 0px;
  max-width: 50px;
  background: #444 !important;

  .v-input__slot {
    min-height: 32px;
    padding: 0 !important;
  }

  i {
    color: white !important;
  }
}

.icon-tooltip-text {
  text-transform: capitalize;
}

.form-button {
  text-transform: none;
  font-weight: 800 !important;
  letter-spacing: 0.02em;
  height: 28px !important;
  min-height: 0 !important;
}
</style>
