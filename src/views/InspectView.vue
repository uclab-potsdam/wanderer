<script setup>
import TheCanvas from '@/components/TheCanvas.vue'
import { useRoute } from 'vue-router'
import TheDetail from '@/components/TheDetail.vue'

const route = useRoute()
</script>

<template>
  <TheCanvas v-if="route.params?.type === 'graph'" />

  <TheDetail v-else />
</template>

<style lang="scss" scoped>
main {
  display: flex;
}
</style>
