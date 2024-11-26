<script setup>
import { RouterView } from 'vue-router'
import { useActivityStore } from './stores/activity'
import { onMounted, onUnmounted } from 'vue'
import ContextMenu from '@/components/ContextMenu.vue'
import TheModal from '@/components/TheModal.vue'

const activityStore = useActivityStore()

onMounted(() => {
  activityStore.startActivityTracking()

  window.addEventListener('resize', setAppHeight)
  setAppHeight()
})
onUnmounted(() => {
  activityStore.stopActivityTracking()
  window.removeEventListener('resize', setAppHeight)
})

function setAppHeight() {
  document.querySelector(':root').style.setProperty('--app-height', `${window.innerHeight}px`)
}
</script>

<template>
  <RouterView />
  <ContextMenu />
  <TheModal />
</template>
