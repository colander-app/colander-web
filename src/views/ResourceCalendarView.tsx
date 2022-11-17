import { values } from 'mobx'
import { observer } from 'mobx-react-lite'
import { getSnapshot } from 'mobx-state-tree'
import moment from 'moment'
import { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { ResourceCalendar } from '../containers/ResourceCalendar'
import { useRootStore } from '../context/RootStoreContext'
import { useWindowEvent } from '../hooks/useWindowEvent'
import { IEventModel } from '../store/event'
import { IResourceModel } from '../store/resource'

interface QueryEventWindow {
  type: 'QueryEventWindow'
  resourceIds: string[]
  viewStart: Date
  viewEnd: Date
}

const makeQueryEventWindow = (
  resourceIds: string[],
  viewStart: Date,
  viewEnd: Date
): QueryEventWindow => {
  return {
    type: 'QueryEventWindow',
    resourceIds,
    viewStart,
    viewEnd,
  }
}

type CalendarRow = { resource: IResourceModel; events: IEventModel[] }

const useEventsAsCalendarRowData = (
  resourceIds: string[],
  start: Date,
  end: Date
): CalendarRow[] => {
  const { store, subscribe } = useRootStore()

  useEffect(() => {
    const unsubscribe = subscribe(makeQueryEventWindow(resourceIds, start, end))
    return () => {
      unsubscribe()
    }
  }, [start, end, resourceIds.join()])

  const storeEvents = Array.from(store.events.values())
  return resourceIds.map((id) => ({
    resource: store.resources.get(id) as IResourceModel,
    events: storeEvents.filter((event) => event.resource === id),
  }))
}

export const ResourceCalendarView = observer(() => {
  const { store } = useRootStore()
  const navigate = useNavigate()

  const resourceIds = ['r1', 'r2', 'r3', 'r4']
  const startDate = new Date()
  const cellWidth = 40
  const bubbleHeight = 50
  const bubbleMargin = 2

  const numOfDays = useWindowEvent(
    'resize',
    ({ innerWidth }) => Math.ceil(innerWidth / cellWidth),
    [cellWidth]
  )

  const calendarRows = useEventsAsCalendarRowData(
    resourceIds,
    startDate,
    moment(startDate).add(numOfDays, 'days').toDate()
  )
  console.log('get resources', resourceIds, calendarRows)

  const onMoveEvent = (event: IEventModel, start: Date, end: Date) => {
    event.changeDates(start, end)
  }

  const onAddEvent = (resource: IResourceModel, start: Date, end: Date) => {
    const label = 'New Event'
    store.createEvent(resource.id, label, start, end)
  }

  const onSelectEvent = (id: string) => {
    navigate(`event/${id}`)
  }

  return (
    <div className="columns mt-0 mb-0">
      <ResourceCalendar
        data={calendarRows}
        onMoveEvent={onMoveEvent}
        onAddEvent={onAddEvent}
        onSelectEvent={onSelectEvent}
        startDate={startDate}
        numOfDays={numOfDays}
        cellWidth={cellWidth}
        bubbleHeight={bubbleHeight}
        bubbleMargin={bubbleMargin}
      />
      <Outlet />
    </div>
  )
})
