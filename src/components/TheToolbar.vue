<script setup>
import CursorDefault from '~icons/base/CursorDefault'
import AddEntity from '~icons/base/AddEntity'
import AddStory from '~icons/base/AddStory'
import AddImage from '~icons/base/AddImage'
import AddEdge from '~icons/base/AddLink'
import SeperatorHorizontal from '~icons/base/SeperatorHorizontal'
import DisplayBlur from '~icons/base/DisplayBlur'
import DisplayDefault from '~icons/base/DisplayDefault'
import DisplayHighlight from '~icons/base/DisplayHighlight'
import DisplayUnset from '~icons/base/DisplayUnset'
import DisplayFrame from '~icons/base/DisplayFrame'
import InputSegment from './InputSegment.vue'
import { useEditStore } from '@/stores/edit'

const editStore = useEditStore()
</script>

<template>
  <section class="toolbar">
    <InputSegment
      v-model="editStore.mode"
      :options="[
        { value: 'default', slot: 'default', tooltip: 'Select' },
        { value: 'add-entity', slot: 'add-entity', tooltip: 'add entity' },
        { value: 'add-story', slot: 'add-story', tooltip: 'add story' },
        { value: 'add-image', slot: 'add-image', tooltip: 'add image' },
        { value: 'add-edge', slot: 'add-edge', tooltip: 'add edge' },
        { disabled: true, slot: 'seperator' },
        { value: 'display-blur', slot: 'display-blur', tooltip: 'blur' },
        { value: 'display-default', slot: 'display-default', tooltip: 'default' },
        { value: 'display-highlight', slot: 'display-highlight', tooltip: 'highlight' },
        { value: 'display-unset', slot: 'display-unset', tooltip: 'unset' },
        { value: 'display-frame', slot: 'display-frame', tooltip: 'frame' }
      ]"
    >
      <template #default><CursorDefault /></template>
      <template #add-entity><AddEntity /></template>
      <template #add-story><AddStory /></template>
      <template #add-image><AddImage /></template>
      <template #add-edge><AddEdge /></template>
      <template #seperator><SeperatorHorizontal /></template>
      <template #display-blur><DisplayBlur /></template>
      <template #display-default><DisplayDefault /></template>
      <template #display-highlight><DisplayHighlight /></template>
      <template #display-unset><DisplayUnset /></template>
      <template #display-frame><DisplayFrame /></template>
    </InputSegment>
  </section>
</template>

<style scoped>
.toolbar {
  --accent: var(--ui-accent);
  position: absolute;
  left: var(--spacing-half);
  /* align-self: center; */
  top: 50%;
  transform: translateY(-50%);

  display: flex;
  flex-direction: column;
  gap: var(--border-radius-small);
  align-items: center;
  justify-content: center;

  /* background: var(--color-background);
  box-shadow: var(--ui-shadow);
  border-radius: var(--border-radius); */

  .button {
    border-radius: var(--border-radius-small);
  }
}
</style>
