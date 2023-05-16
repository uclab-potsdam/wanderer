<script setup>
import IconV3 from '~icons/default/V3'
import IconCog from '~icons/default/Cog'
import InputButton from '@/components/InputButton.vue'

import { useAuthStore } from '@/stores/auth'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import { computed } from 'vue'
import InputSelect from './InputSelect.vue'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const quickNavRouteNames = computed(() => {
  return router
    .getRoutes()
    .filter((r) => {
      if (r.meta?.hideInQuickNav) return false
      if (r.meta.allowedTypes && !r.meta.allowedTypes.includes(route.params.type)) return false
      const keys = [...r.path.matchAll(/\/:([^/]+)/g)].map((d) => d[1])
      return keys.every((p) => Object.keys(route.params || {}).includes(p))
    })
    .map((d) => ({ value: d.name, label: d.name }))
})

const quickNavRouteTypes = computed(() => {
  return route.params.id != null || route.meta?.allowedTypes == null
    ? null
    : route.meta.allowedTypes.map((d) => ({ value: d, label: d }))
})

// console.log(quickNavRouteTypes.value, route.params?.allowedTypes)

function signout() {
  authStore.clearCredentials()
  router.push({ name: 'signin' })
}
</script>

<template>
  <header>
    <RouterLink :to="{ name: 'home' }">
      <InputButton>
        <IconV3 />
      </InputButton>
    </RouterLink>
    <span />
    <slot name="left">
      <h1>
        <span>
          <template v-if="quickNavRouteNames.length <= 1">{{ route.name }}</template>
          <InputSelect
            v-else
            :options="quickNavRouteNames"
            :model-value="route.name"
            @update:modelValue="(name) => router.push({ name })"
          />
        </span>
        <span v-if="route.params.type">
          /
          <template v-if="!quickNavRouteTypes">{{ route.params.type }}</template>
          <InputSelect
            v-else
            :options="quickNavRouteTypes"
            :model-value="route.params.type"
            @update:modelValue="(type) => router.push({ params: { type } })"
          />
        </span>
        <span v-if="route.params.id"> / {{ route.params.id }}</span>
      </h1>
    </slot>
    <span />
    <slot name="right">
      <span />
    </slot>
    <InputButton>
      <IconCog @click="signout" />
    </InputButton>
  </header>
</template>

<style lang="scss" scoped>
header {
  display: grid;
  align-items: center;
  // gap: var(--spacing);
  grid-template-columns: auto var(--spacing) auto 1fr auto auto;
  position: relative;
  z-index: 2;

  h1 {
    // margin-left: var(--spacing);
    display: flex;
    align-items: center;
  }
}
</style>
