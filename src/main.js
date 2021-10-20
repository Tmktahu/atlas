import './initCompositionAPI.js';
import Vue from 'vue';
import { createApp, provide, h } from '@vue/composition-api';
import Vuelidate from 'vuelidate';
import browserDetect from 'vue-browser-detect-plugin';
import App from '@/App.vue';
import router from './router';
import vuetify from './plugins/vuetify';
import VueMoment from 'vue-moment';
import Toasted from 'vue-toasted';

import 'roboto-fontface/css/roboto/roboto-fontface.css';
import 'material-design-icons-iconfont/dist/material-design-icons.css';

// Import the plugin here
Vue.use(Vuelidate);
Vue.use(browserDetect);

Vue.config.productionTip = false;

Vue.use(VueMoment);
Vue.use(Toasted, {
  iconPack: 'mdi',
});

async function init() {
  const app = createApp({
    setup() {},
    render() {
      return h(App);
    },
    router,
    vuetify,
  });

  const mountedApp = app.mount('#app');

  app.config.errorHandler = function (error, vm, info) {
    console.error('Component ', error);
    console.log('Error Info:', info);
    console.log('Component:', vm?.$el);
    // mountedApp.$logger.error('Component Error:', error);
    return false;
  };
}

init();
