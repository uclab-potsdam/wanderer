<script setup>
import { useTerminusStore } from '@/stores/terminus'
import { useViewStore } from '@/stores/view'
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const terminusStore = useTerminusStore()
const viewStore = useViewStore()

const document = ref({})
const sources = ref([])

watch(
  () => route.params,
  async () => {
    document.value =
      route.params.type &&
      route.params.id &&
      (await terminusStore.getDocument(`${route.params.type}/${route.params.id}`))

    sources.value = document.value.file?.map((d) => viewStore.getMediaUrl(d)) ?? []
  },
  { immediate: true }
)
</script>

<template>
  <div class="the-player">
    <div class="wrapper">
      <video v-if="sources.length > 0" loop autoplay muted ref="video">
        <source v-for="(source, i) in sources" :key="i" :src="source" preload />
      </video>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.the-player {
  video {
    object-fit: contain;
    width: 100vw;
    height: calc(100vh - var(--menu-bar-height));
  }
}
</style>
