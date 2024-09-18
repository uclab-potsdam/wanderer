<script setup>
import { useSettingsStore } from '@/stores/settings'
import { useRoute, useRouter } from 'vue-router'
import { ref } from 'vue'
import InputSegment from '@/components/InputSegment.vue'
import { useConfigStore } from '@/stores/config'

const projectTitle = ref(import.meta.env.VITE_PROJECT_TITLE)

const route = useRoute()
const router = useRouter()
const settingsStore = useSettingsStore()
const configStore = useConfigStore()
</script>

<template>
  <header>
    <RouterLink to="/">
      <h1>{{ projectTitle }}</h1>
    </RouterLink>

    <span class="right">
      <RouterLink v-if="route.name !== 'settings'" to="/settings"> settings </RouterLink>
      <InputSegment
        horizontal
        equal-size
        v-model="settingsStore.lang"
        :options="configStore.languages"
      />
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
    align-items: center;
  }
}
</style>
