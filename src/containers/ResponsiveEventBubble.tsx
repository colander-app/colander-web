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
        start={event.start}
        end={event.end}
        offset={offset}
        width={width}
        onClick={onClick}
        onMove={onMove}
      >
        <span style={{ fontSize: 12, fontWeight: 'bold' }}>{event.label}</span>
      </EventBubble>
    )
  }
)
