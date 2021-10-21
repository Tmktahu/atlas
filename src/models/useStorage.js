import Vue from 'vue';
import { ref, watch } from '@vue/composition-api';
const fs = require('fs');
const fsPromises = fs.promises;

import { ISAN_ORIGIN_POINT, ORIGIN_POINT } from './useMap';
import { ORIGIN_STATIONS, TRANSMITTER_STATIONS } from './presetCoords/eos';

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
    // if (fs.existsSync(dataStoragePath.value)) {
    //   readFromJSON(pointStorage, dataStoragePath.value);
    // } else {
    //   console.log('No storage. Initing json file with default data.');
    //   saveToJSON(DEFAULT_DATA, dataStoragePath.value, pointStorage);
    // }
  };

  const readFromJSON = async (file) => {
    return new Promise((resolve, reject) => {
      let data = '';
      const fileReader = new FileReader();

      fileReader.onloadend = function (event) {
        data = JSON.parse(event.target.result);
        resolve(data);
      };

      fileReader.onerror = function (error) {
        console.log('Error reading file: ', error);
        Vue.toasted.global.alertError({ message: 'Error reading JSON file', description: error });
        reject(error);
      };

      fileReader.readAsText(file);
    });
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
    pointStorage,
    readFromJSON,
    saveToJSON,
    dataStoragePath,
  };
}
