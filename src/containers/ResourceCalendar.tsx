import { EventBubble } from '../components/EventBubble'
import { NewEventHandle } from '../components/NewEventHandle'
import { DateList } from './DateList'
import { IEvent, IResource } from '../store'
import {
  ResourceCalendarBlock,
  CalendarRow,
  ResourceLabelBlock,
  HeaderLabelBlock,
  RowSeparator,
  DateBlock,
} from '../components/base/styled'
import { Fragment, PropsWithChildren } from 'react'
import { observer } from 'mobx-react-lite'
import {
  getEventOffsetBuckets,
  getEventOffsetsById,
  filterEventsStartingOn,
} from '../util/events'

interface Props {
  resources: IResource[]
  onMoveEvent: (event: IEvent, start: Date, end: Date) => void
  onAddEvent: (resource: IResource, start: Date, end: Date) => void
  onSelectEvent: (id: string) => void
  startDate: Date
  numOfDays: number
  cellWidth: number
  bubbleHeight: number
  bubbleMargin: number
}

const makeGetHeight = (height: number, margin: number) => (count: number) =>
  count * height + (count + 1) * margin

export const ResourceCalendar: React.FC<Props & PropsWithChildren> = observer(
  ({
    resources,
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
    return (
      <ResourceCalendarBlock>
        <CalendarRow isHeader>
          <ResourceLabelBlock />
          <DateList startDate={startDate} count={numOfDays}>
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
            <Fragment key={resource.id}>
              <CalendarRow key={resource.id} height={getHeight(buckets.length)}>
                <ResourceLabelBlock>{resource.name}</ResourceLabelBlock>
                <DateList startDate={startDate} count={numOfDays}>
                  {({ date, isWeekend }) => (
                    <DateBlock isWeekend={isWeekend}>
                      {resource.events
                        .filter(filterEventsStartingOn(date))
                        .map((event) => (
                          <EventBubble
                            key={event.id}
                            start={event.start}
                            end={event.end}
                            offset={getHeight(eventOffsets[event.id])}
                            width={cellWidth}
                            onMove={(start, end) =>
                              onMoveEvent(event, start, end)
                            }
                            onClick={() => onSelectEvent(event.id)}
                          >
                            <span style={{ fontSize: 11 }}>{event.label}</span>
                          </EventBubble>
                        ))}
                    </DateBlock>
                  )}
                </DateList>
              </CalendarRow>
              <CalendarRow isHeader>
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
