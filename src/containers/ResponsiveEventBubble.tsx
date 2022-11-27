import { observer } from 'mobx-react-lite'
import { EventBubble } from '../components/EventBubble'
import { IEventModel } from '../store/event'

interface Props {
  viewStart: Date
  viewEnd: Date
  event: IEventModel
  offset: number
  width: number
  onMove: (newStart: Date, newEnd: Date) => void
  onClick: () => void
}

export const ResponsiveEventBubble = observer(
  ({ event, offset, width, onClick, onMove, viewStart, viewEnd }: Props) => {
    return (
      <EventBubble
        key={event.id}
        viewStart={viewStart}
        viewEnd={viewEnd}
        start={new Date(event.start_date)}
        end={new Date(event.end_date)}
        offset={offset}
        width={width}
        striped={event.tentative}
        bgColor={event.color}
        onClick={onClick}
        onMove={onMove}
      >
        <span className="text-xs">{event.label}</span>
      </EventBubble>
    )
  }
)
