import Vue from 'vue';
import { ref } from '@vue/composition-api';
const fs = require('fs');

import { useCoordinates } from './useCoordinates';

export function useStorage(isElectron) {
  let dataStoragePath = ref('');
  if (isElectron) {
    if (process.env.NODE_ENV === 'development') {
      dataStoragePath.value = 'waypoint_data.json';
    } else {
      const remote = require('electron').remote;
      dataStoragePath.value = `${remote.process.env.PORTABLE_EXECUTABLE_DIR}/waypoint_data.json`;
    }
  }

  const init = async (storageContainer) => {
    if (fs.existsSync && fs.existsSync(dataStoragePath.value)) {
      const result = await readFromJSON(null, dataStoragePath.value);
      storageContainer.value = result;
    } else {
      console.log('No storage. Initing json file with default data.');
      const result = await saveToJSON(null, dataStoragePath.value, storageContainer, true);
    }
  };

  const readFromJSON = async (container, filePath, file) => {
    if (isElectron) {
      try {
        const data = await fs.promises.readFile(filePath, 'utf-8');
        let rawData = JSON.parse(data);
        const { scaleDownCoordinate } = useCoordinates();
        let scaledDownData = rawData.map((item) => {
          return scaleDownCoordinate(item);
        });

        if (container) {
          container.value = scaledDownData;
          return;
        } else {
          return scaledDownData;
        }
      } catch (error) {
        console.log('Error reading file: ', error);
        Vue.toasted.global.alertError({ message: 'Error reading JSON file', description: error });
      }
    } else {
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
    }
  };

  const saveToJSON = async (inData, filePath, container = null, useDefaultData = false) => {
    if (isElectron) {
      const { scaleUpCoordinate } = useCoordinates();
      let stringifiedData = null;
      let scaledData = null;

      if (useDefaultData) {
        let useCoordinates = await import('./useCoordinates');
        let eosData = await import('./presetMapData/eos');
        let elysiumData = await import('./presetMapData/elysium');

        let defaultData = [
          useCoordinates.ORIGIN_POINT,
          elysiumData.ELYSIUM_WARP_GATE,
          useCoordinates.ISAN_ORIGIN_POINT,
          ...eosData.ORIGIN_STATIONS,
          ...eosData.TRANSMITTER_STATIONS,
        ];

        stringifiedData = JSON.stringify(defaultData, null, 2);
      } else {
        scaledData = inData.map((item) => {
          return scaleUpCoordinate(item);
        });
        stringifiedData = JSON.stringify(scaledData, null, 2);
      }

      try {
        fs.writeFile(filePath, stringifiedData, 'utf-8', () => {
          if (container) {
            container.value = scaledData;
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
    } else {
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
    }
  };

  const readFromLocalStorage = () => {
    try {
      let rawData = window.localStorage.getItem('atlasWaypoints');
      if (rawData) {
        let parsedData = JSON.parse(rawData);
        return parsedData;
      } else {
        return null;
      }
    } catch (error) {
      console.log('Error reading local storage: ', error);
      Vue.toasted.global.alertError({ message: 'Error reading localstorage', description: error });
      return null;
    }
  };

  const saveToLocalStorage = async (inData) => {
    try {
      let stringifiedData = JSON.stringify(inData, null, 2);
      window.localStorage.setItem('atlasWaypoints', stringifiedData);
    } catch (error) {
      console.log('Error writing to local storage: ', error);
      Vue.toasted.global.alertError({ message: 'Error saving to localstorage', description: error });
    }
  };

  return {
    init,
    readFromJSON,
    saveToJSON,
    dataStoragePath,
    readFromLocalStorage,
    saveToLocalStorage,
  };
}
