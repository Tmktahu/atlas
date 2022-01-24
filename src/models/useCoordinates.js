/* eslint-disable id-length */
import { ref } from '@vue/composition-api';
import { ORIGIN_STATIONS, TRANSMITTER_STATIONS } from './presetMapData/eos';
import { ELYSIUM_WARP_GATE } from './presetMapData/elysium';

import { useStorage } from '@/models/useStorage.js';

export const COORD_SCALAR = 10000;

export const ORIGIN_POINT = {
  name: 'Origin / Eos WarpGate',
  type: 'gate',
  color: 'aqua',
  position: { x: 0, y: 0, z: 0 },
  id: '0',
  hide: false,
  icon: 'stargate',
  group: 'Origins',
  description:
    'This is the Eos Warp Gate. It allows fast travel to the Elysium Warp Gate provided the ship has a functioning fast travel core.\nIt is also the origin point of the IPS coordinate system and this mapping tool.',
};

export const ISAN_ORIGIN_POINT = {
  name: 'ISAN Origin',
  type: 'misc',
  color: 'orange',
  position: { x: 15313, y: -3476, z: -1535 },
  id: '1234',
  hide: false,
  icon: 'isan',
  group: 'Origins',
  description: 'This is the origin point of the ISAN coordinate grid. It represents a point equidistant to the four transmitter stations.',
};

export function useCoordinates() {
  const init = (isElectron) => {
    const masterPointsArray = ref([]);

    if (!isElectron) {
      const { readFromLocalStorage } = useStorage();

      let localStorageData = readFromLocalStorage();
      if (localStorageData) {
        masterPointsArray.value = localStorageData;
      } else {
        masterPointsArray.value = setupInitialPoints();
      }
    } else {
      masterPointsArray.value = setupInitialPoints();
    }

    return {
      masterPointsArray,
    };
  };

  const setupInitialPoints = () => {
    let initialPoints = [];

    initialPoints.push(scaleDownCoordinate(ORIGIN_POINT));
    initialPoints.push(scaleDownCoordinate(ELYSIUM_WARP_GATE));

    initialPoints.push(scaleDownCoordinate(ISAN_ORIGIN_POINT));

    for (let index in ORIGIN_STATIONS) {
      initialPoints.push(scaleDownCoordinate(ORIGIN_STATIONS[index]));
    }

    for (let index in TRANSMITTER_STATIONS) {
      initialPoints.push(scaleDownCoordinate(TRANSMITTER_STATIONS[index]));
    }

    return initialPoints;
  };

  const scaleDownCoordinate = (inCoord) => {
    if (typeof inCoord === 'object') {
      let outCoord = JSON.parse(JSON.stringify(inCoord));
      if (outCoord.position) {
        outCoord.position.x = inCoord.position.x / COORD_SCALAR;
        outCoord.position.y = inCoord.position.y / COORD_SCALAR;
        outCoord.position.z = inCoord.position.z / COORD_SCALAR;
      }

      if (outCoord.radius) {
        outCoord.radius = inCoord.radius / COORD_SCALAR;
      }

      if (outCoord.overalRadius) {
        outCoord.overalRadius = inCoord.overalRadius / COORD_SCALAR;
      }

      if (outCoord.innerRadius) {
        outCoord.innerRadius = inCoord.innerRadius / COORD_SCALAR;
      }

      return outCoord;
    } else {
      return Math.round(inCoord * COORD_SCALAR);
    }
  };

  const scaleUpCoordinate = (inCoord) => {
    if (inCoord.position) {
      let outCoord = JSON.parse(JSON.stringify(inCoord));
      outCoord.position.x = Math.round(inCoord.position.x * COORD_SCALAR);
      outCoord.position.y = Math.round(inCoord.position.y * COORD_SCALAR);
      outCoord.position.z = Math.round(inCoord.position.z * COORD_SCALAR);

      if (outCoord.radius) {
        outCoord.radius = inCoord.radius * COORD_SCALAR;
      }

      if (outCoord.overalRadius) {
        outCoord.overalRadius = inCoord.overalRadius * COORD_SCALAR;
      }

      if (outCoord.innerRadius) {
        outCoord.innerRadius = inCoord.innerRadius * COORD_SCALAR;
      }

      return outCoord;
    } else {
      return Math.round(inCoord * COORD_SCALAR);
    }
  };

  return {
    init,
    setupInitialPoints,
    scaleDownCoordinate,
    scaleUpCoordinate,
  };
}
