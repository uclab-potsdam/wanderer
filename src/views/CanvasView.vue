<script setup>
import TheCanvas from '@/components/TheCanvas.vue'
import TheToolbar from '@/components/TheToolbar.vue'
import ThePlayer from '@/components/ThePlayer.vue'
import TheRelatedGraphs from '@/components/TheRelatedGraphs.vue'
import { useSyncStore } from '@/stores/sync'

const syncStore = useSyncStore()

syncStore.openCanvas()

addEventListener('beforeunload', () => {
  syncStore.closeCanvas()
})
</script>

<template>
  <TheCanvas />
  <ThePlayer width="450" v-if="!syncStore.hasPlayer" />
  <TheToolbar />
  <TheRelatedGraphs />
</template>

<style lang="scss" scoped>
main {
  display: flex;
}
</style>
