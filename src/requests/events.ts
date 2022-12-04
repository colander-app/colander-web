import { QueryEventWindow } from '../services/live-model/query-interfaces'

export const subscribeToEventRange = (query: QueryEventWindow) => ({
  action: 'subscribeToEventRange',
  query: {
    resource_ids: query.resourceIds,
    start_date: query.viewStart.toISOString(),
    end_date: query.viewEnd.toISOString(),
  },
})

export const unsubscribeFromEventRange = (
  resource_ids: QueryEventWindow['resourceIds']
) => ({
  action: 'unsubscribeFromEventRange',
  data: {
    resource_ids,
  },
})
