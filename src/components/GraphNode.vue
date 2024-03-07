<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'

import { useRouter } from 'vue-router'
import { useDataStore } from '@/stores/data'
import { useLayoutStore } from '@/stores/layout'
import { useDisplayStore } from '@/stores/display'
import { useActivityStore } from '@/stores/activity'
// import { useConstantStore } from '@/stores/constant'

import { getComponentForType } from '@/assets/js/nodes'

// import {GraphNodeEntity} from '@/components/GraphNodeEntity.vue'

const props = defineProps({
  id: String,
  position: Object,
  transform: Object
})

const router = useRouter()
const dataStore = useDataStore()
const layoutStore = useLayoutStore()
const displayStore = useDisplayStore()
const activityStore = useActivityStore()
// const constantStore = useConstantStore()

const componentRef = ref(null)

const node = computed(() => dataStore.data.nodes[props.id])
const positioning = computed(() => ({
  left: `${props.position.x}px`,
  top: `${props.position.y}px`
  // transform: `translate(${props.position.x}px, ${props.position.y}px)`
}))

const component = computed(() => getComponentForType(node.value.type))

const nodeElement = computed(() => componentRef.value.el ?? componentRef.value.$el)

const display = computed(() => {
  if (!node.value.inheritDisplay) return displayStore.states[props.id]
  // fallback for depricated edges imported from terminus
  return displayStore.inheritStateFromNeighbor(props.id)
})

const resizeObserver = new ResizeObserver((entries) => {
  for (const entry of entries) {
    if (entry.contentRect) {
      const measuredWidth = Math
        .max
        // ...[...entry.target.querySelectorAll('.measure-width')].map(
        //   (d) => d.getBoundingClientRect().width / props.transform.k + constantStore.spacing
        // )
        ()
      layoutStore.nodes[props.id] = {
        width: measuredWidth > 0 ? measuredWidth : entry.contentRect.width,
        height: entry.contentRect.height,
        x:
          measuredWidth > 0
            ? props.position.x - entry.contentRect.width / 2 + measuredWidth / 2
            : props.position.x,
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
  <component
    :is="component"
    ref="componentRef"
    :id="id"
    class="node"
    :class="[display, { 'user-active': !activityStore.inactivityShort }]"
    :style="positioning"
    :node="node"
    @click="router.push({ name: 'graph', params: { type: node.type, id } })"
  />
</template>

<style scoped>
.node {
  position: absolute;
  transform: translate(-50%, -50%);
  transition:
    top var(--transition),
    left var(--transition);

  &.hide {
    opacity: 0;

    &.user-active {
      opacity: 0.6;
    }
  }
  &.highlight {
    color: red;
  }
}
</style>
