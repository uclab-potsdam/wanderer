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

const props = defineProps(['edge'])

const label = computed(() => {
  const propertyClass = terminusStore.properties.find((c) => c['@id'] === props.edge.edge?.property)
  return propertyClass?.label ? viewStore.localize(propertyClass.label) : {}
})

const local = computed(() => props.edge.edge?.graph === terminusStore.graph || props.edge.active)

const id = computed(() => {
  return (props.edge.id || props.edge.edge?.['@id'] || 'some-path').replace(/%/g, '-')
})

const path = computed(() => {
  if (props.edge.target == null) return ``
  return props.edge.source.x < props.edge.target.x
    ? `M${props.edge.source.x},${props.edge.source.y}L${props.edge.target.x},${props.edge.target.y}`
    : `M${props.edge.target.x},${props.edge.target.y}L${props.edge.source.x},${props.edge.source.y}`
})

const arrow = computed(() => (props.edge.source.x < props.edge.target.x ? '→' : '←'))

// const showOptions = ref(false);

function onClick() {
  // showOptions.value = true;
  router.push(`/edit/${props.edge.edge?.['@id']}`)
}
</script>

<template>
  <g class="edge" :class="{ local }" @click="onClick">
    <path class="edge-shadow" :d="path" />
    <path v-if="!local" class="edge-outline" :d="path" />
    <path :id="id" class="edge-main" :class="{ active: edge.active }" :d="path" />
    <text :lang="label.lang">
      <textPath :href="`#${id}`" startOffset="50%" dominant-baseline="middle">
        {{ arrow }} {{ label.text }} {{ arrow }}
      </textPath>
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
  cursor: context-menu;
  .edge-shadow {
    stroke-width: 26;
    stroke: var(--secondary);
  }
  .edge-main {
    stroke-width: 18;
    stroke: var(--secondary);
  }
  .edge-outline {
    stroke-width: 20;
    stroke: var(--primary);
  }

  text {
    fill: var(--primary);
    font-size: var(--font-size-s);
    font-weight: 500;
    pointer-events: none;
    text-anchor: middle;
  }

  &:has(.edge-main:hover, .edge-outline:hover) {
    .edge-outline {
      stroke: var(--accent);
    }
    text {
      fill: var(--accent);
    }
  }

  &.local {
    .edge-main {
      stroke: var(--primary);
      stroke-width: 20;

      &:hover,
      &.active {
        stroke: var(--accent);
        cursor: default;
      }
    }

    text {
      fill: var(--secondary);
    }

    &:has(.edge-main:hover, .edge-outline:hover) {
      text {
        fill: var(--secondary);
      }
    }
  }
}
</style>
