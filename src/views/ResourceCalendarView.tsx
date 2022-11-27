import {
  Drawer,
  DrawerContent,
  DrawerContentBody,
} from '@patternfly/react-core'
import { observer } from 'mobx-react-lite'
import moment from 'moment'
import { useEffect } from 'react'
import { Outlet, useNavigate, useParams } from 'react-router-dom'
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start.toString(), end.toString(), resourceIds.join()])

  const storeEvents = Array.from(store.events.values())
  return resourceIds.map((id) => ({
    resource: store.resources.get(id) as IResourceModel,
    events: storeEvents.filter((event) => event.resource_id === id),
  }))
}

export const ResourceCalendarView = observer(() => {
  const { store } = useRootStore()
  const navigate = useNavigate()

  const { id } = useParams()
  const isExpanded = Boolean(id)

  const resourceIds = ['r1', 'r2', 'r3', 'r4']
  const startDate = moment().startOf('day').toDate()
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

  const onMoveEvent = (event: IEventModel, start: Date, end: Date) => {
    event.changeDates(start.toISOString(), end.toISOString())
  }

  const onAddEvent = (resource: IResourceModel, start: Date, end: Date) => {
    const label = 'New Event'
    store.createEvent(resource.id, label, start, end)
  }

  const onSelectEvent = (id: string) => {
    navigate(`event/${id}`, { replace: true })
  }

  return (
    <Drawer isExpanded={isExpanded} position="right">
      <DrawerContent panelContent={<Outlet />}>
        <DrawerContentBody>
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
          </div>
        </DrawerContentBody>
      </DrawerContent>
    </Drawer>
  )
})
