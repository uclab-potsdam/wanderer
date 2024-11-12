<script setup>
import { useSettingsStore } from '@/stores/settings'
import { useRoute, useRouter } from 'vue-router'
import { ref } from 'vue'
import InputSegment from '@/components/InputSegment.vue'
import { useConfigStore } from '@/stores/config'

import IconHome from '~icons/base/Home'
import IconBack from '~icons/base/Back'
import ListWrapper from './ListWrapper.vue'
import { useVideoStore } from '@/stores/video'
import LocalizeText from './LocalizeText.vue'
import { useDataStore } from '@/stores/data'
import HeaderNavigation from './HeaderNavigation.vue'

const projectTitle = ref(import.meta.env.VITE_PROJECT_TITLE)

const route = useRoute()
const router = useRouter()
const settingsStore = useSettingsStore()
const configStore = useConfigStore()
const videoStore = useVideoStore()
const dataStore = useDataStore()
</script>

<template>
  <footer>
    <span class="right">
      <InputSegment
        horizontal
        equal-size
        v-model="settingsStore.lang"
        :options="configStore.languages"
      />
    </span>
    <!-- <a v-else @click="router.go(-1)">back</a> -->
  </footer>
</template>

<style scoped>
footer {
  position: fixed;
  bottom: calc(var(--spacing-half) + var(--spacing-quart));
  left: var(--spacing-half);

  z-index: 1;
  display: flex;
  gap: var(--spacing-half);
  /* padding: var(--spacing-half); */
  .header-item {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 40px;

    font-weight: bold;
    /* justify-content: space-between; */
    /* gap: var(--spacing-half); */

    padding: var(--spacing-quart) var(--spacing-half);
  }

  a {
    text-decoration: none;
    color: currentColor;
    cursor: pointer;
  }
}
</style>
