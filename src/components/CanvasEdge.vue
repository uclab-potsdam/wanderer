<script setup>
import { computed } from 'vue'
// import BaseModal from "./BaseModal.vue";
// import CanvasEdgeOptions from "./CanvasEdgeOptions.vue";
import { useRouter } from 'vue-router'
import { useTerminusStore } from '@/stores/terminus'
import { useViewStore } from '@/stores/view'

const router = useRouter()
const terminusStore = useTerminusStore()
const viewStore = useViewStore()

const props = defineProps({ edge: Object, interactive: Boolean, displayRemoteStyle: Boolean })

const label = computed(() => {
  const propertyClass = terminusStore.properties.find((c) => c['@id'] === props.edge.edge?.property)
  return propertyClass?.label ? viewStore.localize(propertyClass.label) : {}
})

const local = computed(
  () =>
    !props.displayRemoteStyle &&
    (props.edge.edge?.graph === terminusStore.graph || props.edge.active)
)

const id = computed(() => {
  return (props.edge.id || props.edge.edge?.['@id'] || 'some-path').replace(/%/g, '-')
})

const path = computed(() => {
  if (props.edge.target == null) return ``
  const { source, target } = props.edge

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

  // const c1 =
  //   Math.abs(diffX) > Math.abs(diffY)
  //     ? [
  //         [source.x + diffX / 2, source.y + diffY / 10],
  //         'L',
  //         [source.x + diffX / 2, target.y - diffY / 10]
  //       ]
  //     : [
  //         [source.x + diffX / 10, source.y + diffY / 2],
  //         'L',
  //         [target.x - diffX / 10, source.y + diffY / 2]
  //       ]

  // const points = [[source.x, source.y], 'L', ...c1, 'L', [target.x, target.y]]

  const r = Math.min(40, Math.abs(horizontal ? diffY : diffX) / 2)
  // const c1 =
  //   Math.abs(diffX) > Math.abs(diffY)
  //     ? [
  //         [source.x + diffX / 2 - r, source.y],
  //         [source.x + diffX / 2, source.y],
  //         [source.x + diffX / 2, source.y + r],
  //         [source.x + diffX / 2, target.y - r],
  //         [source.x + diffX / 2, target.y],
  //         [source.x + diffX / 2 + r, target.y]
  //       ]
  //     : [
  //         [source.x, source.y + diffY / 2 + r],
  //         [source.x, source.y + diffY / 2],
  //         [source.x + r, source.y + diffY / 2],
  //         [target.x - r, source.y + diffY / 2],
  //         [target.x, source.y + diffY / 2],
  //         [target.x, source.y + diffY / 2 - r]
  //       ]

  const anchor1 = horizontal
    ? { x: source.x + diffX / 2, y: start.y }
    : { x: start.x, y: source.y + diffY / 2 }

  const anchor2 = horizontal
    ? { x: source.x + diffX / 2, y: end.y }
    : { x: end.x, y: source.y + diffY / 2 }

  // const points = [{
  //   x: anchor1.x, y: anchor1.y

  // }]
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
  // const points = [
  //   [source.x, source.y],
  //   [target.x, target.y]
  // ]

  if (source.x > target.x) points.reverse()
  // points.splice(1, 0, 'L')
  // points.splice(3, 0, 'Q')
  // points.splice(6, 0, 'L')
  // points.splice(8, 0, 'Q')
  // points.splice(11, 0, 'L')
  return `M${points
    .map((point) => `${point.x} ${point.y}`)
    .reduce((a, b, i) => `${a} ${' LQ'[i % 3]}${b} `)}`
})

const arrow = computed(() => (props.edge.source.x <= props.edge.target.x ? 'end' : 'start'))

// const showOptions = ref(false);

function onClick() {
  if (!props.interactive) return
  // showOptions.value = true;
  router.push(`/edit/${props.edge.edge?.['@id']}`)
}
</script>

<template>
  <g class="edge" :class="{ local }" @click="onClick">
    <path class="edge-hitzone" :d="path" />
    <!-- <path v-if="!local" class="edge-outline" :d="path" /> -->
    <path
      :id="id"
      class="edge-main"
      :class="[arrow, { active: edge.active, interactive }]"
      :d="path"
    />
    <text :lang="label.lang">
      <textPath :href="`#${id}`" startOffset="50%" dominant-baseline="middle">
        {{ label.text }}
      </textPath>
      <!-- <textPath :href="`#${id}`" startOffset="75%" dominant-baseline="middle">
        {{ arrow }}
      </textPath>
      <textPath :href="`#${id}`" startOffset="25%" dominant-baseline="middle">
        {{ arrow }}
      </textPath> -->
    </text>
    <!-- <foreignObject v-if="showOptions">
      <Teleport to="body">
        <BaseModal @close="showOptions = false">
          <RouterLink :to="`/edit/${props.edge.property?.['@id']}`"
            >edit</RouterLink
          >
        </BaseModal>
      </Teleport>
    </foreignObject> -->
  </g>
</template>

<style lang="scss" scoped>
.edge {
  user-select: none;
  // cursor: context-menu;

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
    font-size: var(--font-size-s);
    font-weight: 400;
    // text-transform: uppercase;
    pointer-events: none;
    text-anchor: middle;
    // letter-spacing: 1px;
    // dominant-baseline: ideographic;

    textPath {
      dominant-baseline: ideographic;
    }
  }

  &:has(.edge-main:hover, .edge-hitzone:hover) {
    .edge-main {
      stroke: var(--accent);
    }
    text {
      fill: var(--accent);
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
        stroke: var(--accent);
        cursor: default;
      }
    }

    text {
      fill: var(--primary);
    }

    &:has(.edge-main:hover, .edge-hitzone:hover) {
      text {
        fill: var(--accent);
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
}
</style>
