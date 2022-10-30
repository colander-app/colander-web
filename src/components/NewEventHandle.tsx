import moment from 'moment'
import { useRef, useState } from 'react'
import { DraggableCore, DraggableEventHandler } from 'react-draggable'
import styled from 'styled-components'
import { EventBlock } from './EventBubble'

interface Props {
  date: Date
  width: number
  onCreate: (start: Date, end: Date) => void
}

const Label = styled.span`
  color: #fff;
  font-weight: bold;
`

export const NewEventHandle = ({ date, width, onCreate }: Props) => {
  const nodeRef = useRef<HTMLDivElement>(null)
  const [numOfDays, setNumOfDays] = useState(1)
  const [dragging, setDragging] = useState(false)
  const [hovering, setHovering] = useState(false)

  const gridX = width + 1

  const onDrag: DraggableEventHandler = (_, data) => {
    setNumOfDays(Math.max(Math.floor(data.x / gridX) + 1, 1))
  }

  const onStart: DraggableEventHandler = (_, data) => {
    setDragging(true)
  }

  const onStop: DraggableEventHandler = () => {
    const newEnd = moment(date)
      .add(numOfDays - 1, 'days')
      .toDate()
    onCreate(date, newEnd)
    setDragging(false)
    setNumOfDays(1)
  }

  const onMouseMove: React.MouseEventHandler<HTMLDivElement> = (event) => {
    if (event.nativeEvent.buttons === 0 && !hovering) {
      setHovering(true)
    }
  }

  const onMouseLeave: React.MouseEventHandler<HTMLDivElement> = () => {
    setHovering(false)
  }

  return (
    <DraggableCore
      onDrag={onDrag}
      onStart={onStart}
      onStop={onStop}
      grid={[41, 0]}
    >
      <EventBlock
        isPlaceholder
        isDraggingPlaceholder={dragging}
        isHoveringPlaceholder={hovering}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        ref={nodeRef}
        numOfDays={numOfDays}
        cellWidth={width}
        offset={0}
      >
        <Label>{!dragging ? '+' : null}</Label>
      </EventBlock>
    </DraggableCore>
  )
}
