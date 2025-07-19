import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es', 'umd'],
      name: 'JsonViewerElement',
      fileName: (format) => `json-viewer-element.${format}.js`
    }
  },
  plugins: [dts()],
});
