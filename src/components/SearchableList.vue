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
  },
  none: {
    type: Boolean,
    default: false
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
          const s2 = helperStore.localize(node.label)?.toLowerCase()
          if (s2 == null) return { distance: 1, node }
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
    <div>
      <input :placeholder="`${context.nodeType} label`" @click.stop v-model="label" ref="input" />
      <button class="create" :disabled="label === ''" @click="createNode">
        create «{{ label || '…' }}»
      </button>
      <button v-if="none" class="none" @click="emit('select-item', null)">–</button>
      <button v-for="(node, i) in nodes" :key="i" @click="emit('select-item', node.id)">
        <LocalizeText :text="node.label" />
      </button>
    </div>
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
  min-width: 255px;

  /* max-height: 300px; */
  /* max-width: 250px; */
  overflow: auto;

  > div {
    display: flex;
    flex-direction: column;
    max-height: 300px;
    overflow: auto;
    gap: calc(var(--spacing-quart) / 2);
  }

  input {
    font-size: inherit;
    padding: var(--spacing-half);
    max-width: 250px;
    border: none;
    background: color-mix(in hsl, var(--ui-accent), transparent 80%);
    outline: 1px solid var(--ui-accent);
    outline-offset: -1px;
    border-radius: var(--border-radius-small);

    &:focus {
      outline-offset: -2.5px;
      outline: 2.5px solid var(--ui-accent);
    }
  }

  button {
    text-align: left;
    padding: var(--spacing-half);
    max-width: 250px;
    border-radius: var(--border-radius-small);

    &:not(:disabled):hover {
      color: var(--ui-accent);
      background-color: color-mix(in lab, currentColor, transparent 90%);
    }

    &.create {
      background-color: color-mix(in lab, var(--ui-accent), transparent 70%);
    }
  }
}
</style>
