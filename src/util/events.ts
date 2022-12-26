import moment from 'moment'
import { IEventModel } from '../store/event'

export const doEventsOverlap = (e1: IEventModel, e2: IEventModel): boolean =>
  moment(e1.start_date).isBetween(e2.start_date, e2.end_date, 'day', '[]') ||
  moment(e1.end_date).isBetween(e2.start_date, e2.end_date, 'day', '[]') ||
  moment(e2.start_date).isBetween(e1.start_date, e1.end_date, 'day', '[]')

/**
 * Find out how many events will be pushing the current event down on a given date block
 */
export const getEventOffsetBuckets = (
  events: Array<Readonly<IEventModel>>
): Array<Array<IEventModel>> => {
  const offsetBuckets: Array<Array<IEventModel>> = []
  events.forEach((event) => {
    let bucketIndex = offsetBuckets.findIndex(
      (bucket) => !bucket.some((e) => doEventsOverlap(e, event))
    )
    if (bucketIndex === -1) {
      bucketIndex = offsetBuckets.length
      offsetBuckets[bucketIndex] = []
    }
    offsetBuckets[bucketIndex].push(event)
  })
  return offsetBuckets
}

export const eventsInRange = (
  events: Array<IEventModel>,
  start: Date,
  end: Date
) => {
  const start_date = moment(start)
  const end_date = moment(end)
  return events.filter((event) => {
    return (
      start_date.isSameOrBefore(moment(event.end_date).local(), 'day') &&
      end_date.isSameOrAfter(moment(event.start_date).local(), 'day')
    )
  })
}

export const getEventOffsetsById = (
  buckets: Array<Array<Readonly<IEventModel>>>
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

export const filterEventsStartingOn =
  (date: moment.Moment, windowStart: Date) => (event: IEventModel) => {
    return (
      // event starts on this day
      date.isSame(moment(event.start_date).local(), 'day') ||
      // event is visible but starts before window
      (date.isSame(moment(windowStart), 'day') &&
        moment(windowStart).isBetween(
          moment(event.start_date).local(),
          moment(event.end_date).local(),
          'day',
          '[]'
        ))
    )
  }
