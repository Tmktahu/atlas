import Vue from 'vue';
import { ref } from '@vue/composition-api';
const fs = require('fs');
import { EventBus } from '@/eventBus';

import { useCoordinates } from './useCoordinates';
import { useMap } from '@/models/useMap.js';

export function useStorage(isElectron) {
  let dataStoragePath = ref('');
  if (isElectron) {
    if (process.env.NODE_ENV === 'development') {
      dataStoragePath.value = 'atlas_data.json';
    } else {
      const remote = require('electron').remote;
      dataStoragePath.value = `${remote.process.env.PORTABLE_EXECUTABLE_DIR}/atlas_data.json`;
    }
  }

  const init = async (isElectron) => {
    // if we are electron, then we want to read from the local json storage file
    if (isElectron) {
      if (fs.existsSync && fs.existsSync(dataStoragePath.value)) {
        const { result, errors } = await readFromJSON(null, dataStoragePath.value);

        const { scaleDownCoordinate } = useCoordinates();
        let scaledDownData = result.map((item) => {
          return scaleDownCoordinate(item);
        });

        return { storageData: scaledDownData, errors };
      } else {
        console.error('No storage. Initing json file with default data.');
        const result = await saveToJSON(null, dataStoragePath.value, storageContainer, true);
      }
    } else {
      // otherwise we are not electron and want to read from browser local storage
      const { data, errors } = readFromLocalStorage();
      return { storageData: data, errors };
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
          return {
            data: rawData,
            errors: null,
          };
        }
      } catch (error) {
        console.error('Error reading file: ', error);
        Vue.toasted.global.alertError({ message: 'Error reading JSON file', description: error });
        return { data: null, errors: { message: `Error reading file: ${error}` } };
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
          console.error('Error reading file: ', error);
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
          return scaleUpCoordinate(item.data);
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
        console.error('There was a problem saving data: ', error);
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
        console.error('There was a problem saving data: ', error);
        return error;
      }
    }
  };

  const readFromLocalStorage = () => {
    try {
      let oldKeyData = window.localStorage.getItem('atlasWaypoints');
      if (oldKeyData !== null) {
        // we have an old localStorage key to clear
        window.localStorage.removeItem('atlasWaypoints');
        window.localStorage.setItem('atlasData', oldKeyData);
      }

      let rawData = window.localStorage.getItem('atlasData');
      if (rawData) {
        let parsedData = JSON.parse(rawData);
        let hasOldData = detectOldDataStructures(parsedData);
        if (hasOldData) {
          // data from local storage should always start scaled down
          // but to let the user download a JSON file, we want to scale it up
          const { scaleUpCoordinate } = useCoordinates();
          let scaledUpData = parsedData.map((item) => {
            return scaleUpCoordinate(item);
          });

          EventBus.$emit('openOldDataDialog', scaledUpData);

          return {
            data: parsedData,
            errors: { message: 'oldData' },
          };
        } else {
          return {
            data: parsedData,
            errors: null,
          };
        }
      } else {
        let newData = {
          version: process.env.VUE_APP_VERSION,
          points: [],
          vectors: [],
        };

        return {
          data: newData,
          errors: { message: 'noData' },
        };
      }
    } catch (error) {
      console.error('Error reading local storage: ', error);
      Vue.toasted.global.alertError({ message: 'Error reading localstorage', description: error });
      return null;
    }
  };

  const saveToLocalStorage = async (inData, isStorageData = false) => {
    try {
      if (inData !== null) {
        let storageData = null;
        if (isStorageData) {
          storageData = inData;
        } else {
          const { getPointData, getVectorData } = useMap();

          storageData = {
            version: process.env.VUE_APP_VERSION,
            points: getPointData(inData),
            vectors: getVectorData(inData),
          };
        }

        let stringifiedData = JSON.stringify(storageData, null, 2);
        window.localStorage.setItem('atlasData', stringifiedData);
      }
    } catch (error) {
      console.error('Error writing to local storage: ', error);
      Vue.toasted.global.alertError({ message: 'Error saving to localstorage', description: error });
    }
  };

  const detectOldDataStructures = (data) => {
    if (Array.isArray(data) && data.length > 0) {
      return true;
    }

    return false;
  };

  const updateDataStructure = (oldData) => {
    if (Array.isArray(oldData) && oldData.length > 0) {
      // we have a coordinate array, which is from v1 of the data structure

      if (isElectron) {
        // if we are electron, then we will be saving to a JSON file, which means we do NOT scale down our data

        let newData = {
          version: process.env.VUE_APP_VERSION,
          points: oldData,
          vectors: [],
        };

        let filePath = 'atlas_data.json';
        saveToJSON(newData, filePath);
      } else {
        // data sent to this function is scaled up, so we need to scale it down for local storage saving
        const { scaleDownCoordinate } = useCoordinates();
        let scaledDownData = oldData.map((item) => {
          return scaleDownCoordinate(item);
        });

        let newData = {
          version: process.env.VUE_APP_VERSION,
          points: scaledDownData,
          vectors: [],
        };

        saveToLocalStorage(newData, true);
      }
    }
  };

  return {
    init,
    readFromJSON,
    saveToJSON,
    dataStoragePath,
    readFromLocalStorage,
    saveToLocalStorage,
    updateDataStructure,
  };
}
