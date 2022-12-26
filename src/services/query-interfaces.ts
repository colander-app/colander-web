export interface QueryEventWindow {
  type: 'subscribeToEventRange'
  resourceIds: string[]
  viewStart: Date
  viewEnd: Date
}

export type Queries = QueryEventWindow
