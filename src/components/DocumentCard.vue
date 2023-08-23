<script setup>
import { useViewStore } from '@/stores/view'
import { useTerminusStore } from '@/stores/terminus'
import { computed } from 'vue'

const viewStore = useViewStore()
const terminusStore = useTerminusStore()

const props = defineProps({
  document: Object,
  draggable: String,
  showHover: Boolean,
  showButtons: Boolean
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
    class="document"
    :draggable="draggable === 'native'"
    @dragstart="onDragStart"
    :class="[document['@type'], { 'show-hover': showHover, 'show-buttons': showButtons }]"
  >
    <img
      v-if="document['@type'] === 'graph' && document.cover"
      class="cover"
      :src="viewStore.getMediaUrl(document.cover)"
    />
    <div class="content">
      <span class="label" :lang="label?.lang"> {{ label?.text }} </span>
      <br />
      <span class="details">
        <span v-if="className" class="class-name" :lang="className.lang"
          >{{ className.text }}<template v-if="description?.text != null">; </template>
        </span>
        <span class="description" :lang="description?.lang">
          {{ description?.text }}
        </span>
      </span>
    </div>
    <div class="buttons">
      <div class="center"><slot name="center" /></div>
      <div class="right"><slot name="right" /></div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
section.document {
  user-select: none;
  padding: var(--spacing-l);
  position: relative;
  background: var(--secondary);

  // border: 1px solid currentColor;
  background: var(--flow-background);
  color: var(--flow-color);
  // text-align: center;
  border-radius: var(--border-radius);
  width: 250px;
  min-height: 90px;
  // overflow: hidden;
  transform: translate(0, 0);

  .cover {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    object-fit: cover;
    // filter: saturate(0);
    mix-blend-mode: luminosity;
    opacity: 0.5;
    z-index: 0;
    pointer-events: none;
    border-radius: var(--border-radius);
  }

  .content {
    z-index: 2;
    pointer-events: none;
    position: relative;
    // width: 100%;
    // height: 100%;
  }
  .label {
    font-weight: var(--black);
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }

  .details {
    display: block;
    font-size: var(--font-size-s);
  }

  span {
    hyphens: auto;
  }

  &.graph {
    // border: none;
    background-color: var(--flow-graph-background);
    color: var(--flow-graph-color);

    &.show-hover:hover {
      background-color: var(--ui-accent-dark);
      color: var(--flow-graph-color);
    }
    // span,
    // .buttons {
    //   color: var(--secondary);
    // }
    height: 250px;
  }

  &.entityclass,
  &.propertyclass {
    border-image: url('@/assets/img/border.svg') 1 round;
  }

  .buttons {
    display: none;
    .center {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      z-index: 100;
      // color: var(--ui-text);

      display: flex;
      flex-direction: column;
      gap: var(--spacing-s);
    }

    .right {
      position: absolute;
      right: var(--spacing);
      top: 50%;
      transform: translate(0, -50%);
      // color: var(--ui-text);

      display: flex;
      flex-direction: column;
      gap: var(--spacing-s);
    }
    :deep(svg.icon) {
      border: 1px solid;
      border-radius: 50%;
      background-color: var(--secondary);

      &:hover {
        color: var(--secondary);
        background-color: var(--ui-accent-dark);
      }
    }
  }

  &.graph {
    .buttons {
      :deep(svg.icon) {
        color: var(--ui-accent-dark);
        &:hover {
          color: var(--secondary);
          // background-color: var(--secondary);
        }
      }
    }
  }

  &.show-hover:hover {
    color: var(--ui-accent-dark);

    &.entityclass,
    &.propertyclass {
      border-image: url('@/assets/img/border-accent.svg') 1 round;
    }
    .buttons {
      display: block;
    }
  }
  &.show-buttons {
    .buttons {
      display: block;
    }
  }
}
</style>
