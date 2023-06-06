<script setup>
import { useTerminusStore } from '@/stores/terminus'
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import DocumentCard from './DocumentCard.vue'
import IconArrow from '~icons/default/Arrow'
import IconClose from '~icons/default/Close'
import IconEdit from '~icons/default/Edit'

const props = defineProps({
  allocation: Object,
  transform: Object,
  connectingTo: Boolean
})
const emit = defineEmits([
  'update-position',
  'connect-start',
  'connect-end',
  'connect',
  'mouse-enter',
  'mouse-out'
])

const terminusStore = useTerminusStore()

let dragStartX = null
let dragStartY = null

const dragX = ref(0)
const dragY = ref(0)

const x = computed(() => dragX.value + props.allocation.x)
const y = computed(() => dragY.value + props.allocation.y)

const connectable = ref(true) // computed(() => props.allocation.node['@type'] !== 'graph')

const arrowX = ref(0)
const arrowY = ref(0)
const arrowDeg = ref(0)
const connectingFrom = ref(false)

function moveCard(e) {
  e.stopPropagation()
  dragStartX = e.x
  dragStartY = e.y

  const controller = new AbortController()

  window.addEventListener(
    'mouseup',
    () => {
      emit('update-position', { x: x.value, y: y.value })
      dragX.value = 0
      dragY.value = 0
      controller.abort()
    },
    { once: true }
  )

  window.addEventListener(
    'mousemove',
    (e) => {
      dragX.value = (e.x - dragStartX) / props.transform.k
      dragY.value = (e.y - dragStartY) / props.transform.k
    },
    { signal: controller.signal }
  )
}

function connect(e) {
  e.stopPropagation()
  dragStartX = e.x
  dragStartY = e.y
  connectingFrom.value = true
  emit('connect-start')

  const controller = new AbortController()

  window.addEventListener(
    'mouseup',
    () => {
      emit('connect-end')
      // emit("updatePosition", { x: x.value, y: y.value });
      arrowX.value = 0
      arrowY.value = 0
      connectingFrom.value = false
      controller.abort()
    },
    { once: true }
  )

  window.addEventListener(
    'mousemove',
    (e) => {
      arrowX.value = (e.x - dragStartX) / props.transform.k
      arrowY.value = (e.y - dragStartY) / props.transform.k
      updateArrowDeg(e)
      emit('connect', {
        x: arrowX.value,
        y: arrowY.value
      })
    },
    { signal: controller.signal }
  )
}
function onMouseMove(e) {
  updateArrowDeg(e)
}

function updateArrowDeg(e) {
  const vectorX =
    e.x / props.transform.k - (props.allocation.x + props.transform.x / props.transform.k)
  const vectorY =
    e.y / props.transform.k - (props.allocation.y + props.transform.y / props.transform.k)
  arrowDeg.value = Math.atan(vectorY / vectorX) * (180 / Math.PI) + (vectorX > 0 ? 0 : 180)
}

async function deleteAllocation() {
  terminusStore.deleteDocument(props.allocation['@id'])
  const index = terminusStore.allocations.findIndex((n) => n['@id'] === props.allocation['@id'])
  if (index >= 0) {
    terminusStore.allocations.splice(index, 1)
  }
}

function onMouseEnter() {
  if (connectable.value) emit('mouse-enter')
}

function onMouseOut() {
  if (connectable.value) emit('mouse-out')
}
</script>

<template>
  <foreignObject width="100" height="100" :x="x" :y="y">
    <DocumentCard
      @mousedown="moveCard"
      @mouseover="onMouseEnter"
      @mouseout="onMouseOut"
      @mousemove="onMouseMove"
      :document="allocation.node"
      :class="{
        'connecting-from': connectingFrom,
        'connecting-to': connectingTo,
        connectable: connectable
      }"
      show-hover
    >
      <template v-slot:center>
        <IconArrow
          v-if="connectable"
          :style="{
            transform: `translate(${arrowX}px, ${arrowY}px) rotate(${arrowDeg}deg)`
          }"
          @mousedown="connect"
        />
      </template>
      <template v-slot:right>
        <IconClose @click="deleteAllocation" />
        <RouterLink :to="`/edit/${allocation.node['@id']}`">
          <IconEdit />
        </RouterLink>
      </template>
    </DocumentCard>
  </foreignObject>
</template>

<style lang="scss" scoped>
foreignObject {
  > section.document {
    transform: translate(-50%, -50%);
    outline: 3px solid var(--secondary);
    &.connecting-from {
      pointer-events: none;
      :deep(.buttons) {
        display: block;
        .center {
          .icon {
            color: var(--secondary);
            background-color: var(--accent);
          }
        }
      }
    }
  }
  // &.connectable {
  > section.document.connecting-to {
    &:hover {
      background: var(--accent);
      color: var(--secondary);
      :deep(.buttons) {
        display: none;
      }
    }

    &:not(.connectable) {
      pointer-events: none;
    }

    &.connecting-from {
      background: var(--secondary);
      color: var(--accent);
    }
  }
  // }
}
</style>
