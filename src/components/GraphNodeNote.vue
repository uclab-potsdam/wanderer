<script setup>
import { useHelperStore } from '@/stores/helper'
import { computed, ref } from 'vue'

const props = defineProps({ node: Object, occurances: Array })

const helperStore = useHelperStore()

const el = ref(null)

const text = computed(() => helperStore.localize(props.node.text))
const color = computed(() => {
  if (props.occurances.length !== 1 || props.occurances[0].color == null) return
  return { '--graph-accent': `var(--${props.occurances[0].color})` }
})

defineExpose({ el })
</script>

<template>
  <div class="entity" ref="el" :style="color">
    <div class="wrap">
      <span class="text measure-width">{{ text }}</span>
    </div>
  </div>
</template>

<style scoped>
.entity {
  color: color-mix(in lab, var(--graph-accent), var(--color-text) 40%);
  max-width: 250px;
  padding: calc(var(--spacing) * 0.5);
  width: max-content;
  text-wrap: balance;
  hyphens: auto;

  font-size: 14px;
  font-style: oblique 8deg;

  &.highlight {
    color: var(--graph-accent);
  }
  .wrap {
    border: 1px dashed color-mix(in lab, var(--graph-accent), var(--color-background) 70%);
    padding: calc(var(--spacing) * 0.5);
    border-radius: calc(var(--spacing) * 0.25);
  }
}
</style>
