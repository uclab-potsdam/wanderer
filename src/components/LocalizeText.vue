<script setup>
import { useHelperStore } from '@/stores/helper'
import { computed } from 'vue'

const helperStore = useHelperStore()

const props = defineProps({
  text: {
    type: [String, Object, Array],
    default: null
  },
  separator: {
    type: String,
    default: '; '
  },
  strict: {
    type: Boolean,
    default: false
  }
})

const displayText = computed(() => transform(props.text))

function transform(d) {
  if (typeof d === 'string') return d
  if (d === null) return
  if (Array.isArray(d)) return d.map((d) => transform(d)).join(props.separator)
  if (typeof d === 'object') return helperStore.localize(d, props.strict)
}
</script>

<template>
  {{ displayText }}
</template>
