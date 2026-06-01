import { defineConfig } from '#q-app/wrappers'

export default defineConfig(() => ({
  boot: ['store', 'walletconnect', 'onesignal'],
  css: ['app.scss'],
  extras: ['roboto-font', 'material-icons'],
  build: {
    target: { browser: ['es2022', 'firefox115', 'chrome115', 'safari16', 'edge115'], node: 'node22' },
    esbuildTarget: { browser: ['es2022'], node: 'node22' },
    sourceMap: false,
    vueRouterMode: 'hash',
    extendViteConf(viteConf) {
      viteConf.optimizeDeps = {
        noDiscovery: true,
        include: [
          'events', 'buffer', 'util', 'stream-browserify',
          'semver', 'fast-deep-equal', 'debug', 'ms', 'supports-color',
          'eventemitter3', 'lodash', 'lodash-es', 'axios', 'qrcode',
          'follow-redirects', 'form-data', 'combined-stream', 'delayed-stream',
          'mime-types', 'mime-db', 'asynckit', 'proxy-from-env', 'bn.js',
        ],
        esbuildOptions: { define: { global: 'globalThis' } },
      }
      viteConf.server = { ...viteConf.server, hmr: { timeout: 30000 } }
      viteConf.resolve = {
        ...viteConf.resolve,
        alias: { ...viteConf.resolve?.alias, events: 'events/events.js', buffer: 'buffer/index.js', util: 'util/util.js', stream: 'stream-browserify/index.js' },
      }
      viteConf.define = { ...viteConf.define, global: 'globalThis', 'process.env': {} }
    },
    vitePlugins: [],
  },
  devServer: { open: true, port: 9002 },
  framework: { config: {}, plugins: ['Notify'] },
  animations: [],
}))
