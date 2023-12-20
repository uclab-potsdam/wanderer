<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useTerminusStore } from '@/stores/terminus'
import { useSyncStore } from '@/stores/sync'
import { useViewStore } from '@/stores/view'
import { useCanvasStore } from '@/stores/canvas'
import { useComposeStore } from '@/stores/compose'
import { lineIntersect } from '@/assets/js/utils'
import ModalEdit from './modals/ModalEdit.vue'
import { MODE_COMPOSE, MODE_VIEW } from '@/assets/js/constants'

import BaseInterpolate from '@/components/BaseInterpolate.vue'

const terminusStore = useTerminusStore()
const syncStore = useSyncStore()
const viewStore = useViewStore()
const canvasStore = useCanvasStore()
const composeStore = useComposeStore()

const route = useRoute()

const viewClass = computed(() => `view-${route.name}`)

const props = defineProps({ edge: Object, interactive: Boolean })

const mode = computed(() => viewStore.mode)

const label = computed(() => {
  // if (props.edge.proxy != null) return null
  const propertyClass = terminusStore.properties.find((c) => c['@id'] === props.edge.property)
  return propertyClass?.label ? viewStore.localize(propertyClass.label) : {}
})

const color = computed(() => {
  if (!props.edge.color) return
  return {
    '--edge-color': `rgb(var(--${props.edge.color}-5))`
  }
})

const id = computed(() => {
  return (props.edge.id || props.edge['@id'] || 'some-path').replace(/%/g, '-')
})

const points = ref([])

watch(
  () => [canvasStore.nodes[props.edge.source], canvasStore.nodes[props.edge.target], props.edge.x, props.edge.y],
  computePoints,
  {
    immediate: true
  }
)

function getDirection(a, b) {
  const buffer = 40
  if ((a.bounds?.right || a.x) < (b.bounds?.left || b.x)) {
    if ((a.bounds?.top || a.y) - buffer > (b.bounds?.bottom || b.y)) return '↗'
    if ((a.bounds?.bottom || a.y) + buffer < (b.bounds?.top || b.y)) return '↘'
    return '→'
  }

  if ((a.bounds?.left || a.x) > (b.bounds?.right || b.x)) {
    if ((a.bounds?.top || a.y) - buffer > (b.bounds?.bottom || b.y)) return '↖'
    if ((a.bounds?.bottom || a.y) + buffer < (b.bounds?.top || b.y)) return '↙'
    return '←'
  }

  if (a.y < b.y) return '↓'
  return '↑'
}

function getAnchor(node, dir, inverse) {
  if (inverse) {
    const dirs = ['→', '↘', '↓', '↙', '←', '↖', '↑', '↗']
    dir = dirs[(dirs.indexOf(dir) + 4) % 8]
  }
  switch (dir) {
    case '→': {
      return {
        x: node.bounds.right,
        y: node.y
      }
    }
    case '↘': {
      return {
        x: node.bounds.right,
        y: node.bounds.bottom
      }
    }
    case '↓': {
      return {
        x: node.x,
        y: node.bounds.bottom
      }
    }
    case '↙': {
      return {
        x: node.bounds.left,
        y: node.bounds.bottom
      }
    }
    case '←': {
      return {
        x: node.bounds.left,
        y: node.y
      }
    }
    case '↖': {
      return {
        x: node.bounds.left,
        y: node.bounds.top
      }
    }
    case '↑': {
      return {
        x: node.x,
        y: node.bounds.top
      }
    }
    case '↗': {
      return {
        x: node.bounds.right,
        y: node.bounds.top
      }
    }
  }
}

function getEncasedDirection(dir, delta, inverse) {
  if (inverse) {
    const dirs = ['→', '↘', '↓', '↙', '←', '↖', '↑', '↗']
    dir = dirs[(dirs.indexOf(dir) + 4) % 8]
  }
  switch (dir) {
    case '→':
      return delta.y === 0 ? '→' : delta.y > 0 ? '↗' : '↘'
    case '↘':
      return Math.abs(delta.x) === Math.abs(delta.y) ? '↘' : Math.abs(delta.x) > Math.abs(delta.y) ? '→' : '↓'
    case '↓':
      return delta.x === 0 ? '↓' : delta.x > 0 ? '↙' : '↘'
    case '↙':
      return Math.abs(delta.x) === Math.abs(delta.y) ? '↙' : Math.abs(delta.x) > Math.abs(delta.y) ? '←' : '↓'
    case '←':
      return delta.y === 0 ? '←' : delta.y > 0 ? '↖' : '↙'
    case '↖':
      return Math.abs(delta.x) === Math.abs(delta.y) ? '↖' : Math.abs(delta.x) > Math.abs(delta.y) ? '←' : '↑'
    case '↑':
      return delta.x === 0 ? '↑' : delta.x > 0 ? '↖' : '↗'
    case '↗': {
      return Math.abs(delta.x) === Math.abs(delta.y) ? '↗' : Math.abs(delta.x) > Math.abs(delta.y) ? '→' : '↑'
    }
  }
}

function streamlinePattern(pattern) {
  return pattern.replace(/(.)(.)\1\1\2\1/, '$1$1$2$2$1$1')
}

function getPointsAt(a, b, ratios) {
  const delta = {
    x: a.x - b.x,
    y: a.y - b.y
  }

  return ratios.map((r) => {
    return {
      x: a.x - delta.x * r,
      y: a.y - delta.y * r
    }
  })
}

function resolvePattern(pattern, sourceAnchor, center, targetAnchor, delta1, delta2) {
  const seq1 = []
  if (/^(.)\1\1/.test(pattern)) {
    seq1.push(...getPointsAt(sourceAnchor, center, [0.25, 0.5, 0.75]))
  } else {
    const control1A = resolveDirection(sourceAnchor, pattern[0], delta1)
    const center1 = resolveDirection(control1A, pattern[1], delta1)
    const control1B = resolveDirection(center, pattern[2], delta1, true)
    if (/^(.)\1/.test(pattern)) {
      // const center1Alt = getPointsAt(control1B, center, [0.9])[0]
      const center1Alt = getPointsAt(center1, control1B, [0.9])[0]
      seq1.push(center1, center1Alt, control1B)
    } else {
      seq1.push(control1A, center1, control1B)
    }
  }

  const seq2 = []
  if (/(.)\1\1$/.test(pattern)) {
    seq2.push(...getPointsAt(center, targetAnchor, [0.25, 0.5, 0.75]))
  } else {
    const control2B = resolveDirection(targetAnchor, pattern[5], delta2, true)
    const center2 = resolveDirection(control2B, pattern[4], delta2, true)
    const control2A = resolveDirection(center, pattern[3], delta2)
    if (/(.)\1$/.test(pattern)) {
      // const center2Alt = getPointsAt(center, control2A, [0.1])[0]
      const center2Alt = getPointsAt(center2, control2A, [0.9])[0]
      seq2.push(control2A, center2Alt, center2)
    } else {
      seq2.push(control2A, center2, control2B)
    }
  }

  // const control2B = resolveDirection(targetAnchor, pattern[5], delta2, true)
  // const center2 = resolveDirection(control2B, pattern[4], delta2, true)
  // const control2A = resolveDirection(center, pattern[3], delta2)

  // const seq2 = pattern[4] === pattern[5] ? [center2, control2B, control2B] : [control2A, center2, control2B]

  return [sourceAnchor, ...seq1, center, ...seq2, targetAnchor]
}

function resolveDirection(anchor, dir, delta, inverse) {
  if (inverse) {
    const dirs = ['→', '↘', '↓', '↙', '←', '↖', '↑', '↗']
    dir = dirs[(dirs.indexOf(dir) + 4) % 8]
  }
  const buffer = 0
  switch (dir) {
    case '→': {
      return {
        x: anchor.x + Math.max(buffer, (Math.abs(delta.x) - Math.abs(delta.y)) / 2),
        y: anchor.y
      }
    }
    case '↘': {
      const buffer = Math.min(Math.abs(delta.x) / 2, Math.abs(delta.y) / 2)
      return {
        x: anchor.x + buffer,
        y: anchor.y + buffer
      }
    }
    case '↓': {
      return {
        x: anchor.x,
        y: anchor.y + Math.max(buffer, (Math.abs(delta.y) - Math.abs(delta.x)) / 2)
      }
    }
    case '↙': {
      const buffer = Math.min(Math.abs(delta.x) / 2, Math.abs(delta.y) / 2)
      return {
        x: anchor.x - buffer,
        y: anchor.y + buffer
      }
    }
    case '←': {
      return {
        x: anchor.x - (Math.abs(delta.x) - Math.abs(delta.y)) / 2,
        y: anchor.y
      }
    }
    case '↖': {
      const buffer = Math.min(Math.abs(delta.x) / 2, Math.abs(delta.y) / 2)
      return {
        x: anchor.x - buffer,
        y: anchor.y - buffer
      }
    }
    case '↑': {
      return {
        x: anchor.x,
        y: anchor.y - Math.max(buffer, (Math.abs(delta.y) - Math.abs(delta.x)) / 2)
      }
    }
    case '↗': {
      const buffer = Math.min(Math.abs(delta.x) / 2, Math.abs(delta.y) / 2)
      return {
        x: anchor.x + buffer,
        y: anchor.y - buffer
      }
    }
  }
}

function computePoints() {
  if (route.name === 'graph') {
    const offset = terminusStore.offset
    const source = canvasStore.nodes[props.edge.source]
    const target = canvasStore.nodes[props.edge.target]
    if (source == null || target == null) return
    // FLOWCHART – draw edges using line segments at 45° angles

    const edge = props.edge.x != null &&
      props.edge.y != null && { x: props.edge.x + offset.x, y: props.edge.y + offset.y }

    const dir1 = getDirection(source, edge || target)
    const dir2 = getDirection(edge || source, target)

    const sourceAnchor = getAnchor(source, dir1)
    const targetAnchor = getAnchor(target, dir2, true)

    const { center, delta1, delta2 } = getDeltaAndCenter(sourceAnchor, targetAnchor, edge)

    const pattern = `${dir1}${getEncasedDirection(dir1, delta1)}${dir1}${dir2}${getEncasedDirection(
      dir2,
      delta2
    )}${dir2}`

    points.value = resolvePattern(
      streamlinePattern(pattern),
      sourceAnchor,
      edge || center,
      targetAnchor,
      delta1,
      delta2
    )
  } else {
    // use proxy position if **either** target or source have a proxy position
    const source = (!props.edge.proxy?.source && props.edge.proxy?.target) || canvasStore.nodes[props.edge.source]
    const target = (!props.edge.proxy?.target && props.edge.proxy?.source) || canvasStore.nodes[props.edge.target]

    if (source == null || target == null) {
      return
    }

    // NETWORK – Draw edge on source-target staight, stopping at node bounds
    const straight = [
      { x: source.x, y: source.y },
      { x: target.x, y: target.y }
    ]

    if (props.edge.offset) {
      const delta = {
        x: target.x - source.x,
        y: target.y - source.y
      }
      const length = Math.sqrt(Math.pow(delta.x, 2) + Math.pow(delta.y, 2))
      const norm = {
        x: delta.x / length,
        y: delta.y / length
      }

      const offset = {
        x: norm.y * 5 * (props.edge.contradict ? 1 : props.edge.offset),
        y: -norm.x * 5 * (props.edge.contradict ? 1 : props.edge.offset)
      }

      straight[0].x += offset.x
      straight[0].y += offset.y
      straight[1].x += offset.x
      straight[1].y += offset.y
    }

    // only check plausible rect edges (i.e. one vertical and one horizontal per node)
    const above = source.y < target.y
    const left = source.x < target.x

    let pSource = straight[0]
    if (source.centerBounds != null) {
      const hSource = [
        { x: source.centerBounds.left, y: source.centerBounds[above ? 'bottom' : 'top'] },
        { x: source.centerBounds.right, y: source.centerBounds[above ? 'bottom' : 'top'] }
      ]
      const vSource = [
        { x: source.centerBounds[left ? 'right' : 'left'], y: source.centerBounds.top },
        { x: source.centerBounds[left ? 'right' : 'left'], y: source.centerBounds.bottom }
      ]
      pSource = lineIntersect(straight, hSource) || lineIntersect(straight, vSource) || pSource
    }

    let pTarget = straight[1]
    if (target.centerBounds != null) {
      const hTarget = [
        { x: target.centerBounds.left, y: target.centerBounds[above ? 'top' : 'bottom'] },
        { x: target.centerBounds.right, y: target.centerBounds[above ? 'top' : 'bottom'] }
      ]
      const vTarget = [
        { x: target.centerBounds[left ? 'left' : 'right'], y: target.centerBounds.top },
        { x: target.centerBounds[left ? 'left' : 'right'], y: target.centerBounds.bottom }
      ]
      pTarget = lineIntersect(straight, hTarget) || lineIntersect(straight, vTarget) || pTarget
    }

    if (!pSource || !pTarget) {
      return
    }
    const p = []

    const segments = 8
    const delta = {
      x: pSource.x - pTarget.x,
      y: pSource.y - pTarget.y
    }
    for (let i = 0; i <= segments; i++) {
      p.push({
        x: pSource.x - (delta.x / segments) * i,
        y: pSource.y - (delta.y / segments) * i
      })
    }

    points.value = p.map(({ x, y }) => ({ x: Math.round(x), y: Math.round(y) }))
  }
}

function getDeltaAndCenter(sourceAnchor, targetAnchor, center) {
  const delta = {
    x: sourceAnchor.x - targetAnchor.x,
    y: sourceAnchor.y - targetAnchor.y
  }
  center = center || {
    x: sourceAnchor.x - delta.x / 2,
    y: sourceAnchor.y - delta.y / 2
  }
  const delta1 = {
    x: sourceAnchor.x - center.x,
    y: sourceAnchor.y - center.y
  }
  const delta2 = {
    x: center.x - targetAnchor.x,
    y: center.y - targetAnchor.y
  }
  return { delta, center, delta1, delta2 }
}

const path = computed(() => {
  if (!points.value?.length) return null
  const p = points.value.map((p) => `${p.x},${p.y}`)

  return `M${p[0]} C${p[1]} ${p[1]} ${p[2]} C ${p[3]} ${p[3]} ${p[4]} C ${p[5]} ${p[5]} ${p[6]} C ${p[7]} ${p[7]} ${p[8]}`
  // return `M${p[0]} L${p[1]} ${p[1]} ${p[2]} L ${p[3]} ${p[3]} ${p[4]} L ${p[5]} ${p[5]} ${p[6]} L ${p[7]} ${p[7]} ${p[8]} `
})

const midPoint = computed(() => {
  if (vertical.value) return { x: points.value[4].x - 25, y: points.value[4].y }
  if (!props.edge.multitude) {
    if (props.edge.contradict === true) return points.value?.[4 + Math.abs(props.edge.offset)]
    if (props.edge.contradict === false) return points.value?.[4 + props.edge.offset]
  }
  return points.value?.[4]
})

// const vertical = computed(
//   () => points.value?.length > 0 && points.value?.[0].x === points.value?.[points.value?.length - 1].x
// )

const vertical = false

const showEditModal = ref(false)
function onClick() {
  if (!props.interactive) return
  if (composeStore.movingEdge != null) {
    composeStore.movingEdge = null
    return
  }
  showEditModal.value = true
}

const sourceLevel = computed(
  () =>
    terminusStore.states.findLast((state) => state.node === props.edge.source && state.timestamp <= syncStore.time)
      ?.level ?? viewStore.stateLevelDefault
)

const targetLevel = computed(
  () =>
    terminusStore.states.findLast((state) => state.node === props.edge.target && state.timestamp <= syncStore.time)
      ?.level ?? viewStore.stateLevelDefault
)

const level = computed(() => {
  return Math.min(sourceLevel.value, targetLevel.value)
})

const gradient = computed(() => {
  if (props.edge.proxy == null) return 'gradient-none'
  if (props.edge.proxy.source && props.edge.proxy.target) return 'gradient-both'
  if (props.edge.proxy.source) return 'gradient-end'
  return 'gradient-start'
})

function onMouseDown(e) {
  if (mode.value !== MODE_COMPOSE) return
  e.stopPropagation()
  composeStore.moveEdge(props.edge['@id'], { x: midPoint.value.x, y: midPoint.value.y }, { x: e.x, y: e.y })
}
</script>

<template>
  <g
    class="edge"
    :style="color"
    :class="[`level-${level}`, viewClass, viewStore.modeClass, gradient, { activity: !viewStore.inactivityShort }]"
  >
    <BaseInterpolate
      :props="{
        x1: points?.[0]?.x ?? 0,
        y1: points?.[0]?.y ?? 0,
        x2: points?.[4]?.x ?? 0,
        y2: points?.[4]?.y ?? 0,
        path
      }"
      :delay="0"
      :duration="2000"
      v-slot="value"
    >
      <g>
        <defs>
          <marker :id="`marker-${id}`" markerWidth="10" markerHeight="20" refX="10" refY="10" orient="auto">
            <path d="M0,0 L10,10 L0,20" />
          </marker>

          <linearGradient
            gradientUnits="userSpaceOnUse"
            :x1="value.x1"
            :y1="value.y1"
            :x2="value.x2"
            :y2="value.y2"
            :id="`gradient-${id}`"
          >
            <stop offset="0%" stop-color="var(--gradient-1)" :id="`stop1-${id}`" />
            <stop offset="25%" stop-color="var(--gradient-2)" :id="`stop2-${id}`" />
            <stop offset="75%" stop-color="var(--gradient-3)" :id="`stop3-${id}`" />
            <stop offset="100%" stop-color="var(--gradient-4)" :id="`stop4-${id}`" />
          </linearGradient>
        </defs>
        <path v-if="viewStore.mode === MODE_COMPOSE" class="events" :d="path" />
        <path
          :id="id"
          class="path"
          :d="viewStore.mode === MODE_VIEW ? value.path : path"
          :marker-end="`url('#marker-${id}')`"
          :style="{ stroke: `url(#gradient-${id})` }"
        />
        <template v-if="midPoint">
          <g
            :class="{ hide: props.edge.proxy != null || props.edge.plurality }"
            class="label"
            :style="{ transform: `translate(${midPoint.x}px, ${midPoint.y}px)` }"
          >
            <text
              :lang="label.lang"
              class="shadow"
              :class="{ vertical, unset: label.text == null }"
              @mousedown="onMouseDown"
              @click="onClick"
            >
              {{ label.text ?? '[?]' }}
            </text>
            <text :lang="label.lang" :class="{ vertical, unset: label.text == null }">
              {{ label.text ?? '[?]' }}
            </text>
          </g>
        </template>

        <foreignObject>
          <Teleport to="#modals">
            <ModalEdit :show="showEditModal" :id="id" type="edge" @close="showEditModal = false" />
          </Teleport>
        </foreignObject>
      </g>
    </BaseInterpolate>
  </g>
</template>

<style lang="scss" scoped>
.edge {
  user-select: none;
  pointer-events: none;
  mix-blend-mode: var(--default-blend-mode);
  transition: all var(--transition-extended-half);

  &.activity {
    transition: all var(--transition);
  }
  defs stop {
    transition: stop-color var(--transition-extended);
  }

  path {
    fill: none;
  }

  --marker: var(--edge-color);
  &.gradient-none {
    --gradient-1: var(--edge-color);
    --gradient-2: var(--edge-color);
    --gradient-3: var(--edge-color);
    --gradient-4: var(--edge-color);
  }

  &.gradient-both {
    opacity: 0.6;
    --gradient-1: var(--edge-color);
    --gradient-2: color-mix(in lab, var(--edge-color), transparent 99%);
    --gradient-3: color-mix(in lab, var(--edge-color), transparent 99%);
    --gradient-4: var(--edge-color);
  }

  &.gradient-start {
    opacity: 0.6;
    --gradient-1: color-mix(in lab, var(--edge-color), transparent 99%);
    --gradient-2: color-mix(in lab, var(--edge-color), transparent 75%);
    --gradient-3: color-mix(in lab, var(--edge-color), transparent 25%);
    --gradient-4: var(--edge-color);
  }

  &.gradient-end {
    opacity: 0.6;
    --gradient-1: var(--edge-color);
    --gradient-2: color-mix(in lab, var(--edge-color), transparent 25%);
    --gradient-3: color-mix(in lab, var(--edge-color), transparent 75%);
    --gradient-4: color-mix(in lab, var(--edge-color), transparent 99%);
    --marker: color-mix(in lab, var(--edge-color), transparent 99%);
  }

  marker {
    overflow: visible;
    path {
      stroke: var(--marker);
    }
  }
  .events {
    stroke-width: 20;
    stroke: transparent;
    pointer-events: all;
  }
  .path {
    stroke-width: 1;
    // stroke: var(--edge-color);
  }

  &.mode-view {
    path {
      transition: stroke var(--transition-extended);
    }
    .label {
      transition: all var(--transition-extended);
      text {
        transition: all var(--transition-extended);
      }

      &.label-enter-active {
        transition: opacity var(--transition-extended-half) var(--transition-extended-half);
      }
      &.label-leave-active {
        transition: opacity var(--transition-extended-half);
      }

      &.label-enter-from,
      &.label-leave-to,
      &.hide {
        opacity: 0;
      }
    }
  }

  text {
    fill: color-mix(in lab, var(--edge-color), var(--text-base) 40%);
    font-size: var(--font-size);
    font-weight: var(--light);
    pointer-events: none;
    text-anchor: middle;
    dominant-baseline: middle;

    &.shadow {
      stroke: var(--background-color);
      stroke-width: 8px;
    }

    &.vertical {
      text-anchor: start;
    }
  }

  &.mode-compose {
    text.shadow {
      pointer-events: all;
      cursor: pointer;
    }
  }

  &:not(.mode-compose) {
    text.unset {
      fill: none;
      stroke: none;
    }
  }

  &:hover {
    .path {
      stroke: var(--edge-color-accent);
    }
    text {
      fill: var(--background-color);

      &.shadow {
        stroke-width: 50;
        clip-path: inset(-5px -10px -5px -10px round 50px);
        stroke: var(--edge-color);
      }
    }
  }

  &.level-0:not(.mode-compose, .activity:not(.mode-couple), .view-entity) {
    filter: blur(8px);
    opacity: 0;
  }
  &.level-1:not(.mode-compose, .activity:not(.mode-couple), .view-entity) {
    filter: blur(8px);
    opacity: 0.2;
  }
  // &.level-2:not(.mode-compose) {
  //   path.path {
  //   }
  // }
  // &.level-3:not(.mode-compose, .view-entity) {
  //   marker {
  //     path {
  //       stroke: var(--accent);
  //     }
  //   }
  //   path.path {
  //     stroke: var(--accent);
  //   }
  //   text {
  //     fill: var(--accent);
  //   }
  // }
}
</style>
