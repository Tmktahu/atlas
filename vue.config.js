process.env.VUE_APP_VERSION = process.env.npm_package_version;

module.exports = {
  transpileDependencies: ['vuetify'],
  assetsDir: 'assets',
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
    },
  },
};
