<script setup>
import TheCanvas from '@/components/TheCanvas.vue'
import TheControls from '@/components/TheControls.vue'
import ThePlayer from '@/components/ThePlayer.vue'
</script>

<template>
  <TheCanvas />
  <ThePlayer width="450" />
  <TheControls persistent scrubbing mark />
</template>

<style lang="scss" scoped>
// .the-player {
//   position: absolute;
//   width: 300px;
//   height: 200px;
// }
</style>
