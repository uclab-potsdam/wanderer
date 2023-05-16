<script setup>
import { RouterView, useRoute } from 'vue-router'
import TheHeader from '@/components/TheHeader.vue'

const route = useRoute()
</script>

<template>
  <TheHeader v-if="!route.meta.hideMenuBar"></TheHeader>
  <RouterView />
</template>

<style lang="scss" scoped></style>
