<script setup>
import { RouterView } from 'vue-router'
import { useActivityStore } from './stores/activity'
import { onMounted, onUnmounted } from 'vue'

const activityStore = useActivityStore()

onMounted(() => activityStore.startActivityTracking())
onUnmounted(() => activityStore.stopActivityTracking())
</script>

<template>
  <RouterView />
</template>
