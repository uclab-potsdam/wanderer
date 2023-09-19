<script async setup>
import { zoom, zoomIdentity } from 'd3-zoom'
import { select } from 'd3-selection'
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useTerminusStore } from '@/stores/terminus'
import { useViewStore } from '@/stores/view'
import { useCanvasStore } from '@/stores/canvas'
import CanvasDocumentCard from './CanvasDocumentCard.vue'
import CanvasEdge from './CanvasEdge.vue'
import CanvasEdgeCouple from './CanvasEdgeCouple.vue'

import { MODE_VIEW, MODE_COMPOSE, MODE_COUPLE } from '@/assets/js/constants'
import SvgMarker from './svg/SvgMarker.vue'
import SvgPattern from './svg/SvgPattern.vue'
import CanvasEdgeDrawing from './CanvasEdgeDrawing.vue'

const containerRef = ref(null)
const container = ref(null)

const route = useRoute()
const terminusStore = useTerminusStore()
const viewStore = useViewStore()
const canvasStore = useCanvasStore()

// const transform = ref(zoomIdentity)
const zoomBehaviour = ref(null)

const scaleExtent = ref([0.1, 2])

const context = computed(() => `${route.name}/${route.params.id}`)
const mode = computed(() => viewStore.mode)

onMounted(async () => {
  // await terminusStore.getGraph(context.value, true)
  container.value = select(containerRef.value)
  zoomBehaviour.value = zoom()
    .scaleExtent(scaleExtent.value)
    .on('zoom', (e) => {
      canvasStore.transform = e.transform
    })
  // .filter((e) => {
  //   if (e.type === "touchstart" && e.touches?.length === 1) return false;
  //   if (e.type === "mousedown" && e.target.getAttribute("draggable"))
  //     return false;
  //   return !e.button && !(e.type === "wheel" && !e.ctrlKey && !e.shiftKey);
  // });
  container.value.call(zoomBehaviour.value) //.on("dblclick.zoom", null);
  zoomToFit()
})

function onDrop(e) {
  if (mode.value !== MODE_COMPOSE) return
  e.preventDefault()
  // console.log(e.dataTransfer.getData("text/uri-list"));
  const uri = e.dataTransfer.getData('text/uri-list').replace(location.origin, 'workbench:/')
  const isLocal = /workbench:\/\//.test(uri)
  if (!isLocal) return // todo: import and allocate external ressources
  const node = uri
    // .replace(new RegExp(`^${location.origin}/?`), "");
    .replace(new RegExp(`^workbench://`), '')

  terminusStore.updateAllocation(node, {
    x: (e.x - canvasStore.transform.x) / canvasStore.transform.k,
    y: (e.y - canvasStore.transform.y) / canvasStore.transform.k
  })
}

function onDragOver(e) {
  if (mode.value !== MODE_COMPOSE) return
  e.preventDefault()
}

function zoomToFit() {
  if (zoomBehaviour.value == null) return
  if (terminusStore.allocations.length < 1) return

  const xs = terminusStore.allocations.map(({ x }) => x)
  const ys = terminusStore.allocations.map(({ y }) => y)

  const padding = 150

  const minX = Math.min(...xs) - padding
  const maxX = Math.max(...xs) + padding
  const minY = Math.min(...ys) - padding
  const maxY = Math.max(...ys) + padding

  const diffX = maxX - minX
  const diffY = maxY - minY

  const x = minX + diffX / 2
  const y = minY + diffY / 2

  const scale = Math.min(innerWidth / diffX, innerHeight / diffY, 1)
  container.value.call(
    zoomBehaviour.value.transform,
    zoomIdentity
      .translate(innerWidth / 2, innerHeight / 2)
      .scale(scale)
      .translate(-x, -y)
  )
}

watch(
  () => route,
  async () => {
    await terminusStore.getGraph(context.value, true)
    zoomToFit()
  },
  { immediate: true, deep: true }
)
</script>

<template>
  <div
    class="container"
    v-resize="(s) => (size = s)"
    ref="containerRef"
    @drop="onDrop"
    @dragover="onDragOver"
  >
    <svg width="100%" height="100%">
      <SvgMarker />
      <SvgPattern v-if="mode === MODE_COMPOSE" :transform="canvasStore.transform" />
      <g :transform="canvasStore.transform">
        <g class="edges">
          <CanvasEdgeDrawing v-if="mode === MODE_COMPOSE" />
          <!-- <CanvasEdge v-if="composeStore.drawingEdge" :edge="composeStore.drawingEdge" /> -->
          <CanvasEdge
            v-for="(edge, i) in terminusStore.edges"
            :interactive="mode === MODE_COMPOSE"
            :key="edge.edge?.['@id'] || i"
            :edge="edge"
          />
        </g>
      </g>
    </svg>
    <div
      class="nodes"
      :style="{
        transform: `translate(${canvasStore.transform.x}px, ${canvasStore.transform.y}px) scale(${canvasStore.transform.k})`
      }"
    >
      <!-- <template v-if="mode === MODE_COMPOSE"> -->
      <CanvasDocumentCard
        v-for="allocation in terminusStore.allocations"
        :key="allocation.node['@id']"
        :allocation="allocation"
        :transform="canvasStore.transform"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.container {
  position: absolute;
  overflow: hidden;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;

  svg {
    position: absolute;
    display: block;
    isolation: isolate;

    foreignObject {
      overflow: visible;
    }
  }
  .nodes {
    position: absolute;
    > * {
      position: absolute;
    }
  }
}
</style>
