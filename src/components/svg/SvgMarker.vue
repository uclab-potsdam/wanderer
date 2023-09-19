<script setup>
import { ref } from 'vue'

const marker = {
  markerWidth: 15,
  markerHeight: 10,
  refY: 5,
  orient: 'auto'
}
const markerDefault = {
  refX: 7
}
const pathDefault = 'M2,1 L7,5 L2,9'

const markerFlipped = {
  refX: 8
}

const pathFlipped = 'M13,1 L8,5 L13,9'

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
path {
  fill: none;
}
#arrow,
#arrow-flipped {
  path {
    stroke: var(--flow-edge);
  }
}
#arrow-muted,
#arrow-muted-flipped {
  path {
    stroke: var(--flow-edge);
  }
}
#arrow-accent,
#arrow-accent-flipped {
  path {
    stroke: var(--ui-accent-dark);
  }
}
</style>
