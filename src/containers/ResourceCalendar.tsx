// @ts-nocheck
import React, { Fragment, PropsWithChildren } from 'react'
import { observer } from 'mobx-react-lite'
import { NewEventHandle } from '../components/NewEventHandle'
import { DateList } from './DateList'
import {
  ResourceCalendarBlock,
  CalendarRow,
  ResourceLabelBlock,
  HeaderLabelBlock,
  DateBlock,
} from '../components/base/styled'
import {
  getEventOffsetBuckets,
  getEventOffsetsById,
  filterEventsStartingOn,
  eventsInRange,
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

const rowHasBottomBorder = (rowIndex: number, rowCount: number) =>
  rowIndex === rowCount - 1

const getNewEventRowHeight = (bubbleHeight: number, marginHeight: number) => {
  return bubbleHeight + marginHeight * 1
}

const getEventRowHeight = (
  bubbleHeight: number,
  marginHeight: number,
  bubbleCount: number,
  minEventRowBubbles = 1
) => {
  const minMarginCount = 1

  const bubbleCountTotal = Math.max(minEventRowBubbles, bubbleCount)
  const marginCountTotal = minMarginCount + bubbleCountTotal

  return bubbleHeight * bubbleCountTotal + marginHeight * marginCountTotal
}

const getLabelRowHeight = (
  bubbleHeight: number,
  marginHeight: number,
  bubbleCount: number
) => {
  return (
    getEventRowHeight(bubbleHeight, marginHeight, bubbleCount) +
    getNewEventRowHeight(bubbleHeight, marginHeight)
  )
}

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
    const endDate = moment(startDate).add(numOfDays, 'days').toDate()

    const resourceColumn = (
      <div className="flex flex-col">
        <CalendarRow topBorder>
          <ResourceLabelBlock style={{ height: '3rem' }} />
        </CalendarRow>
        {data.map(({ resource, events }, i) => {
          const buckets = getEventOffsetBuckets(
            eventsInRange(events, startDate, endDate)
          )
          const hasBottomBorder = rowHasBottomBorder(i, data.length)
          return (
            <React.Fragment key={resource.id}>
              <CalendarRow
                topBorder
                bottomBorder={hasBottomBorder}
                height={getLabelRowHeight(
                  bubbleHeight,
                  bubbleMargin,
                  buckets.length
                )}
              >
                <ResourceLabelBlock>{resource.name}</ResourceLabelBlock>
              </CalendarRow>
            </React.Fragment>
          )
        })}
      </div>
    )

    const dateLabelRow = (
      <CalendarRow topBorder>
        <DateList startDate={startDate} count={numOfDays}>
          {({ date, isWeekend }) => (
            <HeaderLabelBlock width={cellWidth} isWeekend={isWeekend}>
              <span className="block">{weekdayLabels[date.weekday()]}</span>
              <span className="block">{date.date()}</span>
            </HeaderLabelBlock>
          )}
        </DateList>
      </CalendarRow>
    )
    return (
      <ResourceCalendarBlock>
        <div className="flex flex-row">
          {resourceColumn}
          <div className="w-full overflow-x-scroll">
            <div className="inline-flex flex-col">
              {dateLabelRow}
              {data.map(({ resource, events }, i) => {
                const buckets = getEventOffsetBuckets(
                  eventsInRange(events, startDate, endDate)
                )
                const eventOffsets = getEventOffsetsById(buckets)
                const hasBottomBorder = rowHasBottomBorder(i, data.length)
                return (
                  <Fragment key={resource.id}>
                    <CalendarRow
                      topBorder
                      height={getEventRowHeight(
                        bubbleHeight,
                        bubbleMargin,
                        buckets.length
                      )}
                    >
                      <DateList startDate={startDate} count={numOfDays}>
                        {({ date, isWeekend }) => (
                          <DateBlock width={cellWidth} isWeekend={isWeekend}>
                            {events
                              .filter(filterEventsStartingOn(date, startDate))
                              .map((event) => (
                                <ResponsiveEventBubble
                                  key={event.id}
                                  viewStart={startDate}
                                  viewEnd={endDate}
                                  event={event}
                                  width={cellWidth}
                                  offset={getEventRowHeight(
                                    bubbleHeight,
                                    bubbleMargin,
                                    eventOffsets[event.id],
                                    0
                                  )}
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
                    <CalendarRow
                      bottomBorder={hasBottomBorder}
                      height={getNewEventRowHeight(bubbleHeight, bubbleMargin)}
                    >
                      <DateList startDate={startDate} count={numOfDays}>
                        {({ date, isWeekend }) => (
                          <DateBlock width={cellWidth} isWeekend={isWeekend}>
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
                  </Fragment>
                )
              })}
            </div>
          </div>
        </div>
        {children}
      </ResourceCalendarBlock>
    )
  }
)
