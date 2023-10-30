<script setup>
import { useViewStore } from '@/stores/view'
import { useTerminusStore } from '@/stores/terminus'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { formatTime } from '@/assets/js/utils'

import IconPlay from '~icons/base/CanvasPlay'
import IconPlaying from '@/components/svg/SvgIconPlaying.vue'

const viewStore = useViewStore()
const terminusStore = useTerminusStore()

const route = useRoute()

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

const viewClass = computed(() => `view-${route.name}`)
// const description = computed(() => {
//   return viewStore.localize(props.document.description)
// })

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
    :class="[
      document['@type'],
      viewClass,
      `level-${level ?? viewStore.stateLevelDefault}`,
      { activity: viewStore.activity }
    ]"
  >
    <div class="card">
      <span class="label" :lang="label?.lang"> {{ label?.text }} </span>
      <template>
        <br />
        <span v-if="className" class="class" :lang="className.lang">
          {{ className.text }}
        </span>
      </template>
      <template v-if="document['@type'] === 'graph' && document.media != null">
        <br />
        <span class="canvas-play-state">
          <IconPlaying v-if="document['@id'] === terminusStore.graph" />
          <IconPlay v-else />
          <template v-if="document.media.duration != null">{{ formatTime(document.media.duration) }}</template>
        </span>
      </template>
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
  // border-radius: var(--node-border-radius);
  .card {
    // min-width: 90px;
    // width: 250px;
    // min-height: 90px;
    transition: all var(--transition);
    // background: rgb(var(--gray-10));
    color: var(--node-background);
    background: none;
    // color: var(--node-background);
    // border-radius: var(--node-border-radius);
    padding: var(--node-padding);

    .label {
      font-weight: var(--black);
      letter-spacing: 0.2px;
      white-space: nowrap;
    }
    .class {
      font-weight: var(--light);
    }
  }

  &.graph {
    .card {
      background: color-mix(in lab, var(--ui-accent), transparent 80%);
      color: color-mix(in lab, var(--ui-accent), black 50%);
      min-width: 200px;
      // var(--ui-accent);
      border-radius: var(--ui-border-radius);

      .canvas-play-state {
        display: flex;
        gap: var(--spacing-s);
        align-items: center;
      }
    }
  }

  &.level-0:not(.mode-compose, .activity:not(.mode-couple), .view-entity) {
    &.mode-couple {
      outline: 1px dashed var(--node-background);
      outline-offset: -1px;
    }
    &:not(.mode-couple:hover) .card,
    &.mode-couple:has(.actions:hover) .card {
      filter: blur(15px);
      opacity: 0;
    }
    &.mode-view .card {
      transition: all var(--transition-extended);
    }
  }

  &.level-1:not(.mode-compose, .activity:not(.mode-couple), .view-entity) {
    &.mode-couple {
      outline: 1px dashed var(--node-background);
      outline-offset: -1px;
    }
    &:not(.mode-couple:hover) .card,
    &.mode-couple:has(.actions:hover) .card {
      filter: blur(15px);
      // background: var(--node-background-light);
      color: var(--flow-color-inactive);
    }
    &.mode-view .card {
      transition: all var(--transition-extended);
    }
  }

  &.level-2:not(.mode-compose) {
    .card {
      // default case
    }
  }

  &.level-3:not(.mode-compose, .view-entity) {
    .card {
      // color: var(--flow-color-highlight);

      span {
        margin: 0 -0.6em;
        padding: 0em 0.6em;
        border-radius: 0.7em 0.3em 0.7em 0.3em;
        // background: transparent;
        background-image: linear-gradient(
          to right,
          rgba(var(--red-7), 0.8),
          rgba(var(--red-7), 0.7) 4%,
          rgba(var(--red-7), 0.3)
        );
        box-decoration-break: clone;
      }
    }
  }
  .actions {
    position: absolute;
    right: 0;
    top: 0;
    margin: var(--spacing);
    padding: var(--spacing);
    border-radius: var(--ui-border-radius-s);
    color: #fff;

    &:hover {
      background-color: var(--node-background);
    }
  }

  &.mode-view {
    .actions {
      display: none;
    }
  }
}
</style>
