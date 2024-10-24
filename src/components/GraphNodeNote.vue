<script setup>
import { useHelperStore } from '@/stores/helper'
import { computed, onMounted, ref } from 'vue'
import { getContentWidth } from '@/assets/js/utils'

const props = defineProps({ node: Object, occurances: Array })

const helperStore = useHelperStore()

const el = ref(null)
const width = ref(null)

const text = computed(() => helperStore.localize(props.node.text))
const color = computed(() => {
  if (props.occurances.length !== 1 || props.occurances[0].color == null) return
  return { '--graph-accent': `var(--${props.occurances[0].color})` }
})

onMounted(() => {
  width.value = getContentWidth(el)
})

defineExpose({ el })
</script>

<template>
  <div class="note" ref="el" :style="{ ...color, width }">
    <!-- <span class="text measure-width">{{ text }}</span> -->
  </div>
</template>

<style scoped>
/* .note {
  pointer-events: none;
  &.edit {
    pointer-events: initial;
  }
  box-sizing: content-box;
  color: color-mix(in lab, var(--graph-accent), var(--color-text) 40%);
  max-width: 250px;
  padding: var(--spacing-half);
  width: max-content;
  text-wrap: balance;
  hyphens: auto;

  border: 1px dashed color-mix(in lab, var(--graph-accent), var(--color-background) 70%);
  border-radius: var(--spacing-quart);

  font-size: 14px;
  font-style: oblique 8deg;

  &.highlight {
    color: var(--graph-accent);
  }
  .wrap {
    border: 1px dashed color-mix(in lab, var(--graph-accent), var(--color-background) 70%);
    padding: var(--spacing-half);
    border-radius: var(--spacing-quart);
  } 
} */
</style>
