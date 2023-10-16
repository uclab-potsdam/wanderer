<script setup>
import { useViewStore } from '@/stores/view'
import { MODE_COMPOSE, MODE_COUPLE } from '@/assets/js/constants'

import { useRoute } from 'vue-router'
import ControlsCompose from './controls/ControlsCompose.vue'
import ControlsCouple from './controls/ControlsCouple.vue'

const route = useRoute()

const viewStore = useViewStore()
</script>
<template>
  <div class="the-toolbar" v-if="route.name === 'graph'">
    <ControlsCompose v-if="viewStore.mode === MODE_COMPOSE" />
    <ControlsCouple v-if="viewStore.mode === MODE_COUPLE" />
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
