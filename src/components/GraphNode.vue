<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'

import { useRouter } from 'vue-router'
import { useDataStore } from '@/stores/data'
import { useLayoutStore } from '@/stores/layout'

const props = defineProps({
  id: String,
  position: Object
})

const router = useRouter()
const dataStore = useDataStore()
const layoutStore = useLayoutStore()

const nodeElement = ref(null)

const node = computed(() => dataStore.data.nodes[props.id])
const positioning = computed(() => ({
  left: `${props.position.x}px`,
  top: `${props.position.y}px`
}))

const resizeObserver = new ResizeObserver((entries) => {
  for (const entry of entries) {
    if (entry.contentRect) {
      layoutStore.nodes[props.id] = {
        width: entry.contentRect.width,
        height: entry.contentRect.height,
        x: props.position.x,
        y: props.position.y
      }
    }
  }
})

watch(
  () => [props.position.y, props.position.x],
  () => {
    layoutStore.nodes[props.id] = {
      ...layoutStore.nodes[props.id],
      x: props.position.x,
      y: props.position.y
    }
  }
)

onMounted(() => {
  resizeObserver.observe(nodeElement.value)
})

onBeforeUnmount(() => {
  if (nodeElement.value != null) resizeObserver.unobserve(nodeElement.value)
  delete layoutStore.nodes[props.id]
})
</script>

<template>
  <div
    @click="router.push({ name: 'graph', params: { type: node.type, id } })"
    ref="nodeElement"
    class="node"
    :style="positioning"
  >
    {{ node?.text?.en || 'untitled' }}
  </div>
</template>

<style scoped>
.node {
  position: absolute;
  transform: translate(-50%, -50%);
}
</style>
