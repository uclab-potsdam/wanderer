import { createRouter, createWebHashHistory } from 'vue-router'
import { useDataStore } from '@/stores/data'
import { useVideoStore } from '@/stores/video'
import { useSettingsStore } from '@/stores/settings'
import { useHelperStore } from '@/stores/helper'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'index'
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
  const helperStore = useHelperStore()

  const videoStore = useVideoStore()
  if (dataStore.data === null) {
    await dataStore.init()
  }

  const index =
    dataStore.nodes.find((n) => n.type === 'graph' && n.index) ??
    dataStore.nodes.find((n) => n.type === 'graph')

  if (to.name === 'index') {
    if (index?.id != null) return { name: 'graph', params: { type: 'graph', id: index.id } }
    return { name: 'list', params: { type: 'graph' } }
  }

  if (from.name === 'graph') {
    if (dataStore.data.nodes?.[from.params?.id]?.style) {
      Object.keys(dataStore.data.nodes?.[from.params?.id]?.style).forEach((property) => {
        document.querySelector(':root').style.removeProperty(property)
      })
    }
    document.querySelector(':root').style.removeProperty('--color-background')
    document.querySelector(':root').style.removeProperty('--color-text')
    document.querySelector(':root').style.removeProperty('--color-edge')
    document.querySelector(':root').style.removeProperty('--colorBackground')
  }

  let title

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
        // document
        //   .querySelector(':root')
        //   .style.setProperty('--color-edge', 'var(--color-network-edge)')
      } else if (to.params.id === index.id) {
        document
          .querySelector(':root')
          .style.setProperty('--color-background', 'var(--color-index-background)')
        document.querySelector(':root').style.setProperty('--color-edge', 'var(--color-index-edge)')
      }
    }

    title = dataStore.data.nodes?.[to.params?.id].label
  }

  if (to.params.type === 'graph' && to.name === 'graph') {
    videoStore.graphId = dataStore.storyId = to.params.id
  } else if (videoStore.graphId == null || to.name === 'list') {
    videoStore.graphId = index?.id
  }
  to.meta.initializeView = to.name !== from.name

  document.title = helperStore.localize(title ?? dataStore.data.config.name) ?? 'wanderer'
  // next()
})

router.afterEach(() => {
  document.querySelector(':root').classList.add('initialized')
})

export default router
