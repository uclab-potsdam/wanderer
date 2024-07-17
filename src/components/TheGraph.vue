<script setup>
import { computed, ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { zoom, zoomIdentity } from 'd3-zoom'
import { select } from 'd3-selection'
import { computeAllocations } from '@/assets/js/nodeAllocation'

import { useRoute, useRouter } from 'vue-router'
import { useDataStore } from '@/stores/data'
import { useConstantStore } from '@/stores/constant'
import { useDisplayStore } from '@/stores/display'
import { useActivityStore } from '@/stores/activity'
import { useVideoStore } from '@/stores/video'
import { useLayoutStore } from '@/stores/layout'
import { useSettingsStore } from '@/stores/settings'
import { useContextMenuStore } from '@/stores/contextMenu'
import { useEditStore } from '@/stores/edit'

import GraphNode from '@/components/GraphNode.vue'
import GraphEdge from '@/components/GraphEdge.vue'
import ContextMenuList from './ContextMenuList.vue'
import ContextMenuSearch from './ContextMenuSearch.vue'

import { shorten } from '@/assets/js/resolveUrl'

// import CursorAddEntity from '@/assets/icons/AddEntity.svg'

const route = useRoute()
const router = useRouter()
const dataStore = useDataStore()
const constantStore = useConstantStore()
const displayStore = useDisplayStore()
const activityStore = useActivityStore()
const videoStore = useVideoStore()
const layoutStore = useLayoutStore()
const settingsStore = useSettingsStore()
const contextMenuStore = useContextMenuStore()
const editStore = useEditStore()

const allocations = ref([])

const zoomElement = ref(null)
const zoomElementSelection = ref(null)
const zoomBehaviour = ref(null)
// const transform = ref({ x: 0, y: 0, k: 1 })

const id = computed(() => route.params.id)
const node = computed(() => dataStore.data.nodes[id.value])
const view = computed(() => (route.params.type === 'graph' ? 'diagram' : 'network'))

const transformString = computed(
  () =>
    `translate(${layoutStore.transform.x}px, ${layoutStore.transform.y}px) scale(${layoutStore.transform.k})`
)
const bounds = computed(() => {
  if (displayStore.bounds != null)
    // return displayStore.bounds
    return {
      x1: displayStore.bounds.x1 + layoutStore.offset.x,
      y1: displayStore.bounds.y1 + layoutStore.offset.y,
      x2: displayStore.bounds.x2 + layoutStore.offset.x,
      y2: displayStore.bounds.y2 + layoutStore.offset.y
    }
  const values = Object.values(allocations.value)
  const valuesX = values.map(({ x }) => x)
  const valuesY = values.map(({ y }) => y)

  const xOffset = 200
  const yOffset = 100

  return {
    x1: Math.min(...valuesX) - xOffset + layoutStore.offset.x,
    y1: Math.min(...valuesY) - yOffset + layoutStore.offset.y,
    x2: Math.max(...valuesX) + xOffset + layoutStore.offset.x,
    y2: Math.max(...valuesY) + yOffset + layoutStore.offset.y
  }
})
const edges = computed(() => {
  const nodes = Object.keys(allocations.value)
  return dataStore.data.edges.filter(
    (edge) =>
      nodes.includes(edge.nodes[0]) &&
      nodes.includes(edge.nodes[1]) &&
      (edge.graph === id.value || node.value.type !== 'graph')
  )
})

const allocationOrder = computed(() => Object.keys(allocations.value).sort())
const cssProps = computed(() => {
  if (node.value.color == null) return
  return {
    '--graph-accent': `var(--${node.value.color})`
    // cursor: `url("${CursorAddEntity}"), auto`
  }
})
watch(node, () => initGraph(constantStore.transition))

watch(bounds, () => {
  if (!activityStore.inactivityShort) return
  zoomToBounds(bounds.value, constantStore.transition)
})

watch(
  () => activityStore.inactivityShort,
  () => {
    if (!videoStore.playing) return
    zoomToBounds(bounds.value, constantStore.transition)
  }
)

watch(
  () => activityStore.inactivityLong,
  () => {
    if (!videoStore.playing) return
    if (route.name === 'graph' && route.params.type !== 'graph' && videoStore.graphId != null) {
      router.push({ name: 'graph', params: { type: 'graph', id: videoStore.graphId } })
    }
  }
)

onMounted(() => {
  zoomElementSelection.value = select(zoomElement.value)
  zoomBehaviour.value = zoom()
    // .scaleExtent([0.1, 2])
    .scaleExtent([0.1, 1])
    .on('zoom', (e) => {
      layoutStore.transform = e.transform
    })
    .filter((e) => {
      nextTick(() => activityStore.registerActivity())
      return e.button === 0 && !contextMenuStore.show
    })
  zoomElementSelection.value.call(zoomBehaviour.value)
  initGraph(0)
  resizeObserver.observe(zoomElement.value)
})

onBeforeUnmount(() => {
  if (zoomElement.value != null) resizeObserver.unobserve(zoomElement.value)
})

function initGraph(duration) {
  allocations.value =
    route.params.type === 'graph' ? node.value.allocations : computeAllocations(id.value)

  zoomToBounds(bounds.value, duration)
}

// function translate(allocations) {
//   return Object.fromEntries(
//     Object.entries(allocations ?? {}).map((allocation) => [
//       allocation[0],
//       {
//         ...allocation[1]
//         // x: allocation[1].x + layoutStore.offset.x,
//         // y: allocation[1].y + layoutStore.offset.y
//       }
//     ])
//   )
// }

function zoomToBounds(bounds, duration = 0) {
  const diff = {
    x: bounds.x2 - bounds.x1,
    y: bounds.y2 - bounds.y1
  }

  const zoomElementDimensions = zoomElement.value.getBoundingClientRect()

  const scaleX = zoomElementDimensions.width / diff.x
  const scaleY = (zoomElementDimensions.height - constantStore.spacing * 2.7) / diff.y
  const scale = Math.min(scaleX, scaleY)

  const x = bounds.x1 + diff.x / 2
  const y = bounds.y1 + diff.y / 2

  zoomElementSelection.value
    .transition()
    .duration(duration)
    .call(
      zoomBehaviour.value.transform,
      zoomIdentity
        .translate(zoomElementDimensions.width / 2, zoomElementDimensions.height / 2)
        .scale(scale)
        .translate(-x, -y)
    )
}

const resizeObserver = new ResizeObserver((entries) => {
  for (const entry of entries) {
    if (entry.contentRect) {
      zoomToBounds(bounds.value, 0)
    }
  }
})

function onContextMenu(e) {
  if (!settingsStore.edit || view.value !== 'diagram') return
  e.preventDefault()
  contextMenuStore.open(
    ContextMenuList,
    [
      {
        label: 'add',
        action: (e) => {
          e.stopPropagation()
          contextMenuStore.open(ContextMenuSearch)
        }
      },
      {
        label: 'log',
        action: () => {
          console.log(layoutStore.transform, contextMenuStore.offset)
        }
      }
    ],
    { x: e.x, y: e.y }
  )
}

function onClick(e) {
  if (!settingsStore.edit || view.value !== 'diagram') return

  if (['add-entity', 'add-story', 'add-image'].includes(editStore.mode)) e.stopPropagation()
  switch (editStore.mode) {
    case 'add-entity':
      contextMenuStore.open(
        ContextMenuSearch,
        {
          nodeType: 'entity'
        },
        { x: e.x, y: e.y }
      )
      editStore.resetMode()
      break
    case 'add-story':
      contextMenuStore.open(
        ContextMenuSearch,
        {
          nodeType: 'graph'
        },
        { x: e.x, y: e.y }
      )
      editStore.resetMode()
      break
    case 'add-image':
      contextMenuStore.open(
        ContextMenuSearch,
        {
          nodeType: 'image'
        },
        { x: e.x, y: e.y }
      )
      editStore.resetMode()
      break

    default:
      break
  }
}

function onDrop(e) {
  e.preventDefault()
  if (!settingsStore.edit || view.value !== 'diagram') return

  // handling files
  // console.log(e.dataTransfer.files)

  const uri = shorten(e.dataTransfer.getData('text/uri-list'))

  // fetch mime types from urls (only works if cors is enabled)
  // const controller = new AbortController();
  // const signal = controller.signal;
  // const mime = await fetch(uri, {signal}).then(d => {controller.abort(); return d.headers.get('Content-Type')})

  const existingNode = dataStore.nodes.find((n) => n.file === shorten(uri))
  if (existingNode != null) return insertNode(existingNode.id, e.x, e.y)

  // console.log(shorten(uri))
  // .replace(location.origin, "workbench:/");

  const isImage = /(.png|.jpe?g|.gif|.webp)$/i.test(uri)
  if (isImage) {
    const uuid = crypto.randomUUID()

    const node = {
      type: 'image',
      file: uri,
      text: { universal: uri.replace(/[^:]*:\/?\/?/, '').replace(/\.[^.]+$/, '') }
    }

    dataStore.data.nodes[uuid] = node
    insertNode(uuid, e.x, e.y)
  }
}

function insertNode(id, x, y) {
  dataStore.data.nodes[dataStore.nodeId].allocations[id] = {
    x: (x - layoutStore.transform.x) / layoutStore.transform.k,
    y: (y - layoutStore.transform.y) / layoutStore.transform.k
  }
}
</script>

<template>
  <main
    class="graph"
    ref="zoomElement"
    :class="[`mode-${editStore.mode}`, { initializing: route.meta.initializeView }]"
    :style="cssProps"
    @contextmenu="onContextMenu"
    @click="onClick"
    @drop="onDrop"
    @dragover.prevent
    @dragenter.prevent
  >
    <div class="nodes" :style="{ transform: transformString }">
      <TransitionGroup name="nodes">
        <GraphNode
          v-for="nodeId in allocationOrder"
          :key="nodeId"
          :id="nodeId"
          :position="route.params.type === 'graph' ? null : allocations[nodeId]"
          :view="view"
          :graph="view === 'diagram' && id"
        />
      </TransitionGroup>
    </div>
    <svg>
      <g :style="{ transform: transformString }">
        <TransitionGroup name="edges">
          <GraphEdge v-for="edge in edges" :key="edge.id" :edge="edge" :view="view" />
        </TransitionGroup>
      </g>
    </svg>
  </main>
  <div class="tint" />
</template>

<style scoped>
.graph {
  grid-column: graph-start / graph-end;
  grid-row: graph-start / graph-end;
  position: relative;
  overflow: hidden;

  /* cursor: pointer; */

  &.mode-add-entity {
    cursor:
      url('@/assets/icons/AddEntity.svg') 11 15,
      auto;
  }
  &.mode-add-story {
    cursor:
      url('@/assets/icons/AddStory.svg') 11 15,
      auto;
  }
  &.mode-add-image {
    cursor:
      url('@/assets/icons/AddImage.svg') 11 15,
      auto;
  }

  /* position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh; */

  .nodes {
    position: absolute;
  }
  svg {
    position: absolute;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }

  /* transitions */
  .nodes-enter-active {
    transition: opacity var(--transition) var(--transition);
  }
  .nodes-leave-active {
    transition: opacity var(--transition);
  }

  .edges-enter-active {
    transition: opacity var(--transition) var(--transition);
  }
  .edges-leave-active {
    transition: opacity var(--transition);
  }

  .edges-enter-from,
  .nodes-enter-from,
  .edges-leave-to,
  .nodes-leave-to {
    opacity: 0;
  }

  &.initializing {
    .nodes-enter-active,
    .edges-enter-active {
      transition: opacity var(--transition);
    }
  }
}
.tint {
  transition: all var(--transition);
  /* position: absolute; */
  grid-column: graph-start-x / graph-end-x;
  grid-row: graph-start-y / graph-end-y;
  background: var(--graph-accent);
  opacity: 0.05;
  pointer-events: none;
  z-index: 5;
}
</style>
