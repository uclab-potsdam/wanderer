<script setup>
import { useTerminusStore } from '@/stores/terminus'
import { useComposeStore } from '@/stores/compose'
import { useViewStore } from '@/stores/view'
import { useSyncStore } from '@/stores/sync'
import { useCanvasStore } from '@/stores/canvas'
import { ref, watch, computed, onMounted, onBeforeUnmount } from 'vue'
import DocumentCard from './DocumentCard.vue'
import NodeButtonDrawEdge from './NodeButtonDrawEdge.vue'
import NodeButtonRaiseLevel from './NodeButtonRaiseLevel.vue'
import IconEdit from '~icons/default/Edit'
import IconClose from '~icons/default/Close'
import ModalEdit from './modals/ModalEdit.vue'

import { MODE_COMPOSE, MODE_COUPLE, MODE_VIEW } from '@/assets/js/constants'
import { useRouter, useRoute } from 'vue-router'

const props = defineProps({
  allocation: Object,
  transform: Object
})

const terminusStore = useTerminusStore()
const composeStore = useComposeStore()
const viewStore = useViewStore()
const syncStore = useSyncStore()
const canvasStore = useCanvasStore()

const router = useRouter()
const route = useRoute()

const mode = computed(() => viewStore.mode)

const node = ref(null)

const moving = computed(() => props.allocation.node['@id'] === composeStore.movingNode)
const drawingSource = computed(() => props.allocation.node['@id'] === composeStore.sourceNode)
const drawingTarget = computed(
  () => composeStore.sourceNode && props.allocation.node['@id'] !== composeStore.sourceNode
)

function onMouseDown(e) {
  if (mode.value !== MODE_COMPOSE) return
  e.stopPropagation()
  composeStore.moveNode(
    props.allocation.node['@id'],
    { x: props.allocation.x, y: props.allocation.y },
    { x: e.x, y: e.y }
  )
}

const resizeObserver = new ResizeObserver((entries) => {
  for (const entry of entries) {
    if (entry.contentRect) {
      const labelWidth = [...entry.target.children[0].classList].includes('entity')
        ? Math.max(...[...entry.target.children[0].children[0].children].map((d) => d.getBoundingClientRect().width)) /
          props.transform.k
        : -Infinity
      canvasStore.updateNode(props.allocation.node['@id'], {
        width: labelWidth > 0 ? labelWidth + 20 : entry.contentRect.width,
        height: entry.contentRect.height,
        x: props.allocation.x,
        y: props.allocation.y
      })
    }
  }
})

watch(
  () => props.allocation.y,
  () => {
    canvasStore.updateNode(props.allocation.node['@id'], {
      y: props.allocation.y
    })
  }
)

watch(
  () => props.allocation.x,
  () => {
    canvasStore.updateNode(props.allocation.node['@id'], {
      x: props.allocation.x
    })
  }
)

onMounted(() => {
  resizeObserver.observe(node.value)
})

onBeforeUnmount(() => {
  if (node.value != null) resizeObserver.unobserve(node.value)
  canvasStore.deleteNode(props.allocation.node['@id'])
})

async function deleteAllocation() {
  terminusStore.deleteAllocation(props.allocation['@id'])
  const index = terminusStore.allocations.findIndex((n) => n['@id'] === props.allocation['@id'])
  if (index >= 0) {
    terminusStore.allocations.splice(index, 1)
  }
  terminusStore.edges = terminusStore.edges.filter(
    (e) => e.source !== props.allocation.node['@id'] && e.target !== props.allocation.node['@id']
  )
}

function onMouseEnter() {
  if (mode.value !== MODE_COMPOSE || composeStore.sourceNode == null) return
  composeStore.targetNode = props.allocation.node['@id']
}

function onMouseOut() {
  if (mode.value !== MODE_COMPOSE || composeStore.sourceNode == null) return
  composeStore.targetNode = null
}

const state = computed(() =>
  terminusStore.states.findLast(
    (state) => state.node === props.allocation.node['@id'] && state.timestamp <= syncStore.activeMarker?.timestamp
  )
)

// watch(state, () => {
//   canvasStore.updateNode(props.allocation.node['@id'], { level: state.value.level })
// })

function onClick() {
  if (mode.value !== MODE_VIEW) return
  router.push(`/${props.allocation.node['@id']}`)
}

const offset = ref(route.name === 'graph' ? 'translate(-45px, -32.5px)' : 'translate(-50%, -50%)')
watch(
  () => terminusStore.allocations,
  () => (offset.value = route.name === 'graph' ? 'translate(-45px, -32.5px)' : 'translate(-50%, -50%)')
)

const showEditModal = ref(false)
</script>

<template>
  <div
    ref="node"
    class="canvas-document-card"
    :style="{
      transform: `translate(${allocation.x}px, ${allocation.y}px) ${offset}`
    }"
    :class="[viewStore.modeClass, { moving, 'drawing-source': drawingSource, 'drawing-target': drawingTarget }]"
    @click="onClick"
  >
    <DocumentCard
      @mousedown="onMouseDown"
      @mouseover="onMouseEnter"
      @mouseout="onMouseOut"
      :document="allocation.node"
      :level="state?.level"
      :class="[viewStore.modeClass]"
      on-canvas
    >
      <template v-slot:center>
        <NodeButtonDrawEdge v-if="mode === MODE_COMPOSE" :allocation="allocation" />
        <NodeButtonRaiseLevel v-if="mode === MODE_COUPLE" :allocation="allocation" :level="state?.level" />
      </template>
      <template v-slot:right>
        <IconClose @click="deleteAllocation" />
        <IconEdit @click="showEditModal = true" />
        <Teleport to="#modals">
          <ModalEdit
            :show="showEditModal"
            :id="allocation.node['@id']"
            :type="allocation.node['@type']"
            @close="showEditModal = false"
          />
        </Teleport>
      </template>
    </DocumentCard>
  </div>
</template>

<style lang="scss" scoped>
.canvas-document-card {
  user-select: none;

  &.mode-view {
    transition: transform var(--transition-extended);
  }

  &.moving,
  &.drawing-source {
    z-index: 1;
  }

  &.drawing-source {
    pointer-events: none;
    :deep(.buttons) {
      display: block;
      .center {
        .icon {
          color: var(--secondary);
          background-color: var(--ui-accent-dark);
        }
      }
    }
  }

  &.drawing-target:hover .node {
    :deep(.card) {
      background: var(--ui-accent-dark);
      color: var(--secondary);
    }
    :deep(.actions) {
      display: none;
    }
  }
}
</style>
