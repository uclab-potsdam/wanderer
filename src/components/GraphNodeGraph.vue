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

const text = computed(() => helperStore.localize(props.node.text))
const image = computed(() => helperStore.getMediaUrl(props.node.image))
const color = computed(() => {
  return { '--graph-accent': `var(--${props.node.color})` }
})
const playing = computed(() => videoStore.graphId === props.id && videoStore.playing)

defineExpose({
  el
})
</script>

<template>
  <div class="entity" ref="el" :style="color">
    <img :src="image" />
    <div class="text" ref="textElement">
      {{ text }}
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
  border-radius: calc(var(--spacing) * 0.25);
  overflow: hidden;
  z-index: -1;

  background-color: color-mix(in lab, var(--graph-accent), var(--color-text) 60%);

  background-size: cover;
  background-position: center center;

  display: flex;
  flex-direction: column;
  justify-content: flex-end;

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
    padding: calc(var(--spacing) * 0.5);

    display: flex;
    justify-content: space-between;
    align-items: center;

    color: color-mix(in lab, var(--graph-accent), var(--color-background) 100%);
    background-color: color-mix(
      in lab,
      color-mix(in lab, var(--graph-accent), var(--color-text) 60%),
      transparent 40%
    );
    backdrop-filter: blur(7px);
  }
}
</style>
