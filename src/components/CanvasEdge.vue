<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useTerminusStore } from '@/stores/terminus'
import { useSyncStore } from '@/stores/sync'
import { useViewStore } from '@/stores/view'
import { useCanvasStore } from '@/stores/canvas'
import { lineIntersect } from '@/assets/js/utils'
import ModalEdit from './modals/ModalEdit.vue'
import { MODE_COMPOSE, MODE_VIEW } from '@/assets/js/constants'

import BaseInterpolate from '@/components/BaseInterpolate.vue'

const terminusStore = useTerminusStore()
const syncStore = useSyncStore()
const viewStore = useViewStore()
const canvasStore = useCanvasStore()

const route = useRoute()

const viewClass = computed(() => `view-${route.name}`)

const props = defineProps({ edge: Object, interactive: Boolean })

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

watch(() => [canvasStore.nodes[props.edge.source], canvasStore.nodes[props.edge.target]], computePoints, {
  immediate: true
})

function computePoints() {
  const offset = canvasStore.offset

  if (route.name === 'graph') {
    const source = canvasStore.nodes[props.edge.source]
    const target = canvasStore.nodes[props.edge.target]
    if (source == null || target == null) return
    // FLOWCHART – draw edges using line segments at 45° angles
    const buffer = 40
    const alignHorizontally =
      target.bounds.bottom > source.bounds.top - buffer && target.bounds.top < source.bounds.bottom + buffer
    const alignVertically =
      target.bounds.right > source.bounds.left - buffer && target.bounds.left < source.bounds.right + buffer

    const stubSize = 15
    if (alignHorizontally && !alignVertically) {
      // HORIZONTAL
      const sourceAnchor = {
        x: source.bounds[source.x < target.x ? 'right' : 'left'],
        y: source.bounds.top + offset.y
      }
      const targetAnchor = {
        x: target.bounds[source.x < target.x ? 'left' : 'right'],
        y: target.bounds.top + offset.y
      }
      const delta = {
        x: sourceAnchor.x - targetAnchor.x,
        y: sourceAnchor.y - targetAnchor.y
      }
      const center = {
        x: sourceAnchor.x - delta.x / 2,
        y: sourceAnchor.y - delta.y / 2
      }
      if (Math.abs(delta.x) > Math.abs(delta.y) + stubSize * 2) {
        points.value = [
          sourceAnchor,
          { x: center.x - Math.abs(delta.y / 2) * (delta.x > 0 ? -1 : 1), y: sourceAnchor.y },
          center,
          { x: center.x + Math.abs(delta.y / 2) * (delta.x > 0 ? -1 : 1), y: targetAnchor.y },
          targetAnchor
        ]
      } else {
        points.value = [
          sourceAnchor,
          { x: center.x, y: sourceAnchor.y },
          center,
          { x: center.x, y: targetAnchor.y },
          targetAnchor
        ]
      }
    } else if (alignVertically && !alignHorizontally) {
      // VERTICAL
      const sourceAnchor = {
        x: source.bounds.left + offset.x,
        y: source.bounds[source.y < target.y ? 'bottom' : 'top']
      }
      const targetAnchor = {
        x: target.bounds.left + offset.x,
        y: target.bounds[source.y < target.y ? 'top' : 'bottom']
      }
      const delta = {
        x: sourceAnchor.x - targetAnchor.x,
        y: sourceAnchor.y - targetAnchor.y
      }
      const center = {
        x: sourceAnchor.x - delta.x / 2,
        y: sourceAnchor.y - delta.y / 2
      }
      if (Math.abs(delta.y) > Math.abs(delta.x) + stubSize * 2) {
        points.value = [
          sourceAnchor,
          { x: sourceAnchor.x, y: center.y - Math.abs(delta.x / 2) * (delta.y > 0 ? -1 : 1) },
          center,
          { x: targetAnchor.x, y: center.y + Math.abs(delta.x / 2) * (delta.y > 0 ? -1 : 1) },
          targetAnchor
        ]
      } else {
        points.value = [
          sourceAnchor,
          { x: sourceAnchor.x, y: center.y },
          center,
          { x: targetAnchor.x, y: center.y },
          targetAnchor
        ]
      }
    } else if (!alignVertically && !alignHorizontally) {
      // DIAGONAL
      if (source.x < target.x) {
        if (source.y < target.y) {
          // ↘↘↘
          const sourceAnchor = { x: source.bounds.right, y: source.bounds.bottom }
          const targetAnchor = { x: target.bounds.left, y: target.bounds.top }

          const delta = {
            x: sourceAnchor.x - targetAnchor.x,
            y: sourceAnchor.y - targetAnchor.y
          }
          const center = {
            x: sourceAnchor.x - delta.x / 2,
            y: sourceAnchor.y - delta.y / 2
          }

          if (Math.abs(delta.x) < Math.abs(delta.y)) {
            points.value = [
              sourceAnchor,
              { x: sourceAnchor.x - delta.x / 2, y: sourceAnchor.y - delta.x / 2 },
              center,
              { x: targetAnchor.x + delta.x / 2, y: targetAnchor.y + delta.x / 2 },
              targetAnchor
            ]
          } else {
            points.value = [
              sourceAnchor,
              { x: sourceAnchor.x - delta.y / 2, y: sourceAnchor.y - delta.y / 2 },
              center,
              { x: targetAnchor.x + delta.y / 2, y: targetAnchor.y + delta.y / 2 },
              targetAnchor
            ]
          }
        } else {
          // ↗↗↗
          const sourceAnchor = { x: source.bounds.right, y: source.bounds.top }
          const targetAnchor = { x: target.bounds.left, y: target.bounds.bottom }

          const delta = {
            x: sourceAnchor.x - targetAnchor.x,
            y: sourceAnchor.y - targetAnchor.y
          }
          const center = {
            x: sourceAnchor.x - delta.x / 2,
            y: sourceAnchor.y - delta.y / 2
          }

          if (Math.abs(delta.x) < Math.abs(delta.y)) {
            points.value = [
              sourceAnchor,
              { x: sourceAnchor.x - delta.x / 2, y: sourceAnchor.y + delta.x / 2 },
              center,
              { x: targetAnchor.x + delta.x / 2, y: targetAnchor.y - delta.x / 2 },
              targetAnchor
            ]
          } else {
            points.value = [
              sourceAnchor,
              { x: sourceAnchor.x + delta.y / 2, y: sourceAnchor.y - delta.y / 2 },
              center,
              { x: targetAnchor.x - delta.y / 2, y: targetAnchor.y + delta.y / 2 },
              targetAnchor
            ]
          }
        }
      } else {
        if (source.y < target.y) {
          // ↙↙↙
          const sourceAnchor = { x: source.bounds.left, y: source.bounds.bottom }
          const targetAnchor = { x: target.bounds.right, y: target.bounds.top }

          const delta = {
            x: sourceAnchor.x - targetAnchor.x,
            y: sourceAnchor.y - targetAnchor.y
          }
          const center = {
            x: sourceAnchor.x - delta.x / 2,
            y: sourceAnchor.y - delta.y / 2
          }

          if (Math.abs(delta.x) < Math.abs(delta.y)) {
            points.value = [
              sourceAnchor,
              { x: sourceAnchor.x - delta.x / 2, y: sourceAnchor.y + delta.x / 2 },
              center,
              { x: targetAnchor.x + delta.x / 2, y: targetAnchor.y - delta.x / 2 },
              targetAnchor
            ]
          } else {
            points.value = [
              sourceAnchor,
              { x: sourceAnchor.x + delta.y / 2, y: sourceAnchor.y - delta.y / 2 },
              center,
              { x: targetAnchor.x - delta.y / 2, y: targetAnchor.y + delta.y / 2 },
              targetAnchor
            ]
          }
        } else {
          // ↖↖↖
          const sourceAnchor = { x: source.bounds.left, y: source.bounds.top }
          const targetAnchor = { x: target.bounds.right, y: target.bounds.bottom }

          const delta = {
            x: sourceAnchor.x - targetAnchor.x,
            y: sourceAnchor.y - targetAnchor.y
          }
          const center = {
            x: sourceAnchor.x - delta.x / 2,
            y: sourceAnchor.y - delta.y / 2
          }

          if (Math.abs(delta.x) < Math.abs(delta.y)) {
            points.value = [
              sourceAnchor,
              { x: sourceAnchor.x - delta.x / 2, y: sourceAnchor.y - delta.x / 2 },
              center,
              { x: targetAnchor.x + delta.x / 2, y: targetAnchor.y + delta.x / 2 },
              targetAnchor
            ]
          } else {
            points.value = [
              sourceAnchor,
              { x: sourceAnchor.x - delta.y / 2, y: sourceAnchor.y - delta.y / 2 },
              center,
              { x: targetAnchor.x + delta.y / 2, y: targetAnchor.y + delta.y / 2 },
              targetAnchor
            ]
          }
        }
      }
    }
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
    const segments = 4
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

const path = computed(() => {
  if (!points.value?.length) return null
  const p = points.value.map((p) => `${p.x},${p.y}`)
  return `M${p[0]} C${p[1]} ${p[1]} ${p[2]} C${p[3]} ${p[3]} ${p[4]}`
})

const midPoint = computed(() => {
  if (vertical.value) return { x: points.value[2].x - 25, y: points.value[2].y }
  if (!props.edge.multitude) {
    if (props.edge.contradict === true) return points.value?.[2 + Math.abs(props.edge.offset)]
    if (props.edge.contradict === false) return points.value?.[2 + props.edge.offset]
  }
  return points.value?.[2]
})

const vertical = computed(
  () => points.value?.length > 0 && points.value?.[0].x === points.value?.[points.value?.length - 1].x
)

const showEditModal = ref(false)
function onClick() {
  if (!props.interactive) return
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
</script>

<template>
  <g
    class="edge"
    :style="color"
    :class="[`level-${level}`, viewClass, viewStore.modeClass, gradient, { activity: !viewStore.inactivityShort }]"
    @click="onClick"
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
            <text :lang="label.lang" class="shadow" :class="{ vertical }">
              {{ label.text }}
            </text>
            <text :lang="label.lang" :class="{ vertical }">
              {{ label.text }}
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

    transition: all var(--transition);

    dominant-baseline: middle;
    &.shadow {
      stroke: var(--background-color);
      stroke-width: 8px;
    }

    &.vertical {
      text-anchor: start;
    }
  }

  &:hover {
    .path {
      stroke: var(--edge-color-accent);
    }
    text {
      fill: var(--edge-color-accent);
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
