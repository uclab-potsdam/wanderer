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
      path: '/authoring',
      name: 'authoring',
      component: () => import('@/views/SettingsView.vue')
    },
    {
      path: '/settings',
      name: 'settings',
      redirect: { name: 'authoring' }
    },
    {
      path: '/:type',
      name: 'list',
      component: () => import('@/views/ListView.vue')
    },
    {
      path: '/:type/:id',
      name: 'graph',
      component: () => import('@/views/GraphView.vue')
    },
    {
      path: '/share/:id',
      name: 'open'
      // redirect: { name: 'list', params: { type: 'graph' } }
    },
    {
      path: '/video',
      name: 'video',
      component: () => import('@/views/VideoView.vue')
    }
  ]
})

router.beforeEach(async (to, from) => {
  const dataStore = useDataStore()
  const settingsStore = useSettingsStore()

  const videoStore = useVideoStore()
  if (dataStore.data === null) {
    await dataStore.init()
  }

  const index = dataStore.nodes.find((n) => n.type === 'graph' && n.index)
  if (to.name === 'list' && !settingsStore.enableEditing && index != null) {
    return { name: 'graph', params: { type: 'graph', id: index.id } }
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
  } else if (videoStore.graphId == null || to.name === 'list') {
    // console.log(dataStore.nodes.find((node) => node.type === 'graph' && node.index)?.id)
    videoStore.graphId = dataStore.nodes.find((node) => node.type === 'graph' && node.index)?.id
  }
  to.meta.initializeView = to.name !== from.name
  // next()
})

export default router
