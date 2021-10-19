import { ref, watch } from '@vue/composition-api';
const fs = require('fs');

import { ORIGIN_POINT } from './useMap';
import { ORIGIN_STATIONS, TRANSMITTER_STATIONS } from './presetCoords/eos';

const remote = require('electron').remote;

export const DEFAULT_DATA = [ORIGIN_POINT, ...ORIGIN_STATIONS, ...TRANSMITTER_STATIONS];

export function useStorage() {
  let dataStoragePath = ref('');
  if (process.env.NODE_ENV === 'development') {
    dataStoragePath.value = 'waypoint_data.json';
  } else {
    dataStoragePath.value = `${remote.process.env.PORTABLE_EXECUTABLE_DIR}/waypoint_data.json`;
  }

  const pointStorage = ref([]);

  const init = async () => {
    if (fs.existsSync(dataStoragePath.value)) {
      readFromJSON(pointStorage, dataStoragePath.value);
    } else {
      console.log('No storage. Initing json file with default data.');
      saveToJSON(DEFAULT_DATA, dataStoragePath.value, pointStorage);
    }
  };

  const readFromJSON = (container, filePath) => {
    fs.readFile(filePath, 'utf-8', (error, data) => {
      if (error) {
        console.log('Error reading file: ', error);
        return;
      }

      container.value = JSON.parse(data);
    });
  };

  const saveToJSON = async (inData, filePath, container = null) => {
    let stringifiedData = JSON.stringify(inData, null, 2);
    try {
      fs.writeFile(filePath, stringifiedData, 'utf-8', () => {
        if (container) {
          container.value = inData;
        }
      });
      return null;
    } catch (error) {
      console.log('There was a problem saving data: ', error);
      return error;
    }
  };

  return {
    init,
    pointStorage,
    readFromJSON,
    saveToJSON,
    dataStoragePath,
  };
}
