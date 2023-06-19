<script setup>
import ThePlayer from '@/components/ThePlayer.vue'
import { useSyncStore } from '@/stores/sync'

const syncStore = useSyncStore()

syncStore.handshake()

addEventListener('beforeunload', () => {
  syncStore.releaseHandshake()
  // return null
})
</script>

<template>
  <ThePlayer letterbox />
</template>

<style lang="scss" scoped>
main {
  display: flex;
}
</style>
