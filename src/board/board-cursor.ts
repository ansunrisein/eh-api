import {BoardCursor, BoardsSort} from './model'
import {tryCatch} from '../shared/tryCatch'
import {Page} from '../pagination/model'
import {ObjectId} from 'mongodb'

const parseJson = tryCatch(
  (cursor: string): BoardCursor => JSON.parse(cursor),
  (_, cursor) => cursor,
)

export const makePaginationPipeline = ({
  sort,
  after,
}: {
  sort?: BoardsSort
  after: Page['after']
}) => {
  if (!after) {
    return []
  }

  const cursor = parseJson(after)

  if (
    sort?.nearestEvent &&
    sort?.nearestEvent !== 'none' &&
    typeof cursor !== 'string' &&
    cursor.nearestEvent
  ) {
    const addFields = {
      $addFields: {
        _cursor: {
          _id: '$_id',
          nearestEvent: '$events.0.deadline',
        },
      },
    }

    if (sort.nearestEvent === 'asc') {
      return [
        addFields,
        {
          $match: {
            $or: [
              {'_cursor.nearestEvent': {$gt: new Date(cursor.nearestEvent)}},
              {
                $and: [
                  {'_cursor.nearestEvent': new Date(cursor.nearestEvent)},
                  {_id: {$gt: new ObjectId(cursor._id)}},
                ],
              },
              {$and: [{'_cursor.nearestEvent': null}, {_id: {$gt: new ObjectId(cursor._id)}}]},
            ],
          },
        },
      ]
    }

    if (sort.nearestEvent === 'desc') {
      return [
        addFields,
        {
          $match: {
            $or: [
              {'_cursor.nearestEvent': {$lt: new Date(cursor.nearestEvent)}},
              {
                $and: [
                  {'_cursor.nearestEvent': new Date(cursor.nearestEvent)},
                  {_id: {$lt: new ObjectId(cursor._id)}},
                ],
              },
              {$and: [{'_cursor.nearestEvent': null}, {_id: {$lt: new ObjectId(cursor._id)}}]},
            ],
          },
        },
      ]
    }
  }

  if (sort?.pin && sort?.pin !== 'none' && typeof cursor !== 'string' && cursor.pin) {
    const addFields = {
      $addFields: {
        _cursor: {
          _id: '$_id',
          pin: '$isPin',
        },
      },
    }

    if (sort.pin === 'asc') {
      return [
        addFields,
        {
          $match: {
            $or: [
              {'_cursor.pin': {$gt: cursor.pin}},
              {
                $and: [{'_cursor.pin': cursor.pin}, {_id: {$gt: new ObjectId(cursor._id)}}],
              },
              {$and: [{'_cursor.pin': null}, {_id: {$gt: new ObjectId(cursor._id)}}]},
            ],
          },
        },
      ]
    }

    if (sort.pin === 'desc') {
      return [
        addFields,
        {
          $match: {
            $or: [
              {'_cursor.pin': {$lt: cursor.pin}},
              {
                $and: [{'_cursor.pin': cursor.pin}, {_id: {$lt: new ObjectId(cursor._id)}}],
              },
              {$and: [{'_cursor.pin': null}, {_id: {$lt: new ObjectId(cursor._id)}}]},
            ],
          },
        },
      ]
    }
  }

  if (
    sort?.favorite &&
    sort?.favorite !== 'none' &&
    typeof cursor !== 'string' &&
    cursor.favorite
  ) {
    const addFields = {
      $addFields: {
        _cursor: {
          _id: '$_id',
          favorite: '$isFavorite',
        },
      },
    }

    if (sort.favorite === 'asc') {
      return [
        addFields,
        {
          $match: {
            $or: [
              {'_cursor.favorite': {$gt: cursor.favorite}},
              {
                $and: [
                  {'_cursor.favorite': cursor.favorite},
                  {_id: {$gt: new ObjectId(cursor._id)}},
                ],
              },
              {$and: [{'_cursor.favorite': null}, {_id: {$gt: new ObjectId(cursor._id)}}]},
            ],
          },
        },
      ]
    }

    if (sort.favorite === 'desc') {
      return [
        addFields,
        {
          $match: {
            $or: [
              {'_cursor.favorite': {$lt: cursor.favorite}},
              {
                $and: [
                  {'_cursor.favorite': cursor.favorite},
                  {_id: {$lt: new ObjectId(cursor._id)}},
                ],
              },
              {$and: [{'_cursor.favorite': null}, {_id: {$lt: new ObjectId(cursor._id)}}]},
            ],
          },
        },
      ]
    }
  }

  return [
    {
      $match: {
        _id: {
          $gt: new ObjectId(typeof cursor === 'string' ? cursor : cursor._id),
        },
      },
    },
  ]
}
