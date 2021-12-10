import { defineConfig } from 'vite'
import pkg from './package.json';

// https://vitejs.dev/config/
export default defineConfig(async (env) => {
  return {
    assetsInclude: [
      '**/*.glb',
      '**/*.gltf',
      '**/*.bin',
      '**/*.hdr',
    ],
    define: {
      __app_build_version__: JSON.stringify(pkg.version),
      __app_build_time__: JSON.stringify(Date.now().toString()),
    },
    build: {
      assetsInlineLimit: 0
    },
    server: {
      host: true,
      https: true
    }
  }
})