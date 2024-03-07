<script setup>
import { computed, ref } from 'vue'
import { useHelperStore } from '@/stores/helper'

const props = defineProps({
  node: Object
})

const helperStore = useHelperStore()

const el = ref(null)

const url = computed(() => helperStore.getMediaUrl(props.node.file))

defineExpose({
  el
})
</script>

<template>
  <img ref="el" class="image" :srcset="`${url} 2x`" />
</template>

<style scoped>
.image {
  z-index: -2;
}
</style>
