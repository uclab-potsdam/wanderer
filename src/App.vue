<script setup>
import { RouterView, useRoute } from 'vue-router'
import { onMounted, onUnmounted } from 'vue'

import TheHeader from '@/components/TheHeader.vue'
import { useViewStore } from './stores/view'

const viewStore = useViewStore()

onMounted(() => viewStore.startActivityTracking())
onUnmounted(() => viewStore.stopActivityTracking())

const route = useRoute()
</script>

<template>
  <TheHeader v-if="!route.meta.hideMenuBar"></TheHeader>
  <RouterView />
</template>

<style lang="scss" scoped></style>
