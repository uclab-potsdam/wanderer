<script setup>
import { useTerminusStore } from '@/stores/terminus'
import { useComposeStore } from '@/stores/compose'
import { useViewStore } from '@/stores/view'
import { useSyncStore } from '@/stores/sync'
import { ref, computed } from 'vue'
import DocumentCard from './DocumentCard.vue'
import NodeButtonDrawEdge from './NodeButtonDrawEdge.vue'
import NodeButtonRaiseLevel from './NodeButtonRaiseLevel.vue'
import IconClose from '~icons/default/Close'
import IconEdit from '~icons/default/Edit'
import ModalEdit from './modals/ModalEdit.vue'

import { MODE_VIEW, MODE_COMPOSE, MODE_COUPLE } from '@/assets/js/constants'

const props = defineProps({
  allocation: Object,
  transform: Object
})

const terminusStore = useTerminusStore()
const composeStore = useComposeStore()
const viewStore = useViewStore()
const syncStore = useSyncStore()

const mode = computed(() => viewStore.mode)

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

function update() {
  terminusStore.getGraph(terminusStore.graph)
}

async function deleteAllocation() {
  terminusStore.deleteDocument(props.allocation['@id'])
  const index = terminusStore.allocations.findIndex((n) => n['@id'] === props.allocation['@id'])
  if (index >= 0) {
    terminusStore.allocations.splice(index, 1)
  }
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
    (state) => state.node === props.allocation.node['@id'] && state.timestamp <= syncStore.time
  )
)

const modeClass = computed(() => {
  switch (mode.value) {
    case MODE_COMPOSE:
      return 'mode-compose'
    case MODE_COUPLE:
      return 'mode-couple'
    case MODE_VIEW:
      return 'mode-view'
  }
  return null
})

const showEditModal = ref(false)
</script>

<template>
  <div
    class="canvas-document-card"
    :style="{ transform: `translate(${allocation.x}px, ${allocation.y}px)` }"
    :class="{ moving, 'drawing-source': drawingSource, 'drawing-target': drawingTarget }"
  >
    <DocumentCard
      @mousedown="onMouseDown"
      @mouseover="onMouseEnter"
      @mouseout="onMouseOut"
      :document="allocation.node"
      :level="state?.level"
      :class="[modeClass]"
    >
      <template v-slot:center>
        <NodeButtonDrawEdge v-if="mode === MODE_COMPOSE" :allocation="allocation" />
        <NodeButtonRaiseLevel
          v-if="mode === MODE_COUPLE"
          :allocation="allocation"
          :level="state?.level"
        />
      </template>
      <template v-slot:right>
        <!-- <IconClose @click="deleteAllocation" /> -->
        <IconEdit @click="showEditModal = true" />
        <Teleport to="#modals">
          <ModalEdit
            :show="showEditModal"
            :id="allocation.node['@id']"
            :type="allocation.node['@type']"
            @close="showEditModal = false"
            @update="update"
          />
        </Teleport>
      </template>
    </DocumentCard>
  </div>
</template>

<style lang="scss" scoped>
.canvas-document-card {
  .node {
    transform: translate(-50%, -50%);
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

  &.drawing-target {
    > section.document:hover {
      background: var(--ui-accent-dark);
      color: var(--secondary);
      :deep(.buttons) {
        display: none;
      }
    }
  }
}
</style>
