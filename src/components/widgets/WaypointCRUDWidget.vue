<template>
  <div class="waypoint-crud-widget pa-3 pr-4" :class="{ open: showWaypointCRUDWidget, 'with-drag-bar': isElectron }">
    <div v-if="type === 'create'" class="widget-title">Create Waypoint</div>
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
      <v-col v-if="mode === 'ips'">
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
      <v-col v-if="mode === 'ips'" class="px-2">
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
      <v-col v-if="mode === 'ips'">
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
      <v-col v-if="mode === 'isan'">
        <v-text-field
          v-model="isanX"
          type="number"
          label="X"
          class="coord-input"
          outlined
          hide-details
          flat
          solo
          :error="$v.formInfo.position.y.$invalid"
          @input="$v.formInfo.position.y.$touch"
        />
      </v-col>
      <v-col v-if="mode === 'isan'" class="px-2">
        <v-text-field
          v-model="isanY"
          type="number"
          outlined
          label="Y"
          class="coord-input"
          hide-details
          solo
          flat
          :error="$v.formInfo.position.z.$invalid"
          @input="$v.formInfo.position.z.$touch"
        />
      </v-col>
      <v-col v-if="mode === 'isan'">
        <v-text-field
          v-model="isanZ"
          outlined
          type="number"
          label="Z"
          class="coord-input"
          hide-details
          flat
          solo
          :error="$v.formInfo.position.x.$invalid"
          @input="$v.formInfo.position.x.$touch"
        />
      </v-col>
    </v-row>

    <v-row v-if="mode === 'isan'" no-gutters class="mt-2 align-center">
      <v-col class="flex-grow-0 mr-2" style="color: black; font-weight: 600; min-width: 115px; font-size: 14px"> Converted to IPS: </v-col>
      <v-col>
        <v-text-field
          v-model="formInfo.position.x"
          label="IPS X"
          class="coord-input faded"
          outlined
          disabled
          hide-details
          flat
          solo
          @change="$v.formInfo.position.y.$touch"
        />
      </v-col>
      <v-col class="px-2">
        <v-text-field
          v-model="formInfo.position.y"
          outlined
          disabled
          label="IPS Y"
          class="coord-input faded"
          hide-details
          solo
          flat
          @change="$v.formInfo.position.z.$touch"
        />
      </v-col>
      <v-col>
        <v-text-field
          v-model="formInfo.position.z"
          outlined
          disabled
          label="IPS Z"
          class="coord-input faded"
          hide-details
          flat
          solo
          @change="$v.formInfo.position.x.$touch"
        />
      </v-col>
    </v-row>

    <v-row no-gutters class="mt-2">
      <v-btn class="form-button mr-1 px-1" dense small outlined @click="onPaste"><v-icon size="16" class="mr-1">mdi-content-paste</v-icon>Paste Coord</v-btn>
      <div class="mode-wrapper d-flex flex-grow-0 px-1 mr-1 align-center">
        <span>IPS</span>
        <v-switch v-model="mode" hide-details dense true-value="isan" class="ma-0 pl-2" style="padding-top: 2px" false-value="ips" />
        <span style="margin-left: -2px">ISAN</span>
      </div>
      <v-spacer />
      <v-btn v-if="type === 'create'" class="form-button mr-2 px-1" dense small outlined :disabled="$v.$invalid" @click="onCreate">Create</v-btn>
      <v-btn v-if="type === 'edit'" class="form-button mr-2 px-1" dense small outlined :disabled="$v.$invalid" @click="onSave">Save</v-btn>
      <v-btn class="form-button px-1" dense small outlined @click="close">Cancel</v-btn>
    </v-row>

    <v-expansion-panels class="description-panel mt-2" accordion flat>
      <v-expansion-panel>
        <v-expansion-panel-header class="form-button px-1"> Description (Uses Markdown) </v-expansion-panel-header>
        <v-expansion-panel-content>
          <v-textarea v-model="formInfo.description" rows="3" hide-details solo dense auto-grow flat class="description-input mt-2" @input="updateMarkdown" />
          <v-divider class="mt-2" color="black" />
          <div class="compiled-markdown px-3 mt-2" v-html="compiledDescription" />
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
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
      group: { required },
      position: {
        x: { required },
        y: { required },
        // eslint-disable-next-line id-length
        z: { required },
      },
    },
  },

  setup(_, context) {
    const isElectron = inject('isElectron');
    const showWaypointCRUDWidget = inject('showWaypointCRUDWidget');
    const masterMapData = inject('masterMapData');
    const showInfoWidget = inject('showInfoWidget');

    const type = ref('create');
    const mode = ref('ips');

    const isanX = ref(null);
    const isanY = ref(null);
    const isanZ = ref(null);

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
      description: '',
    });

    const descriptionPanel = ref(null);
    const compiledDescription = ref('');

    const colorPickerMenu = ref(false);

    let icons = Object.values(ICON_MAP).map((value) => {
      return { text: value.workingFilePath, value: value.name };
    });

    const { createNewPoint, savePoint } = useMap(masterMapData);
    const { scaleUpCoordinate, scaleDownCoordinate } = useCoordinates();

    watch([isanX, isanY, isanZ, mode], () => {
      formInfo.value.position.x = isanZ.value ? parseInt(isanZ.value) + ISAN_ORIGIN_POINT.position.x : null;
      formInfo.value.position.y = isanX.value ? parseInt(isanX.value) + ISAN_ORIGIN_POINT.position.y : null;
      // eslint-disable-next-line id-length
      formInfo.value.position.z = isanY.value ? parseInt(isanY.value) + ISAN_ORIGIN_POINT.position.z : null;
    });

    return {
      isElectron,
      masterMapData,
      showWaypointCRUDWidget,
      showInfoWidget,
      type,
      mode,
      formInfo,
      compiledDescription,
      colorPickerMenu,
      icons,
      createNewPoint,
      savePoint,
      scaleUpCoordinate,
      scaleDownCoordinate,
      isanX,
      isanY,
      isanZ,
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

  mounted() {
    EventBus.$on('openEditWidget', (data) => {
      this.open('edit', data);
    });
  },

  methods: {
    open(type, point = null) {
      this.type = type;

      if (point) {
        let scaledUpPoint = this.scaleUpCoordinate(point.data);
        this.formInfo = scaledUpPoint;
        this.updateMarkdown();
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
        description: this.formInfo.description,
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
        description: this.formInfo.description,
      };

      let scaledDownPoint = this.scaleDownCoordinate(pointData);
      this.savePoint(scaledDownPoint);

      this.close();
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

  &.faded {
    .v-input__slot {
      min-height: 0 !important;
      background-color: color.change($primary-blue, $lightness: 80%, $saturation: 40%) !important;
    }

    .v-input__control {
      min-height: 15px;
    }

    .v-input__slot {
      min-height: 15px !important;
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

.description-panel::v-deep {
  .v-expansion-panel {
    background: transparent !important;
  }

  .v-expansion-panel-header {
    border: 1px solid black;
    border-radius: 4px;
    &:hover {
      background: rgba(0, 0, 0, 0.1);
    }
  }

  .v-expansion-panel-content__wrap {
    padding: 0 !important;
  }

  .description-input {
    .v-input__slot {
      background-color: color.change($primary-blue, $lightness: 80%, $saturation: 40%) !important;
    }

    textarea {
      max-height: 200px;
      min-height: 100px;
      overflow-y: auto;
      margin: 0 !important;
    }
  }

  .compiled-markdown {
    border-radius: 4px;
    background: color.change($primary-blue, $lightness: 60%, $saturation: 50%) !important;
    max-height: 200px;
    min-height: 100px;
  }
}

.with-drag-bar {
  margin-top: 30px;
}
</style>
