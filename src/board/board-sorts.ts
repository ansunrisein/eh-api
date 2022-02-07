import {ObjectId} from 'mongodb'

export type BoardSort = 'asc' | 'desc' | 'none'

export const mapSortStateToState = (state: BoardSort): number =>
  state === 'none' ? 0 : state === 'desc' ? -1 : state === 'asc' ? 1 : NaN

export const makeSortByIsFavoritePipeline = ({
  userId,
  sort = 'none',
}: {
  userId?: ObjectId
  sort?: BoardSort
}) => {
  const favorite = mapSortStateToState(sort)

  if (!favorite) {
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
      $sort: {
        isFavorite: favorite,
      },
    },
  ]
}
