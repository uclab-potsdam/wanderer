<script setup>
import { useViewStore } from '@/stores/view'
import { useTerminusStore } from '@/stores/terminus'
import { computed } from 'vue'

const viewStore = useViewStore()
const terminusStore = useTerminusStore()

const props = defineProps({
  document: Object,
  draggable: String,
  level: Number
})

const label = computed(() => {
  return viewStore.localize(props.document.label)
})

const className = computed(() => {
  if (props.document.class == null) return null
  const cl = terminusStore.classes.find((cl) => cl['@id'] === props.document.class)
  if (cl == null) return null
  return viewStore.localize(cl.label)
})

const description = computed(() => {
  return viewStore.localize(props.document.description)
})

const emit = defineEmits(['close'])
function onDragStart(e) {
  emit('close')
  e.dataTransfer.setData('text/uri-list', `workbench://${props.document['@id']}`)
}
</script>

<template>
  <section
    class="node"
    :draggable="draggable === 'native'"
    @dragstart="onDragStart"
    :class="[document['@type'], `level-${level ?? viewStore.stateLevelDefault}`]"
  >
    <div class="card">
      <span class="label" :lang="label?.lang"> {{ label?.text }} </span>
      <br />
      <span v-if="className" class="class" :lang="className.lang">
        {{ className.text }}
      </span>
    </div>
    <div class="actions">
      <div class="center"><slot name="center" /></div>
      <div class="right"><slot name="right" /></div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.node {
  position: relative;
  border-radius: var(--node-border-radius);
  .card {
    width: 250px;
    // height: 100px;
    transition: all var(--transition);
    background: var(--node-background);
    color: var(--node-text);
    border-radius: var(--node-border-radius);
    padding: var(--node-padding);

    .label {
      font-weight: var(--black);
      letter-spacing: 0.2px;
    }
    .class {
      font-weight: var(--light);
    }
  }

  &.level-0 {
    &.mode-couple {
      outline: 1px dashed var(--node-background);
      outline-offset: -1px;
    }
    &:not(.mode-compose) {
      .card {
        opacity: 0;
      }
    }
  }

  &.level-1 {
    &.mode-couple {
      outline: 1px dashed var(--node-background);
      outline-offset: -1px;
    }
    &:not(.mode-compose) {
      .card {
        filter: blur(15px);
        background: var(--node-background-light);
        color: var(--flow-color-inactive);
      }
    }
  }

  &.level-2 {
    .card {
    }
  }

  &.level-3 {
    &:not(.mode-compose) {
      .card {
        color: var(--flow-color-highlight);
        background: var(--flow-background-highlight);
      }
    }
  }
  .actions {
    position: absolute;
    right: 0;
    top: 0;
    margin: var(--spacing);
    padding: var(--spacing);
    // border-radius: var(--ui-border-radius);
    background: var(--ui-backdrop-translucent);
    backdrop-filter: blur(7px);
    color: var(--node-text);
  }
}
</style>
