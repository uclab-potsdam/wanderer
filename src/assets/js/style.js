const transition = +getComputedStyle(document.documentElement)
  .getPropertyValue('--transition')
  .replace(/(.+)ms/, (_, ms) => ms)
  .replace(/(.+)s/, (_, s) => s * 1000)

const spacing = +getComputedStyle(document.documentElement)
  .getPropertyValue('--spacing')
  .replace(/px$/, '')

export { transition, spacing }
