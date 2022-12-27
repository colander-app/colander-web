import { observer } from 'mobx-react-lite'
import moment from 'moment'
import { useEffect, useLayoutEffect, useState } from 'react'
import {
  Outlet,
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom'
import { ResourceCalendar } from '../containers/ResourceCalendar'
import { useRootStore } from '../context/RootStoreContext'
import { useWindowEvent } from '../hooks/useWindowEvent'
import { IEventModel } from '../store/event'
import { IResourceModel } from '../store/resource'
import ChevronLeftIcon from '@heroicons/react/24/solid/ChevronLeftIcon'
import ChevronRightIcon from '@heroicons/react/24/solid/ChevronRightIcon'
import { QueryEventWindow } from '../services/query-interfaces'
import { v4 as uuidv4 } from 'uuid'
import { useSearchParamsState } from '../hooks/useSearchParamsState'

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
  const { resources, events, subscribe } = useRootStore()

  useEffect(() => {
    const unsubscribe = subscribe(makeQueryEventWindow(resourceIds, start, end))
    return () => {
      unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start.toString(), end.toString(), resourceIds.join()])

  const storeEvents = Array.from(events.store.items.values())
  return resourceIds.map((id) => ({
    resource: resources.store.items.get(id) as IResourceModel,
    events: storeEvents.filter((event) => event.resource_id === id),
  }))
}

const getTodayISO = () =>
  moment().startOf('month').startOf('day').format('YYYY-MM-DD')

export const ResourceCalendarView = observer(() => {
  const { events, resources } = useRootStore()
  const navigate = useNavigate()
  const location = useLocation()

  const resourceIds = Array.from(resources.store.items.values()).map(
    (r) => r.id
  )

  const [viewStartDateISO, setViewStartDateISO] = useSearchParamsState(
    'start',
    getTodayISO()
  )
  const startDate = moment(viewStartDateISO).startOf('day').toDate()

  // Current MAGIC VALUES
  const cellWidth = 50
  const bubbleHeight = 50
  const bubbleMargin = 2

  // const numOfDaysInWindow = useWindowEvent(
  //   'resize',
  //   ({ innerWidth }) => Math.ceil(innerWidth / cellWidth),
  //   [cellWidth]
  // )
  const numOfDays = moment(startDate).daysInMonth()
  // .add(numOfDaysInWindow)
  // .endOf('month')
  // .diff(startDate, 'days')

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
    events.store.set([
      {
        __type: 'event',
        id: uuidv4(),
        updated_at: new Date().toISOString(),
        start_date: start.toISOString(),
        end_date: end.toISOString(),
        resource_id: resource.id,
        tentative: false,
        color: '#CCC',
        label,
      },
    ])
  }

  const onPrevious = () => {
    setViewStartDateISO(
      moment(viewStartDateISO)
        .subtract(1, 'month')
        .startOf('month')
        .format('YYYY-MM-DD')
    )
  }

  const onNext = () => {
    setViewStartDateISO(
      moment(viewStartDateISO)
        .add(1, 'month')
        .startOf('month')
        .format('YYYY-MM-DD')
    )
  }

  const onToday = () => {
    setViewStartDateISO(
      moment().startOf('month').startOf('day').format('YYYY-MM-DD')
    )
  }

  const onSelectEvent = (id: string) => {
    navigate({ pathname: `event/${id}`, search: location.search })
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
