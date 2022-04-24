<template>
  <v-app>
    <LeftNav />
    <ConversionWidget ref="conversionWidget" />
    <WaypointManagementWidget ref="waypointManagementWidget" />
    <SaveWidget ref="saveWidget" />
    <ImportWidget ref="importWidget" />
    <InfoWidget ref="infoWidget" />
    <VectorManagementWidget ref="vectorManagementWidget" />
    <OldDataDialog ref="oldDataDialog" />
    <ControlsWidget ref="controlsWidget" />
    <v-main>
      <div v-if="isElectron" class="draggable-area-bar" />
      <router-view />
    </v-main>
  </v-app>
</template>

<script>
import { onMounted, ref, watch, provide, toRefs } from '@vue/composition-api';
import { debounce } from 'lodash';
import { EventBus } from '@/eventBus';

import { useMap, masterMapData } from '@/models/useMap.js';
import { useCoordinates } from '@/models/useCoordinates.js';
import { useStorage } from '@/models/useStorage.js';
import { useToasts } from '@/models/useToasts.js';

import LeftNav from '@/components/LeftNav.vue';
import ConversionWidget from '@/components/widgets/ConversionWidget.vue';
import WaypointManagementWidget from '@/components/widgets/WaypointManagementWidget.vue';
import SaveWidget from '@/components/widgets/SaveWidget.vue';
import ImportWidget from '@/components/widgets/ImportWidget.vue';
import InfoWidget from '@/components/widgets/InfoWidget.vue';
import VectorManagementWidget from '@/components/widgets/VectorManagementWidget.vue';
import OldDataDialog from '@/components/dialogs/OldDataDialog.vue';
import ControlsWidget from '@/components/widgets/ControlsWidget.vue';

export default {
  metaInfo: {
    // All subcomponent titles will be injected into this template.
    titleTemplate(title) {
      return `Atlas | ${title}`;
    },
  },

  components: {
    LeftNav,
    ConversionWidget,
    WaypointManagementWidget,
    SaveWidget,
    ImportWidget,
    InfoWidget,
    VectorManagementWidget,
    OldDataDialog,
    ControlsWidget,
  },

  setup(_, context) {
    let startApp = true;
    let userAgent = navigator.userAgent.toLowerCase();
    const isElectron = userAgent.indexOf('electron/') > -1;
    provide('isElectron', isElectron);

    EventBus.$on('openOldDataDialog', (data) => {
      setTimeout(() => {
        context.refs.oldDataDialog.open(data);
      }, 100);
    });

    const leftNavCondensed = ref(false);
    const needsToSave = ref(false);

    const showOldDataDialog = ref(false);

    const showConversionWidget = ref(false);
    const showWaypointWidget = ref(false);
    const showWaypointCRUDWidget = ref(false);
    const showSaveWidget = ref(false);
    const showImportWidget = ref(false);
    const showImportSelectionWidget = ref(false);
    const showInfoWidget = ref(false);
    const showVectorWidget = ref(false);
    const showVectorCRUDWidget = ref(false);
    const showControlsWidget = ref(false);

    watch(showWaypointWidget, () => {
      if (showWaypointWidget.value) {
        showSaveWidget.value = false;
        showImportWidget.value = false;
        showInfoWidget.value = false;
        showVectorWidget.value = false;
      }
    });

    watch(showSaveWidget, () => {
      if (showSaveWidget.value) {
        showWaypointWidget.value = false;
        showImportWidget.value = false;
        showInfoWidget.value = false;
        showVectorWidget.value = false;
      }
    });

    watch(showImportWidget, () => {
      if (showImportWidget.value) {
        showWaypointWidget.value = false;
        showSaveWidget.value = false;
        showInfoWidget.value = false;
        showVectorWidget.value = false;
      }
    });

    watch(showInfoWidget, () => {
      if (showInfoWidget.value) {
        showWaypointWidget.value = false;
        showSaveWidget.value = false;
        showImportWidget.value = false;
        showVectorWidget.value = false;
      }
    });

    watch(showVectorWidget, () => {
      if (showVectorWidget.value) {
        showWaypointWidget.value = false;
        showSaveWidget.value = false;
        showImportWidget.value = false;
        showInfoWidget.value = false;
      }
    });

    onMounted(() => {
      if (isElectron) {
        console.log(
          '%cAtlas Electron Version Started',
          'border: 2px solid white; background-color: #527cbf; border-radius: 5px; color: #cbdaf2; font-size: 2rem; font-weight: 800; padding: 4px; margin: 5px 0;'
        );
      } else {
        context.root.$toasted.global.alertWarning({
          message: 'You must have Hardware Acceleration enabled in your browser,<br>or else this website will max out your CPU trying to render.',
        });

        console.log(
          '%cAtlas Web Version Started',
          'border: 2px solid white; background-color: #527cbf; border-radius: 5px; color: #cbdaf2; font-size: 2rem; font-weight: 800; padding: 4px; margin: 5px 0;'
        );
      }
      console.log(
        // eslint-disable-next-line quotes
        "%cIf you're reading this, then I may be able to use your help!\nCome check out the Discord server: https://discord.gg/Vafdx5JWBh",
        'font-size: 1rem'
      );
    });

    useToasts();

    const init = async () => {
      const { init: initStorage } = useStorage(isElectron);
      const { storageData, errors: storageErrors } = await initStorage(isElectron);

      if (storageErrors && storageErrors.message !== 'noData') {
        // if there were storage errors, do nothing for now
        if (storageErrors.message === 'oldData') {
          startApp = false;
        }
      } else {
        // otherwise we have no storage errors
        const { init: initPoints } = useCoordinates();
        initPoints(storageData);

        const { initMasterMapData, getPointData } = useMap();
        initMasterMapData(storageData);
      }
    };

    init().then(() => {
      if (startApp) {
        const { saveToLocalStorage } = useStorage(isElectron);

        let points = toRefs(masterMapData).points;
        let vectors = toRefs(masterMapData).vectors;

        let initialSave = true;
        let saveDebounce = debounce(() => {
          if (!isElectron) {
            saveToLocalStorage(masterMapData);
          }

          if (!initialSave) {
            needsToSave.value = true;
          }
          initialSave = false;
        }, 500);

        watch(points, saveDebounce);
        watch(vectors, saveDebounce);

        setTimeout(() => {
          EventBus.$emit('initMap');
        }, 1000);
      }
    });

    provide('masterMapData', masterMapData);
    provide('showControlsWidget', showControlsWidget);
    provide('leftNavCondensed', leftNavCondensed);
    provide('needsToSave', needsToSave);

    provide('showConversionWidget', showConversionWidget);
    provide('showWaypointWidget', showWaypointWidget);
    provide('showWaypointCRUDWidget', showWaypointCRUDWidget);
    provide('showSaveWidget', showSaveWidget);
    provide('showImportWidget', showImportWidget);
    provide('showImportSelectionWidget', showImportSelectionWidget);
    provide('showInfoWidget', showInfoWidget);
    provide('showVectorWidget', showVectorWidget);
    provide('showVectorCRUDWidget', showVectorCRUDWidget);

    provide('showOldDataDialog', showOldDataDialog);

    return {
      isElectron,
    };
  },
};
</script>

<style lang="scss">
@use 'sass:color';

@import '@/design/variables/_colors';

html {
  overflow: hidden;
}

#app {
  color: black;
  background: #333;
}

.draggable-area-bar {
  position: absolute;
  width: 100%;
  height: 30px;
  -webkit-user-select: none;
  -webkit-app-region: drag;
  background: #222;
}

.with-draggable-bar {
  margin-top: 30px;
}

/* width */
::-webkit-scrollbar {
  width: 5px;
}

/* Track */
::-webkit-scrollbar-track {
  background: #444;
  border-radius: 10px;
}

/* Handle */
::-webkit-scrollbar-thumb {
  background: $primary-blue;
  border-radius: 10px;
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: white;
}

.general-tooltip {
  z-index: 10000 !important;
  background-color: color.change($primary-blue, $lightness: 80%) !important;

  div {
    color: black;
  }
}
</style>
