export const parseSRT = (text) => {
  const items = text
    .trim()
    .split(/\n{2,3}/)
    .map((item) => {
      // const keys = ['index', 'time', 'text']
      // const props = Object.fromEntries(item.split('\n').map((value, i) => [keys[i], value]))
      const props = {
        index: item.split('\n')[0],
        time: item.split('\n')[1],
        text: item
          .split('\n')
          .filter((d, i) => i > 1)
          .join(' ')
      }
      const multipliers = [60 * 60, 60, 1]
      const start = props.time
        .replace(/ --> .*/, '')
        .replace(/,/, '.')
        .split(':')
        .reduce((a, b, i) => +a + +b * multipliers[i])
      const end = props.time
        .replace(/.* --> /, '')
        .replace(/,/, '.')
        .split(':')
        .reduce((a, b, i) => +a + +b * multipliers[i])
      return {
        start,
        end,
        text: props.text.replace(/^- /, '')
      }
    })
  return items
}
