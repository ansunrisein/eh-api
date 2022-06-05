import {mapSortStateToState, Sort} from '../shared/sort'

export const makeSortByDeadlinePipeline = ({sort = 'none'}: {sort?: Sort}) => {
  const deadline = mapSortStateToState(sort)

  if (!deadline) {
    return []
  }

  return [
    {
      $addFields: {
        hasDeadline: {
          $gt: ['$deadline', 0],
        },
      },
    },
    {
      $sort: {
        hasDeadline: -1,
        deadline,
        _id: -deadline,
      },
    },
  ]
}
