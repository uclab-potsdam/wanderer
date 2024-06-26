<script setup>
import { RouterView } from 'vue-router'
import { useActivityStore } from './stores/activity'
import { onMounted, onUnmounted } from 'vue'
import ContextMenu from '@/components/ContextMenu.vue'
import TheModal from '@/components/TheModal.vue'

const activityStore = useActivityStore()

onMounted(() => activityStore.startActivityTracking())
onUnmounted(() => activityStore.stopActivityTracking())
</script>

<template>
  <RouterView />
  <ContextMenu />
  <TheModal />
</template>
