import { createRouter, createWebHistory } from 'vue-router'
import { useDataStore } from '@/stores/data'
import { useVideoStore } from '@/stores/video'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      redirect: { name: 'list', params: { type: 'graph' } }
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
      path: '/video',
      name: 'video',
      component: () => import('@/views/VideoView.vue'),
      meta: {
        hideMenuBar: true
      }
    }
  ]
})

router.beforeEach(async (to, from) => {
  const dataStore = useDataStore()
  const videoStore = useVideoStore()
  if (dataStore.data === null && ['list', 'graph'].includes(to.name)) {
    await dataStore.init()
  }
  if (to.name === 'graph') {
    dataStore.nodeId = to.params.id
  }
  if (to.params.type === 'graph') {
    videoStore.graphId = to.params.id
  }
  to.meta.initializeView = to.name !== from.name
})

export default router
