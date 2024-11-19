<script setup>
import { useSettingsStore } from '@/stores/settings'
import { useRoute, useRouter } from 'vue-router'
import { ref } from 'vue'
import InputSegment from '@/components/InputSegment.vue'
import InputButton from './InputButton.vue'
import { useConfigStore } from '@/stores/config'

import ControlsPlay from '~icons/base/ControlsPlay35'
import ControlsPause from '~icons/base/ControlsPause35'
import ControlsMuted from '~icons/base/ControlsMuted'
import ControlsUnmuted from '~icons/base/ControlsUnmuted'
import ControlsSplit from '~icons/base/ControlsSplit'
import ControlsSplitAlt from '~icons/base/ControlsSplitAlt'
import ControlsPip from '~icons/base/ControlsPip'
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
    <span class="icon-group">
      <template v-if="route.name === 'graph'">
        <ListWrapper class="footer-item" horizontal>
          <InputButton disable-padding>
            <ControlsPlay v-if="!videoStore.playing" @click="videoStore.setPlaying = true" />
            <ControlsPause v-else @click="videoStore.setPlaying = false" />
          </InputButton>
        </ListWrapper>
        <ListWrapper class="footer-item">
          <InputButton disable-padding>
            <ControlsMuted v-if="videoStore.muted" @click="videoStore.muted = false" />
            <ControlsUnmuted v-else @click="videoStore.muted = true" />
          </InputButton>
        </ListWrapper>
        <!-- <ListWrapper class="footer-item">
        <InputButton disable-padding>
          <ControlsPip
            v-if="settingsStore.pictureInPicture"
            @click="settingsStore.pictureInPicture = false"
          />
          <ControlsSplit v-else @click="settingsStore.pictureInPicture = true" />
        </InputButton>
      </ListWrapper> -->
      </template>
      <InputSegment
        horizontal
        equal-size
        v-model="settingsStore.lang"
        :options="configStore.languages"
      />
    </span>
    <span class="right" v-if="route.name === 'graph'">
      <InputSegment
        horizontal
        equal-size
        v-model="settingsStore.pictureInPicture"
        :options="[
          { value: true, slot: 'pip', tooltip: 'picture in picture' },
          { value: false, slot: 'split', tooltip: 'split screen' }
        ]"
      >
        <template #pip><ControlsPip /></template>
        <template #split
          ><ControlsSplit class="split" /><ControlsSplitAlt class="split-alt"
        /></template>
      </InputSegment>
    </span>
    <!-- <a v-else @click="router.go(-1)">back</a> -->
  </footer>
</template>

<style scoped>
footer {
  position: sticky;
  top: calc(100vh - 40px - var(--spacing-half) - var(--spacing-quart));
  user-select: none;
  pointer-events: none;
  padding: 0 var(--spacing-half);

  > * {
    pointer-events: initial;
  }

  z-index: 1;
  display: flex;
  justify-content: space-between;
  gap: var(--spacing-half);
  /* padding: var(--spacing-half); */

  .icon-group {
    display: flex;
    gap: var(--spacing-half);
  }
  .footer-item {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 40px;
    /* width: 40px; */

    button {
      border-radius: var(--border-radius-small);
    }

    font-weight: bold;
    /* justify-content: space-between; */
    /* gap: var(--spacing-half); */

    /* padding: var(--spacing-quart) var(--spacing-half); */
  }

  a {
    text-decoration: none;
    color: currentColor;
    cursor: pointer;
  }

  .split {
    display: none;
  }
  @media (min-aspect-ratio: 3/2) {
    .split {
      display: initial;
    }
    .split-alt {
      display: none;
    }
  }
}
</style>
