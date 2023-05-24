<script setup>
import TheCanvas from '@/components/TheCanvas.vue'
import { useRoute } from 'vue-router'
import TheDetail from '@/components/TheDetail.vue'
import ThePlayer from '@/components/ThePlayer.vue'

const route = useRoute()
</script>

<template>
  <TheCanvas v-if="route.params?.type === 'graph'" />
  <ThePlayer v-else-if="route.params?.type === 'media'" />
  <TheDetail v-else />
</template>

<style lang="scss" scoped>
main {
  display: flex;
}
</style>
