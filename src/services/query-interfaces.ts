export interface QueryEventWindow {
  type: 'subscribeToEventRange'
  resourceIds: string[]
  viewStart: Date
  viewEnd: Date
}

export interface SubscribeToOrg {
  type: 'subscribeToOrganization'
  organization_id: string
}

export type Queries = QueryEventWindow | SubscribeToOrg
