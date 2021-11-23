import Vue from 'vue';
const fs = require('fs');
const fsPromises = fs.promises;

import { ISAN_ORIGIN_POINT, ORIGIN_POINT } from './useCoordinates';
import { ORIGIN_STATIONS, TRANSMITTER_STATIONS } from './presetMapData/eos';

const remote = require('electron').remote;

export const DEFAULT_DATA = [ORIGIN_POINT, ISAN_ORIGIN_POINT, ...ORIGIN_STATIONS, ...TRANSMITTER_STATIONS];

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

  const readFromJSON = async (container, filePath) => {
    try {
      const data = await fsPromises.readFile(filePath, 'utf-8');
      if (container) {
        container.value = JSON.parse(data);
        return;
      } else {
        return JSON.parse(data);
      }
    } catch (error) {
      console.log('Error reading file: ', error);
      Vue.toasted.global.alertError({ message: 'Error reading JSON file', description: error });
    }
  };

  const saveToJSON = async (inData, filePath, container = null) => {
    let stringifiedData = JSON.stringify(inData, null, 2);
    try {
      fs.writeFile(filePath, stringifiedData, 'utf-8', () => {
        if (container) {
          container.value = inData;
          Vue.toasted.global.alertInfo({
            message: 'Initialized default JSON storage',
            description: `No standard JSON file was found, so one was created at ${dataStoragePath.value}`,
          });
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
    readFromJSON,
    saveToJSON,
    dataStoragePath,
  };
}
