import {ObjectId} from 'mongodb'

export type BoardFilter = -1 | 1 | 0

export const makeFilterByIsFavoritePipeline = ({
  userId,
  filter = 0,
}: {
  userId?: ObjectId
  filter?: BoardFilter
}) => {
  if (!filter) {
    return []
  }

  return [
    {
      $lookup: {
        from: 'favorite-boards',
        as: 'favoriteBoards',
        let: {
          boardId: '$_id',
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $eq: ['$boardId', '$$boardId'],
                  },
                  {
                    $eq: ['$userId', userId],
                  },
                ],
              },
            },
          },
        ],
      },
    },
    {
      $addFields: {
        isFavorite: {
          $ne: ['$favoriteBoards', []],
        },
      },
    },
    {
      $match: {
        isFavorite: filter !== -1,
      },
    },
  ]
}

export const makeFilterByIsPinPipeline = ({
  userId,
  filter = 0,
}: {
  userId?: ObjectId
  filter?: BoardFilter
}) => {
  if (!filter) {
    return []
  }

  return [
    {
      $lookup: {
        from: 'pin-boards',
        as: 'pinBoards',
        let: {
          boardId: '$_id',
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $eq: ['$boardId', '$$boardId'],
                  },
                  {
                    $eq: ['$userId', userId],
                  },
                ],
              },
            },
          },
        ],
      },
    },
    {
      $addFields: {
        isFavorite: {
          $ne: ['$pinBoards', []],
        },
      },
    },
    {
      $match: {
        isFavorite: filter !== -1,
      },
    },
  ]
}
