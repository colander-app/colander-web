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
  (date: moment.Moment) => (event: IEventModel) =>
    date.isSame(event.start_date, 'day')
