<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useTerminusStore } from '@/stores/terminus'
import { useSyncStore } from '@/stores/sync'
import { useViewStore } from '@/stores/view'
import { useCanvasStore } from '@/stores/canvas'
import { lineIntersect } from '@/assets/js/utils'
import ModalEdit from './modals/ModalEdit.vue'
import { MODE_COMPOSE } from '@/assets/js/constants'

const terminusStore = useTerminusStore()
const syncStore = useSyncStore()
const viewStore = useViewStore()
const canvasStore = useCanvasStore()

const route = useRoute()

const viewClass = computed(() => `view-${route.name}`)

const props = defineProps({ edge: Object, interactive: Boolean })

const label = computed(() => {
  if (props.edge.proxy != null) return null
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

watch(() => [canvasStore.nodes[props.edge.source], canvasStore.nodes[props.edge.target]], computePoints)

function computePoints() {
  const offset = canvasStore.offset

  if (route.name === 'graph') {
    const source = canvasStore.nodes[props.edge.source]
    const target = canvasStore.nodes[props.edge.target]
    if (source == null || target == null) return (points.value = null)
    // FLOWCHART – draw edges using line segments at 45° angles
    const buffer = 20
    const alignHorizontally =
      target.bounds.bottom > source.bounds.top + buffer && target.bounds.top < source.bounds.bottom + buffer
    const alignVertically =
      target.bounds.right > source.bounds.left + buffer && target.bounds.left < source.bounds.right + buffer
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
      return (points.value = null)
    }

    // NETWORK – Draw edge on source-target staight, stopping at node bounds
    const straight = [
      { x: source.x, y: source.y },
      { x: target.x, y: target.y }
    ]

    // only check plausible rect edges (i.e. one vertical and one horizontal per node)
    const above = source.y < target.y
    const left = source.x < target.x

    let pSource = straight[0]
    if (source.bounds != null) {
      const hSource = [
        { x: source.bounds.left, y: source.bounds[above ? 'bottom' : 'top'] },
        { x: source.bounds.right, y: source.bounds[above ? 'bottom' : 'top'] }
      ]
      const vSource = [
        { x: source.bounds[left ? 'right' : 'left'], y: source.bounds.top },
        { x: source.bounds[left ? 'right' : 'left'], y: source.bounds.bottom }
      ]
      pSource = lineIntersect(straight, hSource) || lineIntersect(straight, vSource) || pSource
    }

    let pTarget = straight[1]
    if (target.bounds != null) {
      const hTarget = [
        { x: target.bounds.left, y: target.bounds[above ? 'top' : 'bottom'] },
        { x: target.bounds.right, y: target.bounds[above ? 'top' : 'bottom'] }
      ]
      const vTarget = [
        { x: target.bounds[left ? 'left' : 'right'], y: target.bounds.top },
        { x: target.bounds[left ? 'left' : 'right'], y: target.bounds.bottom }
      ]
      pTarget = lineIntersect(straight, hTarget) || lineIntersect(straight, vTarget) || pTarget
    }

    if (!pSource || !pTarget) {
      return (points.value = null)
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

    points.value = p
  }
}

const path = computed(() => {
  if (!points.value?.length) return null
  const p = points.value.map((p) => `${p.x},${p.y}`)
  return `M${p[0]} C${p[1]} ${p[1]} ${p[2]} C${p[3]} ${p[3]} ${p[4]}`
})

const midPoint = computed(() => {
  if (vertical.value) return { x: points.value[2].x - 25, y: points.value[2].y }
  return points.value?.[2]
})

const vertical = computed(
  () => points.value?.length > 0 && points.value?.[0].x === points.value?.[points.value?.length - 1].x
)

const arrow = computed(() => (props.edge.source.x <= props.edge.target.x ? 'end' : 'start'))

const showEditModal = ref(false)
function onClick() {
  if (!props.interactive) return
  showEditModal.value = true
}

function update() {
  terminusStore.getGraph(terminusStore.graph)
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
    :class="[`level-${level}`, viewClass, viewStore.modeClass, gradient, { activity: viewStore.activity }]"
    @click="onClick"
  >
    <g>
      <defs>
        <marker :id="`marker-${id}`" markerWidth="10" markerHeight="20" refX="10" refY="10" orient="auto">
          <path d="M0,0 L10,10 L0,20" />
        </marker>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          :x1="points?.[0]?.x"
          :y1="points?.[0]?.y"
          :x2="points?.[4]?.x"
          :y2="points?.[4]?.y"
          :id="`gradient-${id}`"
        >
          <stop offset="0%" stop-color="var(--gradient-1)" />
          <stop offset="25%" stop-color="var(--gradient-2)" />
          <stop offset="75%" stop-color="var(--gradient-3)" />
          <stop offset="100%" stop-color="var(--gradient-4)" />
        </linearGradient>
      </defs>
      <path v-if="viewStore.mode === MODE_COMPOSE" class="events" :d="path" />
      <path
        :id="id"
        class="path"
        :class="[arrow]"
        :d="path"
        :marker-end="`url('#marker-${id}')`"
        :style="{ stroke: `url(#gradient-${id})` }"
      />
      <template v-if="midPoint">
        <g v-if="label" class="label" :style="{ transform: `translate(${midPoint.x}px, ${midPoint.y}px)` }">
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
          <ModalEdit :show="showEditModal" :id="id" type="edge" @close="showEditModal = false" @update="update" />
        </Teleport>
      </foreignObject>
    </g>
  </g>
</template>

<style lang="scss" scoped>
.edge {
  user-select: none;
  pointer-events: none;
  transition: all var(--transition);

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
    opacity: 0.4;
    --gradient-1: var(--edge-color);
    --gradient-2: color-mix(in lab, var(--edge-color), transparent 80%);
    --gradient-3: color-mix(in lab, var(--edge-color), transparent 80%);
    --gradient-4: var(--edge-color);
  }

  &.gradient-start {
    opacity: 0.4;
    --gradient-1: color-mix(in lab, var(--edge-color), transparent 100%);
    --gradient-2: color-mix(in lab, var(--edge-color), transparent 75%);
    --gradient-3: color-mix(in lab, var(--edge-color), transparent 25%);
    --gradient-4: var(--edge-color);
  }

  &.gradient-end {
    opacity: 0.4;
    --gradient-1: var(--edge-color);
    --gradient-2: color-mix(in lab, var(--edge-color), transparent 25%);
    --gradient-3: color-mix(in lab, var(--edge-color), transparent 75%);
    --gradient-4: color-mix(in lab, var(--edge-color), transparent 100%);
    --marker: color-mix(in lab, var(--edge-color), transparent 100%);
  }

  marker {
    overflow: visible;
    path {
      stroke: var(--marker);
    }
  }
  .events {
    stroke-width: 20;
    pointer-events: all;
  }
  .path {
    stroke-width: 1;
    // stroke: var(--edge-color);
  }

  &.mode-view {
    path {
      transition: all var(--transition-extended);
    }
    .label {
      transition: all var(--transition-extended);
      text {
        transition: all var(--transition-extended);
      }
    }
  }

  text {
    fill: var(--edge-color);
    font-size: var(--font-size);
    font-weight: var(--light);
    pointer-events: none;
    text-anchor: middle;

    transition: all var(--transition);

    dominant-baseline: middle;
    &.shadow {
      stroke: #fff;
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
    &.mode-view {
      transition: all var(--transition-extended);
    }
  }
  &.level-1:not(.mode-compose, .activity:not(.mode-couple), .view-entity) {
    filter: blur(8px);
    opacity: 0.2;

    &.mode-view {
      transition: all var(--transition-extended);
    }
  }
  &.level-2:not(.mode-compose) {
    path.path {
    }
  }
  &.level-3:not(.mode-compose, .view-entity) {
    marker {
      path {
        stroke: var(--accent);
      }
    }
    path.path {
      stroke: var(--accent);
    }
    text {
      fill: var(--accent);
    }
  }
}
</style>
