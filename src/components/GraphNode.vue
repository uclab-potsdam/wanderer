<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'

import ContextMenuList from './ContextMenuList.vue'

import { useRoute, useRouter } from 'vue-router'
import { useDataStore } from '@/stores/data'
import { useLayoutStore } from '@/stores/layout'
import { useDisplayStore } from '@/stores/display'
import { useActivityStore } from '@/stores/activity'
import { useVideoStore } from '@/stores/video'
import { useContextMenuStore } from '@/stores/contextMenu'
import { useConnectStore } from '@/stores/connect'
import { useModalStore } from '@/stores/modal'
import { useEditStore } from '@/stores/edit'

import DisplayBlur from '~icons/base/DisplayBlur'
import DisplayDefault from '~icons/base/DisplayDefault'
import DisplayHighlight from '~icons/base/DisplayHighlight'
import DisplayUnset from '~icons/base/DisplayUnset'

import { getComponentForType } from '@/assets/js/nodes'
import { useSettingsStore } from '@/stores/settings'

const props = defineProps({
  id: String,
  view: String,
  position: Object,
  graph: [String, Boolean]
})

const router = useRouter()
const route = useRoute()
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
const positioning = computed(() => {
  // nextTick(() => {
  //   if (route.params.id === props.id) {
  //     console.log('triggered')
  //   }
  //   triggerRef(positioning)
  // })
  return {
    transform: `translate(${props.position.x + layoutStore.offset.x}px, ${props.position.y + layoutStore.offset.y}px) translate(-50%, -50%)`
  }
})

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
      // console.log('resizing')
      //   layoutStore.nodes[props.id] = {
      //     width: entry.contentRect.width,
      //     height: entry.contentRect.height,
      //     x: props.position.x,
      //     y: props.position.y
      //   }
    }
  }
})

function onClick(e) {
  if (!settingsStore.edit || e.metaKey) {
    // hacky way to prevent changing routes when clicking on a blurred/hidden node
    // the entites opacity on hover/click is changed only after a very brief css transition delay to make this possible
    if (getComputedStyle(componentRef.value.el).opacity < 0.5) return
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

function includeIf(condition, value) {
  return condition ? [value] : []
}

function onContextMenu(e) {
  if (!settingsStore.edit) return
  e.preventDefault()
  e.stopPropagation()
  contextMenuStore.open(
    ContextMenuList,
    [
      ...includeIf(props.view === 'diagram', {
        label: 'delete',
        action: () => {
          dataStore.deleteNode(props.id, props.graph)
        }
      }),
      {
        label: 'edit',
        action: () => {
          modalStore.open(props.id, 'node')
        }
      },
      ...includeIf(props.view === 'diagram', {
        label: '→',
        action: () => {
          if (props.view !== 'diagram') return
          connectStore.open(props.id, '→', props.graph)
        }
      }),
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
      ...includeIf(props.view === 'diagram', {
        label: locked.value ? 'unlock' : 'lock',
        action: () => {
          dataStore.data.nodes[props.graph].allocations[props.id].locked = !locked.value
        }
      }),
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

const marker = computed(() => {
  if (settingsStore.mode !== 'edit') return
  return displayStore.exactMarker?.states?.[props.id]
  // const exactMarker = Object.prototype.hasOwnProperty.call(displayStore.exactMarker?.states, props.id)
})

const zIndex = computed(() => {
  if (node.value.type === 'image') return -1
  return 1
})
</script>

<template>
  <div class="node-wrapper" :style="{ 'z-index': zIndex }">
    <div :style="{ ...positioning, 'z-index': zIndex }">
      <DisplayBlur class="marker" v-if="marker === 'hide'" />
      <DisplayDefault class="marker" v-if="marker === 'default'" />
      <DisplayHighlight class="marker" v-if="marker === 'highlight'" />

      <!-- <BaseInterpolate
    :props="{
      positioning
    }"
    :delay="0"
    :duration="transition"
    v-slot="value"
  > -->
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
            paused: !videoStore.playing && settingsStore.mode !== 'edit',
            exact: displayStore.exactMarker?.states?.hasOwnProperty(id)
          }
        ]"
        :no-style="positioning"
        :node="node"
        :occurances="occurances"
        :position="position"
        @click="onClick"
        @dblclick.stop="onDoubleClick"
        @mousedown="onMouseDown"
        @contextmenu="onContextMenu"
      />
      <!-- </BaseInterpolate> -->
    </div>
  </div>
</template>

<style scoped>
.node-wrapper > div {
  position: absolute;
  transition:
    transform var(--transition),
    opacity var(--transition),
    filter var(--transition);

  .marker {
    pointer-events: none;
    position: absolute;
    transform: translate(-50%, -50%);
    z-index: 5;
    color: var(--ui-accent-bright);
    opacity: 1;
  }
}
.node {
  user-select: none;
  position: absolute;
  transform: translate(-50%, -50%);

  text-wrap: balance;
  /* position: absolute;
  transform: translate(-50%, -50%);
  transition:
    transform var(--transition),
    opacity var(--transition),
    filter var(--transition); */
  /* width var(--transition); */

  &.hide:not(.paused) {
    opacity: 0.2;
    filter: var(--blur);

    /* &.user-active {
      opacity: 1;
      filter: none;
    } */

    transition:
      opacity var(--ui-transition) var(--delay-transition),
      filter 0s calc(var(--delay-transition) + var(--ui-transition));

    &:hover {
      opacity: 1;
      filter: none;
      /* set a very brief delay on opacity change to enable checking against previous opacity value in click handler */
      transition: opacity 0s 0.01s;
    }
  }

  &.edit {
    &:hover {
      &:not(.locked) {
      }
    }

    &.exact {
      /* --light: color-mix(in lab, var(--ui-accent), transparent 70%); */
      /* outline: var(--ui-accent) solid 2px; */
      /* background: var(--light); */
      /* outline-offset: 2px; */
      /* border-radius: 5px; */
    }

    /* &.hide {
      opacity: 0.2;
      filter: var(--blur);
    } */

    &.mode-add-entity,
    &.mode-add-story,
    &.mode-add-image {
      pointer-events: none;
    }

    &.mode-add-edge {
      cursor: crosshair;
    }

    &.mode-default {
      cursor: move;
    }
  }

  /* &.mode-display-blur {
    cursor:
      url('@/assets/icons/DisplayBlur.svg') 22 22,
      auto;
  } */
}
</style>
