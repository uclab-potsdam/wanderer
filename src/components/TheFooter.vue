<script setup>
import { useSettingsStore } from '@/stores/settings'
import { useRoute, useRouter } from 'vue-router'
import { computed, ref } from 'vue'
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
import IconText from '~icons/base/Text'
import IconAudio from '~icons/base/Audio'
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

const showText = ref(false)
const showAudio = ref(false)

const hideTextIcon = computed(() => dataStore.data.config.languages.text.length <= 1)
const hideAudioIcon = computed(() => dataStore.data.config.languages.video.length <= 1)

const disableAudioIcon = computed(
  () => Object.values(videoStore.video?.file ?? {}).filter((d) => d).length <= 1
)

function toggleAudio() {
  showAudio.value = !showAudio.value
  if (showAudio.value) {
    showText.value = false
    window.addEventListener(
      'click',
      () => {
        showAudio.value = false
      },
      { once: true }
    )
  }
}

function toggleText() {
  showText.value = !showText.value
  if (showText.value) {
    showAudio.value = false
    window.addEventListener(
      'click',
      () => {
        showText.value = false
      },
      { once: true }
    )
  }
}
</script>

<template>
  <footer :class="{ edit: settingsStore.edit && route.name === 'graph' }">
    <span class="icon-group">
      <template v-if="route.name === 'graph' && (!dataStore.kiosk || settingsStore.enableEditing)">
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
    </span>
    <span class="right icon-group">
      <template v-if="route.name === 'graph'">
        <InputSegment
          horizontal
          v-if="!dataStore.kiosk"
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
        <ListWrapper class="footer-item" v-if="!hideAudioIcon">
          <InputButton disable-padding :disabled="disableAudioIcon" @click.stop="toggleAudio">
            <IconAudio />
          </InputButton>
        </ListWrapper>
      </template>
      <ListWrapper class="footer-item" v-if="!hideTextIcon">
        <InputButton disable-padding @click.stop="toggleText" :class="{ active: showText }">
          <IconText />
        </InputButton>
      </ListWrapper>
    </span>

    <InputSegment
      v-if="showAudio"
      @click.stop
      @update:model-value="showAudio = false"
      class="languages"
      equal-size
      v-model="settingsStore.videoLang"
      :options="
        dataStore.data.config.languages.video
          .filter((l) => l.selectable !== false)
          .map(({ key, label }) => ({
            value: key,
            label,
            disabled: videoStore.video.file[key] == null
          }))
      "
    />
    <InputSegment
      v-if="showText"
      @click.stop
      @update:model-value="showText = false"
      class="languages"
      equal-size
      v-model="settingsStore.lang"
      :options="
        dataStore.data.config.languages.text
          .filter((l) => l.selectable !== false)
          .map(({ key, label }) => ({ value: key, label }))
      "
    />
    <!-- <a v-else @click="router.go(-1)">back</a> -->
  </footer>
</template>

<style scoped>
footer {
  position: sticky;
  top: calc(var(--app-height) - 40px - var(--spacing-half) - var(--spacing-quart));
  &.edit {
    top: calc(var(--app-height) - 95px - var(--spacing-half) - var(--spacing-quart));
  }
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

  .languages {
    position: absolute;
    right: var(--spacing-half);
    bottom: calc(40px + var(--spacing-half));
    display: flex;
    flex-direction: column;
    min-width: 160px;
  }
}
</style>
