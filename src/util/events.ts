import moment from 'moment'
import { IEvent } from '../store'

export const doEventsOverlap = (e1: IEvent, e2: IEvent): boolean =>
  moment(e1.start).isBetween(e2.start, e2.end, 'day', '[]') ||
  moment(e1.end).isBetween(e2.start, e2.end, 'day', '[]') ||
  moment(e2.start).isBetween(e1.start, e1.end, 'day', '[]')

/**
 * Find out how many events will be pushing the current event down on a given date block
 */
export const getEventOffsetBuckets = (
  events: IEvent[]
): Array<Array<IEvent>> => {
  const offsetBuckets: Array<Array<IEvent>> = []
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

export const getEventOffsetsById = (
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

export const filterEventsStartingOn =
  (date: moment.Moment) => (event: IEvent) =>
    date.isSame(event.start, 'day')
