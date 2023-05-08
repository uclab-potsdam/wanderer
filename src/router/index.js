import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import { useTerminusStore } from '@/stores/terminus'
import { useViewStore } from '@/stores/view'
import { ACCESS_READ, ACCESS_WRITE } from '@/assets/js/constants'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('@/views/AboutView.vue')
    },
    {
      path: '/signin',
      name: 'signin',
      component: () => import('@/views/SignInView.vue')
    },
    {
      path: '/:type',
      name: 'list',
      component: () => import('@/views/ListView.vue'),
      meta: { requiresAccess: ACCESS_READ }
    },
    {
      path: '/:type/:id',
      name: 'inspect',
      component: () => import('@/views/InspectView.vue'),
      meta: { requiresAccess: ACCESS_READ }
    },
    {
      path: '/screen/:type/:id',
      name: 'screen',
      component: () => import('@/views/ScreenView.vue'),
      meta: { requiresAccess: ACCESS_READ }
    },
    {
      path: '/edit/:type/:id',
      name: 'edit',
      component: () => import('@/views/EditView.vue'),
      meta: { requiresAccess: ACCESS_WRITE }
    },
    {
      path: '/create/:type',
      name: 'create',
      component: () => import('@/views/CreateView.vue'),
      meta: { requiresAccess: ACCESS_WRITE }
    },
    {
      path: '/compose/canvas/:id',
      name: 'compose',
      component: () => import('@/views/ComposeView.vue'),
      meta: { requiresAccess: ACCESS_WRITE }
    },
    {
      path: '/couple/canvas/:id',
      name: 'couple',
      component: () => import('@/views/CoupleView.vue'),
      meta: { requiresAccess: ACCESS_WRITE }
    }
  ]
})

router.beforeEach(async (to, from) => {
  const viewStore = useViewStore()
  viewStore.before = from

  const terminusStore = useTerminusStore()

  if (terminusStore.access < to.meta.requiresAccess) {
    const authStatus = await terminusStore.connect(to.meta.requiresAccess)
    if (authStatus !== 'SUCCESS') return { replace: true, name: 'signin' }
  }

  if (to.name === 'canvas') {
    terminusStore.getCanvas(to.path.replace(/^\//, ''))
  }

  return
})

export default router
