const shorthands = {
  xe: 'https://amazoniafuturelab.fh-potsdam.de/media/xingu-entangled/',
  xingu: 'https://amazoniafuturelab.fh-potsdam.de/media/xingu-entangled/_/'
}

function shorten(url) {
  const prefix = Object.entries(shorthands).find((shorthand) =>
    new RegExp(`^${shorthand[1]}`).test(url)
  )
  if (!prefix) return url
  return url.replace(prefix[1], `${prefix[0]}:`)
}

function expand(url) {
  const prefix = Object.entries(shorthands).find((shorthand) =>
    new RegExp(`^${shorthand[0]}:`).test(url)
  )
  if (!prefix) return url
  return url.replace(`${prefix[0]}:`, prefix[1])
}

export { shorten, expand }
