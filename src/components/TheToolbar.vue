<script setup>
import { useTerminusStore } from '@/stores/terminus'
import { useViewStore } from '@/stores/view'
import { MODE_COMPOSE, MODE_COUPLE, MODE_VIEW } from '@/assets/js/constants'

import { useRoute } from 'vue-router'
import ControlsCompose from './controls/ControlsCompose.vue'
import ControlsCouple from './controls/ControlsCouple.vue'
import ControlsMedia from './controls/ControlsMedia.vue'

const route = useRoute()

const terminusStore = useTerminusStore()
const viewStore = useViewStore()
</script>
<template>
  <div class="the-toolbar" v-if="route.name === 'graph'">
    <ControlsCompose v-if="viewStore.mode === MODE_COMPOSE" />
    <ControlsCouple v-if="viewStore.mode === MODE_COUPLE" />
    <ControlsMedia v-if="viewStore.mode === MODE_VIEW" />
  </div>
</template>
<style lang="scss" scoped>
.the-toolbar {
  position: absolute;
  bottom: 0px;
  left: 0px;
  width: 100%;
  display: grid;
  justify-items: center;
  padding: calc(var(--spacing-s) + var(--spacing-xs));
}
</style>
