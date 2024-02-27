import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { useDataStore } from '@/stores/data'

export const useVideoStore = defineStore('video', () => {
  const dataStore = useDataStore()

  const history = ref([])
  const graphId = ref(null)

  const video = computed(() => dataStore.data.nodes[graphId.value]?.media)
  const playSplitScreen = computed(() => video.value != null)

  watch(graphId, (id) => {
    history.value.push(id)
    if (history.value.length > 3) history.value.splice(0, 1)
  })

  return { history, graphId, video, playSplitScreen }
})
