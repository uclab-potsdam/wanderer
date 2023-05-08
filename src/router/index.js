import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/signin',
      name: 'signin',
      component: () => import('@/views/SignInView.vue')
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('@/views/AboutView.vue')
    },
    {
      path: '/:type',
      name: 'list',
      component: () => import('@/views/ListView.vue')
    },
    {
      path: '/:type/:id',
      name: 'inspect',
      component: () => import('@/views/InspectView.vue')
    },
    {
      path: '/screen/:type/:id',
      name: 'screen',
      component: () => import('@/views/ScreenView.vue')
    },
    {
      path: '/edit/:type/:id',
      name: 'edit',
      component: () => import('@/views/EditView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/create/:type/:id',
      name: 'create',
      component: () => import('@/views/CreateView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/compose/canvas/:id',
      name: 'compose',
      component: () => import('@/views/ComposeView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/couple/canvas/:id',
      name: 'couple',
      component: () => import('@/views/CoupleView.vue'),
      meta: { requiresAuth: true }
    }
  ]
})

export default router
