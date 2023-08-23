<script async setup>
import { zoom, zoomIdentity } from 'd3-zoom'
import { select } from 'd3-selection'
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useTerminusStore } from '@/stores/terminus'
import { useViewStore } from '@/stores/view'
import CanvasDocumentCard from './CanvasDocumentCard.vue'
import CanvasDocumentCardStatic from './CanvasDocumentCardStatic.vue'
import CanvasDocumentCardCouple from './CanvasDocumentCardCouple.vue'
import CanvasDocumentCardScreen from './CanvasDocumentCardScreen.vue'
import CanvasEdge from './CanvasEdge.vue'
import CanvasEdgeCouple from './CanvasEdgeCouple.vue'

import { MODE_VIEW, MODE_COMPOSE, MODE_COUPLE } from '@/assets/js/constants'

const containerRef = ref(null)
const container = ref(null)

const route = useRoute()
const terminusStore = useTerminusStore()
const viewStore = useViewStore()

const transform = ref(zoomIdentity)
const zoomBehaviour = ref(null)

const connecting = ref(false)
const connectingLine = ref(null)
const connectable = ref(null)

const pattern = computed(() => {
  const scale = transform.value.k
  return {
    width: 125 * scale,
    height: 125 * scale,
    x: transform.value.x,
    y: transform.value.y
  }
})

const scaleExtent = ref([0.1, 2])

const context = computed(() => `${route.name}/${route.params.id}`)
const mode = computed(() => viewStore.mode)

// terminusStore.getGraph(context.value)

// watch(
//   () => route.params,
//   () => terminusStore.getGraph(context.value, true)
// )

onMounted(async () => {
  await terminusStore.getGraph(context.value, true)
  container.value = select(containerRef.value)
  zoomBehaviour.value = zoom()
    .scaleExtent(scaleExtent.value)
    .on('zoom', (e) => {
      transform.value = e.transform
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

  terminusStore.addAllocation(node, context.value, {
    x: (e.x - transform.value.x) / transform.value.k,
    y: (e.y - transform.value.y) / transform.value.k
  })
}

function onUpdatePosition(allocation, position) {
  if (mode.value !== MODE_COMPOSE) return
  terminusStore.addAllocation(allocation, context.value, position)
}

function onConnectStart(allocation) {
  if (mode.value !== MODE_COMPOSE) return
  connecting.value = true
  terminusStore.pushBackAllocation(allocation)
}

function onConnect(allocation, position) {
  if (mode.value !== MODE_COMPOSE) return
  connectingLine.value = {
    active: true,
    source: { x: allocation.x, y: allocation.y },
    target: { x: allocation.x + position.x, y: allocation.y + position.y }
  }
}

function onConnectEnd(allocation) {
  if (mode.value !== MODE_COMPOSE) return
  connecting.value = false
  connectingLine.value = null
  if (connectable.value == null) return
  terminusStore.addEdge(allocation.node['@id'], connectable.value.node['@id'])
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
      <defs>
        <pattern id="bg" v-bind="pattern" patternUnits="userSpaceOnUse">
          <circle class="point" r="0.75" :transform="`translate(1 ${pattern.height / 2 + 1})`" />
          <circle class="point" r="0.75" :transform="`translate(${pattern.width / 2 + 1} 1)`" />
        </pattern>
        <marker id="arrow" markerWidth="15" markerHeight="10" refX="7" refY="5" orient="auto">
          <path d="M2,1 L7,5 L2,9" fill="none" />
        </marker>
        <marker id="arrow-muted" markerWidth="15" markerHeight="10" refX="7" refY="5" orient="auto">
          <path d="M2,1 L7,5 L2,9" fill="none" />
        </marker>
        <marker
          id="arrow-accent"
          markerWidth="15"
          markerHeight="10"
          refX="7"
          refY="5"
          orient="auto"
        >
          <path d="M2,1 L7,5 L2,9" fill="none" />
        </marker>
        <marker
          id="arrow-flipped"
          markerWidth="15"
          markerHeight="10"
          refX="8"
          refY="5"
          orient="auto"
        >
          <path d="M13,1 L8,5 L13,9" fill="none" />
        </marker>
        <marker
          id="arrow-muted-flipped"
          markerWidth="15"
          markerHeight="10"
          refX="8"
          refY="5"
          orient="auto"
        >
          <path d="M13,1 L8,5 L13,9" fill="none" />
        </marker>
        <marker
          id="arrow-accent-flipped"
          markerWidth="15"
          markerHeight="10"
          refX="8"
          refY="5"
          orient="auto"
        >
          <path d="M13,1 L8,5 L13,9" fill="none" />
        </marker>
      </defs>
      <rect v-if="mode === MODE_COMPOSE" x="0" y="0" width="100%" height="100%" fill="url(#bg)" />
      <g :transform="transform">
        <g class="edges">
          <CanvasEdge v-if="connectingLine" :edge="connectingLine" />
          <template v-if="mode !== MODE_COUPLE && mode !== MODE_VIEW">
            <CanvasEdge
              v-for="(edge, i) in terminusStore.edges"
              :interactive="mode === MODE_COMPOSE"
              :key="edge.edge?.['@id'] || i"
              :edge="edge"
            />
          </template>
          <template v-else>
            <CanvasEdgeCouple
              v-for="(edge, i) in terminusStore.edges"
              :mode="mode"
              :key="edge.edge?.['@id'] || i"
              :edge="edge"
            />
          </template>
        </g>
        <g class="nodes">
          <template v-if="mode === MODE_COMPOSE">
            <CanvasDocumentCard
              v-for="allocation in terminusStore.allocations"
              :key="allocation.node['@id']"
              :allocation="allocation"
              :transform="transform"
              @update-position="($event) => onUpdatePosition(allocation.node['@id'], $event)"
              :connecting-to="connecting"
              @connect-start="onConnectStart(allocation)"
              @connect="onConnect(allocation, $event)"
              @connect-end="onConnectEnd(allocation)"
              @mouse-enter="connectable = allocation"
              @mouse-out="connectable = null"
            />
          </template>
          <template v-else-if="mode === MODE_COUPLE">
            <CanvasDocumentCardCouple
              v-for="allocation in terminusStore.allocations"
              :key="allocation.node['@id']"
              :allocation="allocation"
            />
          </template>
          <template v-else-if="mode === MODE_VIEW">
            <CanvasDocumentCardScreen
              v-for="allocation in terminusStore.allocations"
              :key="allocation.node['@id']"
              :allocation="allocation"
            />
          </template>
          <template v-else>
            <CanvasDocumentCardStatic
              v-for="allocation in terminusStore.allocations"
              :key="allocation.node['@id']"
              :allocation="allocation"
            />
          </template>
        </g>
      </g>
    </svg>
  </div>
</template>

<style lang="scss" scoped>
.container {
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;

  svg {
    display: block;
    isolation: isolate;

    foreignObject {
      overflow: visible;
    }

    pattern {
      circle {
        fill: var(--primary);
      }
    }

    #arrow,
    #arrow-flipped {
      path {
        stroke: var(--flow-edge);
      }
    }
    #arrow-muted,
    #arrow-muted-flipped {
      path {
        stroke: var(--flow-edge);
      }
    }
    #arrow-accent,
    #arrow-accent-flipped {
      path {
        stroke: var(--ui-accent-dark);
      }
    }
  }
}
</style>
