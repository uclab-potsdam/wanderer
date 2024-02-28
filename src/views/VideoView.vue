<script setup>
import TheVideo from '@/components/TheVideo.vue'
import { useVideoStore } from '@/stores/video'
import { onMounted } from 'vue'

const videoStore = useVideoStore()

onMounted(() => videoStore.attachPlayer())

addEventListener('beforeunload', () => {
  videoStore.detachPlayer()
})
</script>

<template>
  <main class="video-wrapper">
    <TheVideo letterbox v-if="videoStore.video" />
  </main>
</template>

<style scoped>
.video-wrapper {
  --font-size-subtitle: max(4vw, 40px);

  grid-column: 1 / -1;
  grid-row: 1 / -1;

  max-height: 100vh;
  display: grid;

  grid-template-columns:
    [video-start-x] 1fr
    [video-end-x];

  grid-template-rows:
    [video-start-y] 1fr
    [video-end-y];
}
</style>
