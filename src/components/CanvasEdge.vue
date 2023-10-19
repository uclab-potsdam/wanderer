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

const props = defineProps({ edge: Object, interactive: Boolean, displayRemoteStyle: Boolean })

const label = computed(() => {
  const propertyClass = terminusStore.properties.find((c) => c['@id'] === props.edge.property)
  return propertyClass?.label ? viewStore.localize(propertyClass.label) : {}
})

const id = computed(() => {
  return (props.edge.id || props.edge['@id'] || 'some-path').replace(/%/g, '-')
})

const points = ref([])

watch(
  () => canvasStore.nodes, // check if we can limit that to only update when source or target node changes
  () => {
    const source = canvasStore.nodes[props.edge.source]
    const target = canvasStore.nodes[props.edge.target]
    const offset = canvasStore.offset

    if (source == null || target == null) return (points.value = [])

    if (route.name === 'graph') {
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
      // check falling through to here if no nice edge could be drawn

      // NETWORK – Draw edge on source-target staight, stopping at node bounds
      const straight = [
        { x: source.x, y: source.y },
        { x: target.x, y: target.y }
      ]
      // only check plausible rect edges (i.e. one vertical and one horizontal per node)
      const above = source.y < target.y
      const left = source.x < target.x

      const hSource = [
        { x: source.bounds.left, y: source.bounds[above ? 'bottom' : 'top'] },
        { x: source.bounds.right, y: source.bounds[above ? 'bottom' : 'top'] }
      ]
      const hTarget = [
        { x: target.bounds.left, y: target.bounds[above ? 'top' : 'bottom'] },
        { x: target.bounds.right, y: target.bounds[above ? 'top' : 'bottom'] }
      ]

      const vSource = [
        { x: source.bounds[left ? 'right' : 'left'], y: source.bounds.top },
        { x: source.bounds[left ? 'right' : 'left'], y: source.bounds.bottom }
      ]
      const vTarget = [
        { x: target.bounds[left ? 'left' : 'right'], y: target.bounds.top },
        { x: target.bounds[left ? 'left' : 'right'], y: target.bounds.bottom }
      ]

      const pSource = lineIntersect(straight, hSource) || lineIntersect(straight, vSource)
      const pTarget = lineIntersect(straight, hTarget) || lineIntersect(straight, vTarget)

      if (!pSource || !pTarget) return (points.value = [])
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
      // const midpoints p
      points.value = p // [pSource, pTarget]
    }

    // function closeToCorner(point, corner) {
    //   const limit = 35
    //   return Math.abs(point.x - corner.x) < limit && Math.abs(point.y - corner.y) < limit
    // }

    // const cornerSource = { x: vSource[0].x, y: hSource[0].y }
    // const dirSource = pSource.x === cornerSource.x ? 'horizontal' : 'vertical'
    // const diaSource = closeToCorner(pSource, cornerSource)
    // const cornerTarget = { x: vTarget[0].x, y: hTarget[0].y }
    // const dirTarget = pTarget.x === cornerTarget.x ? 'horizontal' : 'vertical'
    // const diaTarget = closeToCorner(pTarget, cornerTarget)
    // // console.log(dirSource, diaSource, dirTarget, diaTarget)
    // const midpoints = (() => {
    //   if (!diaSource && !diaTarget) {
    //     if (dirSource === 'vertical' && dirTarget === 'vertical') {
    //       // if (pSource.x === pTarget.x)
    //       return [
    //         { x: pSource.x, y: (pSource.y + pTarget.y) / 2 },
    //         { x: pTarget.x, y: (pSource.y + pTarget.y) / 2 }
    //       ]
    //     }
    //     if (dirSource === 'horizontal' && dirTarget === 'horizontal') {
    //       return [
    //         { x: (pSource.x + pTarget.x) / 2, y: pSource.y },
    //         { x: (pSource.x + pTarget.x) / 2, y: pTarget.y }
    //       ]
    //     }
    //     if (dirSource === 'vertical' && dirTarget === 'horizontal') {
    //       return [{ x: pSource.x, y: pTarget.y }]
    //     }
    //     if (dirSource === 'horizontal' && dirTarget === 'vertical') {
    //       return [{ x: pTarget.x, y: pSource.y }]
    //     }
    //   }

    //   const dir =
    //     Math.abs(pSource.x - pTarget.x) > Math.abs(pSource.y - pTarget.y)
    //       ? 'horizontal'
    //       : 'vertical'
    //   if (diaSource && diaTarget) {
    //     if (dir === 'horizontal') {
    //       const diff =
    //         ((pSource.y - pTarget.y) / 2) *
    //         (pSource.x > pTarget.x ? -1 : 1) *
    //         (pSource.y > pTarget.y ? -1 : 1)
    //       return [
    //         { x: pSource.x - diff, y: (pSource.y + pTarget.y) / 2 },
    //         { x: pTarget.x + diff, y: (pSource.y + pTarget.y) / 2 }
    //       ]
    //     }
    //     const diff =
    //       ((pSource.x - pTarget.x) / 2) *
    //       (pSource.x > pTarget.x ? -1 : 1) *
    //       (pSource.y > pTarget.y ? -1 : 1)
    //     return [
    //       { x: (pSource.x + pTarget.x) / 2, y: pSource.y - diff },
    //       { x: (pSource.x + pTarget.x) / 2, y: pTarget.y + diff }
    //     ]
    //   }

    //   if (diaSource) {
    //     if (dir === 'vertical') {
    //       const diff =
    //         (pSource.x - pTarget.x) *
    //         (pSource.x > pTarget.x ? -1 : 1) *
    //         (pSource.y > pTarget.y ? 1 : -1)
    //       return [{ x: pTarget.x, y: pSource.y + diff }]
    //     }
    //     const diffX =
    //       ((pSource.y - pTarget.y) / 2) *
    //       (pSource.x > pTarget.x ? -1 : 1) *
    //       (pSource.y > pTarget.y ? 1 : -1)
    //     const diffY = (pSource.y - pTarget.y) / 2
    //     return [
    //       { x: pSource.x + diffX, y: pSource.y - diffY },
    //       { x: pTarget.x, y: pSource.y - diffY }
    //     ]
    //     // console.log(diaSource)
    //   }
    //   if (dir === 'horizontal') {
    //     const diff =
    //       (pSource.y - pTarget.y) *
    //       (pSource.x > pTarget.x ? -1 : 1) *
    //       (pSource.y > pTarget.y ? 1 : -1)
    //     return [{ x: pTarget.x - diff, y: pSource.y }]
    //   }
    //   const diffX =
    //     ((pSource.y - pTarget.y) / 2) *
    //     (pSource.x > pTarget.x ? -1 : 1) *
    //     (pSource.y > pTarget.y ? 1 : -1)
    //   const diffY = (pSource.y - pTarget.y) / 2
    //   return [
    //     { x: pSource.x + diffX, y: pSource.y - diffY },
    //     { x: pTarget.x, y: pSource.y - diffY }
    //   ]
    // })()
    // if (dirSource === dirTarget === 'vertical')

    //   source.center.y < target.center.y
    //     ? [source.bounds[0], source.bounds[1]]
    //     : [source.bounds[2], source.bounds[3]]
    // const sourceVertical =
    //   source.center.x < target.center.x
    //     ? [source.bounds[1], source.bounds[2]]
    //     : [source.bounds[3], source.bounds[4]]

    // const targetHorizontal =
    //   target.center.y < target.center.y
    //     ? [target.bounds[0], target.bounds[1]]
    //     : [target.bounds[2], target.bounds[3]]
    // const sourceVertical =
    //   source.center.x < target.center.x
    //     ? [source.bounds[1], source.bounds[2]]
    //     : [source.bounds[3], source.bounds[4]]

    // if (props.edge.active) return `M${source.x},${source.y}L${target.x},${target.y}`

    // const diffX = target.x - source.x
    // const diffY = target.y - source.y

    // const offsetX = 140
    // const offsetY = 70

    // const horizontal = Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > offsetX * 2

    // const direction =
    //   (horizontal && source.x < target.x) || (!horizontal && source.y < target.y) ? 1 : -1

    // const flip = (horizontal && source.y < target.y) || (!horizontal && source.x < target.x) ? 1 : -1

    // const push = horizontal ? (diffX > 0 ? -15 : +15) : diffY > 0 ? -60 : 60

    // const start = {
    //   x: horizontal ? source.x + offsetX * direction : source.x + push,
    //   y: horizontal ? source.y + push : source.y + offsetY * direction
    // }
    // const end = {
    //   x: horizontal ? target.x + offsetX * direction * -1 : target.x + push,
    //   y: horizontal ? target.y + push : target.y + offsetY * direction * -1
    // }

    // const r = Math.min(10, Math.abs(horizontal ? diffY : diffX) / 2)

    // const anchor1 = horizontal
    //   ? { x: source.x + diffX / 2, y: start.y }
    //   : { x: start.x, y: source.y + diffY / 2 }

    // const anchor2 = horizontal
    //   ? { x: source.x + diffX / 2, y: end.y }
    //   : { x: end.x, y: source.y + diffY / 2 }

    // const points = [
    //   start,
    //   {
    //     x: horizontal ? anchor1.x - r * direction : anchor1.x,
    //     y: horizontal ? anchor1.y : anchor1.y - r * direction
    //   },
    //   anchor1,
    //   {
    //     x: horizontal ? anchor1.x : anchor1.x + r * flip,
    //     y: horizontal ? anchor1.y + r * flip : anchor1.y
    //   },
    //   {
    //     x: horizontal ? anchor2.x : anchor2.x - r * flip,
    //     y: horizontal ? anchor2.y - r * flip : anchor2.y
    //   },
    //   anchor2,
    //   {
    //     x: horizontal ? anchor2.x + r * direction : anchor2.x,
    //     y: horizontal ? anchor2.y : anchor2.y + r * direction
    //   },
    //   end
    // ]

    // if (source.x > target.x) points.reverse()

    // return `M${points
    //   .map((point) => `${point.x} ${point.y}`)
    //   .reduce((a, b, i) => `${a} ${' LQ'[i % 3]}${b} `)}`
    // console.log(midpoints)
    // return `M${pSource.x},${pSource.y}${midpoints.map((p) => `L${p.x},${p.y}`).join()}L${pTarget.x},${
    //   pTarget.y
    // }`
    // points.value = [pSource, ...midpoints, pTarget]
  },
  { immediate: true, deep: true }
)
// const points = computed(() => {

// })

const path = computed(() => {
  if (!points.value?.length) return null
  // M0,200 C100,100 100,100 200,100 C300,100 300,100 400,0
  // return `M${points.value.map((p) => `${p.x},${p.y}`).join('L')}`
  const p = points.value.map((p) => `${p.x},${p.y}`)
  return `M${p[0]} C${p[1]} ${p[1]} ${p[2]} C${p[3]} ${p[3]} ${p[4]}`
})

// midpoint calculation from https://codepen.io/Maher-Fa/pen/pezdbe?editors=0010
function getPointByDistance(pnts, distance) {
  var cl = 0
  var ol
  var result
  pnts.forEach(function (point, i, points) {
    ol = cl
    cl += i ? lineLen([points[i - 1], point]) : 0
    if (distance <= cl && distance > ol) {
      var dd = distance - ol
      result = pntOnLine([points[i - 1], point], dd)
    }
  })
  return result
}
// returns a point on a single line (two points) using distance // line=[[x0,y0],[x1,y1]]
function pntOnLine(line, distance) {
  var t = distance / lineLen(line)
  var xt = (1 - t) * line[0].x + t * line[1].x
  var yt = (1 - t) * line[0].y + t * line[1].y
  return { x: xt, y: yt }
}
// returns the total length of a linestring (multiple points) // pnts=[[x0,y0],[x1,y1],[x2,y2],...]
function totalLen(pnts) {
  var tl = 0
  pnts.forEach(function (point, i, points) {
    tl += i ? lineLen([points[i - 1], point]) : 0
  })
  return tl
}
// returns the length of a line (two points) // line=[[x0,y0],[x1,y1]]
function lineLen(line) {
  var xd = line[0].x - line[1].x
  var yd = line[0].y - line[1].y
  return Math.sqrt(xd * xd + yd * yd)
}

const midPoint = computed(() => {
  var totalLength = totalLen(points.value)
  var midDistance = totalLength / 2
  var midPoint = getPointByDistance(points.value, midDistance)
  if (vertical.value) midPoint.x -= 25

  return midPoint
})

const vertical = computed(
  () => points.value.length > 0 && points.value[0].x === points.value[points.value.length - 1].x
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
</script>

<template>
  <g
    class="edge"
    :class="[`level-${level}`, viewClass, viewStore.modeClass, { activity: viewStore.activity }]"
    @click="onClick"
  >
    <path v-if="viewStore.mode === MODE_COMPOSE" class="events" :d="path" />
    <path :id="id" class="path" :class="[arrow]" :d="path" />
    <template v-if="midPoint">
      <g class="label" :style="{ transform: `translate(${midPoint.x}px, ${midPoint.y}px)` }">
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
</template>

<style lang="scss" scoped>
.edge {
  user-select: none;
  pointer-events: none;
  transition: all var(--transition);

  path {
    fill: none;
  }
  .events {
    stroke-width: 20;
    pointer-events: all;
  }
  .path {
    stroke-width: 1;
    stroke: var(--edge-stroke);
    // transition: all var(--transition);

    marker-end: url(#arrow);
    // marker-start: url(#arrow-flipped);
    // &.end {
    //   marker-end: url(#arrow-muted);
    // }
    // &:not(.end) {
    //   marker-start: url(#arrow-muted-flipped);
    // }
  }
  &.mode-view {
    path {
      transition: all var(--transition-extended);
    }
    .label {
      transition: all var(--transition-extended);
    }
  }

  text {
    fill: var(--edge-text);
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
      stroke: var(--edge-stroke-accent);
      marker-end: url(#arrow-accent);
      // marker-start: url(#arrow-accent-flipped);
    }
    text {
      fill: var(--edge-text-accent);
    }
  }

  &.level-0:not(.mode-compose, .activity:not(.mode-couple), .view-entity) {
    filter: blur(8px);
    opacity: 0;
    &.mode-view {
      transition: all var(--transition-extended);
    }
    // path.path {
    //   transition: all var(--transition-extended);
    //   // stroke: var(--hidden);
    // }
    // text {
    //   transition: all var(--transition-extended);
    //   // fill: var(--hidden);
    // }
  }
  &.level-1:not(.mode-compose, .activity:not(.mode-couple), .view-entity) {
    filter: blur(8px);
    opacity: 0.2;

    &.mode-view {
      transition: all var(--transition-extended);
    }
    // path.path {
    //   transition: all var(--transition-extended);
    //   // stroke: var(--inactive);
    //   opacity: 0.2;
    // }
    // text {
    //   transition: all var(--transition-extended);
    //   // fill: var(--inactive);
    //   opacity: 0.2;
    // }
  }
  &.level-2:not(.mode-compose) {
    path.path {
    }
  }
  &.level-3:not(.mode-compose, .view-entity) {
    path.path {
      stroke: rgb(var(--red-5));
      marker-end: url(#arrow-level-3);
    }
    text {
      fill: rgb(var(--red-5));
    }
  }
}
</style>
