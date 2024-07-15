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

    <span class="right">
      <RouterLink v-if="route.name !== 'settings'" to="/settings"> settings </RouterLink>
      <RouterLink v-if="route.name !== 'projects'" to="/projects"> projects </RouterLink>
    </span>
    <!-- <a v-else @click="router.go(-1)">back</a> -->
  </header>
</template>

<style scoped>
header {
  grid-column: header-start / header-end;
  grid-row: header-start / header-end;

  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing);

  padding: var(--spacing-half);

  a {
    text-decoration: none;
    color: currentColor;
    cursor: pointer;
  }

  .right {
    display: inherit;
    gap: inherit;
  }
}
</style>
