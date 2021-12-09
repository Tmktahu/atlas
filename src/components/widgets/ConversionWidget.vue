<template>
  <div v-if="conversionWidgetOpen" class="conversion-widget py-3 px-2">
    <v-row no-gutters>
      <v-col>
        <div style="color: black; font-size: 16px">
          Copy/Paste actions use the format <strong>x,y,z</strong>
          <br />
          i.e. <strong>-1234,287,-17</strong>
        </div>
      </v-col>

      <v-col class="d-flex flex-column flex-grow-0">
        <v-spacer />

        <v-btn icon @click="onOpenExternal(leftSelect)">
          <v-icon size="18">mdi-open-in-new</v-icon>
        </v-btn>

        <v-tooltip left>
          <template v-slot:activator="{ on }">
            <v-btn icon class="action-button" v-on="on" @click="onClear('left')">
              <v-icon size="18">mdi-cancel</v-icon>
            </v-btn>
          </template>
          <div>Clear</div>
        </v-tooltip>

        <v-tooltip left>
          <template v-slot:activator="{ on }">
            <v-btn icon v-on="on" @click="onPaste('left')">
              <v-icon size="18">mdi-content-paste</v-icon>
            </v-btn>
          </template>
          <div>Paste</div>
        </v-tooltip>

        <v-tooltip left>
          <template v-slot:activator="{ on }">
            <v-btn icon v-on="on" @click="onCopy('left')">
              <v-icon size="18">mdi-content-copy</v-icon>
            </v-btn>
          </template>
          <div>Copy</div>
        </v-tooltip>
      </v-col>

      <v-col class="input-col mr-6 flex-grow-0">
        <v-select v-model="leftSelect" class="option-select" :menu-props="{ nudgeBottom: '45px' }" outlined hide-details dense :items="conversionOptions" />

        <div class="d-flex align-center">
          <span class="number-input-label mr-1 pt-1">X: </span>
          <v-text-field v-model="inputLeftX" class="number-input" hide-details dense type="number" @input="onInputChange('left')" />
        </div>

        <div class="d-flex align-center">
          <span class="number-input-label mr-1 pt-1">Y: </span>
          <v-text-field v-model="inputLeftY" class="number-input" hide-details dense type="number" @input="onInputChange('left')" />
        </div>

        <div class="d-flex align-center">
          <span class="number-input-label mr-1 pt-1">Z: </span>
          <v-text-field v-model="inputLeftZ" class="number-input" hide-details dense type="number" @input="onInputChange('left')" />
        </div>
      </v-col>

      <v-col class="d-flex flex-column flex-grow-0">
        <v-spacer />

        <v-btn icon @click="onOpenExternal(rightSelect)">
          <v-icon size="18">mdi-open-in-new</v-icon>
        </v-btn>

        <v-tooltip left>
          <template v-slot:activator="{ on }">
            <v-btn icon class="action-button" v-on="on" @click="onClear('right')">
              <v-icon size="18">mdi-cancel</v-icon>
            </v-btn>
          </template>
          <div>Clear</div>
        </v-tooltip>

        <v-tooltip left>
          <template v-slot:activator="{ on }">
            <v-btn icon v-on="on" @click="onPaste('right')">
              <v-icon size="18">mdi-content-paste</v-icon>
            </v-btn>
          </template>
          <div>Paste</div>
        </v-tooltip>

        <v-tooltip left>
          <template v-slot:activator="{ on }">
            <v-btn icon v-on="on" @click="onCopy('right')">
              <v-icon size="18">mdi-content-copy</v-icon>
            </v-btn>
          </template>
          <div>Copy</div>
        </v-tooltip>
      </v-col>

      <v-col class="input-col mr-6 flex-grow-0">
        <v-select v-model="rightSelect" class="option-select" :menu-props="{ nudgeBottom: '45px' }" outlined hide-details dense :items="conversionOptions" />

        <div class="d-flex align-center">
          <span class="number-input-label mr-1 pt-1">X: </span>
          <v-text-field v-model="inputRightX" class="number-input" hide-details dense type="number" @input="onInputChange('right')" />
        </div>

        <div class="d-flex align-center">
          <span class="number-input-label mr-1 pt-1">Y: </span>
          <v-text-field v-model="inputRightY" class="number-input" hide-details dense type="number" @input="onInputChange('right')" />
        </div>

        <div class="d-flex align-center">
          <span class="number-input-label mr-1 pt-1">Z: </span>
          <v-text-field v-model="inputRightZ" class="number-input" hide-details dense type="number" @input="onInputChange('right')" />
        </div>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { ref, watch, inject } from '@vue/composition-api';

import { useCoordinates, ISAN_ORIGIN_POINT } from '@/models/useCoordinates.js';

export default {
  setup() {
    const conversionWidgetOpen = inject('conversionWidgetOpen');
    const leftNavCondensed = inject('leftNavCondensed');

    const leftSelect = ref('isan');
    const rightSelect = ref('ips');

    const inputLeftX = ref(0);
    const inputLeftY = ref(0);
    const inputLeftZ = ref(0);

    const inputRightX = ref(0);
    const inputRightY = ref(0);
    const inputRightZ = ref(0);

    const ignoreUpdate = ref(false);

    const conversionOptions = [
      { text: 'ISAN', value: 'isan' },
      { text: 'IPS', value: 'ips' },
      //{ text: 'SignaTrope', value: 'signa' },
    ];

    const { scaleUpCoordinate, scaleDownCoordinate } = useCoordinates();

    return {
      conversionWidgetOpen,
      leftNavCondensed,
      conversionOptions,
      ignoreUpdate,
      leftSelect,
      rightSelect,
      inputLeftX,
      inputLeftY,
      inputLeftZ,
      inputRightX,
      inputRightY,
      inputRightZ,
      scaleUpCoordinate,
      scaleDownCoordinate,
    };
  },

  watch: {
    leftSelect(newValue, oldValue) {
      if (this.ignoreUpdate) {
        this.ignoreUpdate = false;
        return;
      }

      if (newValue === this.rightSelect) {
        this.ignoreUpdate = true;
        this.rightSelect = oldValue;
      }
      this.onInputChange('left');
    },

    rightSelect(newValue, oldValue) {
      if (this.ignoreUpdate) {
        this.ignoreUpdate = false;
        return;
      }

      if (newValue === this.leftSelect) {
        this.ignoreUpdate = true;
        this.leftSelect = oldValue;
      }
      this.onInputChange('right');
    },
  },

  mounted() {
    this.onInputChange('left');

    // this.$nextTick(() => {
    //   window.addEventListener('keydown', (event) => {
    //     if (event.keyCode === 87) {
    //       this.onWDown();
    //     }

    //     if (event.keyCode === 83) {
    //       this.onSDown();
    //     }
    //   });
    // });
  },

  methods: {
    toggle() {
      this.conversionWidgetOpen = !this.conversionWidgetOpen;
    },

    onInputChange(inputSide) {
      let from = '';
      let to = '';

      console.log(inputSide);

      if (inputSide === 'left') {
        from = this.leftSelect;
        to = this.rightSelect;
      } else {
        from = this.rightSelect;
        to = this.leftSelect;
      }

      // IPS <=> ISAN
      if (from === 'isan' && to === 'ips') {
        this.convertISANtoIPS(inputSide);
      }

      if (from === 'ips' && to === 'isan') {
        this.convertIPStoISAN(inputSide);
      }

      // SIGNA <=> IPS
      if (from === 'signa' && to === 'ips') {
        this.convertSIGNAtoIPS(inputSide);
      }

      if (from === 'ips' && to === 'signa') {
        this.convertIPStoSIGNA(inputSide);
      }

      // SIGNA <=> ISAN
      if (from === 'signa' && to === 'isan') {
        this.convertIPStoSIGNA(inputSide);
      }

      if (from === 'isan' && to === 'signa') {
        this.convertIPStoSIGNA(inputSide);
      }
    },

    convertISANtoIPS(inputSide) {
      // left = ISAN, right = IPS
      // ISAN [+Z,+X,+Y] === IPS [+X,+Y,+Z]
      if (inputSide === 'left') {
        this.inputRightX = parseInt(this.inputLeftZ) + ISAN_ORIGIN_POINT.position.x;
        this.inputRightY = parseInt(this.inputLeftX) + ISAN_ORIGIN_POINT.position.y;
        this.inputRightZ = parseInt(this.inputLeftY) + ISAN_ORIGIN_POINT.position.z;
      } else {
        this.inputLeftX = parseInt(this.inputRightZ) + ISAN_ORIGIN_POINT.position.x;
        this.inputLeftY = parseInt(this.inputRightX) + ISAN_ORIGIN_POINT.position.y;
        this.inputLeftZ = parseInt(this.inputRightY) + ISAN_ORIGIN_POINT.position.z;
      }
    },

    convertIPStoISAN(inputSide) {
      // left = IPS, right = ISAN
      // IPS [+Y,+Z,+X] === ISAN [+X,+Y,+Z]
      if (inputSide === 'left') {
        this.inputRightX = parseInt(this.inputLeftY) - ISAN_ORIGIN_POINT.position.y;
        this.inputRightY = parseInt(this.inputLeftZ) - ISAN_ORIGIN_POINT.position.z;
        this.inputRightZ = parseInt(this.inputLeftX) - ISAN_ORIGIN_POINT.position.x;
      } else {
        this.inputLeftX = parseInt(this.inputRightY) - ISAN_ORIGIN_POINT.position.y;
        this.inputLeftY = parseInt(this.inputRightZ) - ISAN_ORIGIN_POINT.position.z;
        this.inputLeftZ = parseInt(this.inputRightX) - ISAN_ORIGIN_POINT.position.x;
      }
    },

    convertSIGNAtoIPS(inputSide) {
      console.log('Converting from SIGNA to IPS');
      // left = SIGNA, right = IPS

      /*
        So he defines the Signa grid as
        - East = [0, 0, 0]
        - East => West is the +X-axis
        - North is +Y direction



      His steps to convert are weird. I can derive them myself.

      // First we take the input coordinate and perform a series of rotations on it to bring it in line with our grid.

      // To define those rotations, we need to define the angles we need to cover
      // We can do this easily since we have the coordinates for everything in our own space.

      // East = { x: -20000, y: -60000, z: 0 }
      // West = { x: -5000, y: 60000, z: 0 }

      Vector from East to West = [15000, 120000, 0]
      Angle from EW (+X) to IPS +X-axis = 76.96 degrees

      so Rotation #1 = rotation around the Y axis by 76.96 degrees counter-clockwise (grid-wise)


      Next, we need to pull the Y axis to be in line with ours.
      So we need to calculate the angle between our Y axis and his.
      Signa Y axis is defined as the North direction.
      North rests on a Y of 0, that means we should be able to just flat out rotate everything 90 degrees

      so Rotation #2 = rotation around the X axis by 90 degrees clockwise (grid wise)


      And then finally we need to make one more rotation to fix the Z axis.
      At this point, Y is perfectly aligned, but X and Z are off.
      Because rotation #2 was a 90 degree rotation, this third rotation will also be around the Y axis.

      We need to define the Z direction, which is a perpendicular line from Eest=>West to North
      In this case, we don't care about the X component.

      // North = { x: 20000, y: 0, z: 65000 }

      midpont between east and west is [-12500, 0, 0]

      then we get the vector from the midpoint to north
      mid=>North = [32500, 0, 65000]

      THAT is our Z direction, and after the first 2 rotations that should properly represent the currently rotated Z axis
      So now we get the angle

      Angle = 26.565 degrees

      so Rotation #3 = rotation around the Y axis by 26.565 degrees counterclockwise (grid-wise)



      // After all 3 rotations, we should end up with the coordinate of the point on a correctly rotated grid assuming that East is 0,0,0



      //////////////////////// using wolfram alpha
      Starting Coordinate = [x0, y0, z0]
      Rotation #1 = [x1 = 0.2256(x0) - 0.97421(z0), y0, z1 = 0.97421(x0) + 0.2256(z0)] // 76.96 degrees around Y-axis "clockwise"
      Rotation #2 = [x1, y1 = z1, z2 = -y0] // 90 degress around the X-axis "clockwise"
      Rotation #3 = [x2 = 0.89443(x1) + 0.4472(z2), y1, z3 = 0.89443(z2) - 0.4472(x1)] // 26.565 degrees around the Y-axis "clockwise"

      Now we can smush things together

      xr = x2 = 0.89443(x1)
      xr = 0.89443(x1)
      xr = 0.89443(0.2256(x0) - 0.97421(z0))

      yr = y1
      yr = z1
      yr = 0.97421(x0) + 0.2256(z0)

      zr = z3 = 0.89443(z2) - 0.4472(x1)
      zr = 0.89443(z2) - 0.4472(x1)
      zr = 0.89443(-y0) - 0.4472(x1)
      zr = 0.89443(-y0) - 0.4472(0.2256(x0) - 0.97421(z0))

      */

      // let x1 = 0.2256 * this.inputLeftX + 0.97421 * this.inputLeftZ;
      // let y1 = this.inputLeftY;
      // let z1 = 0.2256 * this.inputLeftZ - 0.97421 * this.inputLeftX;

      // let x2 = 0.89443 * x1 + 0.4472 * y1;
      // let y2 = 0.89443 * y1 - 0.4472 * x1;
      // let z2 = z1;

      // Now we have a coordinate as if East were [0, 0, 0], so correction is easy.

      // Signa [0, 0, 0] should equal IPS [-20000, -60000, 0]
      // Signa [120933.866224, 0, 0] should equal IPS [-5000, 60000, 0]

      //8x - y - 4z + 100000 = 0
      // normal vector = [8, -1, -4] <= this is the direction of the +z axis before rotations in IPS coords

      // now what we do, is we take our X-axis [1, 0, 0] and project it onto [8, -1, -4],
      //  which gives us the 'vertical component' of [1, 0, 0] relative to the W/E/N plane.

      //https://www.emathhelp.net/calculators/linear-algebra/vector-projection-calculator/?u=8%2C-1%2C-4&v=1%2C0%2C0

      // projected vector = [65/81, -8/81, -32/81] = [0.790123456790123, −0.098765432098765, −0.395061728395062]

      // Then we subtract that vertical component from [1, 0, 0] to get the projection of [1, 0, 0] onto the plane
      // projected IPS X-axis = [1, 0, 0] - [0.790123456790123, −0.098765432098765, −0.395061728395062] = [0.209876543209877, 0.098765432098765, 0.395061728395062]
      //  now this is the IPS X-axis vector projected onto the Signa XY-plane in IPS coordinates.
      //  so now we want to compare this projected vector to the E=>W Signa X-axis (in IPS coords)
      //  Then we perform rotation #1 so that the IPS X-axis rests on the Signa XZ-plane

      // projected IPS X-axis = [0.209876543209877, 0.098765432098765, 0.395061728395062]
      // E=>W Signa X-axis = [15000, 120000, 0]
      // Angle Between = 74.29 degrees   /// NOTE how this differs from the one before. It's smaller, which is good.

      // Starting Coordinate = [x0, y0, z0]
      // Rotation #1 = [0.2708*(x0) + 0.96264*(y0), 0.2708*(y0) - 0.96264*(x0), z0] // rotating around Z-axis

      ////////////
      // Now we want to compare our IPS X-axis [1, 0, 0] to the normal vector from before [8, -1, -4]
      //  We technically rotated the plane, so the normal hasn't changed
      // angle = 27.266 degrees

      // But, we want to rotate it in the other direction so the X-axis lines up. So we do 90-that
      // angle between X-axes = 62.734 degrees

      // Starting Coordinate = [x1, y1, z1]
      // Rotation #2 = [0.4581*(z1) - 0.88889*(x1), y1, 0.88889*(z1) + 0.4581*(x1)] // rotating around y axis

      // at this point, X axis should be good to go

      let x1 = 0.2708 * this.inputLeftX + 0.96264 * this.inputLeftY;
      let y1 = 0.2708 * this.inputLeftY - 0.96264 * this.inputLeftX;
      let z1 = this.inputLeftZ;

      let x2 = 0.4581 * z1 - 0.88889 * x1;
      let y2 = y1;
      let z2 = 0.88889 * z1 + 0.4581 * x1;

      let xFinal = x2;
      let yFinal = y2;
      let zFinal = z2;

      this.inputRightX = xFinal + 20000;
      this.inputRightY = yFinal + 60000;
      this.inputRightZ = zFinal;

      // Signa [0, 0, 0] should equal IPS [-20000, -60000, 0]
      // Signa [120933.866224, 0, 0] should equal IPS [-5000, 60000, 0]
    },

    convertIPStoSIGNA(inputSide) {
      console.log('Converting from IPS to SIGNA');
    },

    convertSIGNAtoISAN(inputSide) {
      console.log('Converting from SIGNA to ISAN');
      // left = SIGNA, right = ISAN
    },

    convertISANtoSIGNA(inputSide) {
      console.log('Converting from ISAN to SIGNA');
      // left = ISAN, right = SIGNA
      // subtract [-56525 1408 -35301] from ISAN (X,Y,Z)
      let tempX = this.inputLeftX + 56525;
      let tempY = this.inputLeftY - 1408;
      let tempZ = this.inputLeftZ + 35301;

      // then we do the projection
    },

    onOpenExternal(type) {
      if (type === 'ips') {
        window.open('https://github.com/Tmktahu/IPS', '_blank');
      }

      if (type === 'isan') {
        window.open('https://github.com/Collective-SB/ISAN', '_blank');
      }

      if (type === 'signa') {
        window.open('https://github.com/d6rks1lv3rz3r0/SB-SignaTrope', '_blank');
      }
    },

    onClear(type) {
      if (type === 'left') {
        this.inputLeftX = 0;
        this.inputLeftY = 0;
        this.inputLeftZ = 0;
        this.onInputChange('left');
      }

      if (type === 'right') {
        this.inputRightX = 0;
        this.inputRightY = 0;
        this.inputRightZ = 0;
        this.onInputChange('right');
      }
    },

    async onCopy(side) {
      try {
        let coord = 'Error';
        if (side === 'left') {
          coord = `${this.inputLeftX},${this.inputLeftY},${this.inputLeftZ}`;
        } else {
          coord = `${this.inputRightX},${this.inputRightY},${this.inputRightZ}`;
        }
        await navigator.clipboard.writeText(coord);
      } catch (error) {
        this.$toasted.global.alertError({ message: 'Copy failed' });
        console.error('Failed to copy: ', error);
      }
    },

    async onPaste(side) {
      try {
        let content = await navigator.clipboard.readText();
        if (content) {
          let coord = content.split(',');
          if (coord.length !== 3) {
            return;
          }

          if (side === 'left') {
            this.inputLeftX = parseFloat(coord[0]);
            this.inputLeftY = parseFloat(coord[1]);
            this.inputLeftZ = parseFloat(coord[2]);
            this.onInputChange('left');
          } else {
            this.inputRightX = parseFloat(coord[0]);
            this.inputRightY = parseFloat(coord[1]);
            this.inputRightZ = parseFloat(coord[2]);
            this.onInputChange('right');
          }
        } else {
          console.error('There was a problem with your paste');
        }
      } catch (error) {
        this.$toasted.global.alertError({ message: 'Paste failed' });
        console.error('Failed to paste: ', error);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@use 'sass:color';

@import '@/design/variables/_colors';

.conversion-widget {
  z-index: 1;
  background: color.change($primary-blue, $lightness: 50%, $saturation: 50%);
  width: 590px;
  position: fixed;
  top: 0;
  left: 0;
  transition: left 0.1s ease;
  border-bottom-right-radius: 16px;
  padding-left: 70px !important;
}

.close-button {
  position: absolute;
  right: 0;
  top: 14px;
}

.action-button {
  height: 24px;
}

.input-col {
  max-width: 120px;
}

.option-select {
  width: 100%;
}

.number-input-label {
  color: black;
  font-weight: 600;
}

.number-input {
  width: 120px;
}
</style>
