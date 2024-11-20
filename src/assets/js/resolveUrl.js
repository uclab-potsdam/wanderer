import { useDataStore } from '@/stores/data'

function shorten(url) {
  const dataStore = useDataStore()
  const prefix = Object.entries(dataStore.data.config.shorthands).find((shorthand) =>
    new RegExp(`^${shorthand[1]}`).test(url)
  )
  if (!prefix) return url
  return url.replace(prefix[1], `${prefix[0]}:`)
}

function expand(url) {
  const dataStore = useDataStore()
  const prefix = Object.entries(dataStore.data.config.shorthands).find((shorthand) =>
    new RegExp(`^${shorthand[0]}:`).test(url)
  )
  if (!prefix) return url
  return url.replace(`${prefix[0]}:`, prefix[1])
}

export { shorten, expand }
