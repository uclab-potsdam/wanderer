<script setup>
import { computed, ref } from 'vue'
import { useTerminusStore } from '@/stores/terminus'
import { useSyncStore } from '@/stores/sync'
import { useViewStore } from '@/stores/view'
import { useCanvasStore } from '@/stores/canvas'
import ModalEdit from './modals/ModalEdit.vue'

const terminusStore = useTerminusStore()
const syncStore = useSyncStore()
const viewStore = useViewStore()
const canvasStore = useCanvasStore()

const props = defineProps({ edge: Object, interactive: Boolean, displayRemoteStyle: Boolean })

const label = computed(() => {
  const propertyClass = terminusStore.properties.find((c) => c['@id'] === props.edge.property)
  return propertyClass?.label ? viewStore.localize(propertyClass.label) : {}
})

const local = computed(
  () => !props.displayRemoteStyle && (props.edge.graph === terminusStore.graph || props.edge.active)
)

const id = computed(() => {
  return (props.edge.id || props.edge['@id'] || 'some-path').replace(/%/g, '-')
})

const path = computed(() => {
  if (props.edge.target == null) return ``
  const source = canvasStore.nodes[props.edge.source]
  const target = canvasStore.nodes[props.edge.target]

  if (props.edge.active) return `M${source.x},${source.y}L${target.x},${target.y}`

  const diffX = target.x - source.x
  const diffY = target.y - source.y

  const offsetX = 140
  const offsetY = 70

  const horizontal = Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > offsetX * 2

  const direction =
    (horizontal && source.x < target.x) || (!horizontal && source.y < target.y) ? 1 : -1

  const flip = (horizontal && source.y < target.y) || (!horizontal && source.x < target.x) ? 1 : -1

  const push = horizontal ? (diffX > 0 ? -15 : +15) : diffY > 0 ? -60 : 60

  const start = {
    x: horizontal ? source.x + offsetX * direction : source.x + push,
    y: horizontal ? source.y + push : source.y + offsetY * direction
  }
  const end = {
    x: horizontal ? target.x + offsetX * direction * -1 : target.x + push,
    y: horizontal ? target.y + push : target.y + offsetY * direction * -1
  }

  const r = Math.min(10, Math.abs(horizontal ? diffY : diffX) / 2)

  const anchor1 = horizontal
    ? { x: source.x + diffX / 2, y: start.y }
    : { x: start.x, y: source.y + diffY / 2 }

  const anchor2 = horizontal
    ? { x: source.x + diffX / 2, y: end.y }
    : { x: end.x, y: source.y + diffY / 2 }

  const points = [
    start,
    {
      x: horizontal ? anchor1.x - r * direction : anchor1.x,
      y: horizontal ? anchor1.y : anchor1.y - r * direction
    },
    anchor1,
    {
      x: horizontal ? anchor1.x : anchor1.x + r * flip,
      y: horizontal ? anchor1.y + r * flip : anchor1.y
    },
    {
      x: horizontal ? anchor2.x : anchor2.x - r * flip,
      y: horizontal ? anchor2.y - r * flip : anchor2.y
    },
    anchor2,
    {
      x: horizontal ? anchor2.x + r * direction : anchor2.x,
      y: horizontal ? anchor2.y : anchor2.y + r * direction
    },
    end
  ]

  if (source.x > target.x) points.reverse()

  return `M${points
    .map((point) => `${point.x} ${point.y}`)
    .reduce((a, b, i) => `${a} ${' LQ'[i % 3]}${b} `)}`
})

const arrow = computed(() => (props.edge.source.x <= props.edge.target.x ? 'end' : 'start'))

// const showOptions = ref(false);

const showEditModal = ref(false)
function onClick() {
  if (!props.interactive) return
  showEditModal.value = true
  // showOptions.value = true;
  // router.push(`/edit/${props.edge.['@id']}`)
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
  <g class="edge" :class="[`level-${level}`, { local }]" @click="onClick">
    <path class="edge-hitzone" :d="path" />
    <!-- <path v-if="!local" class="edge-outline" :d="path" /> -->
    <path
      :id="id"
      class="edge-main"
      :class="[arrow, { active: edge.active, interactive }]"
      :d="path"
    />
    <text :lang="label.lang">
      <textPath class="shadow" :href="`#${id}`" startOffset="50%">
        {{ label.text }}
      </textPath>
      <textPath :href="`#${id}`" startOffset="50%">
        {{ label.text }}
      </textPath>
      <!-- <textPath :href="`#${id}`" startOffset="75%" dominant-baseline="middle">
        {{ arrow }}
      </textPath>
      <textPath :href="`#${id}`" startOffset="25%" dominant-baseline="middle">
        {{ arrow }}
      </textPath> -->
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

  path {
    fill: none;
  }
  .edge-hitzone {
    stroke-width: 20;
    // stroke: blue;
    pointer-events: all;
  }
  .edge-main {
    stroke-width: 1;
    transition: stroke-width var(--transition);
    stroke: var(--flow-edge);
    mix-blend-mode: var(--default-blend-mode);

    &.end {
      marker-end: url(#arrow-muted);
    }
    &:not(.end) {
      marker-start: url(#arrow-muted-flipped);
    }
  }
  // .edge-outline {
  //   stroke-width: 4;
  //   stroke: red;
  // }

  text {
    fill: var(--flow-edge);
    font-size: var(--font-size-m);
    font-weight: 400;
    // text-transform: uppercase;
    pointer-events: none;
    text-anchor: middle;
    // letter-spacing: 1px;
    // dominant-baseline: ideographic;

    textPath {
      dominant-baseline: middle;

      &.shadow {
        stroke: #fff;
        stroke-width: 6px;
      }
    }
  }

  &:has(.edge-main:hover, .edge-hitzone:hover) {
    .edge-main {
      stroke: var(--ui-accent-dark);
      stroke-width: 2;
    }
    text {
      fill: var(--ui-accent-dark);
    }
  }

  &.local {
    .edge-main {
      stroke: var(--primary);
      &.end {
        marker-end: url(#arrow);
      }
      &:not(.end) {
        marker-start: url(#arrow-flipped);
      }
      // stroke-width: 20;
      &.interactive:hover,
      &.active {
        stroke: var(--ui-accent-dark);
        stroke-width: 2;
        marker-end: none;
        cursor: default;
      }
    }

    text {
      fill: var(--primary);
    }

    &:has(.edge-main:hover, .edge-hitzone:hover) {
      text {
        fill: var(--ui-accent-dark);
      }
      .edge-main {
        &.end {
          marker-end: url(#arrow-accent);
        }
        &:not(.end) {
          marker-start: url(#arrow-accent-flipped);
        }
      }
    }
  }

  &.level-0 {
    opacity: 0;
    :deep(path.edge-main) {
      stroke: var(--hidden);
    }
    :deep(text) {
      fill: var(--hidden);
    }
  }
  &.level-1 {
    filter: blur(10px);
    :deep(path.edge-main) {
      stroke: var(--inactive);
    }
    :deep(text) {
      fill: var(--inactive);
    }
  }
  &.level-2 {
    :deep(path.edge-main) {
      // stroke: var(--primary);

      &.end {
        marker-end: url(#arrow);
      }
      &:not(.end) {
        marker-start: url(#arrow-flipped);
      }
    }
    :deep(text) {
      // fill: var(--primary);
    }
  }
  &.level-3 {
    :deep(path.edge-main) {
      stroke: var(--flow-edge-highlight);

      &.end {
        marker-end: url(#arrow-accent);
      }
      &:not(.end) {
        marker-start: url(#arrow-accent-flipped);
      }
    }
    :deep(text) {
      fill: var(--flow-edge-highlight);
    }
  }
}
</style>
