<script async setup>
import { zoom, zoomIdentity } from 'd3-zoom'
import { select } from 'd3-selection'
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTerminusStore } from '@/stores/terminus'
import { useViewStore } from '@/stores/view'
import { useCanvasStore } from '@/stores/canvas'
import { useSyncStore } from '@/stores/sync'
import CanvasDocumentCard from './CanvasDocumentCard.vue'
import CanvasEdge from './CanvasEdge.vue'

import { MODE_COMPOSE, MODE_COUPLE, MODE_VIEW } from '@/assets/js/constants'
import SvgPattern from './svg/SvgPattern.vue'
import CanvasEdgeDrawing from './CanvasEdgeDrawing.vue'

const containerRef = ref(null)
const container = ref(null)

const route = useRoute()
const router = useRouter()
const terminusStore = useTerminusStore()
const viewStore = useViewStore()
const canvasStore = useCanvasStore()
const syncStore = useSyncStore()

const zoomBehaviour = ref(null)

const scaleExtent = ref([0.1, 2])

const context = computed(() => `${route.name}/${route.params.id}`)
const mode = computed(() => viewStore.mode)

const bounds = computed(() => {
  const bounds =
    mode.value === MODE_COUPLE ? syncStore.atMarker?.bounds || canvasStore.bounds : syncStore.currentBounds?.bounds
  if (bounds == null) return
  return {
    x1: bounds.x1 + terminusStore.offset.x,
    x2: bounds.x2 + terminusStore.offset.x,
    y1: bounds.y1 + terminusStore.offset.y,
    y2: bounds.y2 + terminusStore.offset.y
  }
})

watch(
  () => syncStore.next,
  () => {
    if (viewStore.mode !== MODE_VIEW || terminusStore.graphDoc.next == null) return
    router.push(`/${terminusStore.graphDoc.next}`)
  }
)

watch(
  () => viewStore.inactivityMid,
  (inactive) => {
    if (viewStore.mode !== MODE_VIEW) return
    if (inactive && route.name === 'graph' && bounds.value != null) {
      return zoomToBounds()
    }
  }
)

watch(
  () => viewStore.inactivityLong,
  (inactive) => {
    if (viewStore.mode !== MODE_VIEW) return
    if (inactive && route.name === 'entity' && terminusStore.graph != null) {
      return router.push(`/${terminusStore.graph}`)
    }
  }
)

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
  // zoomToFit(true)
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

function zoomToFit(skipTransition = false) {
  if (zoomBehaviour.value == null) return
  if (terminusStore.allocations.length < 1) return
  if (bounds.value != null) return
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
  container.value
    .transition()
    .duration(skipTransition ? 0 : 2000)
    .call(
      zoomBehaviour.value.transform,
      zoomIdentity
        .translate(innerWidth / 2, innerHeight / 2)
        .scale(scale)
        .translate(-x, -y)
    )
    .on('end', () => zoomBehaviour.value.filter(() => true))
}

function zoomToFitNetwork(skipTransition = false) {
  if (zoomBehaviour.value == null) return
  if (terminusStore.allocations.length < 1) return
  const xs = terminusStore.allocations.map(({ x }) => x)
  const ys = terminusStore.allocations.map(({ y }) => y)

  const center = terminusStore.allocations.find(({ node }) => node['@id'] === context.value)
  const padding = 150

  const x = center.x
  const y = center.y

  const minX = Math.min(...xs) - padding
  const maxX = Math.max(...xs) + padding
  const minY = Math.min(...ys) - padding
  const maxY = Math.max(...ys) + padding

  const diffX = Math.max(x - minX, maxX - x)
  const diffY = Math.max(y - minY, maxY - y)

  const scale = Math.min(innerWidth / (diffX * 2), innerHeight / (diffY * 2), 1)
  container.value
    .transition()
    .duration(skipTransition ? 0 : 2000)
    .call(
      zoomBehaviour.value.transform,
      zoomIdentity
        .translate(innerWidth / 2, innerHeight / 2)
        .scale(scale)
        .translate(-x, -y)
    )
}

function zoomToBounds() {
  const scaleX = innerWidth / (bounds.value.x2 - bounds.value.x1)
  const scaleY = innerHeight / (bounds.value.y2 - bounds.value.y1)
  const scale = Math.min(scaleX, scaleY)

  const width = innerWidth / scale
  const height = innerHeight / scale
  const x = -bounds.value.x1 + width / 2 - (bounds.value.x2 - bounds.value.x1) / 2
  const y = -bounds.value.y1 + height / 2 - (bounds.value.y2 - bounds.value.y1) / 2

  container.value
    .transition()
    .duration(2000)
    .call(zoomBehaviour.value.transform, zoomIdentity.scale(scale).translate(x, y))
}

watch(
  () => route,
  async () => {
    if (route.name === 'graph') {
      await terminusStore.getGraph(context.value, true)
      zoomToFit()
    } else if (route.name === 'entity') {
      await terminusStore.getNetwork(context.value, true)
      zoomBehaviour.value.filter(() => false)
      zoomToFitNetwork()
    }
  },
  { immediate: true, deep: true }
)

watch(bounds, (newBounds, oldBounds) => {
  if (
    mode.value !== MODE_VIEW ||
    route.name === 'entity' ||
    newBounds == null ||
    !viewStore.inactivityMid ||
    (oldBounds != null &&
      newBounds.x1 === oldBounds.x1 &&
      newBounds.x2 === oldBounds.x2 &&
      newBounds.y1 === oldBounds.y1 &&
      newBounds.y2 === oldBounds.y2)
  )
    return

  zoomToBounds()
})

const accent = computed(() => {
  if (route.name !== 'graph' || !terminusStore.graphDoc.color) return
  return {
    '--accent': `rgb(var(--${terminusStore.graphDoc.color}-5))`,
    '--edge-color': `rgb(var(--${terminusStore.graphDoc.color}-5))`
  }
})
</script>

<template>
  <div
    class="container"
    v-resize="(s) => (size = s)"
    ref="containerRef"
    @drop="onDrop"
    @dragover="onDragOver"
    :style="accent"
  >
    <svg width="100%" height="100%">
      <SvgPattern v-if="mode === MODE_COMPOSE" :transform="canvasStore.transform" />
      <g
        :transform="`translate(${canvasStore.transform.x}, ${canvasStore.transform.y}) scale(${canvasStore.transform.k})`"
      >
        <g class="edges">
          <CanvasEdgeDrawing v-if="mode === MODE_COMPOSE" />
          <!-- <CanvasEdge v-if="composeStore.drawingEdge" :edge="composeStore.drawingEdge" /> -->
          <TransitionGroup name="edges">
            <CanvasEdge
              v-for="edge in terminusStore.edges"
              :key="edge['@id']"
              :interactive="mode === MODE_COMPOSE"
              :id="edge['@id']"
              :edge="edge"
            />
          </TransitionGroup>
        </g>
        <polygon
          class="bounds"
          v-if="mode === MODE_COUPLE && bounds"
          :points="`${bounds.x1},${bounds.y1} ${bounds.x2},${bounds.y1} ${bounds.x2},${bounds.y2} ${bounds.x1},${bounds.y2}`"
        />
      </g>
    </svg>
    <div
      class="nodes"
      :style="{
        transform: `translate(${canvasStore.transform.x}px, ${canvasStore.transform.y}px) scale(${canvasStore.transform.k})`
      }"
    >
      <TransitionGroup name="nodes">
        <div v-for="allocation in terminusStore.allocations" :key="allocation.node['@id']">
          <CanvasDocumentCard :allocation="allocation" :transform="canvasStore.transform" />
        </div>
      </TransitionGroup>
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

  --background-color: color-mix(in lab, var(--accent), var(--background-base) var(--background-base-opacity));
  background: var(--background-color);
  transition: background var(--transition-extended);

  svg {
    position: absolute;
    display: block;
    isolation: isolate;

    .bounds {
      pointer-events: none;
      stroke: var(--ui-accent);
      fill: none;
      vector-effect: non-scaling-stroke;
      stroke-dasharray: 5 5;
    }
  }
  .nodes {
    position: absolute;
    > * {
      position: absolute;
    }
  }

  .nodes-enter-active,
  .nodes-leave-active {
    // transition: opacity 0.5s ease;
  }

  .nodes-enter-active {
    transition: opacity var(--transition-extended-half) var(--transition-extended-half);
  }
  .nodes-leave-active {
    transition: opacity var(--transition-extended-half);
  }

  .edges-enter-active {
    transition: opacity var(--transition-extended) var(--transition-extended-half);
  }
  .edges-leave-active {
    transition: opacity var(--transition-extended-half);
  }

  .edges-enter-from,
  .nodes-enter-from,
  .edges-leave-to,
  .nodes-leave-to {
    opacity: 0;
  }
}
</style>
