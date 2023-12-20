<script setup>
import { useViewStore } from '@/stores/view'
import { useTerminusStore } from '@/stores/terminus'
import { useSyncStore } from '@/stores/sync'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { formatTime } from '@/assets/js/utils'

import IconPlay from '~icons/base/CanvasPlay'
import IconPlaying from '@/components/svg/SvgIconPlaying.vue'
import DocumentCardProgress from './DocumentCardProgress.vue'
import DocumentCardNext from './DocumentCardNext.vue'

const viewStore = useViewStore()
const terminusStore = useTerminusStore()
const syncStore = useSyncStore()

const route = useRoute()

const props = defineProps({
  document: Object,
  draggable: String,
  level: Number,
  isActiveGraph: Boolean
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
const description = computed(() => {
  return viewStore.localize(props.document.description)
})

const emit = defineEmits(['close'])
function onDragStart(e) {
  emit('close')
  e.dataTransfer.setData('text/uri-list', `workbench://${props.document['@id']}`)
}

const accent = computed(() => {
  if (!props.document.color) return
  return {
    '--accent': `rgb(var(--${props.document.color}-5))`
  }
})

const duration = computed(() => {
  if (props.document.media?.duration == null) return null
  if (props.document['@id'] === terminusStore.graph && props.isActiveGraph) return syncStore.duration - syncStore.time
  return props.document.media.duration
})
</script>

<template>
  <section
    class="node"
    :draggable="draggable === 'native'"
    @dragstart="onDragStart"
    :style="accent"
    :class="[
      document['@type'],
      viewClass,
      `level-${level ?? viewStore.stateLevelDefault}`,
      { activity: !viewStore.inactivityShort }
    ]"
  >
    <div class="card">
      <span class="label" :lang="label?.lang">
        {{ label?.text }}
        <span v-if="description && document['@type'] === 'graph'" class="description" :lang="description.lang">
          – {{ description.text }}
        </span></span
      >
      <template v-if="className">
        <br />
        <span v-if="className" class="class" :lang="className.lang">
          {{ className.text }}
        </span>
        <!-- <span v-if="className && description">, </span>
        <span v-if="description" class="description" :lang="description.lang">
          {{ description.text }}
        </span> -->
      </template>
      <template v-if="document['@type'] === 'graph' && document.media != null">
        <br />
        <div class="canvas-meta">
          <span class="canvas-play-state">
            <IconPlaying v-if="document['@id'] === terminusStore.graph" />
            <IconPlay v-else />
            <template v-if="duration != null">{{ formatTime(duration) }}</template>
          </span>
          <!-- <span v-if="description" class="description" :lang="description.lang">
            {{ description.text }}
          </span> -->
        </div>
      </template>
    </div>
    <div class="actions">
      <div class="center"><slot name="center" /></div>
      <div class="right"><slot name="right" /></div>
    </div>
    <DocumentCardProgress v-if="isActiveGraph" />
    <DocumentCardNext v-if="document['@id'] === terminusStore.graphDoc?.next" />
  </section>
</template>

<style lang="scss" scoped>
@property --highlight-color {
  syntax: '<color>';
  initial-value: transparent;
  inherits: false;
}
.node {
  position: relative;
  // border-radius: var(--node-border-radius);
  .card {
    // min-width: 90px;
    max-width: 250px;
    // min-height: 90px;
    transition: all var(--transition);
    // background: rgb(var(--gray-10));
    color: color-mix(in lab, var(--accent), var(--text-base) var(--text-base-opacity));
    background: none;
    // color: var(--node-background);
    // border-radius: var(--node-border-radius);
    padding: var(--node-padding);

    span {
      padding: 0.1em 10px;
      margin: -0.1em -10px;
      border-radius: 10px 2.5px 7.5px 5.5px;
      box-decoration-break: clone;
      transition: --highlight-color var(--transition), text-shadow var(--transition);
      // background-image: linear-gradient(
      //   to right,
      //   color-mix(in lab, var(--highlight-color), transparent 20%),
      //   color-mix(in lab, var(--highlight-color), transparent 30%) 4%,
      //   color-mix(in lab, var(--highlight-color), transparent 70%)
      // );
      background: linear-gradient(
          100deg,
          color-mix(in lab, var(--highlight-color), transparent 99%) 5%,
          color-mix(in lab, var(--highlight-color), transparent 0%) 6.2%,
          color-mix(in lab, var(--highlight-color), transparent 50%) 7.8%,
          color-mix(in lab, var(--highlight-color), transparent 80%) 93%,
          color-mix(in lab, var(--highlight-color), transparent 40%) 96%,
          color-mix(in lab, var(--highlight-color), transparent 99%) 97%
        ),
        linear-gradient(
          195deg,
          color-mix(in lab, var(--highlight-color), transparent 99%) 0%,
          color-mix(in lab, var(--highlight-color), transparent 70%) 7.9%,
          color-mix(in lab, var(--highlight-color), transparent 99%) 50%
        );

      // text-shadow: -5px 5px 9.8px color-mix(in lab, var(--highlight-color), transparent 30%),
      //   21px -18.1px 7.3px var(--background-base), -18.1px -27.3px 30px var(--background-base);
    }

    .label {
      font-weight: var(--black);
      letter-spacing: 0.2px;
      // white-space: nowrap;
    }
    .class {
      font-weight: var(--light);
      white-space: nowrap;
    }
    .description {
      font-weight: var(--light);
      // font-style: oblique 8deg;
      color: color-mix(in lab, var(--accent), var(--text-base) 50%);
    }
  }

  &.graph {
    .card {
      --color: color-mix(in lab, var(--accent), var(--text-base) 50%);
      border: 1px solid color-mix(in lab, var(--color), transparent 50%);
      color: var(--color);
      min-width: 200px;
      // var(--ui-accent);
      border-radius: var(--ui-border-radius);
      backdrop-filter: blur(7px);

      .canvas-meta {
        display: flex;
        justify-content: space-between;
        font-weight: var(--light);
        gap: var(--spacing-l);
        flex-direction: co;
        .description {
          white-space: nowrap;
        }
      }

      .canvas-play-state {
        display: flex;
        gap: var(--spacing-s);
        align-items: center;
        font-feature-settings: 'tnum';
      }
    }
    &.is-related-graph,
    &.active-graph {
      .card {
        border: none;
        background: color-mix(in lab, var(--accent), transparent 80%);
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
      // background: color-mix(in lab, var(--accent), transparent);

      span {
        --highlight-color: var(--accent);
        text-shadow: -5px 5px 9.8px color-mix(in lab, var(--highlight-color), transparent 30%),
          21px -18.1px 7.3px var(--background-base), -18.1px -27.3px 30px var(--background-base);
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
