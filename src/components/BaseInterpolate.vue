<script setup>
import { ref, watch } from 'vue'
import { interpolate } from 'd3-interpolate'
import BezierEasing from 'bezier-easing'
import isEqual from 'lodash.isequal'
import { transition } from '@/assets/js/style'

const initial = defineProps({
  props: Object,
  duration: { type: Number, default: transition },
  delay: { type: Number, default: 0 }
})
const props = ref(initial.props)
let start = null

const ease = BezierEasing(0.25, 0.1, 0.25, 1)

let interpolation = interpolate(null, initial.props)

watch(
  () => initial.props,
  (newProps, oldProps) => {
    if (isEqual(newProps, oldProps)) return
    interpolation = interpolate(props.value, initial.props, newProps)
    start = null
    requestAnimationFrame(tick)
  },
  { deep: false }
)

function tick(t) {
  if (start === null) start = t
  const delta = Math.max(Math.min((t - start - initial.delay) / initial.duration, 1), 0)
  props.value = { ...interpolation(ease(delta)) }
  if (delta < 1) requestAnimationFrame(tick)
}
</script>

<template>
  <slot v-bind="props" />
</template>
