<script setup>
import TheCanvas from '@/components/TheCanvas.vue'
import TheToolbar from '@/components/TheToolbar.vue'
import ThePlayer from '@/components/ThePlayer.vue'
import TheRelatedGraphs from '@/components/TheRelatedGraphs.vue'
</script>

<template>
  <TheCanvas />
  <ThePlayer width="450" />
  <TheToolbar />
  <TheRelatedGraphs />
</template>

<style lang="scss" scoped>
main {
  display: flex;
}
</style>
