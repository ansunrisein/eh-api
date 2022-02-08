export type Sort = 'asc' | 'desc' | 'none'

export const mapSortStateToState = (state: Sort): number =>
  state === 'none' ? 0 : state === 'desc' ? -1 : state === 'asc' ? 1 : NaN
