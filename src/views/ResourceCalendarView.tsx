import { Outlet, useNavigate } from 'react-router-dom'
import { ResourceCalendar } from '../containers/ResourceCalendar'
import { useRootStore } from '../context/RootStoreContext'
import { useWindowEvent } from '../hooks/useWindowEvent'
import { Event, IEvent, IResource } from '../store'

export const ResourceCalendarView = () => {
  const { resources } = useRootStore()
  const navigate = useNavigate()

  const startDate = new Date()
  const cellWidth = 40
  const bubbleHeight = 50
  const bubbleMargin = 2

  const numOfDays = useWindowEvent(
    'resize',
    ({ innerWidth }) => Math.ceil(innerWidth / cellWidth),
    [cellWidth]
  )

  const onMoveEvent = (event: IEvent, start: Date, end: Date) => {
    event.changeDate(start, end)
  }

  const onAddEvent = (resource: IResource, start: Date, end: Date) => {
    resource.addEvent(
      Event.create({
        id: `${Math.random()}`,
        label: 'New Event',
        start,
        end,
      })
    )
  }

  const onSelectEvent = (id: string) => {
    navigate(`event/${id}`)
  }

  return (
    <ResourceCalendar
      resources={resources}
      onMoveEvent={onMoveEvent}
      onAddEvent={onAddEvent}
      onSelectEvent={onSelectEvent}
      startDate={startDate}
      numOfDays={numOfDays}
      cellWidth={cellWidth}
      bubbleHeight={bubbleHeight}
      bubbleMargin={bubbleMargin}
    >
      <Outlet />
    </ResourceCalendar>
  )
}
