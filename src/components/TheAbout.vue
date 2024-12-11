<script setup>
import { useDataStore } from '@/stores/data'
import ListWrapper from './ListWrapper.vue'
import IconAbout from '~icons/base/About'
import IconClose from '~icons/base/Close'
import InputButton from './InputButton.vue'
import { useRoute } from 'vue-router'

import { marked } from 'marked'
import { computed, ref } from 'vue'
import { useHelperStore } from '@/stores/helper'

const route = useRoute()
const dataStore = useDataStore()
const helperStore = useHelperStore()

const showAbout = ref(false)

function toggleAbout() {
  showAbout.value = !showAbout.value
  if (showAbout.value) {
    window.addEventListener(
      'click',
      () => {
        showAbout.value = false
      },
      { once: true }
    )
  }
}

const about = computed(() => {
  let about = helperStore.localize(dataStore.about)
  if (dataStore.kiosk) {
    about = about.replace(/([^!])\[(.*)\]\((.*)\)/g, (a, b, c) => `${b}${c}`)
  }

  return about.replace(/\[(.*)\]\((.*)\)/g, (a, b, c, d) => {
    return `[${b}](${helperStore.getMediaUrl(c)})`
  })
})
</script>

<template>
  <div class="about" v-if="dataStore.about">
    <ListWrapper horizontal class="item" v-if="route.name === 'graph'">
      <InputButton disable-padding @click.stop="toggleAbout" :active="showAbout">
        <IconAbout v-if="!showAbout" />
        <IconClose v-else />
      </InputButton>
    </ListWrapper>
    <ListWrapper class="text-wrapper" v-if="showAbout" @click.stop
      ><div class="text" v-html="marked.parse(about)" />
    </ListWrapper>
  </div>
</template>

<style scoped>
.about {
  position: absolute;
  top: calc(40px + var(--spacing));
  left: var(--spacing-half);
  z-index: 2;

  display: flex;
  gap: var(--spacing-half);

  .item {
    width: 40px;
    height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;

    button {
      border-radius: var(--border-radius-small);
      width: 35px;
      height: 35px;
    }
  }

  .text-wrapper {
    backdrop-filter: contrast(80%) brightness(200%) saturate(10%) blur(10px);
  }

  .text {
    max-height: calc(100cqh - 85px - var(--spacing-double) - var(--spacing-quart));
    overflow: auto;
    width: min(450px, calc(100vw - var(--spacing) * 1.5 - 40px));

    text-align: left;
    font-size: var(--font-size-small);
    padding: var(--spacing-half);
    text-wrap: balance;
    hyphens: auto;

    &:deep(*) {
      :is(img) {
        max-width: 100%;
      }

      > p:not(:has(img)),
      > h1,
      > h2,
      > h3,
      > h4,
      > h5,
      > h6 {
        margin-right: var(--spacing-half);
      }

      + p,
      + h1,
      + h2,
      + h3,
      + h4,
      + h5,
      + h6 {
        margin-top: var(--spacing-half);
      }

      h1,
      h2,
      h3 {
        font-size: inherit;
      }

      a {
        color: inherit;
      }
    }
    &:deep(h1),
    &:deep(h2),
    &:deep(h3) {
      font-size: inherit;
      font-weight: bold;
    }

    &.fade-enter-active,
    &.fade-leave-active {
      transition: opacity var(--ui-transition);
    }

    &.fade-enter-from,
    &.fade-leave-to {
      opacity: 0;
    }
  }
}
</style>
