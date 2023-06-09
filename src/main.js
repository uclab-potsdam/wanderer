import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import '@/assets/style/base.scss'
import resize from '@/directives/resize'

import { plugin as slicksort } from 'vue-slicksort'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.directive('resize', resize)

router.isReady().then(() => {
  app.mount('#app')
})

app.use(slicksort)
