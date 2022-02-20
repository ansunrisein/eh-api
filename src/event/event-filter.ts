export type EventFilter = -1 | 1 | 0

export const makeFilterByExpiredPipeline = ({filter}: {filter?: EventFilter}) => {
  if (!filter) {
    return []
  }

  if (filter === 1) {
    return [
      {
        $match: {
          $or: [{deadline: {$gt: new Date()}}, {deadline: null}],
        },
      },
    ]
  }

  if (filter === -1) {
    return [
      {
        $match: {
          deadline: {$lt: new Date()},
        },
      },
    ]
  }

  return []
}
