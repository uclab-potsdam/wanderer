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

defineExpose({
  el
})
</script>

<template>
  <div class="entity" ref="el" :style="{ 'background-image': image }">
    <span class="text measure-width" ref="textElement">{{ text }}</span>
  </div>
</template>

<style scoped>
.entity {
  width: 250px;
  height: 150px;
  border: 1px solid;
  padding: calc(var(--spacing) * 0.5);
  border-radius: calc(var(--spacing) * 0.25);

  background-size: cover;
  background-position: center center;
  .text {
    font-weight: 900;
  }
}
</style>
