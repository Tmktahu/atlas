import { ref, watch } from '@vue/composition-api';
const fs = require('fs');

import { ORIGIN_POINT } from './useMap';
import { ORIGIN_STATIONS, TRANSMITTER_STATIONS } from './presetCoords/eos';

export const DATA_STORAGE_PATH = 'waypoint_data.json';

export const DEFAULT_DATA = [ORIGIN_POINT, ...ORIGIN_STATIONS, ...TRANSMITTER_STATIONS];

export function useStorage() {
  const pointStorage = ref([]);

  const init = async () => {
    if (fs.existsSync(DATA_STORAGE_PATH)) {
      readFromJSON(pointStorage, DATA_STORAGE_PATH);
    } else {
      console.log('no storage. initing json file with default data');
      saveToJSON(DEFAULT_DATA, DATA_STORAGE_PATH);
      pointStorage.value = DEFAULT_DATA;
    }
  };

  const readFromJSON = (container, filePath) => {
    fs.readFile(filePath, 'utf-8', (error, data) => {
      if (error) {
        console.log('error reading file', error);
        return;
      }

      container.value = JSON.parse(data);
    });
  };

  const saveToJSON = (inData, filePath) => {
    let stringifiedData = JSON.stringify(inData, null, 2);
    try {
      fs.writeFileSync(filePath, stringifiedData, 'utf-8');
    } catch (error) {
      console.log('there was a problem saving data', error);
    }
  };

  return {
    init,
    pointStorage,
    readFromJSON,
    saveToJSON,
  };
}
