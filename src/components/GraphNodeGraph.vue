<script setup>
import { computed, ref } from 'vue'
import { useHelperStore } from '@/stores/helper'

const props = defineProps({
  node: Object
})

const helperStore = useHelperStore()

const textElement = ref(null)

const el = ref(null)

const text = computed(() => helperStore.localize(props.node.text))
const image = computed(() => `url("${helperStore.getMediaUrl(props.node.image)}")`)
const color = computed(() => {
  return { '--graph-accent': `var(--${props.node.color})` }
})

defineExpose({
  el
})
</script>

<template>
  <div class="entity" ref="el" :style="{ 'background-image': image, ...color }">
    <div class="text" ref="textElement">{{ text }}</div>
  </div>
</template>

<style scoped>
.entity {
  width: 250px;
  height: 150px;
  border: 1px solid var(--graph-accent);
  border-radius: calc(var(--spacing) * 0.25);
  z-index: -1;

  background-size: cover;
  background-position: center center;

  display: flex;
  flex-direction: column;
  justify-content: flex-end;

  .text {
    font-weight: 900;
    padding: calc(var(--spacing) * 0.5);
    color: white;
    background-color: color-mix(in lab, var(--graph-accent), transparent 30%);
  }
}
</style>
