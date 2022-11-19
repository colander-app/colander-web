import { observer } from 'mobx-react-lite'
import { EventBubble } from '../components/EventBubble'
import { IEventModel } from '../store/event'

interface Props {
  event: IEventModel
  offset: number
  width: number
  onMove: (newStart: Date, newEnd: Date) => void
  onClick: () => void
}

export const ResponsiveEventBubble = observer(
  ({ event, offset, width, onClick, onMove }: Props) => {
    return (
      <EventBubble
        key={event.id}
        start={new Date(event.start_date)}
        end={new Date(event.end_date)}
        offset={offset}
        width={width}
        striped={event.tentative}
        bgColor={event.color}
        onClick={onClick}
        onMove={onMove}
      >
        <span style={{ fontSize: 12, fontWeight: 'bold' }}>{event.label}</span>
      </EventBubble>
    )
  }
)
