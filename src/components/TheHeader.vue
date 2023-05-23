<script setup>
import IconV3 from '~icons/default/V3'
import IconUser from '~icons/default/User'
import IconAdd from '~icons/default/Add'
import IconSearch from '~icons/default/Search'
import IconUserSignedIn from '~icons/default/UserSignedIn'
import InputButton from '@/components/InputButton.vue'

import { useAuthStore } from '@/stores/auth'
import { useViewStore } from '@/stores/view'
import { useTerminusStore } from '@/stores/terminus'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import { computed, ref } from 'vue'
import InputSelect from './InputSelect.vue'
import BaseModal from '@/components/BaseModal.vue'

import { ACCESS_READ, ACCESS_WRITE } from '@/assets/js/constants'
import ListView from '../views/ListView.vue'
import CreateView from '../views/CreateView.vue'

const authStore = useAuthStore()
const viewStore = useViewStore()
const terminusStore = useTerminusStore()
const router = useRouter()
const route = useRoute()

const currentLabel = computed(
  () => terminusStore.currentLabel && viewStore.localize(terminusStore.currentLabel)
)

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

const signedIn = computed(() => terminusStore.access >= ACCESS_WRITE)

// console.log(quickNavRouteTypes.value, route.params?.allowedTypes)

function signout() {
  authStore.clearCredentials()
  terminusStore.connect(ACCESS_READ)
  router.push({ name: 'home' })
}

async function signin() {
  router.push({ name: 'signin' })
}

const showSearch = ref(false)
const showAdd = ref(false)
const modalType = ref('entity')

function toggleSearch() {
  showSearch.value = !showSearch.value
  showAdd.value = false
}

function toggleAdd() {
  showAdd.value = !showAdd.value
  showSearch.value = false
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
            @update:modelValue="
              (type) =>
                router[route.meta?.trackQuickNavChanges === false ? 'replace' : 'push']({
                  params: { type }
                })
            "
          />
        </span>
        <span v-if="currentLabel" :lang="currentLabel.lang"> / {{ currentLabel.text }}</span>
      </h1>
    </slot>
    <span />
    <slot name="right">
      <span>
        <InputButton><IconSearch @click="toggleSearch" /></InputButton>
        <InputButton><IconAdd @click="toggleAdd" /></InputButton>
      </span>
    </slot>
    <InputButton>
      <IconUser v-if="!signedIn" @click="signin" />
      <IconUserSignedIn v-else @click="signout" />
    </InputButton>
    <Teleport to="body" v-if="showSearch">
      <BaseModal @close="showSearch = false">
        <InputSelect
          :options="[
            { label: 'graph', value: 'graph' },
            { label: 'entity', value: 'entity' }
          ]"
          v-model="modalType"
        />
        <ListView :type="modalType" single-column />
      </BaseModal>
    </Teleport>
    <Teleport to="body" v-if="showAdd">
      <BaseModal @close="showAdd = false">
        <InputSelect
          :options="[
            { label: 'graph', value: 'graph' },
            { label: 'entity', value: 'entity' }
          ]"
          v-model="modalType"
        />
        <CreateView :type="modalType" disable-routing @completed="showAdd = false" />
      </BaseModal>
    </Teleport>
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
