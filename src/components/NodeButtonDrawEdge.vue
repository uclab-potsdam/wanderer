<script setup>
import { computed } from 'vue'
import IconArrow from '~icons/default/Arrow'
import { useComposeStore } from '@/stores/compose'
const composeStore = useComposeStore()
const props = defineProps(['allocation'])

const drawing = computed(() => props.allocation.node['@id'] === composeStore.sourceNode)
const transform = computed(() =>
  drawing.value
    ? `translate(${composeStore.arrow.x}px, ${composeStore.arrow.y}px) rotate(${composeStore.arrow.r}deg)`
    : `translate(0, 0)`
)

function drawEdge(e) {
  e.stopPropagation()
  composeStore.drawEdge(props.allocation.node['@id'], {
    x: props.allocation.x,
    y: props.allocation.y
  })
}
</script>
<template>
  <IconArrow
    :style="{
      transform
    }"
    :class="{ drawing }"
    @mousedown="drawEdge"
  />
</template>
<style lang="scss" scoped></style>
