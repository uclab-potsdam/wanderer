<script setup>
import TheCanvas from '@/components/TheCanvas.vue'
import { useRoute } from 'vue-router'
import TheDetail from '@/components/TheDetail.vue'
import ThePlayer from '@/components/ThePlayer.vue'
import TheControls from '@/components/TheControls.vue'

const route = useRoute()
</script>

<template>
  <TheCanvas v-if="route.params?.type === 'graph'" />
  <template v-else-if="route.params?.type === 'media'">
    <ThePlayer letterbox />
    <TheControls />
  </template>

  <TheDetail v-else />
</template>

<style lang="scss" scoped>
main {
  display: flex;
}
</style>
