import { ThemeProvider } from 'styled-components'
import { observer } from 'mobx-react-lite'
import { types, Instance } from 'mobx-state-tree'
import './App.scss'
import {
  CalendarRow,
  DateBlock,
  HeaderLabelBlock,
  ResourceLabelBlock,
  RowSeparator,
} from './components/base/styled'
import { useWindowEvent } from './hooks/useWindowEvent'
import { DateList } from './containers/DateList'
import { EventBubble } from './components/EventBubble'
import moment from 'moment'

const borderColor = 'rgb(154, 154, 154)'
const primaryTheme = {
  borderColor,
  rowBorder: `solid 1px ${borderColor}`,
  weekendColor: 'rgb(203, 203, 203)',
  dateColor: 'rgb(84, 84, 84)',
}

const Event = types.model({
  id: types.identifier,
  start: types.Date,
  end: types.Date,
  label: types.string,
})
type IEvent = Instance<typeof Event>

const Resource = types.model({
  id: types.identifier,
  name: types.string,
  events: types.array(Event),
})
type IResource = Instance<typeof Resource>

const RootStore = types
  .model({
    resources: types.array(Resource),
  })
  .actions((self) => ({
    replaceResources(resources: IResource[]) {
      self.resources.clear()
      self.resources.push(...resources)
    },
  }))

const createRootStore = () => {
  return RootStore.create()
}

const rootStore = createRootStore()

const resourceList = [...new Array(10)].map((_, id) => {
  const start = moment()
    .startOf('day')
    .add(Math.floor(Math.random() * 35) - 2, 'days')
    .toDate()
  const end = moment(start)
    .add(Math.floor(Math.random() * 15), 'days')
    .toDate()
  return Event.create({
    id: `${id + 1}`,
    start,
    end,
    label: `${id + 1}:${moment(start).format('MM/DD')}-${moment(end).format(
      'MM/DD'
    )}`,
  })
})

rootStore.replaceResources([
  Resource.create({
    id: '1',
    name: 'tom',
    events: resourceList,
  }),
  Resource.create({ id: '2', name: 'susan', events: [] }),
  Resource.create({ id: '3', name: 'gray', events: [] }),
])

const doEventsOverlap = (e1: IEvent, e2: IEvent): boolean =>
  moment(e1.start).isBetween(e2.start, e2.end, 'day', '[]') ||
  moment(e1.end).isBetween(e2.start, e2.end, 'day', '[]') ||
  moment(e2.start).isBetween(e1.start, e1.end, 'day', '[]')

/**
 * Find out how many events will be pushing the current event down on a given date block
 */
const getEventOffsetBuckets = (events: IEvent[]): Array<Array<IEvent>> => {
  const offsetBuckets: Array<Array<IEvent>> = []
  events.forEach((event) => {
    let bucketIndex = 0
    for (; bucketIndex < offsetBuckets.length; bucketIndex++) {
      const bucket = offsetBuckets[bucketIndex]
      const hasOverlap = bucket.some((bucketEvent) =>
        doEventsOverlap(bucketEvent, event)
      )
      if (!hasOverlap) {
        break
      }
    }
    if (bucketIndex >= offsetBuckets.length) {
      offsetBuckets[bucketIndex] = []
    }
    offsetBuckets[bucketIndex].push(event)
  })
  return offsetBuckets
}

const getEventOffsetsById = (
  buckets: Array<Array<IEvent>>
): Record<string, number> => {
  return buckets.reduce(
    (offsetMap, bucket, offset) => ({
      ...offsetMap,
      ...bucket.reduce(
        (bucketMap, event) => ({
          ...bucketMap,
          [event.id]: offset,
        }),
        {}
      ),
    }),
    {}
  )
}

const filterEventsStartingOn = (date: moment.Moment) => (event: IEvent) =>
  date.isSame(event.start, 'day')

const App = observer(() => {
  const { resources } = rootStore

  const cellWidth = 40
  const startDate = new Date()
  const numOfDates = useWindowEvent(
    'resize',
    ({ innerWidth }) => Math.ceil(innerWidth / cellWidth),
    [cellWidth]
  )

  return (
    <ThemeProvider theme={primaryTheme}>
      <div>
        <h1>Calendar</h1>
        <div className="resource-calendar">
          <CalendarRow isHeader>
            <ResourceLabelBlock />
            <DateList startDate={startDate} count={numOfDates}>
              {({ date, isWeekend }) => (
                <HeaderLabelBlock isWeekend={isWeekend}>
                  {date.date()}
                </HeaderLabelBlock>
              )}
            </DateList>
          </CalendarRow>
          <CalendarRow isHeader>
            <RowSeparator />
          </CalendarRow>
          {resources.map((resource) => {
            const buckets = getEventOffsetBuckets(resource.events)
            const eventOffsets = getEventOffsetsById(buckets)
            return (
              <div key={resource.id}>
                <CalendarRow rows={buckets.length}>
                  <ResourceLabelBlock>{resource.name}</ResourceLabelBlock>
                  <DateList startDate={startDate} count={numOfDates}>
                    {({ date, isWeekend }) => (
                      <DateBlock isWeekend={isWeekend}>
                        {resource.events
                          .filter(filterEventsStartingOn(date))
                          .map((event) => (
                            <EventBubble
                              key={event.id}
                              start={event.start}
                              end={event.end}
                              offset={eventOffsets[event.id] * 50}
                              width={cellWidth}
                            >
                              <span style={{ fontSize: 11 }}>
                                {event.label}
                              </span>
                            </EventBubble>
                          ))}
                      </DateBlock>
                    )}
                  </DateList>
                </CalendarRow>
                <CalendarRow>
                  <RowSeparator />
                </CalendarRow>
              </div>
            )
          })}
        </div>
      </div>
    </ThemeProvider>
  )
})

export default App
