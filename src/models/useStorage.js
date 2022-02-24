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
        const { data, errors } = await readFromJSON(null, dataStoragePath.value);

        let hasOldData = detectOldDataStructures(data);

        if (hasOldData) {
          // data from json files should always start scaled up
          // right now, it is being sent to the old data dialog, so it's fine to stay scaled up
          EventBus.$emit('openOldDataDialog', data);

          return {
            storageData: data,
            errors: { message: 'oldData' },
          };
        }

        return { storageData: data, errors };
      } else {
        console.error('No storage. Initing json file with default data.');
        let useCoordinates = await import('./useCoordinates');
        let eosData = await import('./presetMapData/eos');
        let elysiumData = await import('./presetMapData/elysium');

        // TODO update this to the correct new format
        let defaultData = [
          useCoordinates.ORIGIN_POINT,
          elysiumData.ELYSIUM_WARP_GATE,
          useCoordinates.ISAN_ORIGIN_POINT,
          ...eosData.ORIGIN_STATIONS,
          ...eosData.TRANSMITTER_STATIONS,
        ];

        const { result, errors } = await saveToJSON(defaultData, dataStoragePath.value);
        return { storageData: scaledDownData, errors };
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

        return {
          data: rawData,
          errors: null,
        };
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

  const saveToJSON = async (inData, filePath, container = null) => {
    if (isElectron) {
      let stringifiedData = null;
      let scaledData = null;

      stringifiedData = JSON.stringify(inData, null, 2);

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
          EventBus.$emit('openOldDataDialog', parsedData);

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
        let { data: currentData, errors } = readFromLocalStorage();
        let newStorageData = {
          version: null,
          points: null,
          vectors: null,
        };

        if (isStorageData) {
          // if we are dealing with storage-formatted data
          newStorageData.version = inData.version;
          newStorageData.points = inData.points;
          newStorageData.vectors = inData.vectors;
        } else {
          // otherwise we are dealing with map-formatted data
          const { getPointData, getVectorData } = useMap();
          newStorageData.version = process.env.VUE_APP_VERSION;
          newStorageData.points = getPointData(inData);
          newStorageData.vectors = getVectorData(inData);
          newStorageData = scaleUpStorageData(newStorageData);
        }

        // Now we check to see what needs to be updated and assemble the new data
        newStorageData.points = newStorageData.points.length > 0 ? newStorageData.points : currentData.points;
        newStorageData.vectors = newStorageData.vectors.length > 0 ? newStorageData.vectors : currentData.vectors;

        let stringifiedData = JSON.stringify(newStorageData, null, 2);
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

  const updateDataStructure = (oldData, isElectron) => {
    if (Array.isArray(oldData) && oldData.length > 0) {
      // we have a coordinate array, which is from v1 of the data structure

      let newData = {
        version: process.env.VUE_APP_VERSION,
        points: oldData,
        vectors: [],
      };

      if (isElectron) {
        saveToJSON(newData, dataStoragePath.value);
      } else {
        // for the web, local storage use to be scaled down, so we need to scale it up
        let scaledUpData = scaleUpStorageData(newData);
        saveToLocalStorage(scaledUpData, true);
      }
    }
  };

  const assembleStorageData = (mapData, shouldScaleUp = true) => {
    // this will always be sent masterMapData
    // this means data should always begin scaled down by default

    let pointsData = mapData.points.map((point) => {
      return point.data;
    });

    let vectorsData = mapData.vectors.map((vector) => {
      return vector.data;
    });

    let newStorageData = {
      version: process.env.VUE_APP_VERSION,
      points: pointsData,
      vectors: vectorsData,
    };

    if (shouldScaleUp) {
      let scaledStorageData = scaleUpStorageData(newStorageData);
      return scaledStorageData;
    } else {
      return newStorageData;
    }
  };

  const scaleUpStorageData = (inData) => {
    const { scaleUpCoordinate } = useCoordinates();

    let points = inData.points.map((point) => {
      return scaleUpCoordinate(point);
    });

    let vectors = inData.vectors.map((vector) => {
      return scaleUpCoordinate(vector);
    });

    let newStorageData = {
      version: inData.version,
      points: points,
      vectors: vectors,
    };

    return newStorageData;
  };

  const scaleDownStorageData = (inData) => {
    const { scaleDownCoordinate } = useCoordinates();

    let points = inData.points?.map((point) => {
      return scaleDownCoordinate(point);
    });

    let vectors = inData.vectors?.map((vector) => {
      return scaleDownCoordinate(vector);
    });

    let newStorageData = {
      version: inData.version,
      points: points,
      vectors: vectors,
    };

    return newStorageData;
  };

  return {
    init,
    readFromJSON,
    saveToJSON,
    dataStoragePath,
    readFromLocalStorage,
    saveToLocalStorage,
    updateDataStructure,
    assembleStorageData,
    scaleDownStorageData,
  };
}
