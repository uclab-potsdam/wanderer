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

const isBetweenGraphs = computed(
  () =>
    dataStore.data.nodes[props.edge.nodes[0]].type === 'graph' &&
    dataStore.data.nodes[props.edge.nodes[1]].type === 'graph'
)

const source = computed(() => layoutStore.nodes[props.edge.nodes[0]])
const target = computed(() => layoutStore.nodes[props.edge.nodes[1]])

const detailIsSource = computed(() => isNetwork.value && route.params.id === props.edge.nodes[0])
const detailIsTarget = computed(() => isNetwork.value && route.params.id === props.edge.nodes[1])

const secondary = computed(
  () =>
    props.edge.graph !== dataStore.storyId ||
    (isNetwork.value && !props.edge.nodes.includes(route.params.id))
)
const tertiary = computed(
  () =>
    source.value == null ||
    target.value == null ||
    (isNetwork.value && !props.edge.nodes.includes(route.params.id))
)

const color = computed(() => {
  const color = dataStore.data.nodes[props.edge.graph]?.color
  return { '--graph-accent': color ? `var(--${color})` : null }
})

const display = computed(() => displayStore.inheritStateFromNodes(props.edge.nodes))

const points = computed(() => {
  if (source.value == null && target.value == null) return
  const s = source.value ?? offsetPoint(target.value)
  const t = target.value ?? offsetPoint(source.value)

  const margin = spacing
  const radius = spacing

  const sourceWidth = s.width ? s.width + margin + margin * detailIsSource.value : 0
  const sourceHeight = s.height ? s.height + margin + margin * detailIsSource.value * 2 : 0
  const targetWidth = t.width ? t.width + margin + margin * detailIsTarget.value : 0
  const targetHeight = t.height ? t.height + margin + margin * detailIsTarget.value * 2 : 0

  const start = getLineRoundedRectangleIntersection(
    s.x,
    s.y,
    t.x,
    t.y,
    s.x - sourceWidth / 2,
    s.y - sourceHeight / 2,
    sourceWidth,
    sourceHeight,
    Math.min(radius, sourceHeight / 2 - 0.1) // fix issue when radius >= height / 2
  )[0]

  const end = getLineRoundedRectangleIntersection(
    s.x,
    s.y,
    t.x,
    t.y,
    t.x - targetWidth / 2,
    t.y - targetHeight / 2,
    targetWidth,
    targetHeight,
    Math.min(radius, targetHeight / 2 - 0.1) // fix issue when radius >= height / 2
  )[0]

  if (start == null || end == null) {
    return
  }

  const a = { x: start.point[0] + layoutStore.offset.x, y: start.point[1] + layoutStore.offset.y }
  const b = { x: end.point[0] + layoutStore.offset.x, y: end.point[1] + layoutStore.offset.y }

  if (target.value == null) {
    let pathLengthLookup = getPathLengthLookup(`M${a.x},${a.y} L${b.x},${b.y}`)
    const z = pathLengthLookup.getPointAtLength(6)
    const zc = pathLengthLookup.getPointAtLength(3)
    return [a, zc, zc, z]
  }

  if (source.value == null) {
    let pathLengthLookup = getPathLengthLookup(`M${b.x},${b.y} L${a.x},${a.y}`)
    const z = pathLengthLookup.getPointAtLength(6)
    const zc = pathLengthLookup.getPointAtLength(3)
    return [z, zc, zc, b]
  }

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

function offsetPoint(point, r = 500) {
  const angle = Math.random() * Math.PI * 2
  return { x: Math.cos(angle) * r + point.x, y: Math.sin(angle) * r + point.y }
}
</script>

<template>
  <g
    class="edge"
    :class="[
      display,
      view,
      {
        'user-active': !activityStore.inactivityShort || !videoStore.playing,
        secondary,
        tertiary,
        paused: !videoStore.playing && settingsStore.mode !== 'edit'
      }
    ]"
    :style="color"
    v-if="points != null && !(isBetweenGraphs && secondary)"
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
      <path
        :d="value.d"
        :marker-end="markerEnd"
        :marker-start="markerStart"
        :class="{ dashed: edge.classRelationship }"
      />
      <template v-if="!tertiary">
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
      </template>
    </BaseInterpolate>
  </g>
</template>

<style scoped>
.edge {
  fill: none;
  color: var(--color-edge);
  stroke: var(--color-edge);

  &.hide:not(.paused) {
    opacity: 0.2;
    filter: var(--blur);
    pointer-events: all;

    &.user-active {
      /* color: color-mix(in lab, var(--color-text), var(--color-background) 70%);
      stroke: color-mix(in lab, var(--color-text), var(--color-background) 70%); */
      /* filter: none; */
      /* opacity: 0.2; */
    }
    transition:
      opacity var(--ui-transition) var(--delay-transition),
      filter 0s calc(var(--delay-transition) + var(--ui-transition));

    &:hover {
      opacity: 1;
      filter: none;
      transition: none;
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

    &.dashed {
      stroke-dasharray: 8 12;
    }
  }

  text {
    transition: color var(--ui-transition);
    stroke: none;
    fill: currentColor;
    font-size: var(--font-size-small);
    text-anchor: middle;
    dominant-baseline: middle;
    cursor: default;

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
  &.tertiary {
    color: var(--color-edge-secondary);
    stroke: var(--color-edge-secondary);

    opacity: 0.4;
  }
}
</style>
