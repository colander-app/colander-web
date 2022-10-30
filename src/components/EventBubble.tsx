import moment from 'moment'
import React, { useRef } from 'react'
import styled from 'styled-components'
import Draggable, { DraggableEventHandler } from 'react-draggable'
import { Link } from 'react-router-dom'

interface EventBlockProps {
  numOfDays: number
  cellWidth: number
  offset: number
  isPlaceholder?: boolean
  isDraggingPlaceholder?: boolean
  isHoveringPlaceholder?: boolean
}

export const EventBlock = styled.div<EventBlockProps>`
  z-index: 10;
  position: absolute;
  box-sizing: border-box;
  border-radius: 3px;
  min-height: 50px;
  border: solid 1px rgb(230, 230, 230);
  background-color: ${(props) => props.theme.greenEventColor};
  width: ${({ cellWidth, numOfDays }) => cellWidth * numOfDays}px;
  margin-top: ${(props) => props.offset}px;

  ${({ isHoveringPlaceholder, isDraggingPlaceholder, isPlaceholder }) => {
    if (isDraggingPlaceholder) {
      return 'opacity: 1;'
    }
    if (isHoveringPlaceholder) {
      return 'opacity: 0.4;'
    }
    if (isPlaceholder) {
      return 'opacity: 0;'
    }
  }}
`

interface EventBubbleProps {
  start: Date
  end: Date
  offset: number
  width: number
  onMove: (newStart: Date, newEnd: Date) => void
  onClick: () => void
}
export const EventBubble: React.FC<
  React.PropsWithChildren & EventBubbleProps
> = ({ start, end, offset, width, children, onMove, onClick }) => {
  const nodeRef = useRef<HTMLDivElement>(null)
  const numOfDays = moment(end).diff(start, 'days') + 1
  const gridX = width

  const onStop: DraggableEventHandler = (_, data) => {
    const daysDelta = data.x / gridX
    const newStart = moment(start).add(daysDelta, 'days').toDate()
    const newEnd = moment(end).add(daysDelta, 'days').toDate()
    onMove(newStart, newEnd)
  }

  return (
    <Draggable nodeRef={nodeRef} axis="x" grid={[gridX, 0]} onStop={onStop}>
      <EventBlock
        ref={nodeRef}
        numOfDays={numOfDays}
        cellWidth={width}
        offset={offset}
        onClick={onClick}
      >
        {children}
      </EventBlock>
    </Draggable>
  )
}
