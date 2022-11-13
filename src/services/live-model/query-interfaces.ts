export interface QueryEventWindow {
  type: 'QueryEventWindow'
  resourceIds: string[]
  viewStart: Date
  viewEnd: Date
}

export type Queries = QueryEventWindow
