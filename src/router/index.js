import { createRouter, createWebHistory } from 'vue-router'
// import HomeView from '@/views/HomeView.vue'
import { useTerminusStore } from '@/stores/terminus'
import { useViewStore } from '@/stores/view'
import { ACCESS_READ, ACCESS_WRITE } from '@/assets/js/constants'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      // component: HomeView
      redirect: { name: 'list', params: { type: 'graph' } },
      meta: { hideInQuickNav: true }
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('@/views/AboutView.vue'),
      meta: { hideInQuickNav: true }
    },
    {
      path: '/signin',
      name: 'signin',
      component: () => import('@/views/SignInView.vue'),
      meta: { hideMenuBar: false, hideInQuickNav: true }
    },
    {
      path: '/:type',
      name: 'list',
      component: () => import('@/views/ListView.vue'),
      meta: {
        requiresAccess: ACCESS_READ,
        allowedTypes: ['graph', 'entity', 'class', 'property', 'media']
      }
    },
    {
      path: '/:type/:id',
      name: 'inspect',
      component: () => import('@/views/InspectView.vue'),
      meta: {
        requiresAccess: ACCESS_READ,
        allowedTypes: ['graph', 'entity', 'media']
      }
    },
    {
      path: '/screen/:type/:id',
      name: 'screen',
      component: () => import('@/views/ScreenView.vue'),
      meta: { requiresAccess: ACCESS_READ, allowedTypes: ['graph'] }
    },
    {
      path: '/edit/:type/:id',
      name: 'edit',
      component: () => import('@/views/EditView.vue'),
      meta: {
        requiresAccess: ACCESS_WRITE,
        allowedTypes: ['graph', 'entity', 'class', 'property', 'media', 'edge'],
        trackQuickNavChanges: false
      }
    },
    {
      path: '/create/:type',
      name: 'create',
      component: () => import('@/views/CreateView.vue'),
      meta: {
        requiresAccess: ACCESS_WRITE,
        allowedTypes: ['graph', 'entity', 'class', 'property', 'media'],
        trackQuickNavChanges: false
      }
    },
    {
      path: '/compose/:type/:id',
      name: 'compose',
      component: () => import('@/views/ComposeView.vue'),
      meta: { requiresAccess: ACCESS_WRITE, allowedTypes: ['graph'] }
    },
    {
      path: '/couple/:type/:id',
      name: 'couple',
      component: () => import('@/views/CoupleView.vue'),
      meta: { requiresAccess: ACCESS_WRITE, allowedTypes: ['graph'] }
    }
  ]
})

router.beforeEach(async (to, from) => {
  const viewStore = useViewStore()
  viewStore.before = from

  if (to.meta.allowedTypes && !to.meta.allowedTypes.some((type) => to.params.type === type)) {
    // show 404 or similar page here
    console.log('404')
    return false
  }

  const terminusStore = useTerminusStore()

  if (terminusStore.access < to.meta.requiresAccess) {
    const authStatus = await terminusStore.connect(to.meta.requiresAccess)
    if (authStatus !== 'SUCCESS') return { replace: true, name: 'signin' }
  }

  if (to.params.type != null && to.params.id != null) {
    await terminusStore.getLabel(`${to.params.type}/${to.params.id}`)
  } else {
    terminusStore.currentLabel = null
  }

  if (
    to.name === 'compose' ||
    to.name === 'couple' ||
    (to.name === 'inspect' && to.params.type === 'graph')
  ) {
    await terminusStore.getGraph(`${to.params.type}/${to.params.id}`, true)
  }

  return
})

export default router
