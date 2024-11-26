<script setup>
import { useDataStore } from '@/stores/data'
import { computed, onMounted, ref } from 'vue'
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
const input = ref(null)

const nodes = computed(() => {
  const nodes = dataStore.nodes.filter((n) => n.type === props.context.nodeType)
  if (label.value.length === 0) return nodes
  const results = nodes
    .filter((node) => {
      return new RegExp(`^${label.value}`, 'i').test(helperStore.localize(node.label))
    })
    .sort((a, b) =>
      helperStore.localize(a.label).toLowerCase() < helperStore.localize(b.label).toLowerCase()
        ? -1
        : 1
    )

  if (label.value.length >= 3) {
    results.push(
      ...nodes
        .map((node) => {
          const s1 = label.value.toLowerCase()
          const s2 = helperStore.localize(node.label).toLowerCase()
          return {
            distance: distance(s1, s2) / Math.max(s1.length, s2.length),
            node
          }
        })
        .filter(({ distance }) => distance < 0.5)
        .sort((a, b) => a.distance - b.distance)
    )
  }

  results.filter((r, i, results) => results.findIndex(({ id }) => r.id === id) <= i)
  return results
})

onMounted(() => {
  input.value.focus()
})

function createNode() {
  const id = dataStore.createNode({
    type: props.context.nodeType,
    label: { [settingsStore.lang]: label.value }
  })
  emit('select-item', id)
}
</script>

<template>
  <!-- <div> -->
  <ListWrapper class="context-menu-search">
    <input :placeholder="context.nodeType" @click.stop v-model="label" ref="input" />
    <button :disabled="label === ''" @click="createNode">add {{ label }}</button>
    <button v-for="(node, i) in nodes" :key="i" @click="emit('select-item', node.id)">
      <LocalizeText :text="node.label" />
    </button>
  </ListWrapper>
  <!-- </div> -->
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
  /* max-width: 250px; */
  overflow: auto;

  input {
    font-size: inherit;
    padding: var(--spacing-half);
    max-width: 250px;
  }

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
