<script setup>
import { computed } from 'vue'
const props = defineProps(['transform'])

const pattern = computed(() => {
  const scale = props.transform.k
  return {
    width: 125 * scale,
    height: 125 * scale,
    x: props.transform.x,
    y: props.transform.y
  }
})
</script>

<template>
  <defs>
    <pattern id="bg" v-bind="pattern" patternUnits="userSpaceOnUse">
      <circle class="point" r="0.75" :transform="`translate(1 ${pattern.height / 2 + 1})`" />
      <circle class="point" r="0.75" :transform="`translate(${pattern.width / 2 + 1} 1)`" />
    </pattern>
  </defs>
  <rect x="0" y="0" width="100%" height="100%" fill="url(#bg)" />
</template>
<style lang="scss" scoped>
pattern {
  circle {
    fill: var(--primary);
  }
}
</style>
