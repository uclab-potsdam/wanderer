import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import { useTerminusStore } from '@/stores/terminus'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: {
        requiresAuth: true
      },
      redirect: { name: 'list', params: { type: 'graph' } }
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('@/views/AboutView.vue')
    },
    {
      path: '/:type',
      name: 'list',
      component: () => import('@/views/ListView.vue'),
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/graph/:id',
      name: 'graph',
      component: () => import('@/views/CanvasView.vue'),
      meta: {
        requiresAuth: true,
        resolveTitle: true
      }
    },
    {
      path: '/entity/:id',
      name: 'entity',
      component: () => import('@/views/CanvasView.vue'),
      meta: {
        requiresAuth: true,
        resolveTitle: true
      }
    },
    {
      path: '/media/:id',
      name: 'media',
      component: () => import('@/views/InspectView.vue'),
      meta: {
        requiresAuth: true,
        resolveTitle: true
      }
    },
    {
      path: '/play',
      name: 'play',
      component: () => import('@/views/PlayView.vue'),
      meta: {
        requiresAuth: true,
        hideMenuBar: true
      }
    },
    {
      path: '/:type/:id',
      name: 'inspect',
      component: () => import('@/views/InspectView.vue'),
      meta: {
        requiresAuth: true,
        resolveTitle: true
      }
    }
  ]
})

router.beforeEach(async (to) => {
  const terminusStore = useTerminusStore()
  if (to.meta.requiresAuth && !terminusStore.isAuthorized) {
    await terminusStore.connect()
    // todo: error handling
  }
})

export default router
