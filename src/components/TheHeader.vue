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
    <RouterLink to="/">
      <h1>{{ projectTitle }}</h1>
    </RouterLink>
  </header>
</template>

<style scoped>
header {
  grid-column: header-start / header-end;
  grid-row: header-start / header-end;

  z-index: 1;
  display: flex;
  align-items: center;

  padding: calc(var(--spacing) / 2);

  a {
    text-decoration: none;
    color: currentColor;
  }
}
</style>
