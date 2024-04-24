import { useLayoutStore } from '@/stores/layout'

const layoutStore = useLayoutStore()

export function getContentWidth(el) {
  const range = document.createRange()
  const childNodes = el.value.childNodes
  range.setStartBefore(childNodes[0])
  range.setEndAfter(childNodes[childNodes.length - 1])
  return `${range.getBoundingClientRect().width / layoutStore.transform.k}px`
}
