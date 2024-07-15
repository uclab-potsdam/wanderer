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
    <span class="text measure-width">{{ text }}</span>
  </div>
</template>

<style scoped>
.entity {
  --tinted: color-mix(in lab, var(--graph-accent), var(--color-text) 60%);
  color: color-mix(in lab, var(--tinted), var(--color-background) 10%);
  /* color: color-mix(in lab, var(--graph-accent), var(--color-text) 40%); */
  max-width: 250px;
  padding: var(--spacing-half);
  width: max-content;
  font-size: var(--font-size-small);

  &.hide {
    opacity: 0.2;
    filter: var(--blur);

    &.user-active {
      filter: none;
      opacity: 1;
      color: color-mix(in lab, var(--tinted), var(--color-background) 50%);
    }
  }

  &.highlight {
    color: color-mix(in lab, var(--graph-accent), var(--color-text) 30%);

    span {
      --highlight-color: color-mix(in lab, var(--graph-accent), transparent 60%);
      padding: 0.1em 10px;
      margin: -0.1em -10px;
      border-radius: 10px 2.5px 7.5px 5.5px;
      box-decoration-break: clone;

      background: linear-gradient(
          100deg,
          color-mix(in lab, var(--highlight-color), transparent 99%) 5%,
          color-mix(in lab, var(--highlight-color), transparent 0%) 6.2%,
          color-mix(in lab, var(--highlight-color), transparent 50%) 7.8%,
          color-mix(in lab, var(--highlight-color), transparent 80%) 93%,
          color-mix(in lab, var(--highlight-color), transparent 40%) 96%,
          color-mix(in lab, var(--highlight-color), transparent 99%) 97%
        ),
        linear-gradient(
          195deg,
          color-mix(in lab, var(--highlight-color), transparent 99%) 0%,
          color-mix(in lab, var(--highlight-color), transparent 70%) 7.9%,
          color-mix(in lab, var(--highlight-color), transparent 99%) 50%
        );
    }
  }
  &.network {
    color: color-mix(in lab, var(--graph-accent), var(--color-text) 30%);
  }
}
</style>
