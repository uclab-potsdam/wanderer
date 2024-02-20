import { createRouter, createWebHistory } from 'vue-router'
import { useDataStore } from '@/stores/data'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      meta: {
        requiresAuth: true
      },
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
      path: '/player',
      name: 'player',
      component: () => import('@/views/PlayerView.vue'),
      meta: {
        hideMenuBar: true
      }
    }
  ]
})

router.beforeEach(async (to) => {
  const dataStore = useDataStore()
  if (dataStore.data === null && ['list', 'graph'].includes(to.name)) {
    await dataStore.init()
  }
})

export default router
