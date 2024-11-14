<script setup>
import { computed } from 'vue'
import { getLineRoundedRectangleIntersection } from '@/assets/js/intersection'

import { useLayoutStore } from '@/stores/layout'
import { useDisplayStore } from '@/stores/display'
import { useActivityStore } from '@/stores/activity'
import { useVideoStore } from '@/stores/video'
import { useDataStore } from '@/stores/data'

import BaseInterpolate from '@/components/BaseInterpolate.vue'
import ContextMenuList from './ContextMenuList.vue'
import { useSettingsStore } from '@/stores/settings'
import { useModalStore } from '@/stores/modal'
import { useContextMenuStore } from '@/stores/contextMenu'
import LocalizeText from './LocalizeText.vue'

import { spacing } from '@/assets/js/style'
import { useRoute } from 'vue-router'
import { transition } from '@/assets/js/style'
import { getPathLengthLookup } from 'svg-getpointatlength'

const layoutStore = useLayoutStore()
const displayStore = useDisplayStore()
const activityStore = useActivityStore()
const videoStore = useVideoStore()
const dataStore = useDataStore()
const settingsStore = useSettingsStore()
const modalStore = useModalStore()
const contextMenuStore = useContextMenuStore()

const route = useRoute()

const props = defineProps({
  edge: Object,
  view: String
})

const isNetwork = computed(() => route.params.type !== 'graph')

const secondary = computed(() => isNetwork.value && props.edge.graph !== dataStore.storyId)

const source = computed(() => layoutStore.nodes[props.edge.nodes[0]])
const target = computed(() => layoutStore.nodes[props.edge.nodes[1]])

const detailIsSource = computed(() => isNetwork.value && route.params.id === props.edge.nodes[0])
const detailIsTarget = computed(() => isNetwork.value && route.params.id === props.edge.nodes[1])

const color = computed(() => {
  const color = dataStore.data.nodes[props.edge.graph]?.color
  return { '--graph-accent': color ? `var(--${color})` : null }
})

const display = computed(() => displayStore.inheritStateFromNodes(props.edge.nodes))

const points = computed(() => {
  if (source.value == null || target.value == null) return

  const margin = spacing
  const radius = spacing

  const sourceWidth = source.value.width + margin + margin * detailIsSource.value
  const sourceHeight = source.value.height + margin + margin * detailIsSource.value * 2
  const targetWidth = target.value.width + margin + margin * detailIsTarget.value
  const targetHeight = target.value.height + margin + margin * detailIsTarget.value * 2

  const start = getLineRoundedRectangleIntersection(
    source.value.x,
    source.value.y,
    target.value.x,
    target.value.y,
    source.value.x - sourceWidth / 2,
    source.value.y - sourceHeight / 2,
    sourceWidth,
    sourceHeight,
    Math.min(radius, sourceHeight / 2 - 0.1) // fix issue when radius >= height / 2
  )[0]

  const end = getLineRoundedRectangleIntersection(
    source.value.x,
    source.value.y,
    target.value.x,
    target.value.y,
    target.value.x - targetWidth / 2,
    target.value.y - targetHeight / 2,
    targetWidth,
    targetHeight,
    Math.min(radius, targetHeight / 2 - 0.1) // fix issue when radius >= height / 2
  )[0]

  if (start == null || end == null) {
    return
  }

  const a = { x: start.point[0] + layoutStore.offset.x, y: start.point[1] + layoutStore.offset.y }
  const b = { x: end.point[0] + layoutStore.offset.x, y: end.point[1] + layoutStore.offset.y }

  const c = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
  if (isNetwork.value) {
    return [a, c, c, b]
  }

  const vectors = [
    { x: -1, y: 0 },
    { x: -1, y: -1 },
    { x: 0, y: -1 },
    { x: 1, y: -1 },
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 0, y: 1 },
    { x: -1, y: 1 }
  ]

  return [
    a,
    { x: a.x + vectors[start.anchor].x * 100, y: a.y + vectors[start.anchor].y * 100 },
    { x: b.x + vectors[end.anchor].x * 100, y: b.y + vectors[end.anchor].y * 100 },
    b
  ]
})

const d = computed(() => {
  if (points.value == null) return
  return `M${points.value.map((p, i) => `${i === 1 ? 'C' : ''}${p.x},${p.y}`).join(' ')}`
})
const center = computed(() => {
  if (d.value == null) return []
  let pathLengthLookup = getPathLengthLookup(d.value)
  let totalLength = pathLengthLookup.totalLength
  return pathLengthLookup.getPointAtLength(totalLength / 2)
})

const id = computed(() => `${props.edge.nodes.join('-')}-${props.edge.graph}`)
const markerId = computed(() => `url('#marker-${id.value}')`)
const markerAltId = computed(() => `url('#marker-${id.value}-alt')`)
const markerEnd = computed(
  () => (props.edge.arrow === '→' || props.edge.arrow === '↔') && markerId.value
)
const markerStart = computed(
  () => (props.edge.arrow === '←' || props.edge.arrow === '↔') && markerAltId.value
)

function onClick(e) {
  if (!e.metaKey) return

  e.stopPropagation()
  e.preventDefault()
  const arrows = [null, '→', '←', '↔']
  const current = Math.max(arrows.indexOf(props.edge.arrow), 0)
  dataStore.data.edges.find((edge) => edge.id === props.edge.id).arrow =
    arrows[(current + 1) % arrows.length]
}

function onDoubleClick(e) {
  if (!settingsStore.edit || e.metaKey) return
  modalStore.open(props.edge.id, 'edge')
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
          dataStore.data.edges = dataStore.data.edges.filter((e) => e.id !== props.edge.id)
        }
      },
      {
        label: 'edit',
        action: () => {
          modalStore.open(props.edge.id, 'edge')
        }
      }
    ],
    { x: e.x, y: e.y }
  )
}
</script>

<template>
  <g
    class="edge"
    :class="[
      display,
      view,
      { 'user-active': !activityStore.inactivityShort || !videoStore.playing, secondary }
    ]"
    :style="color"
  >
    <defs>
      <marker
        :id="`marker-${id}`"
        markerWidth="10"
        markerHeight="20"
        refX="10"
        refY="10"
        orient="auto"
      >
        <path d="M2,6.5 L10,10 L2,13.5" />
      </marker>
      <marker
        :id="`marker-${id}-alt`"
        markerWidth="10"
        markerHeight="20"
        refX="00"
        refY="10"
        orient="auto"
      >
        <path d="M8,6.5 L0,10 L8,13.5" />
      </marker>
    </defs>
    <BaseInterpolate
      :props="{
        d,
        ...center
      }"
      :delay="0"
      :duration="settingsStore.edit ? 0 : transition"
      v-slot="value"
    >
      <!-- <path :d="value.d" :marker-end="markerEnd" :marker-start="markerStart" /> -->
      <path
        v-if="settingsStore.edit"
        class="edit"
        :d="value.d"
        @dblclick.stop="onDoubleClick"
        @contextmenu="onContextMenu"
        @click="onClick"
      />
      <path :d="value.d" :marker-end="markerEnd" :marker-start="markerStart" />
      <text
        class="shadow"
        :class="{ edit: settingsStore.edit }"
        :x="value.x"
        :y="value.y"
        @dblclick.stop="onDoubleClick"
        @contextmenu="onContextMenu"
        @click="onClick"
        ><LocalizeText :text="edge.label" />
      </text>
      <text :x="value.x" :y="value.y"><LocalizeText :text="edge.label" /> </text>
    </BaseInterpolate>
  </g>
</template>

<style scoped>
.edge {
  fill: none;
  color: var(--color-edge);
  stroke: var(--color-edge);

  &.hide {
    opacity: 0.2;
    filter: var(--blur);

    &.user-active {
      /* color: color-mix(in lab, var(--color-text), var(--color-background) 70%);
      stroke: color-mix(in lab, var(--color-text), var(--color-background) 70%); */
      filter: none;
      /* opacity: 0.2; */
    }
  }

  marker {
    overflow: visible;
    path {
      stroke: currentColor;
      fill: currentColor;
    }
  }

  path {
    transition:
      color var(--ui-transition),
      stroke var(--ui-transition),
      opacity var(--transition);

    &.edit {
      opacity: 0;
      stroke-width: 20;
      pointer-events: all;

      &:hover {
        opacity: 0.1;
        stroke-linecap: round;
      }
    }
  }

  text {
    transition: color var(--ui-transition);
    stroke: none;
    fill: currentColor;
    font-size: var(--font-size-small);
    text-anchor: middle;
    dominant-baseline: middle;

    &.shadow {
      /* stroke: currentColor; */
      /* opacity: 0.1; */
      stroke-linejoin: round;
      stroke: var(--color-background);
      stroke-width: 20px;
      fill: var(--color-background);
      cursor: default;

      &:hover {
        stroke: color-mix(in lab, currentColor, var(--color-background) 90%);
      }
    }

    &.edit {
      pointer-events: all;
    }
  }

  &:has(path.edit:hover) {
    text.shadow {
      stroke: color-mix(in lab, currentColor, var(--color-background) 90%);
    }
  }
  &:has(text.shadow:hover) {
    path.edit {
      opacity: 0.1;
      stroke-linecap: round;
    }
  }

  &.network {
    mix-blend-mode: darken;
  }

  &.highlight {
    color: var(--color-edge-highlight);
    stroke: var(--color-edge-highlight);
  }

  &.secondary {
    color: var(--color-edge-secondary);
    stroke: var(--color-edge-secondary);
  }
}
</style>
