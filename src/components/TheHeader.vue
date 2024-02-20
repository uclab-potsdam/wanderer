<script setup>
import { useDataStore } from '@/stores/data'
import { useRoute, useRouter } from 'vue-router'
import { ref } from 'vue'

const projectTitle = ref(import.meta.env.VITE_PROJECT_TITLE)

const dataStore = useDataStore()
const route = useRoute()
const router = useRouter()
</script>

<template>
  <header>
    <h1>{{ projectTitle }}</h1>
  </header>
</template>

<style scoped>
header {
  grid-column: center-start / center-end;
  grid-row: 1 / center-start;

  display: flex;
  align-items: center;
}
</style>
