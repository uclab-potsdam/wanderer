export default {
  entity: {
    label: 'dictionary',
    class: 'entity',
    description: 'dictionary',
    url: 'multi-string'
  },
  note: {
    text: 'dictionary'
  },
  graph: {
    label: 'dictionary',
    image: 'string',
    'media.file': { input: 'video-dictionary', type: 'file' },
    'media.subtitles': { input: 'dictionary', type: 'file' },
    index: 'boolean'
  },
  image: {
    label: 'dictionary',
    file: { input: 'string', type: 'file' }
  }
}
