<script setup>
import { computed, ref } from 'vue'
import { useHelperStore } from '@/stores/helper'

const props = defineProps({
  node: Object
})

const helperStore = useHelperStore()

const el = ref(null)

const text = computed(() => helperStore.localize(props.node.text))
const className = computed(() => helperStore.localize(props.node.class))

defineExpose({
  el
})
</script>

<template>
  <div class="entity" ref="el">
    <span class="text measure-width">{{ text }}</span>
    <span class="class measure-width" v-if="className != null"><br />{{ className }}</span>
  </div>
</template>

<style scoped>
.entity {
  max-width: 250px;
  padding: calc(var(--spacing) * 0.5);
  color: color-mix(in lab, var(--graph-accent), var(--color-text) 60%);

  &.highlight {
    color: color-mix(in lab, var(--graph-accent), var(--color-text) 10%);

    /* span {
      --highlight-color: var(--graph-accent);

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
    } */
  }
  width: max-content;
  .text {
    font-weight: 900;
  }
}
</style>
