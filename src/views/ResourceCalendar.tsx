import { observer } from 'mobx-react-lite'
import moment from 'moment'
import { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { ResourceCalendar } from '../containers/ResourceCalendar'
import { useRootStore } from '../context/RootStoreContext'
import { useWindowEvent } from '../hooks/useWindowEvent'
import { IEventModel } from '../store/event'
import { IResourceModel } from '../store/resource'
import ChevronLeftIcon from '@heroicons/react/24/solid/ChevronLeftIcon'
import ChevronRightIcon from '@heroicons/react/24/solid/ChevronRightIcon'
import { QueryEventWindow } from '../services/live-model/query-interfaces'

const makeQueryEventWindow = (
  resourceIds: string[],
  viewStart: Date,
  viewEnd: Date
): QueryEventWindow => {
  return {
    type: 'subscribeToEventRange',
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

  const resourceIds = ['r1', 'r2', 'r3', 'r4']
  const [startDateISO, setStartDateISO] = useState(
    moment().startOf('month').startOf('day').toISOString()
  )
  const startDate = new Date(startDateISO)

  // Current MAGIC VALUES
  const cellWidth = 50
  const bubbleHeight = 50
  const bubbleMargin = 2

  const numOfDaysInWindow = useWindowEvent(
    'resize',
    ({ innerWidth }) => Math.ceil(innerWidth / cellWidth),
    [cellWidth]
  )
  const numOfDays = moment(startDate)
    .add(numOfDaysInWindow)
    .endOf('month')
    .diff(startDate, 'days')

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

  const onPrevious = () => {
    setStartDateISO(
      moment(startDateISO).subtract(1, 'month').startOf('month').toISOString()
    )
  }

  const onNext = () => {
    setStartDateISO(
      moment(startDateISO).add(1, 'month').startOf('month').toISOString()
    )
  }

  const onToday = () => {
    setStartDateISO(moment().startOf('month').startOf('day').toISOString())
  }

  const onSelectEvent = (id: string) => {
    navigate(`event/${id}`)
  }

  return (
    <div className="mx-0">
      <div className="flex px-3 py-1 space-x-4 align-middle content-center">
        <button
          className="text-md text-gray-700 hover:text-gray-500"
          onClick={onToday}
        >
          Today
        </button>
        <button
          className="h-8 inline-flex text-gray-700 hover:text-gray-500"
          onClick={onPrevious}
        >
          <ChevronLeftIcon className="h-full" />
        </button>
        <button
          className="h-8 inline-flex text-gray-700 hover:text-gray-500"
          onClick={onNext}
        >
          <ChevronRightIcon className="h-full" />
        </button>
      </div>
      <ResourceCalendar
        data={calendarRows}
        onAddEvent={onAddEvent}
        onMoveEvent={onMoveEvent}
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
