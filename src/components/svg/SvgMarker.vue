<script setup>
import { ref } from 'vue'

const marker = {
  markerWidth: 10,
  markerHeight: 20,
  refY: 10,
  orient: 'auto'
}
const markerDefault = {
  refX: 10
}
const pathDefault = 'M0,0 L10,10 L0,20'

const markerFlipped = {
  refX: 0
}

const pathFlipped = 'M10,0 L0,10 L10,20'

const markers = ref([
  {
    attributes: { id: 'arrow', ...marker, ...markerDefault },
    path: pathDefault
  },
  {
    attributes: { id: 'arrow-muted', ...marker, ...markerDefault },
    path: pathDefault
  },
  {
    attributes: { id: 'arrow-accent', ...marker, ...markerDefault },
    path: pathDefault
  },
  {
    attributes: { id: 'arrow-level-3', ...marker, ...markerDefault },
    path: pathDefault
  },
  {
    attributes: { id: 'arrow-flipped', ...marker, ...markerFlipped },
    path: pathFlipped
  },
  {
    attributes: { id: 'arrow-muted-flipped', ...marker, ...markerFlipped },
    path: pathFlipped
  },
  {
    attributes: { id: 'arrow-accent-flipped', ...marker, ...markerFlipped },
    path: pathFlipped
  }
])
</script>

<template>
  <defs>
    <marker v-for="(marker, i) in markers" :key="i" v-bind="marker.attributes">
      <path :d="marker.path" />
    </marker>
  </defs>
</template>
<style lang="scss" scoped>
marker {
  overflow: visible;
}
path {
  fill: none;
}
#arrow,
#arrow-flipped {
  path {
    stroke: var(--edge-stroke);
  }
}
#arrow-muted,
#arrow-muted-flipped {
  path {
    stroke: var(--edge-stroke);
  }
}
#arrow-accent,
#arrow-accent-flipped {
  path {
    stroke: var(--edge-stroke-accent);
  }
}

#arrow-level-3 {
  path {
    stroke: rgb(var(--red-5));
  }
}
</style>
