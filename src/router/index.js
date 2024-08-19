import { createRouter, createWebHashHistory } from 'vue-router'
import { useDataStore } from '@/stores/data'
import { useVideoStore } from '@/stores/video'
import { useSettingsStore } from '@/stores/settings'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home'
      // redirect: { name: 'list', params: { type: 'graph' } }
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/views/SettingsView.vue')
    },
    {
      path: '/:type',
      name: 'list',
      component: () => import('@/views/ListView.vue')
    },
    {
      path: '/:type/:id',
      name: 'graph',
      component: () => import('@/views/GraphView.vue'),
      meta: {
        hideMenuBar: import.meta.env.VITE_EXHIBITION_MODE === 'true'
      }
    },
    {
      path: '/share/:id',
      name: 'open'
      // redirect: { name: 'list', params: { type: 'graph' } }
    },
    {
      path: '/projects',
      name: 'projects',
      component: () => import('@/views/ProjectView.vue')
    },
    {
      path: '/video',
      name: 'video',
      component: () => import('@/views/VideoView.vue'),
      meta: {
        hideMenuBar: true
      }
    }
  ]
})

router.beforeEach(async (to, from, next) => {
  const settingsStore = useSettingsStore()
  const dataStore = useDataStore()

  if (to.name === 'home') {
    return settingsStore.edit
      ? next({ name: 'projects' })
      : next({ name: 'list', params: { type: 'graph' } })
  }

  if (to.name === 'open') {
    if (settingsStore.edit) dataStore.open(to.params.id)
    // dataStore.data = null
    return next({ name: 'list', params: { type: 'graph' } })
  }

  if (to.name === 'projects' && !settingsStore.edit) {
    return next({ name: 'list', params: { type: 'graph' } })
  }

  const videoStore = useVideoStore()
  if (dataStore.data === null && ['list', 'graph', 'video'].includes(to.name)) {
    await dataStore.init()
  }
  if (to.name === 'graph') {
    dataStore.nodeId = to.params.id
  }
  if (to.params.type === 'graph' && to.name === 'graph') {
    videoStore.graphId = to.params.id
  }
  to.meta.initializeView = to.name !== from.name
  next()
})

export default router
