<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'

import ContextMenuList from './ContextMenuList.vue'

import { useRouter } from 'vue-router'
import { useDataStore } from '@/stores/data'
import { useLayoutStore } from '@/stores/layout'
import { useDisplayStore } from '@/stores/display'
import { useActivityStore } from '@/stores/activity'
import { useVideoStore } from '@/stores/video'
import { useContextMenuStore } from '@/stores/contextMenu'
import { useConnectStore } from '@/stores/connect'
import { useModalStore } from '@/stores/modal'
import { useEditStore } from '@/stores/edit'

import { getComponentForType } from '@/assets/js/nodes'
import { useSettingsStore } from '@/stores/settings'

const props = defineProps({
  id: String,
  view: String,
  position: Object,
  graph: [String, Boolean]
})

const router = useRouter()
const dataStore = useDataStore()
const layoutStore = useLayoutStore()
const displayStore = useDisplayStore()
const activityStore = useActivityStore()
const videoStore = useVideoStore()
const settingsStore = useSettingsStore()
const contextMenuStore = useContextMenuStore()
const modalStore = useModalStore()
const connectStore = useConnectStore()
const editStore = useEditStore()

const componentRef = ref(null)

const node = computed(() => dataStore.data.nodes[props.id])
const positioning = computed(() => ({
  transform: `translate(${position.value.x + layoutStore.offset.x}px, ${position.value.y + layoutStore.offset.y}px) translate(-50%, -50%)`
}))

const position = computed(
  () => props.position ?? dataStore.data.nodes[props.graph].allocations[props.id]
)

const component = computed(() => getComponentForType(node.value.type))

const nodeElement = computed(() => componentRef.value.el ?? componentRef.value.$el)

const occurances = computed(() =>
  dataStore.graphs.filter((d) =>
    Object.prototype.hasOwnProperty.call(d.allocations ?? {}, props.id)
  )
)

const display = computed(() => {
  if (!node.value.inheritDisplay) return displayStore.states[props.id]
  // fallback for depricated edges imported from terminus
  return displayStore.inheritStateFromNeighbor(props.id)
})

const locked = computed(() => dataStore.data.nodes?.[props.graph]?.allocations?.[props.id]?.locked)

const resizeObserver = new ResizeObserver((entries) => {
  for (const entry of entries) {
    if (entry.contentRect) {
      layoutStore.nodes[props.id] = {
        width: entry.contentRect.width,
        height: entry.contentRect.height,
        x: position.value.x,
        y: position.value.y
      }
    }
  }
})

function onClick(e) {
  if (!settingsStore.edit || e.metaKey) {
    router.push({ name: 'graph', params: { type: node.value.type, id: props.id } })
  } else if (connectStore.connecting) {
    connectStore.close(props.id)
  } else if (editStore.mode === 'add-edge') {
    connectStore.open(props.id, '→', props.graph)
  } else if (editStore.mode === 'display-blur') {
    editStore.setDisplay(props.id, 'hide', props.graph)
  } else if (editStore.mode === 'display-default') {
    editStore.setDisplay(props.id, 'default', props.graph)
  } else if (editStore.mode === 'display-highlight') {
    editStore.setDisplay(props.id, 'highlight', props.graph)
  } else if (editStore.mode === 'display-unset') {
    editStore.setDisplay(props.id, null, props.graph)
  }
}

function onDoubleClick() {
  if (!settingsStore.edit) return
  modalStore.open(props.id, 'node')
}

function onMouseDown(e) {
  if (!settingsStore.edit || props.view !== 'diagram' || e.button !== 0 || locked.value) return
  e.stopPropagation()

  const offset = { x: e.x, y: e.y }
  const start = {
    x: dataStore.data.nodes[props.graph].allocations[props.id].x,
    y: dataStore.data.nodes[props.graph].allocations[props.id].y
  }
  const controller = new AbortController()

  window.addEventListener(
    'mousemove',
    (e) => {
      const delta = {
        x: (e.x - offset.x) / layoutStore.transform.k,
        y: (e.y - offset.y) / layoutStore.transform.k
      }
      const gridSize = e.shiftKey ? 0.5 : 20
      const x = Math.round((start.x + delta.x) / gridSize) * gridSize
      const y = Math.round((start.y + delta.y) / gridSize) * gridSize

      dataStore.data.nodes[props.graph].allocations[props.id].x = x
      dataStore.data.nodes[props.graph].allocations[props.id].y = y
    },
    { signal: controller.signal }
  )

  window.addEventListener(
    'mouseup',
    () => {
      reset()
    },
    { once: true, signal: controller.signal }
  )

  window.addEventListener(
    'keydown',
    (e) => {
      if (e.key !== 'Escape') return
      reset()
    },
    { signal: controller.signal }
  )

  function reset() {
    controller.abort()
  }
}

function onContextMenu(e) {
  if (!settingsStore.edit) return
  e.preventDefault()
  e.stopPropagation()
  contextMenuStore.open(
    ContextMenuList,
    [
      {
        label: 'delete',
        action: () => {
          delete dataStore.data.nodes[props.graph].allocations[props.id]
        }
      },
      {
        label: 'edit',
        action: () => {
          modalStore.open(props.id, 'node')
        }
      },
      {
        label: '→',
        action: () => {
          if (props.view !== 'diagram') return
          connectStore.open(props.id, '→', props.graph)
        }
      },
      // {
      //   label: '↔',
      //   action: () => {
      //     modalStore.open(props.id, 'node')
      //   }
      // },
      // {
      //   label: '-',
      //   action: () => {
      //     modalStore.open(props.id, 'node')
      //   }
      // },
      {
        label: locked.value ? 'unlock' : 'lock',
        action: () => {
          dataStore.data.nodes[props.graph].allocations[props.id].locked = !locked.value
        }
      },
      {
        label: 'log',
        action: () => {
          console.log(props.id, dataStore.data.nodes[props.graph].allocations[props.id])
        }
      }
    ],
    { x: e.x, y: e.y }
  )
}

watch(
  () => [position.value.y, position.value.x],
  () => {
    layoutStore.nodes[props.id] = {
      ...layoutStore.nodes[props.id],
      x: position.value.x,
      y: position.value.y
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
    :class="[
      display,
      view,
      `mode-${editStore.mode}`,
      {
        'user-active': !activityStore.inactivityShort || !videoStore.playing,
        edit: settingsStore.edit,
        locked,
        exact: displayStore.exactMarker?.states?.hasOwnProperty(id)
      }
    ]"
    :style="positioning"
    :node="node"
    :occurances="occurances"
    @click="onClick"
    @dblclick.stop="onDoubleClick"
    @mousedown="onMouseDown"
    @contextmenu="onContextMenu"
  />
</template>

<style scoped>
.node {
  user-select: none;
  position: absolute;
  transform: translate(-50%, -50%);
  transition:
    /* transform var(--transition), */
    opacity var(--transition),
    filter var(--transition);

  &.edit {
    &:hover {
      &:not(.locked) {
        --light: color-mix(in lab, var(--ui-accent), transparent 70%);
        outline: var(--light) solid 2px;
        background: var(--light);
        /* outline-offset: 2px; */
        border-radius: 5px;
      }
    }

    &.exact {
      --light: color-mix(in lab, var(--ui-accent), transparent 70%);
      outline: var(--ui-accent) solid 2px;
      /* background: var(--light); */
      /* outline-offset: 2px; */
      border-radius: 5px;
    }
  }

  &.hide {
    opacity: 0.2;
    filter: var(--blur);

    &.user-active {
      opacity: 1;
      filter: none;
    }
  }

  &.mode-add-entity,
  &.mode-add-story,
  &.mode-add-image {
    pointer-events: none;
  }

  &.mode-add-edge {
    cursor: crosshair;
  }
  /* &.mode-display-blur {
    cursor:
      url('@/assets/icons/DisplayBlur.svg') 22 22,
      auto;
  } */
}
</style>
