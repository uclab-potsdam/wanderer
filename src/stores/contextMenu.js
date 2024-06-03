import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useContextMenuStore = defineStore('context-menu', () => {
  const show = ref(false)
  const offset = ref({ x: 100, y: 100 })
  const options = ref([
    { label: 'A', action: () => console.log('AAAA') },
    { label: 'B', action: () => console.log('BBBB') }
  ])

  function open(o, position) {
    show.value = true
    offset.value = position
    options.value = o

    const controller = new AbortController()

    window.addEventListener(
      'keydown',
      (e) => {
        if (e.key !== 'Escape') return
        controller.abort()
        show.value = false
      },
      { signal: controller.signal }
    )

    window.addEventListener(
      'click',
      () => {
        controller.abort()
        show.value = false
      },
      { once: true, signal: controller.signal }
    )

    // window.addEventListener(
    //   'mousedown',
    //   () => {
    //     controller.abort()
    //     show.value = false
    //   },
    //   { once: true, signal: controller.signal }
    // )
  }

  return { show, offset, options, open }
})
