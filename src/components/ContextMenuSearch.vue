<script setup>
import { useDataStore } from '@/stores/data'
import { computed, ref } from 'vue'
import LocalizeText from './LocalizeText.vue'
import { useContextMenuStore } from '@/stores/contextMenu'
import { useLayoutStore } from '@/stores/layout'
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
const dataStore = useDataStore()
const contextMenuStore = useContextMenuStore()
const layoutStore = useLayoutStore()
const settingsStore = useSettingsStore()
const helperStore = useHelperStore()
const label = ref('')

const nodes = computed(() => {
  const nodes = dataStore.nodes.filter((n) => n.type === props.context.nodeType)
  if (label.value.length === 0) return nodes
  if (label.value.length < 3)
    return nodes
      .filter((node) => {
        return new RegExp(`^${label.value}`).test(helperStore.localize(node.text))
      })
      .sort((a, b) => (helperStore.localize(a.text) < helperStore.localize(b.text) ? -1 : 1))
  // .map(({ node, distance }) => ({ ...node, distance }))
  return nodes
    .map((node) => {
      const s1 = label.value
      const s2 = helperStore.localize(node.text)
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
    text: { [settingsStore.lang]: label.value }
  }
  dataStore.data.nodes[uuid] = node
  dataStore.data.nodes[dataStore.nodeId].allocations[uuid] = {
    x: (contextMenuStore.offset.x - layoutStore.transform.x) / layoutStore.transform.k,
    y: (contextMenuStore.offset.y - layoutStore.transform.y) / layoutStore.transform.k
  }
}

function addNode(id) {
  dataStore.data.nodes[dataStore.nodeId].allocations[id] = {
    x: (contextMenuStore.offset.x - layoutStore.transform.x) / layoutStore.transform.k,
    y: (contextMenuStore.offset.y - layoutStore.transform.y) / layoutStore.transform.k
  }
}
</script>

<template>
  <ListWrapper class="context-menu-search">
    <input placeholder="search" @click.stop v-model="label" />
    <button :disabled="label === ''" @click="createNode">add {{ label }}</button>
    <button v-for="(node, i) in nodes" :key="i" @click="addNode(node.id)">
      <LocalizeText :text="node.text" />
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
  padding: var(--border-radius-half); */

  font-size: var(--font-size-small);
  min-width: 150px;

  max-height: 300px;
  overflow: auto;

  button {
    text-align: left;
    padding: var(--spacing-half);
    max-width: 250px;
  }
}
</style>
