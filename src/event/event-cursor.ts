import {ObjectId} from 'mongodb'
import {EventCursor, EventsSort} from './model'
import {Page} from '../pagination/model'
import {tryCatch} from '../shared/tryCatch'

const parseJson = tryCatch(
  (cursor: string): EventCursor => JSON.parse(cursor),
  (_, cursor) => cursor,
)

export const makePaginationPipeline = ({
  sort,
  after,
}: {
  sort?: EventsSort
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
    cursor.deadline
  ) {
    const addFields = {
      $addFields: {
        _cursor: {
          _id: '$_id',
          deadline: '$deadline',
        },
      },
    }

    if (sort.nearestEvent === 'asc') {
      return [
        {
          $match: {
            $or: [
              {deadline: {$gt: new Date(cursor.deadline)}},
              {
                $and: [
                  {deadline: new Date(cursor.deadline)},
                  {_id: {$gt: new ObjectId(cursor._id)}},
                ],
              },
              {$and: [{deadline: null}, {_id: {$gt: new ObjectId(cursor._id)}}]},
            ],
          },
        },
        addFields,
      ]
    }

    if (sort.nearestEvent === 'desc') {
      return [
        {
          $match: {
            $or: [
              {deadline: {$lt: new Date(cursor.deadline)}},
              {
                $and: [
                  {deadline: new Date(cursor.deadline)},
                  {_id: {$lt: new ObjectId(cursor._id)}},
                ],
              },
              {$and: [{deadline: null}, {_id: {$lt: new ObjectId(cursor._id)}}]},
            ],
          },
        },
        addFields,
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
