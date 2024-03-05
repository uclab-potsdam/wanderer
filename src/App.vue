<script setup>
import { RouterView, useRoute } from 'vue-router'
import TheHeader from './components/TheHeader.vue'
import { useActivityStore } from './stores/activity'
import { onMounted, onUnmounted } from 'vue'
const route = useRoute()

const activityStore = useActivityStore()

onMounted(() => activityStore.startActivityTracking())
onUnmounted(() => activityStore.stopActivityTracking())
</script>

<template>
  <TheHeader v-if="!route.meta.hideMenuBar" />
  <RouterView />
</template>
