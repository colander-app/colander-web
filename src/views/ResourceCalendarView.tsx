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

const useLiveResources = (resourceIds: string[], start: Date, end: Date) => {
  const { store, liveData } = useRootStore()
  useEffect(() => {
    return liveData.subscribe({
      type: 'Resource',
      ids: resourceIds,
      start,
      end,
    })
  }, [start, end, resourceIds.join()])
  return store.getResources(resourceIds)
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

  const resources = useLiveResources(
    resourceIds,
    startDate,
    moment(startDate).add(numOfDays, 'days').toDate()
  )
  console.log('get resources', resourceIds, resources)

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
    <div className="columns mt-0">
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
      />
      <Outlet />
    </div>
  )
})
