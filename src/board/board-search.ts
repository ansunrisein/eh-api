export const makeSearchPipeline = ({text}: {text?: string}) => {
  if (!text) {
    return []
  }

  return [
    {
      $search: {
        index: 'search',
        text: {
          query: text,
          path: {
            wildcard: '*',
          },
        },
      },
    },
  ]
}
