<script setup>
import { useTerminusStore } from '@/stores/terminus'
import { useViewStore } from '@/stores/view'
import { MODE_VIEW, MODE_COMPOSE, MODE_COUPLE } from '@/assets/js/constants'

import IconCompose from '~icons/base/Compose'
import IconCouple from '~icons/base/Couple'
import IconPreview from '~icons/base/Preview'
import InputSegment from '@/components/inputs/InputSegment.vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const terminusStore = useTerminusStore()
const viewStore = useViewStore()
</script>
<template>
  <InputSegment
    v-if="terminusStore.isAuthor && route.name === 'graph'"
    v-model="viewStore.modeSetting"
    :options="[
      { value: MODE_COMPOSE, slot: 'compose' },
      { value: MODE_COUPLE, slot: 'couple' },
      { value: MODE_VIEW, slot: 'view' }
    ]"
  >
    <template #compose><IconCompose /></template>
    <template #couple><IconCouple /></template>
    <template #view><IconPreview /></template>
  </InputSegment>
</template>
