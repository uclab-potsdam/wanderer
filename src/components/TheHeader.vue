<script setup>
import { useSettingsStore } from '@/stores/settings'
import { useRoute, useRouter } from 'vue-router'
import { ref } from 'vue'
import InputSegment from '@/components/InputSegment.vue'
import { useConfigStore } from '@/stores/config'

import IconHome from '~icons/base/Home'
import ListWrapper from './ListWrapper.vue'
import TheAbout from './TheAbout.vue'
import { useVideoStore } from '@/stores/video'
import LocalizeText from './LocalizeText.vue'
import { useDataStore } from '@/stores/data'
import HeaderNavigation from './HeaderNavigation.vue'
import InputButton from './InputButton.vue'

const projectTitle = ref(import.meta.env.VITE_PROJECT_TITLE)

const route = useRoute()
const router = useRouter()
const settingsStore = useSettingsStore()
const configStore = useConfigStore()
const videoStore = useVideoStore()
const dataStore = useDataStore()
</script>

<template>
  <header>
    <HeaderNavigation />
    <ListWrapper class="header-item title">
      <RouterLink :to="`graph/${videoStore.graphId ?? ''}`">
        <LocalizeText :text="dataStore.data.nodes[videoStore.graphId]?.label ?? 'Wanderer'" />
      </RouterLink>
    </ListWrapper>
    <div class="mode" v-if="settingsStore.enableEditing">
      <InputSegment
        class="modes"
        horizontal
        v-model="settingsStore.mode"
        :options="
          settingsStore.modeOptions.map((o, i) => ({
            value: o,
            color: `var(--color-${o})`
          }))
        "
      />
    </div>
  </header>
</template>

<style scoped>
header {
  position: absolute;
  top: var(--spacing-half);
  left: var(--spacing-half);
  user-select: none;

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

    button {
      border-radius: var(--border-radius-small);
      width: 35px;
      height: 35px;
    }

    &.title {
      padding: var(--spacing-quart) var(--spacing-half);
    }
  }

  a {
    text-decoration: none;
    color: currentColor;
    cursor: pointer;
  }

  .modes {
    height: 40px;
  }
}

.about {
  /* pointer-events: all; */
  position: absolute;
  width: 300px;
  height: 300px;
  overflow: auto;
}
</style>
