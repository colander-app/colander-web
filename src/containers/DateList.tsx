import { Fragment, ReactNode } from 'react'
import moment from 'moment'

interface DateListProps {
  startDate: Date
  count: number
  children: (data: { date: moment.Moment; isWeekend: boolean }) => ReactNode
}

export const DateList = ({ startDate, count, children }: DateListProps) => (
  <>
    {[...new Array(count)].map((_, i) => {
      const date = moment(startDate).add(i, 'days')
      const key = date.toISOString()
      const isWeekend = date.isoWeekday() > 5
      return <Fragment key={key}>{children({ date, isWeekend })}</Fragment>
    })}
  </>
)
