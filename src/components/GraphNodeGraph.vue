<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useHelperStore } from '@/stores/helper'
import { useVideoStore } from '@/stores/video'

import ControlsPlay from '~icons/base/ControlsPlay'
import IconPlaying from '@/components/IconPlaying.vue'
import { useSettingsStore } from '@/stores/settings'
import { setLayout } from '@/assets/js/utils'

const props = defineProps({
  node: Object,
  id: String,
  position: Object
})

const helperStore = useHelperStore()
const videoStore = useVideoStore()
const settingsStore = useSettingsStore()

const textElement = ref(null)

const el = ref(null)

const label = computed(() => helperStore.localize(props.node.label))
const image = computed(() => helperStore.getMediaUrl(props.node.image))
const color = computed(() => {
  return { '--graph-accent': `var(--${props.node.color})` }
})
const playing = computed(() => videoStore.graphId === props.id && videoStore.playing)

const isNext = computed(() => videoStore.next === props.id)
const autoplay = computed(() => {
  if (!isNext.value) return
  const remaining = videoStore.duration - videoStore.time
  if (remaining > 5) return
  return { '--autoplay': `${100 - remaining * 20}%` }
})

onMounted(() => {
  updateLayout()
})

watch(
  () => settingsStore.lang,
  () => nextTick(() => updateLayout())
)

function updateLayout(endOffset) {
  setLayout(el, props.id, props.position, null, endOffset)
  console.log()
}

defineExpose({
  el
})
</script>

<template>
  <div class="node-graph" ref="el" :style="{ ...color, ...autoplay }">
    <img v-if="image" :src="image" draggable="false" />
    <div v-else class="image-placeholder" />
    <div class="icon">
      <ControlsPlay v-if="!playing" />
      <IconPlaying v-else />
    </div>
    <div class="text" ref="textElement">
      <span
        ><span>{{ label }}</span></span
      >
    </div>
  </div>
</template>

<style scoped>
.node-graph {
  /* border: 1px solid var(--graph-accent); */
  /* border-radius: var(--spacing-quart); */
  /* overflow: hidden; */
  z-index: -1;

  --autoplay: 0%;

  /* background-color: color-mix(in lab, var(--graph-accent), var(--color-text) 60%); */

  /* background-size: cover; */
  /* background-position: center center; */

  display: flex;
  flex-direction: column;
  /* justify-content: flex-end; */

  outline-offset: 2px;
  position: relative;

  img,
  .image-placeholder {
    width: 250px;
    height: 150px;
    /* position: absolute; */
    object-fit: cover;
    z-index: -1;

    filter: grayscale(1) contrast(1.2);
    /* mix-blend-mode: hard-light; */
    /* mix-blend-mode: luminosity; */
  }

  .image-placeholder {
    background-color: var(--color-text);
  }

  > .icon {
    /* position: absolute; */
    /* top: 105px; */
    height: 45px;
    width: 45px;
    margin-top: -45px;
    /* margin-left: -1px; */
    /* background: var(--color-background); */
    background: var(--color-accent);
    color: white;
  }

  .text {
    font-weight: 800;
    /* text-shadow: var(--color-text) 0 0 10px; */
    display: block;
    margin-top: var(--spacing-half);

    > span {
      background: black;
      padding: var(--spacing-half) calc(var(--spacing) * 0.75);
      box-decoration-break: clone;

      > span {
        mix-blend-mode: lighten;
      }
    }

    color: white;
    /* --background: color-mix(
      in lab,
      color-mix(in lab, var(--graph-accent), var(--color-text) 60%),
      transparent 40%
    );
    --background-autoplay: color-mix(in lab, var(--graph-accent), transparent 40%);

    background: linear-gradient(
      90deg,
      var(--background-autoplay) 0%,
      var(--background-autoplay) var(--autoplay),
      var(--background) var(--autoplay),
      var(--background) 100%
    ); */
    /* backdrop-filter: var(--blur); */
  }

  /* &.compact { */
  justify-content: flex-end;
  height: 150px;
  width: 250px;
  img {
    height: 150px;
    position: absolute;
  }
  > .icon {
    /* background-color: var(--color-background); */
    /* color: var(--color-accent); */
  }
  .text {
    margin: var(--spacing-half) 0;
  }
  /* } */
}
</style>
