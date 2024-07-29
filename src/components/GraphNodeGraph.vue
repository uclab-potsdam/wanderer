<script setup>
import { computed, ref } from 'vue'
import { useHelperStore } from '@/stores/helper'
import { useVideoStore } from '@/stores/video'

import IconPlay from '~icons/base/IconPlay'
import IconPlaying from '@/components/IconPlaying.vue'

const props = defineProps({
  node: Object,
  id: String
})

const helperStore = useHelperStore()
const videoStore = useVideoStore()

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

defineExpose({
  el
})
</script>

<template>
  <div class="entity" ref="el" :style="{ ...color, ...autoplay }">
    <img :src="image" draggable="false" />
    <div class="text" ref="textElement">
      {{ label }}
      <IconPlay v-if="!playing" />
      <IconPlaying v-else />
    </div>
  </div>
</template>

<style scoped>
.entity {
  width: 250px;
  height: 150px;
  /* border: 1px solid var(--graph-accent); */
  border-radius: var(--spacing-quart);
  overflow: hidden;
  z-index: -1;

  --autoplay: 0%;

  background-color: color-mix(in lab, var(--graph-accent), var(--color-text) 60%);

  background-size: cover;
  background-position: center center;

  display: flex;
  flex-direction: column;
  justify-content: flex-end;

  outline-offset: 2px;

  img {
    width: 100%;
    height: 100%;
    position: absolute;
    object-fit: cover;
    z-index: -1;
    /* filter: grayscale(1); */
    /* mix-blend-mode: hard-light; */
    /* mix-blend-mode: luminosity; */
  }

  .text {
    font-weight: 900;
    padding: var(--spacing-half);

    display: flex;
    justify-content: space-between;
    align-items: center;

    color: color-mix(in lab, var(--graph-accent), var(--color-background) 100%);
    --background: color-mix(
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
    );
    backdrop-filter: var(--blur);
  }
}
</style>
