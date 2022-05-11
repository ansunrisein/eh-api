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
  const cursor = parseJson(after || '000000000000')

  if (sort?.nearestEvent && sort?.nearestEvent !== 'none') {
    const addFields = {
      $addFields: {
        _cursor: {
          _id: '$_id',
          nearestEvent: '$events.0.deadline',
        },
      },
    }

    if (typeof cursor === 'string' || !cursor.nearestEvent) {
      return [addFields]
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
                  {_id: {$lt: new ObjectId(cursor._id)}},
                ],
              },
              {$and: [{'_cursor.nearestEvent': null}, {_id: {$lt: new ObjectId(cursor._id)}}]},
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
                  {_id: {$gt: new ObjectId(cursor._id)}},
                ],
              },
              {$and: [{'_cursor.nearestEvent': null}, {_id: {$gt: new ObjectId(cursor._id)}}]},
            ],
          },
        },
      ]
    }
  }

  if (sort?.pin && sort?.pin !== 'none') {
    const addFields = {
      $addFields: {
        _cursor: {
          _id: '$_id',
          pin: '$isPin',
        },
      },
    }

    if (typeof cursor === 'string' || cursor.pin === undefined) {
      return [addFields]
    }

    if (sort.pin === 'asc') {
      return [
        addFields,
        {
          $match: {
            $or: [
              {'_cursor.pin': {$gt: cursor.pin}},
              {$and: [{'_cursor.pin': cursor.pin}, {_id: {$lt: new ObjectId(cursor._id)}}]},
              {$and: [{'_cursor.pin': null}, {_id: {$lt: new ObjectId(cursor._id)}}]},
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
              {$and: [{'_cursor.pin': cursor.pin}, {_id: {$gt: new ObjectId(cursor._id)}}]},
              {$and: [{'_cursor.pin': null}, {_id: {$gt: new ObjectId(cursor._id)}}]},
            ],
          },
        },
      ]
    }
  }

  if (sort?.favorite && sort?.favorite !== 'none') {
    const addFields = {
      $addFields: {
        _cursor: {
          _id: '$_id',
          favorite: '$isFavorite',
        },
      },
    }

    if (typeof cursor === 'string' || cursor.favorite === undefined) {
      return [addFields]
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
                  {_id: {$lt: new ObjectId(cursor._id)}},
                ],
              },
              {$and: [{'_cursor.favorite': null}, {_id: {$lt: new ObjectId(cursor._id)}}]},
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
                  {_id: {$gt: new ObjectId(cursor._id)}},
                ],
              },
              {$and: [{'_cursor.favorite': null}, {_id: {$gt: new ObjectId(cursor._id)}}]},
            ],
          },
        },
      ]
    }
  }

  if (sort?.views && sort?.views !== 'none') {
    const addFields = {
      $addFields: {
        _cursor: {
          _id: '$_id',
          views: '$views',
        },
      },
    }

    if (typeof cursor === 'string' || cursor.views === undefined) {
      return [addFields]
    }

    if (sort.views === 'asc') {
      return [
        addFields,
        {
          $match: {
            $or: [
              {'_cursor.views': {$gt: cursor.views}},
              {$and: [{'_cursor.views': cursor.views}, {_id: {$lt: new ObjectId(cursor._id)}}]},
            ],
          },
        },
      ]
    }

    if (sort.views === 'desc') {
      return [
        addFields,
        {
          $match: {
            $or: [
              {'_cursor.views': {$lt: cursor.views}},
              {$and: [{'_cursor.views': cursor.views}, {_id: {$gt: new ObjectId(cursor._id)}}]},
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
