import {ObjectId} from 'mongodb'
import {mapSortStateToState, Sort} from '../shared/sort'

export const makeSortByIsFavoritePipeline = ({
  userId,
  sort = 'none',
}: {
  userId?: ObjectId
  sort?: Sort
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

export const makeSortByIsPinPipeline = ({
  userId,
  sort = 'none',
}: {
  userId?: ObjectId
  sort?: Sort
}) => {
  const pin = mapSortStateToState(sort)

  if (!pin) {
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
      $sort: {
        isFavorite: pin,
      },
    },
  ]
}

export const makeSortByNearestEventPipeline = ({sort = 'none'}: {sort?: Sort}) => {
  const nearestEvent = mapSortStateToState(sort)

  if (!nearestEvent) {
    return []
  }

  return [
    {
      $lookup: {
        from: 'events',
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
                    $gt: ['$deadline', new Date()],
                  },
                ],
              },
            },
          },
          {
            $sort: {
              deadline: 1,
            },
          },
        ],
        as: 'events',
      },
    },
    {
      $addFields: {
        hasEvents: {
          $ne: ['$events', []],
        },
      },
    },
    {
      $sort: {
        hasEvents: -1,
        'events.0.deadline': nearestEvent,
      },
    },
  ]
}
