<script setup>
import { ref, watch } from 'vue'
import { interpolate } from 'd3-interpolate'
import { easeQuad } from 'd3-ease'
import isEqual from 'lodash.isequal'
const initial = defineProps({
  props: Object,
  duration: { type: Number, default: 500 },
  delay: { type: Number, default: 0 }
})
const props = ref(initial.props)
let start = null

let interpolation = interpolate(null, initial.props)

watch(
  () => initial.props,
  (newProps, oldProps) => {
    if (isEqual(newProps, oldProps)) return
    interpolation = interpolate(props.value, newProps)
    start = null
    requestAnimationFrame(tick)
  },
  { deep: false }
)

function tick(t) {
  if (start === null) start = t
  const delta = Math.max(Math.min((t - start - initial.delay) / initial.duration, 1), 0)
  props.value = { ...interpolation(easeQuad(delta)) }
  if (delta < 1) requestAnimationFrame(tick)
}
</script>

<template>
  <slot v-bind="props" />
</template>
