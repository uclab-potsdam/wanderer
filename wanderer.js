export default {
  interface: {
    settings: {
      show: true
    },
    language: {
      show: true,
      compact: true,
      options: [
        {
          audio: { label: 'Original', value: 'original' },
          interface: { label: 'English', value: 'en' }
        },
        {
          audio: { label: 'Original', value: 'original' },
          interface: { label: 'Deutsch', value: 'de' }
        },
        {
          audio: { label: 'Original', value: 'original' },
          interface: { label: 'Português', value: 'pt' }
        }
      ]
      // compact: false,
      // options: {
      //   audio: [
      //     { label: 'Original', value: 'original' },
      //     { label: 'Deutsch', value: 'de' }
      //   ],
      //   interface: [
      //     { label: 'English', value: 'en' },
      //     { label: 'Deutsch', value: 'de' },
      //     { label: 'Português', value: 'pt' }
      //   ],
      //   subtitles: [
      //     { label: 'English', value: 'en' },
      //     { label: 'Deutsch', value: 'de' },
      //     { label: 'Português', value: 'pt' }
      //   ]
      // }
    }
  }
}
