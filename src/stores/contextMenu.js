import { ref, shallowRef } from 'vue'
import { defineStore } from 'pinia'

export const useContextMenuStore = defineStore('context-menu', () => {
  const show = ref(false)
  const offset = ref({ x: 100, y: 100 })
  const component = shallowRef(null)
  const context = ref([
    { label: 'A', action: () => console.log('AAAA') },
    { label: 'B', action: () => console.log('BBBB') }
  ])

  function open(t, c, position) {
    component.value = t
    context.value = c
    if (position != null) offset.value = position
    show.value = true

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

  return { show, offset, component, context, open }
})
