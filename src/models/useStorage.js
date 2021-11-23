import Vue from 'vue';
const fs = require('fs');

export function useStorage() {
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
    readFromJSON,
    saveToJSON,
  };
}
