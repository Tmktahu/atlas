<template>
  <div class="vector-crud-widget pa-3 pr-4" :class="{ open: showVectorCRUDWidget, 'with-drag-bar': isElectron }">
    <div v-if="type === 'create'" class="widget-title">Create Vector</div>
    <div v-if="type === 'edit'" class="widget-title">Edit Vector</div>

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
      <v-col class="mr-2">
        <v-text-field
          v-model="formInfo.name"
          class="input-field"
          outlined
          label="Name"
          dense
          hide-details
          :error="$v.formInfo.name.$invalid && $v.formInfo.name.$dirty"
          @input="onInput($v.formInfo.name)"
        />
      </v-col>
      <v-col>
        <v-text-field
          v-model="formInfo.length"
          class="input-field"
          outlined
          type="number"
          label="Length (m)"
          dense
          hide-details
          :disabled="mode === 'oe'"
          :error="$v.formInfo.length.$invalid && $v.formInfo.length.$dirty"
          @input="onInput($v.formInfo.length)"
        />
      </v-col>
    </v-row>

    <v-row no-gutters class="mt-2">
      <v-col class="d-flex flex-column align-center mr-1">
        <div class="col-label">Start Point</div>
        <v-text-field
          v-model="formInfo.startPoint.x"
          class="input-field mt-2"
          type="number"
          label="X Coord"
          outlined
          hide-details
          dense
          :error="$v.formInfo.startPoint.x.$invalid && $v.formInfo.startPoint.x.$dirty"
          @input="onInput($v.formInfo.start.x)"
        />
        <v-text-field
          v-model="formInfo.startPoint.y"
          class="input-field mt-2"
          type="number"
          label="Y Coord"
          outlined
          hide-details
          dense
          :error="$v.formInfo.startPoint.y.$invalid && $v.formInfo.startPoint.y.$dirty"
          @input="onInput($v.formInfo.startPoint.y)"
        />
        <v-text-field
          v-model="formInfo.startPoint.z"
          class="input-field mt-2"
          type="number"
          label="Z Coord"
          outlined
          hide-details
          dense
          :error="$v.formInfo.startPoint.z.$invalid && $v.formInfo.startPoint.z.$dirty"
          @input="onInput($v.formInfo.startPoint.z)"
        />
        <v-btn class="form-button mt-2" dense small outlined @click="onPaste('startPoint')"
          ><v-icon size="16" class="mr-1">mdi-content-paste</v-icon>Paste</v-btn
        >
      </v-col>
      <v-col class="d-flex flex-column align-center mr-1">
        <div class="col-label">Direction</div>
        <v-text-field
          v-model="formInfo.direction.x"
          class="input-field mt-2"
          type="number"
          label="X Direction"
          outlined
          hide-details
          dense
          :disabled="mode === 'oe'"
          :error="$v.formInfo.direction.x.$invalid && $v.formInfo.direction.x.$dirty"
          @input="onInput($v.formInfo.direction.x)"
        />
        <v-text-field
          v-model="formInfo.direction.y"
          class="input-field mt-2"
          type="number"
          label="Y Direction"
          outlined
          hide-details
          dense
          :disabled="mode === 'oe'"
          :error="$v.formInfo.direction.y.$invalid && $v.formInfo.direction.y.$dirty"
          @input="onInput($v.formInfo.direction.y)"
        />
        <v-text-field
          v-model="formInfo.direction.z"
          class="input-field mt-2"
          type="number"
          label="Z Direction"
          outlined
          hide-details
          dense
          :disabled="mode === 'oe'"
          :error="$v.formInfo.direction.z.$invalid && $v.formInfo.direction.z.$dirty"
          @input="onInput($v.formInfo.direction.z)"
        />
        <v-btn class="form-button mt-2" dense small outlined @click="onPaste('direction')">
          <v-icon size="16" class="mr-1">mdi-content-paste</v-icon>Paste
        </v-btn>
      </v-col>
      <v-col class="d-flex flex-column align-center">
        <div class="col-label">End Point</div>
        <v-text-field
          v-model="formInfo.endPoint.x"
          class="input-field mt-2"
          type="number"
          label="X Coord"
          outlined
          hide-details
          dense
          :disabled="mode === 'odl'"
          :error="$v.formInfo.endPoint.x.$invalid && $v.formInfo.endPoint.x.$dirty"
          @input="onInput($v.formInfo.endPoint.x)"
        />
        <v-text-field
          v-model="formInfo.endPoint.y"
          class="input-field mt-2"
          type="number"
          label="Y Coord"
          outlined
          hide-details
          dense
          :disabled="mode === 'odl'"
          :error="$v.formInfo.endPoint.y.$invalid && $v.formInfo.endPoint.y.$dirty"
          @input="onInput($v.formInfo.endPoint.y)"
        />
        <v-text-field
          v-model="formInfo.endPoint.z"
          class="input-field mt-2"
          type="number"
          label="Z Coord"
          outlined
          hide-details
          dense
          :disabled="mode === 'odl'"
          :error="$v.formInfo.endPoint.z.$invalid && $v.formInfo.endPoint.z.$dirty"
          @input="onInput($v.formInfo.endPoint.z)"
        />
        <v-btn class="form-button mt-2" dense small outlined @click="onPaste('endPoint')"><v-icon size="16" class="mr-1">mdi-content-paste</v-icon>Paste</v-btn>
      </v-col>
    </v-row>

    <v-row no-gutters class="mt-2">
      <v-tooltip bottom content-class="general-tooltip">
        <template v-slot:activator="{ on }">
          <div class="mode-wrapper d-flex flex-grow-0 px-1 mr-1 align-center" v-on="on">
            <span>ODL</span>
            <v-switch v-model="mode" hide-details dense true-value="oe" class="ma-0 pl-2" style="padding-top: 2px" false-value="odl" />
            <span style="margin-left: -2px">OE</span>
          </div>
        </template>
        <div>
          This switch controls the two modes you have available for defining vectors.
          <br />
          <strong>ODL:</strong> This mode uses the Start Point, Direction, and Length.
          <br />
          <strong>OE:</strong> This mode uses the Start Point and End Point.
        </div>
      </v-tooltip>

      <v-spacer />
      <v-btn v-if="type === 'create'" class="form-button mr-2 px-1" dense small outlined :disabled="$v.$invalid" @click="onCreate">Create</v-btn>
      <v-btn v-if="type === 'edit'" class="form-button mr-2 px-1" dense small outlined :disabled="$v.$invalid" @click="onSave">Save</v-btn>
      <v-btn class="form-button px-1" dense small outlined @click="close">Cancel</v-btn>
    </v-row>
  </div>
</template>

<script>
import { ref, inject, watch, reactive } from '@vue/composition-api';
import { v4 as uuidv4 } from 'uuid';
import { marked } from 'marked';
import { EventBus } from '@/eventBus';

import { required } from 'vuelidate/lib/validators';

import { useMap } from '@/models/useMap.js';
import { ICON_MAP } from '@/models/useIcons.js';
import { useCoordinates, ISAN_ORIGIN_POINT } from '@/models/useCoordinates.js';

export default {
  validations: {
    formInfo: {
      name: { required },
      length: { required },
      startPoint: {
        x: { required },
        y: { required },
        // eslint-disable-next-line id-length
        z: { required },
      },
      direction: {
        x: { required },
        y: { required },
        // eslint-disable-next-line id-length
        z: { required },
      },
      endPoint: {
        x: { required },
        y: { required },
        // eslint-disable-next-line id-length
        z: { required },
      },
    },
  },

  setup(_, context) {
    const isElectron = inject('isElectron');
    const showVectorCRUDWidget = inject('showVectorCRUDWidget');
    const masterMapData = inject('masterMapData');

    const type = ref('create');
    const mode = ref('odl');

    const formInfo = ref({
      name: '',
      color: '#FF0000',
      length: null,
      startPoint: {
        x: null,
        y: null,
        // eslint-disable-next-line id-length
        z: null,
      },
      direction: {
        x: null,
        y: null,
        // eslint-disable-next-line id-length
        z: null,
      },
      endPoint: {
        x: null,
        y: null,
        // eslint-disable-next-line id-length
        z: null,
      },
    });

    const colorPickerMenu = ref(false);

    const { createNewVector, saveVector } = useMap(masterMapData);
    const { scaleUpCoordinate, scaleDownCoordinate } = useCoordinates();

    return {
      isElectron,
      masterMapData,
      showVectorCRUDWidget,
      type,
      mode,
      formInfo,
      colorPickerMenu,
      createNewVector,
      saveVector,
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
        height: '36px',
        width: '36px',
        margin: '2px',
        borderRadius: this.colorPickerMenu ? '50%' : '4px',
        transition: 'border-radius 200ms ease-in-out',
      };
    },
  },

  methods: {
    open(type, vector = null) {
      this.type = type;
      this.resetForm();

      if (vector) {
        // let scaledUpPoint = this.scaleUpCoordinate(point.data);
        this.formInfo = {
          id: vector.data.id,
          name: vector.data.name,
          color: vector.data.color,
          length: this.scaleUpCoordinate(vector.data.length),
          startPoint: {
            x: this.scaleUpCoordinate(vector.data.startPoint.x),
            y: this.scaleUpCoordinate(vector.data.startPoint.y),
            // eslint-disable-next-line id-length
            z: this.scaleUpCoordinate(vector.data.startPoint.z),
          },
          direction: {
            x: vector.data.direction.x,
            y: vector.data.direction.y,
            // eslint-disable-next-line id-length
            z: vector.data.direction.z,
          },
          endPoint: {
            x: this.scaleUpCoordinate(vector.data.endPoint.x),
            y: this.scaleUpCoordinate(vector.data.endPoint.y),
            // eslint-disable-next-line id-length
            z: this.scaleUpCoordinate(vector.data.endPoint.z),
          },
        };
      }

      this.showVectorCRUDWidget = true;
      this.$v.formInfo.$reset();
    },

    close() {
      this.showVectorCRUDWidget = false;
      this.resetForm();
    },

    resetForm() {
      this.formInfo = {
        name: '',
        color: '#FF0000',
        length: null,
        startPoint: {
          x: null,
          y: null,
          // eslint-disable-next-line id-length
          z: null,
        },
        direction: {
          x: null,
          y: null,
          // eslint-disable-next-line id-length
          z: null,
        },
        endPoint: {
          x: null,
          y: null,
          // eslint-disable-next-line id-length
          z: null,
        },
      };
    },

    async onPaste(type) {
      try {
        let content = await navigator.clipboard.readText();
        if (content) {
          let coord = content.split(',');

          if (coord.length !== 3) {
            this.$toasted.global.alertError({ message: 'Paste Format Invalid', description: 'Please use the format x,y,z' });
            return;
          }

          if (type === 'startPoint') {
            this.formInfo.startPoint.x = parseFloat(coord[0]);
            this.formInfo.startPoint.y = parseFloat(coord[1]);
            // eslint-disable-next-line id-length
            this.formInfo.startPoint.z = parseFloat(coord[2]);
          } else if (type === 'direction') {
            this.formInfo.direction.x = parseFloat(coord[0]);
            this.formInfo.direction.y = parseFloat(coord[1]);
            // eslint-disable-next-line id-length
            this.formInfo.direction.z = parseFloat(coord[2]);
          } else if (type === 'endPoint') {
            this.formInfo.endPoint.x = parseFloat(coord[0]);
            this.formInfo.endPoint.y = parseFloat(coord[1]);
            // eslint-disable-next-line id-length
            this.formInfo.endPoint.z = parseFloat(coord[2]);
          }
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

      let newVectorData = {
        id: uuidv4(),
        name: this.formInfo.name,
        color: color,
        hide: false,
        startPoint: {
          x: this.scaleDownCoordinate(parseFloat(this.formInfo.startPoint.x)),
          y: this.scaleDownCoordinate(parseFloat(this.formInfo.startPoint.y)),
          // eslint-disable-next-line id-length
          z: this.scaleDownCoordinate(parseFloat(this.formInfo.startPoint.z)),
        },
        direction: {
          x: parseFloat(this.formInfo.direction.x),
          y: parseFloat(this.formInfo.direction.y),
          // eslint-disable-next-line id-length
          z: parseFloat(this.formInfo.direction.z),
        },
        endPoint: {
          x: this.scaleDownCoordinate(parseFloat(this.formInfo.endPoint.x)),
          y: this.scaleDownCoordinate(parseFloat(this.formInfo.endPoint.y)),
          // eslint-disable-next-line id-length
          z: this.scaleDownCoordinate(parseFloat(this.formInfo.endPoint.z)),
        },
        length: this.scaleDownCoordinate(parseFloat(this.formInfo.length)),
      };

      this.createNewVector(newVectorData);
      this.close();
    },

    onSave() {
      let color = '';
      if (this.formInfo.color.length > 7) {
        color = this.formInfo.color.substring(0, this.formInfo.color.length - 2);
      } else {
        color = this.formInfo.color;
      }

      let vectorData = {
        id: this.formInfo.id,
        name: this.formInfo.name,
        color: color,
        hide: false,
        startPoint: {
          x: this.scaleDownCoordinate(parseFloat(this.formInfo.startPoint.x)),
          y: this.scaleDownCoordinate(parseFloat(this.formInfo.startPoint.y)),
          // eslint-disable-next-line id-length
          z: this.scaleDownCoordinate(parseFloat(this.formInfo.startPoint.z)),
        },
        direction: {
          x: parseFloat(this.formInfo.direction.x),
          y: parseFloat(this.formInfo.direction.y),
          // eslint-disable-next-line id-length
          z: parseFloat(this.formInfo.direction.z),
        },
        endPoint: {
          x: this.scaleDownCoordinate(parseFloat(this.formInfo.endPoint.x)),
          y: this.scaleDownCoordinate(parseFloat(this.formInfo.endPoint.y)),
          // eslint-disable-next-line id-length
          z: this.scaleDownCoordinate(parseFloat(this.formInfo.endPoint.z)),
        },
        length: this.scaleDownCoordinate(parseFloat(this.formInfo.length)),
      };

      this.saveVector(vectorData);
      this.close();
    },

    onInput(validationObject) {
      validationObject.$touch();
      let hasStartPoint = this.formInfo.startPoint.x !== null && this.formInfo.startPoint.y !== null && this.formInfo.startPoint.z !== null;
      let hasDirection = this.formInfo.direction.x !== null && this.formInfo.direction.y !== null && this.formInfo.direction.z !== null;
      let hasEndPoint = this.formInfo.endPoint.x !== null && this.formInfo.endPoint.y !== null && this.formInfo.endPoint.z !== null;
      let hasLength = this.formInfo.length !== null;

      if (this.mode === 'odl') {
        // if we are in odl mode, then we want to calculate the end point
        let directionMagnitude = Math.sqrt(
          Math.pow(parseFloat(this.formInfo.direction.x), 2) +
            Math.pow(parseFloat(this.formInfo.direction.y), 2) +
            Math.pow(parseFloat(this.formInfo.direction.z), 2)
        );
        let normalizedDirection = {
          x: parseFloat(this.formInfo.direction.x) / directionMagnitude,
          y: parseFloat(this.formInfo.direction.y) / directionMagnitude,
          // eslint-disable-next-line id-length
          z: parseFloat(this.formInfo.direction.z) / directionMagnitude,
        };

        this.formInfo.endPoint.x =
          this.formInfo.startPoint.x !== null && hasDirection && hasLength
            ? parseFloat(this.formInfo.startPoint.x) + normalizedDirection.x * parseFloat(this.formInfo.length)
            : null;
        this.formInfo.endPoint.y =
          this.formInfo.startPoint.y !== null && hasDirection && hasLength
            ? parseFloat(this.formInfo.startPoint.y) + normalizedDirection.y * parseFloat(this.formInfo.length)
            : null;
        // eslint-disable-next-line id-length
        this.formInfo.endPoint.z =
          this.formInfo.startPoint.z !== null && hasDirection && hasLength
            ? parseFloat(this.formInfo.startPoint.z) + normalizedDirection.z * parseFloat(this.formInfo.length)
            : null;
      } else {
        // otherwise we want to calculate the direction and length
        let direction = {
          x: parseFloat(this.formInfo.endPoint.x) - parseFloat(this.formInfo.startPoint.x),
          y: parseFloat(this.formInfo.endPoint.y) - parseFloat(this.formInfo.startPoint.y),
          // eslint-disable-next-line id-length
          z: parseFloat(this.formInfo.endPoint.z) - parseFloat(this.formInfo.startPoint.z),
        };

        this.formInfo.direction.x = this.formInfo.endPoint.x !== null && this.formInfo.startPoint.x !== null ? direction.x : null;
        this.formInfo.direction.y = this.formInfo.endPoint.y !== null && this.formInfo.startPoint.y !== null ? direction.y : null;
        // eslint-disable-next-line id-length
        this.formInfo.direction.z = this.formInfo.endPoint.z !== null && this.formInfo.startPoint.z !== null ? direction.z : null;

        this.formInfo.length =
          hasStartPoint && hasEndPoint
            ? Math.sqrt(Math.pow(parseFloat(direction.x), 2) + Math.pow(parseFloat(direction.y), 2) + Math.pow(parseFloat(direction.z), 2))
            : null;
      }
    },

    updateMarkdown: _.debounce(function (event) {
      this.compiledDescription = marked(this.formInfo.description || '');
    }, 300),
  },
};
</script>

<style lang="scss" scoped>
@use 'sass:color';

@import '@/design/variables/_colors';

.vector-crud-widget {
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

.col-label {
  color: black;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.input-field::v-deep {
  input {
    color: black !important;
    font-weight: 500;
  }

  .v-label {
    color: black !important;
    background-color: color.change($primary-blue, $lightness: 80%, $saturation: 80%) !important;
    border-radius: 4px;
    padding: 0 4px;
    font-weight: 600;
    letter-spacing: 0.02em;
  }

  .v-input__slot {
    background-color: color.change($primary-blue, $lightness: 80%, $saturation: 80%) !important;
  }

  &.faded {
    .v-input__slot {
      background-color: color.change($primary-blue, $lightness: 80%, $saturation: 40%) !important;
    }

    .v-input__slot {
      padding: 0 6px !important;
    }

    input {
      font-size: 14px;
      padding-top: 0;
      line-height: 16px;
      padding-top: 4px;
      padding-bottom: 4px;
    }

    .v-label {
      font-size: 14px;
      line-height: 17px;
    }
  }

  &.v-input--is-disabled {
    .v-input__slot {
      background-color: color.change($primary-blue, $lightness: 80%, $saturation: 50%) !important;
    }

    .v-label {
      color: #222 !important;
      background-color: color.change($primary-blue, $lightness: 80%, $saturation: 50%) !important;
      border-radius: 4px;
      padding: 0 4px;
      font-weight: 400;
      letter-spacing: 0.02em;
    }
  }
}

.mode-wrapper {
  border: thin solid black;
  border-radius: 4px;

  span {
    color: black;
    font-weight: 500;
  }
}

.form-button {
  text-transform: none;
  font-weight: 800 !important;
  letter-spacing: 0.02em;
  height: 28px !important;
  min-height: 0 !important;
}

.with-drag-bar {
  margin-top: 30px;
}
</style>
