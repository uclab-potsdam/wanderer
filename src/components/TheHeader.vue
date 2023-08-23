<script setup>
import IconWanderer from '~icons/base/Wanderer'
import IconCog from '~icons/base/Cog'
import BaseButton from '@/components/BaseButton.vue'
import ModalSettings from '@/components/modals/ModalSettings.vue'

import { ref, watch } from 'vue'
import ControlsModeSwitch from '@/components/controls/ControlsModeSwitch.vue'
import { useRoute } from 'vue-router'
import { useViewStore } from '@/stores/view'

const projectTitle = ref(import.meta.env.VITE_PROJECT_TITLE)

const route = useRoute()
const viewStore = useViewStore()

const pageTitle = ref(null)

const showSettings = ref(false)

watch(
  () => route,
  async () => {
    pageTitle.value = await viewStore.getTitle(route)
  },
  { immediate: true, deep: true }
)
</script>

<template>
  <header>
    <span class="left">
      <RouterLink :to="{ name: 'home' }" class="logo">
        <IconWanderer />

        <h1 :class="{ thin: pageTitle != null }">{{ projectTitle }}</h1>
      </RouterLink>
      <span v-if="pageTitle">→</span>
      <h2 v-if="pageTitle" :lang="pageTitle.lang">{{ pageTitle.text }}</h2>
    </span>
    <span class="right">
      <ControlsModeSwitch />
      <BaseButton @click="showSettings = true">
        <IconCog />
        <Teleport to="#modals">
          <ModalSettings :show="showSettings" @close="showSettings = false" />
        </Teleport>
      </BaseButton>
    </span>
  </header>
</template>

<style lang="scss" scoped>
header {
  display: flex;
  position: relative;
  z-index: 100;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-s);
  padding: var(--spacing-s);

  .left,
  .right {
    display: flex;
    gap: inherit;
    align-items: center;
  }

  .logo {
    display: flex;
    align-items: center;
    gap: inherit;

    .icon {
      margin: var(--spacing) var(--spacing-s);
    }

    // margin-right: calc(var(--spacing-s) * -1);
  }

  .left {
    > .logo > h1,
    > h2,
    > span {
      transform: translateY(1px);
      // display: flex;
      // align-items: center;
    }

    > h2 {
      font-weight: var(--black);
    }
    > .logo > h1 {
      transition: font-weight var(--transition);
      &.thin {
        font-weight: var(--regular);
      }
    }
  }
}
</style>
