<script setup>
import { useDataStore } from '@/stores/data'
import { computed, ref } from 'vue'
import LocalizeText from './LocalizeText.vue'
import { useSettingsStore } from '@/stores/settings'
import { distance } from 'fastest-levenshtein'
import { useHelperStore } from '@/stores/helper'
import ListWrapper from './ListWrapper.vue'

const props = defineProps({
  context: {
    type: Object,
    default: () => ({
      nodeType: 'entity'
    })
  }
})

const emit = defineEmits(['select-item'])

const dataStore = useDataStore()
const settingsStore = useSettingsStore()
const helperStore = useHelperStore()
const label = ref('')

const nodes = computed(() => {
  const nodes = dataStore.nodes.filter((n) => n.type === props.context.nodeType)
  if (label.value.length === 0) return nodes
  if (label.value.length < 3)
    return nodes
      .filter((node) => {
        return new RegExp(`^${label.value}`).test(helperStore.localize(node.label))
      })
      .sort((a, b) => (helperStore.localize(a.label) < helperStore.localize(b.label) ? -1 : 1))
  // .map(({ node, distance }) => ({ ...node, distance }))
  return nodes
    .map((node) => {
      const s1 = label.value
      const s2 = helperStore.localize(node.label)
      return {
        distance: distance(s1, s2) / Math.max(s1.length, s2.length),
        node
      }
    })
    .filter(({ distance }) => distance < 0.5)
    .sort((a, b) => a.distance - b.distance)
    .map(({ node, distance }) => ({ ...node, distance }))
})

function createNode() {
  const uuid = crypto.randomUUID()
  const node = {
    type: props.context.nodeType,
    // class: { en: 'none' },
    label: { [settingsStore.lang]: label.value }
  }
  dataStore.data.nodes[uuid] = node
  emit('select-item', uuid)
}
</script>

<template>
  <ListWrapper class="context-menu-search">
    <input placeholder="search" @click.stop v-model="label" />
    <button :disabled="label === ''" @click="createNode">add {{ label }}</button>
    <button v-for="(node, i) in nodes" :key="i" @click="emit('select-item', node.id)">
      <LocalizeText :text="node.label" />
      – {{ node.distance }}
    </button>
  </ListWrapper>
</template>

<style scoped>
.context-menu-search {
  /* display: flex;
  flex-direction: column;
  background: var(--color-background);
  box-shadow: var(--ui-shadow);
  border-radius: var(--border-radius);
  padding: var(--border-radius-small); */

  font-size: var(--font-size-small);
  min-width: 150px;

  max-height: 300px;
  overflow: auto;

  button {
    text-align: left;
    padding: var(--spacing-half);
    max-width: 250px;

    &:not(:disabled):hover {
      color: var(--ui-accent);
      background-color: color-mix(in lab, currentColor, transparent 90%);
    }
  }
}
</style>
