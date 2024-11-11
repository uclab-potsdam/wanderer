<script setup>
import IconHome from '~icons/base/Home'
import IconBack from '~icons/base/Back'
import IconNowhereToGo from '~icons/base/NowhereToGo'
import ListWrapper from './ListWrapper.vue'

import { useVideoStore } from '@/stores/video'
import { useDataStore } from '@/stores/data'
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const videoStore = useVideoStore()
const dataStore = useDataStore()
const route = useRoute()

const target = computed(() => {
  if (videoStore.restoreState) {
    return {
      name: 'graph',
      params: {
        type: 'graph',
        id: videoStore.restoreState.graphId
      }
    }
  }
  if (route.name === 'graph' && route.params.type !== 'graph' && videoStore.graphId)
    return {
      name: 'graph',
      params: {
        type: 'graph',
        id: videoStore.graphId
      }
    }
  return {
    name: 'home'
  }
})
</script>

<template>
  <RouterLink :to="target">
    <ListWrapper horizontal class="header-item">
      <div class="icon-wrapper">
        <IconBack v-if="videoStore.restoreState != null" class="pulse" />
        <IconNowhereToGo
          class="index"
          v-else-if="
            route.name === 'graph' && route.params.type === 'graph' && dataStore.node?.index
          "
        />
        <IconHome v-else-if="route.params.type === 'graph' || route.name !== 'graph'" />
        <IconBack v-else />
      </div>
    </ListWrapper>
  </RouterLink>
</template>

<style scoped>
svg {
  display: block;
}

.header-item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  width: 40px;

  .icon-wrapper {
    display: inherit;
    align-items: inherit;
    justify-content: inherit;

    width: 35px;
    height: 35px;

    .pulse {
      animation: linear 1s alternate infinite pulse;
    }

    .v-enter-active,
    .v-leave-active {
      transition: opacity 0.2s ease;
    }

    .v-enter-from,
    .v-leave-to {
      opacity: 0;
    }
  }

  &:hover {
    .icon-wrapper {
      background-color: color-mix(in lab, var(--ui-accent), transparent 70%);
    }
  }
}

a:has(.index) {
  pointer-events: none;
  .icon-wrapper {
    opacity: 0.4;
  }
}
@keyframes pulse {
  from {
    opacity: 1;
  }

  50% {
    opacity: 0.1;
  }

  to {
    opacity: 1;
  }
}
</style>
