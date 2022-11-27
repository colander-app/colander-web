import { Fragment, PropsWithChildren } from 'react'
import { observer } from 'mobx-react-lite'
import { NewEventHandle } from '../components/NewEventHandle'
import { DateList } from './DateList'
import {
  ResourceCalendarBlock,
  CalendarRow,
  ResourceLabelBlock,
  HeaderLabelBlock,
  RowSeparator,
  DateBlock,
} from '../components/base/styled'
import {
  getEventOffsetBuckets,
  getEventOffsetsById,
  filterEventsStartingOn,
} from '../util/events'
import { IResourceModel } from '../store/resource'
import { IEventModel } from '../store/event'
import { ResponsiveEventBubble } from './ResponsiveEventBubble'
import moment from 'moment'

interface Props {
  data: { resource: IResourceModel; events: IEventModel[] }[]
  onMoveEvent: (event: IEventModel, start: Date, end: Date) => void
  onAddEvent: (resource: IResourceModel, start: Date, end: Date) => void
  onSelectEvent: (id: string) => void
  startDate: Date
  numOfDays: number
  cellWidth: number
  bubbleHeight: number
  bubbleMargin: number
}

const makeGetHeight = (height: number, margin: number) => (count: number) =>
  count * height + (count + 1) * margin

const weekdayLabels = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

export const ResourceCalendar: React.FC<Props & PropsWithChildren> = observer(
  ({
    data,
    onMoveEvent,
    onAddEvent,
    onSelectEvent,
    startDate,
    numOfDays,
    cellWidth,
    bubbleHeight,
    bubbleMargin,
    children,
  }) => {
    const getHeight = makeGetHeight(bubbleHeight, bubbleMargin)
    const endDate = moment(startDate).add(numOfDays, 'days').toDate()
    return (
      <ResourceCalendarBlock className="column pr-0 pt-0">
        <CalendarRow isHeader>
          <ResourceLabelBlock />
          <DateList startDate={startDate} count={numOfDays}>
            {({ date, isWeekend }) => (
              <HeaderLabelBlock isWeekend={isWeekend}>
                <span className="is-block">
                  {weekdayLabels[date.weekday()]}
                </span>
                <span className="is-block">{date.date()}</span>
              </HeaderLabelBlock>
            )}
          </DateList>
        </CalendarRow>
        <CalendarRow isHeader>
          <RowSeparator />
        </CalendarRow>
        {data.map(({ resource, events }) => {
          const buckets = getEventOffsetBuckets(events)
          const eventOffsets = getEventOffsetsById(buckets)
          return (
            <Fragment key={resource.id}>
              <CalendarRow key={resource.id} height={getHeight(buckets.length)}>
                <ResourceLabelBlock>{resource.name}</ResourceLabelBlock>
                <DateList startDate={startDate} count={numOfDays}>
                  {({ date, isWeekend }) => (
                    <DateBlock isWeekend={isWeekend}>
                      {events
                        .filter(filterEventsStartingOn(date))
                        .map((event) => (
                          <ResponsiveEventBubble
                            key={event.id}
                            viewStart={startDate}
                            viewEnd={endDate}
                            event={event}
                            width={cellWidth}
                            offset={getHeight(eventOffsets[event.id])}
                            onClick={() => onSelectEvent(event.id)}
                            onMove={(start, end) =>
                              onMoveEvent(event, start, end)
                            }
                          />
                        ))}
                    </DateBlock>
                  )}
                </DateList>
              </CalendarRow>
              <CalendarRow>
                <ResourceLabelBlock />
                <DateList startDate={startDate} count={numOfDays}>
                  {({ date, isWeekend }) => (
                    <DateBlock isWeekend={isWeekend}>
                      <NewEventHandle
                        date={date.toDate()}
                        width={cellWidth}
                        onCreate={(start, end) =>
                          onAddEvent(resource, start, end)
                        }
                      />
                    </DateBlock>
                  )}
                </DateList>
              </CalendarRow>
              <CalendarRow>
                <RowSeparator />
              </CalendarRow>
            </Fragment>
          )
        })}
        {children}
      </ResourceCalendarBlock>
    )
  }
)
