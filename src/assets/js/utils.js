import { useLayoutStore } from '@/stores/layout'

const layoutStore = useLayoutStore()

export function getContentWidth(el) {
  const range = document.createRange()
  const childNodes = el.value?.childNodes
  if (childNodes == null) return 0
  range.setStartBefore(childNodes[0])
  range.setEndAfter(childNodes[childNodes.length - 1])
  return `${range.getBoundingClientRect().width / layoutStore.transform.k}px`
}

export function setLayout(el, id, position, startOffset = 0, endOffset = 0) {
  const range = document.createRange()
  const childNodes = el.value?.childNodes
  if (childNodes == null) return {}

  let start = el.value.firstElementChild
  for (let i = startOffset; i > 0; i--) {
    start = start.nextElementSibling
  }
  let end = el.value.lastElementChild
  for (let i = endOffset; i > 0; i--) {
    end = end.previousElementSibling
  }
  range.setStartBefore(start)
  range.setEndAfter(end)

  const bounds = range.getBoundingClientRect()
  const elWidth = el.value.getBoundingClientRect().width
  const layout = {
    ...position,
    width: Math.min(bounds.width, elWidth) / layoutStore.transform.k,
    height: bounds.height / layoutStore.transform.k
  }
  layoutStore.nodes[id] = layout
  return layout
}

export function getElementWidth(el) {
  if (el == null) return
  return el.getBoundingClientRect().width / layoutStore.transform.k
}
