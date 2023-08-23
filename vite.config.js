import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

import Icons from 'unplugin-icons/vite'
import { FileSystemIconLoader } from 'unplugin-icons/loaders'

import autoprefixer from 'autoprefixer'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    Icons({
      compiler: 'vue3',
      customCollections: {
        // key as the collection name
        default: FileSystemIconLoader('./src/assets/icons', (svg) =>
          svg
            .replace(/fill="#fff"/gi, 'fill="currentColor"')
            .replace(/fill="#000"/gi, 'fill="currentColor"')
            .replace(/fill="#328173"/gi, 'fill="currentColor"')
            .replace(/<svg/, '<svg class="icon"')
        ),
        base: FileSystemIconLoader('./src/assets/icons2', (svg) =>
          svg
            .replace(/fill="#000000"/gi, 'fill="currentColor"')
            .replace(/<svg/, '<svg class="icon"')
        )
      }
    })
  ],
  css: {
    postcss: {
      plugins: [
        autoprefixer({}) // add options if needed
      ]
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
