import { createRouter, createWebHashHistory } from 'vue-router'
import { useDataStore } from '@/stores/data'
import { useVideoStore } from '@/stores/video'
import { useSettingsStore } from '@/stores/settings'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      redirect: { name: 'list', params: { type: 'graph' } }
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
  console.log(from)
  const dataStore = useDataStore()

  const videoStore = useVideoStore()
  if (dataStore.data === null && ['list', 'graph', 'video'].includes(to.name)) {
    await dataStore.init()
  }

  if (from.name === 'graph') {
    if (dataStore.data.nodes?.[from.params?.id]?.style) {
      Object.keys(dataStore.data.nodes?.[from.params?.id]?.style).forEach((property) => {
        document.querySelector(':root').style.removeProperty(property)
      })
    }

    if (from.params.type === 'entity') {
      document.querySelector(':root').style.removeProperty('--color-background')
      document.querySelector(':root').style.removeProperty('--color-text')
      document.querySelector(':root').style.removeProperty('--color-edge')
      document.querySelector(':root').style.removeProperty('--colorBackground')
    }
  }

  if (to.name === 'graph') {
    dataStore.nodeId = to.params.id

    if (dataStore.data.nodes?.[to.params?.id]?.style) {
      Object.entries(dataStore.data.nodes?.[to.params?.id]?.style).forEach((entry) => {
        document.querySelector(':root').style.setProperty(...entry)
      })
    } else {
      if (to.params.type === 'entity') {
        document
          .querySelector(':root')
          .style.setProperty('--color-background', 'var(--color-network-background)')
        document
          .querySelector(':root')
          .style.setProperty('--color-text', 'var(--color-network-text)')
        document
          .querySelector(':root')
          .style.setProperty('--color-edge', 'var(--color-network-edge)')

        document.querySelector(':root').style.setProperty('--colorBackground', 'red')
      }
    }
  }

  if (to.params.type === 'graph' && to.name === 'graph') {
    videoStore.graphId = to.params.id
  }
  to.meta.initializeView = to.name !== from.name
  next()
})

export default router
