/* eslint-disable id-length */
import { v4 as uuidv4 } from 'uuid';

import { ORIGIN_STATIONS, TRANSMITTER_STATIONS } from './presetMapData/eos';
import { ELYSIUM_WARP_GATE } from './presetMapData/elysium';

export const GRID_SCALAR = 10000;

export const ORIGIN_POINT = {
  name: 'Origin / Eos WarpGate',
  type: 'gate',
  color: 'aqua',
  position: { x: 0, y: 0, z: 0 },
  id: uuidv4(),
  hide: false,
  autoScale: true,
  icon: 'stargate',
  group: 'Origins',
  description:
    'This is the Eos Warp Gate. It allows fast travel to the Elysium Warp Gate provided the ship has a functioning fast travel core.\nIt is also the origin point of the IPS coordinate system and this mapping tool.',
};

export const ISAN_ORIGIN_POINT = {
  name: 'ISAN Origin',
  type: 'misc',
  color: 'orange',
  position: { x: 15314, y: -3476, z: -1412 },
  id: uuidv4(),
  hide: false,
  autoScale: false,
  icon: 'isan',
  group: 'Origins',
  description: 'This is the origin point of the ISAN coordinate grid. It represents a point equidistant to the four transmitter stations.',
};

export function useCoordinates() {
  const init = (storageData) => {
    if (storageData.points && storageData.points.length === 0) {
      storageData.points = getInitialPoints();
    }
  };

  const getInitialPoints = () => {
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

  const scaleDownCoordinate = (inObject) => {
    if (inObject.origin && inObject.endPoint && inObject.length) {
      // we are dealing with a vector
      let outVector = JSON.parse(JSON.stringify(inObject));

      outVector.origin.x = inObject.origin.x / GRID_SCALAR;
      outVector.origin.y = inObject.origin.y / GRID_SCALAR;
      outVector.origin.z = inObject.origin.z / GRID_SCALAR;

      outVector.endPoint.x = inObject.endPoint.x / GRID_SCALAR;
      outVector.endPoint.y = inObject.endPoint.y / GRID_SCALAR;
      outVector.endPoint.z = inObject.endPoint.z / GRID_SCALAR;

      outVector.length = inObject.length / GRID_SCALAR;

      return outVector;
    } else if (inObject.position) {
      // we are dealing with a point or something with a general position
      let outPoint = JSON.parse(JSON.stringify(inObject));
      outPoint.position.x = inObject.position.x / GRID_SCALAR;
      outPoint.position.y = inObject.position.y / GRID_SCALAR;
      outPoint.position.z = inObject.position.z / GRID_SCALAR;

      if (outPoint.radius) {
        outPoint.radius = inObject.radius / GRID_SCALAR;
      }

      if (outPoint.overalRadius) {
        outPoint.overalRadius = inObject.overalRadius / GRID_SCALAR;
      }

      if (outPoint.innerRadius) {
        outPoint.innerRadius = inObject.innerRadius / GRID_SCALAR;
      }

      return outPoint;
    } else {
      // we are dealing with a single number
      return inObject / GRID_SCALAR;
    }
  };

  const scaleUpCoordinate = (inObject) => {
    if (inObject.origin && inObject.endPoint && inObject.length) {
      // we are dealing with a vector
      let outVector = JSON.parse(JSON.stringify(inObject));

      outVector.origin.x = inObject.origin.x * GRID_SCALAR;
      outVector.origin.y = inObject.origin.y * GRID_SCALAR;
      outVector.origin.z = inObject.origin.z * GRID_SCALAR;

      outVector.endPoint.x = inObject.endPoint.x * GRID_SCALAR;
      outVector.endPoint.y = inObject.endPoint.y * GRID_SCALAR;
      outVector.endPoint.z = inObject.endPoint.z * GRID_SCALAR;

      outVector.length = inObject.length * GRID_SCALAR;

      return outVector;
    } else if (inObject.position) {
      // we are dealing with a point or something with a general position
      let outPoint = JSON.parse(JSON.stringify(inObject));
      outPoint.position.x = inObject.position.x * GRID_SCALAR;
      outPoint.position.y = inObject.position.y * GRID_SCALAR;
      outPoint.position.z = inObject.position.z * GRID_SCALAR;

      if (outPoint.radius) {
        outPoint.radius = inObject.radius * GRID_SCALAR;
      }

      if (outPoint.overalRadius) {
        outPoint.overalRadius = inObject.overalRadius * GRID_SCALAR;
      }

      if (outPoint.innerRadius) {
        outPoint.innerRadius = inObject.innerRadius * GRID_SCALAR;
      }

      return outPoint;
    } else {
      // we are dealing with a single number
      return inObject * GRID_SCALAR;
    }
  };

  return {
    init,
    getInitialPoints,
    scaleDownCoordinate,
    scaleUpCoordinate,
  };
}
