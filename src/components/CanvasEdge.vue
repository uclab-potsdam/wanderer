<script setup>
import { computed, ref } from 'vue'
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

const props = defineProps({ edge: Object, interactive: Boolean, displayRemoteStyle: Boolean })

const label = computed(() => {
  const propertyClass = terminusStore.properties.find((c) => c['@id'] === props.edge.property)
  return propertyClass?.label ? viewStore.localize(propertyClass.label) : {}
})

const id = computed(() => {
  return (props.edge.id || props.edge['@id'] || 'some-path').replace(/%/g, '-')
})

const path = computed(() => {
  if (props.edge.target == null) return ``
  const source = canvasStore.nodes[props.edge.source]
  const target = canvasStore.nodes[props.edge.target]

  const line = [
    { x: source.x, y: source.y },
    { x: target.x, y: target.y }
  ]

  // only check plausible rect edges (i.e. one vertical and one horizontal per node)
  const hIndexOffset = source.y > target.y ? 0 : 2
  const vIndexOffset = source.x < target.x ? 1 : 3

  const hSource = [source.bounds[(hIndexOffset + 0) % 4], source.bounds[(hIndexOffset + 1) % 4]]
  const hTarget = [target.bounds[(hIndexOffset + 2) % 4], target.bounds[(hIndexOffset + 3) % 4]]

  const vSource = [source.bounds[(vIndexOffset + 0) % 4], source.bounds[(vIndexOffset + 1) % 4]]
  const vTarget = [target.bounds[(vIndexOffset + 2) % 4], target.bounds[(vIndexOffset + 3) % 4]]

  const pSource = lineIntersect(line, hSource) || lineIntersect(line, vSource)
  const pTarget = lineIntersect(line, hTarget) || lineIntersect(line, vTarget)

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
  return `M${pSource.x},${pSource.y}L${pTarget.x},${pTarget.y}`
})

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
    terminusStore.states.findLast(
      (state) => state.node === props.edge.source && state.timestamp <= syncStore.time
    )?.level ?? viewStore.stateLevelDefault
)

const targetLevel = computed(
  () =>
    terminusStore.states.findLast(
      (state) => state.node === props.edge.target && state.timestamp <= syncStore.time
    )?.level ?? viewStore.stateLevelDefault
)

const level = computed(() => {
  return Math.min(sourceLevel.value, targetLevel.value)
})
</script>

<template>
  <g class="edge" :class="[`level-${level}`, viewStore.modeClass]" @click="onClick">
    <path v-if="viewStore.mode === MODE_COMPOSE" class="events" :d="path" />
    <path :id="id" class="path" :class="[arrow]" :d="path" />
    <text :lang="label.lang">
      <textPath class="shadow" :href="`#${id}`" startOffset="50%">
        {{ label.text }}
      </textPath>
      <textPath :href="`#${id}`" startOffset="50%">
        {{ label.text }}
      </textPath>
    </text>
    <foreignObject>
      <Teleport to="#modals">
        <ModalEdit
          :show="showEditModal"
          :id="id"
          type="edge"
          @close="showEditModal = false"
          @update="update"
        />
      </Teleport>
    </foreignObject>
  </g>
</template>

<style lang="scss" scoped>
.edge {
  user-select: none;
  pointer-events: none;

  path {
    fill: none;
  }
  .events {
    stroke-width: 20;
    pointer-events: all;
  }
  .path {
    stroke-width: 1;
    transition: all var(--transition);
    stroke: var(--flow-edge);

    marker-end: url(#arrow-muted);
    // &.end {
    //   marker-end: url(#arrow-muted);
    // }
    // &:not(.end) {
    //   marker-start: url(#arrow-muted-flipped);
    // }
  }

  text {
    fill: var(--flow-edge);
    font-size: var(--font-size);
    font-weight: var(--light);
    pointer-events: none;
    text-anchor: middle;

    textPath {
      dominant-baseline: middle;
      &.shadow {
        stroke: #fff;
        stroke-width: 8px;
      }
    }
  }

  &:hover {
    .path {
      stroke: var(--ui-accent);
    }
    text {
      fill: var(--ui-accent);
      transition: all var(--transition);
    }
  }

  &.level-0:not(.mode-compose) {
    opacity: 0;
    path.edge-main {
      stroke: var(--hidden);
    }
    text {
      fill: var(--hidden);
    }
  }
  &.level-1:not(.mode-compose) {
    filter: blur(8px);
    path.edge-main {
      stroke: var(--inactive);
    }
    text {
      fill: var(--inactive);
    }
  }
  &.level-2:not(.mode-compose) {
    path.edge-main {
      &.end {
        marker-end: url(#arrow);
      }
      &:not(.end) {
        marker-start: url(#arrow-flipped);
      }
    }
  }
  &.level-3:not(.mode-compose) {
    path.edge-main {
      stroke: var(--flow-edge-highlight);

      &.end {
        marker-end: url(#arrow-accent);
      }
      &:not(.end) {
        marker-start: url(#arrow-accent-flipped);
      }
    }
    text {
      fill: var(--flow-edge-highlight);
    }
  }
}
</style>
