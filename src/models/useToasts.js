import Vue from 'vue';

export const useToasts = () => {
  // Default alert config
  let defaultAlertConfig = {
    position: 'top-center',
    closeOnSwipe: true,
    singleton: true,
  };

  // Alert Definitions

  Vue.toasted.register(
    'alertInfo',
    (payload) => {
      defaultAlertConfig.icon = 'mdi-information';
      defaultAlertConfig.className = `alert alert-info ${payload.description ? 'with-description' : null}`;
      defaultAlertConfig.duration = 5000;

      defaultAlertConfig.action = [
        {
          icon: 'mdi-close',
          onClick: (event, toastObject) => {
            toastObject.goAway(0);
          },
        },
      ];

      if (payload.message) {
        let finalMessage = `
          <span class="alert-message">
            ${payload.message}
          </span>
        `;
        if (payload.description) {
          finalMessage = `
            <div class="alert-message-wrapper">
              <span class="alert-message">
                ${payload.message}
              </span>
              <div class="alert-description">
                ${payload.description}
              </div>
            </div>
          `;
        }
        return finalMessage;
      } else {
        return 'Error';
      }
    },
    defaultAlertConfig
  );

  Vue.toasted.register(
    'alertWarning',
    (payload) => {
      defaultAlertConfig.icon = 'mdi-alert';
      defaultAlertConfig.className = `alert alert-warning ${payload.description ? 'with-description' : null}`;
      defaultAlertConfig.duration = 10000;

      defaultAlertConfig.action = [
        {
          icon: 'close',
          onClick: (event, toastObject) => {
            toastObject.goAway(0);
          },
        },
      ];

      if (payload.message) {
        let finalMessage = `
          <span class="alert-message">
            ${payload.message}
          </span>
        `;
        if (payload.description) {
          finalMessage = `
            <div class="alert-message-wrapper">
              <span class="alert-message">
                ${payload.message}
              </span>
              <div class="alert-description">
                ${payload.description}
              </div>
            </div>
          `;
        }
        return finalMessage;
      } else {
        return 'Error';
      }
    },
    defaultAlertConfig
  );

  Vue.toasted.register(
    'alertError',
    (payload) => {
      defaultAlertConfig.icon = 'mdi-close-octagon';
      defaultAlertConfig.className = `alert alert-error ${payload.description ? 'with-description' : null}`;
      defaultAlertConfig.duration = 0;

      defaultAlertConfig.action = [
        {
          icon: 'close',
          onClick: (event, toastObject) => {
            toastObject.goAway(0);
          },
        },
      ];

      if (payload.message) {
        let finalMessage = `
          <span class="alert-message">
            ${payload.message}
          </span>
        `;
        if (payload.description) {
          finalMessage = `
            <div class="alert-message-wrapper">
              <span class="alert-message">
                ${payload.message}
              </span>
              <div class="alert-description">
                ${payload.description}
              </div>
            </div>
          `;
        }
        return finalMessage;
      } else {
        return 'Error';
      }
    },
    defaultAlertConfig
  );
};
