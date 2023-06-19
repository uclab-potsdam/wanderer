<script setup>
import BaseButton from '@/components/BaseButton.vue'
import TheCanvas from '@/components/TheCanvas.vue'
import TheControls from '@/components/TheControls.vue'
import ThePlayer from '@/components/ThePlayer.vue'
import IconPopup from '~icons/default/Popup'

import { watch } from 'vue'

import { useTerminusStore } from '@/stores/terminus'
import { useViewStore } from '@/stores/view'
import { useSyncStore } from '@/stores/sync'

import { useRouter, useRoute } from 'vue-router'
const router = useRouter()

function openPlayer() {
  open(router.resolve({ name: 'player' }).href, '_blank')
}

const route = useRoute()
const terminusStore = useTerminusStore()
const viewStore = useViewStore()
const syncStore = useSyncStore()

watch(
  () => route.params,
  async () => {
    const doc =
      route.params.type &&
      route.params.id &&
      (await terminusStore.getMedia(`${route.params.type}/${route.params.id}`))

    syncStore.sources = doc?.file?.map((d) => viewStore.getMediaUrl(d)) ?? []
  },
  { immediate: true }
)
</script>

<template>
  <TheCanvas />
  <ThePlayer width="450" v-if="!syncStore.playsExternal">
    <BaseButton class="button" @click="openPlayer">
      <IconPopup />
    </BaseButton>
  </ThePlayer>
  <TheControls scrubbing />
</template>

<style lang="scss" scoped>
// .the-player {
//   position: absolute;
//   width: 300px;
//   height: 200px;
// }

.button {
  color: var(--secondary);

  &:hover {
    background: var(--secondary);
    border-radius: 50%;
  }
}
</style>
