<script setup>
import { computed, nextTick, onMounted, ref, Transition, watch } from 'vue'
import { useDataStore } from '@/stores/data'
import { getElementWidth, setLayout } from '@/assets/js/utils'
import LocalizeText from './LocalizeText.vue'
import { useRoute } from 'vue-router'
import HorizontalSlider from './HorizontalSlider.vue'
import GraphNodeGraph from './GraphNodeGraph.vue'
import { useSettingsStore } from '@/stores/settings'
import { useHelperStore } from '@/stores/helper'

const route = useRoute()
const props = defineProps({
  node: Object,
  id: String,
  occurances: Array,
  position: Object
})

const dataStore = useDataStore()
const settingsStore = useSettingsStore()
const helperStore = useHelperStore()

const el = ref(null)
const slider = ref(null)

const width = ref(null)
const height = ref(null)

const animateTextAlign = ref(false)
const transformLabel = ref(null)
const transformClass = ref(null)

const sliderPosition = ref(0)

const nodeClass = computed(() => dataStore.data.nodes[props.node.class]?.label)

const detail = computed(() => route.params.id === props.id)

const secondary = computed(
  () =>
    dataStore.storyId != null &&
    route.params.type !== 'graph' &&
    dataStore.data.edges.find(
      (e) =>
        e.nodes.includes(props.id) &&
        e.nodes.includes(route.params.id) &&
        e.graph === dataStore.storyId
    ) == null

  // nodes[dataStore.storyId].allocations[props.id] == null
)

const description = computed(() => {
  if (!detail.value) return
  return helperStore.localize(props.node.description, true)
})
const urls = computed(() => {
  if (!detail.value || props.node.url == null) return
  return props.node.url.map((url) => ({
    full: url,
    domain: new URL(url).hostname.replace(/^www\./, '')
  }))
})

onMounted(() => {
  updateLayout()
})

watch(detail, (detail) => {
  // nextTick(() => updateLayout(detail ? 0 : 1))

  if (detail) {
    animateTextAlign.value = true
    sliderPosition.value = Math.max(
      props.occurances.findIndex((o) => o.id === dataStore.storyId),
      0
    )
  }
  const labelOffset = (getElementWidth(el.value.querySelector('.label')) - 250) / 2
  transformLabel.value = {
    margin: `0 ${-labelOffset}px 0 ${labelOffset}px`
  }
  const classOffset = (getElementWidth(el.value.querySelector('.class')) - 250) / 2
  transformClass.value = {
    margin: `0 ${-classOffset}px 0 ${classOffset}px`
  }

  nextTick(() => {
    updateLayout(detail ? 0 : 1)
    if (!detail) {
      animateTextAlign.value = true
      transformLabel.value = null
      transformClass.value = null
    }

    // transformLabel.value = null
  })
})

watch(
  () => settingsStore.lang,
  () => nextTick(() => updateLayout())
)

watch(
  () => dataStore.storyIdForce,
  (storyId) => {
    if (storyId == null) return
    if (detail.value) {
      const position = props.occurances.findIndex((o) => o.id === storyId)
      sliderPosition.value = null
      dataStore.storyIdForce = null
      nextTick(() => (sliderPosition.value = position))
    }
  }
)

defineExpose({
  el
})

function updateLayout(endOffset) {
  const layout = setLayout(el, props.id, props.position, null, endOffset)
  height.value = `${layout.height}px`
}

function onTransitionend(e) {
  if (e.propertyName === 'margin-left') {
    animateTextAlign.value = false
    transformLabel.value = null
    transformClass.value = null
  }
}

function selectOccurance(index) {
  dataStore.storyId = props.occurances[index].id
}

function findRelatedStory() {
  if (route.name === 'graph' && route.params.type !== 'graph' && !detail.value) {
    const detail = route.params.id
    const edges = dataStore.data.edges.filter(
      (e) => e.nodes.includes(detail) && e.nodes.includes(props.id) && e.graph != null
    )
    if (edges.length) {
      if (edges.find((e) => e.graph === dataStore.storyId)) return
      dataStore.storyIdForce = edges[0].graph
    }
  }
}
</script>

<template>
  <div
    class="entity"
    ref="el"
    :style="{ width, height }"
    :class="{ detail, secondary }"
    @mouseover="findRelatedStory"
  >
    <span
      class="label"
      :class="{ 'animate-text-align': animateTextAlign }"
      :style="transformLabel"
      @transitionend="onTransitionend"
      ><LocalizeText :text="node.label"
    /></span>
    <br v-if="nodeClass" />
    <span
      class="class"
      v-if="nodeClass"
      :class="{ 'animate-text-align': animateTextAlign }"
      :style="transformClass"
      ><LocalizeText :text="nodeClass"
    /></span>
    <div v-if="description" class="description">
      {{ description }}
    </div>
    <div v-if="urls && !dataStore.kiosk" class="urls">
      <span v-for="(url, i) in urls" :key="i">
        <a :href="url.full"> {{ url.domain }} </a>&nbsp;
      </span>
    </div>
    <Transition name="stories">
      <HorizontalSlider
        v-if="detail"
        :position="sliderPosition"
        ref="slider"
        class="occurances"
        @wheel.stop
        @touchstart.stop
        :no-arrows="animateTextAlign"
        @select-item="selectOccurance"
      >
        <RouterLink
          class="occurance"
          @click.stop=""
          v-for="occurance in occurances"
          :key="occurance.id"
          :to="{ name: 'graph', params: { type: 'graph', id: occurance.id } }"
        >
          <GraphNodeGraph :id="occurance.id" :node="occurance" class="compact"></GraphNodeGraph>
        </RouterLink>
      </HorizontalSlider>
    </Transition>
  </div>
</template>

<style scoped>
.entity {
  font-size: var(--font-size-small);
  box-sizing: content-box;
  width: 250px;
  /* width: max-content; */
  padding: var(--spacing-half);
  --tinted: color-mix(in lab, var(--graph-accent), var(--color-text) 60%);
  color: var(--color-text);
  border-radius: var(--border-radius);
  cursor: pointer;
  pointer-events: none;
  > * {
    pointer-events: initial;
  }

  transition:
    height var(--transition),
    background var(--ui-transition) var(--transition),
    text-align var(--transition) var(--transition),
    color var(--ui-transition);

  &.network {
    transition:
      height var(--transition),
      background var(--transition),
      text-align var(--transition) var(--transition),
      color var(--ui-transition);
  }

  &.detail {
    transition:
      height var(--transition),
      text-align var(--transition) var(--transition),
      color var(--ui-transition),
      background var(--ui-transition);
  }

  &.secondary {
    color: var(--color-text-secondary);

    &:hover {
      color: var(--color-text);
    }
  }

  text-align: center;

  &:has(.animate-text-align),
  &:not(.detail) {
    overflow: hidden;
  }

  &.hide {
    opacity: 0.2;
    filter: var(--blur);

    &.user-active {
      filter: none;
      opacity: 1;
      color: color-mix(in lab, var(--color-text), var(--color-background) 70%);
    }

    &:hover {
      color: var(--color-text);
    }
  }

  span {
    box-decoration-break: clone;
  }

  &.highlight {
    color: var(--graph-accent);

    span {
      --highlight-color: color-mix(in lab, var(--graph-accent), transparent 80%);
      padding: 0.1em 10px;
      margin: -0.1em -10px;
      border-radius: 10px 2.5px 7.5px 5.5px;
      box-decoration-break: clone;

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
    }
  }

  /* .label,
  .class {
    text-align: center;

    &.left-align {
      text-align: left;
    }
  } */

  .label,
  .class {
    &.animate-text-align {
      transition: margin var(--transition);
    }
  }

  .label {
    /* font-weight: 900; */
    font: var(--serif);
    font-weight: bold;
  }

  .class {
    font-size: var(--font-size-small);
  }

  .description {
    text-align: left;
    margin-top: var(--spacing-quart);
    font: var(--serif-small);
    hyphens: auto;
  }

  .urls {
    text-align: left;
    margin-top: var(--spacing-quart);
    a {
      color: inherit;
    }
  }

  .inner {
    display: inline;
  }

  &.detail {
    max-width: none;
    width: 250px !important;
    background-color: var(--color-detail-background);

    &:not(:has(.animate-text-align)) {
      text-align: left;
    }
  }

  .occurances {
    text-align: left;
    margin-top: var(--spacing-half);
    .occurance {
      text-decoration: none;
    }

    &.stories-leave-active {
      transition: all var(--transition);
    }
    &.stories-leave-to {
      opacity: 0;
    }
  }
}
/* @keyframes animate-text-align {
  0% {
    opacity: 1;
  }

  50% {
    opacity: 0;
    text-align: center;
  }

  50% {
    opacity: 0;
    text-align: left;
  }

  100% {
    opacity: 1;
  }
} */
</style>
