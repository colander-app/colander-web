import moment from 'moment'
import React, { useRef } from 'react'
import styled from 'styled-components'
import Color from 'color'
import Draggable, { DraggableEventHandler } from 'react-draggable'

interface EventBlockProps {
  numOfDays: number
  cellWidth: number
  offset: number
  bgColor: string
  striped?: boolean
  isPlaceholder?: boolean
  isDraggingPlaceholder?: boolean
  isHoveringPlaceholder?: boolean
}

export const EventBlock = styled.div<EventBlockProps>`
  z-index: 10;
  position: absolute;
  overflow-y: hidden;
  box-sizing: border-box;
  border-radius: 3px;
  min-height: 50px;
  border: solid 1px rgb(230, 230, 230);
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

  ${({ striped, bgColor }) => {
    if (striped) {
      return `
      background: repeating-linear-gradient(
        -45deg,
        ${bgColor},
        ${bgColor} 10px,
        ${Color(bgColor).lighten(0.1).hex()} 10px,
        ${Color(bgColor).lighten(0.1).hex()} 20px
      );`
    }
    return `background-color: ${bgColor};`
  }}
`

interface EventBubbleProps {
  start: Date
  end: Date
  offset: number
  width: number
  bgColor: string
  striped?: boolean
  onMove: (newStart: Date, newEnd: Date) => void
  onClick: () => void
}
export const EventBubble: React.FC<
  React.PropsWithChildren & EventBubbleProps
> = ({
  start,
  end,
  offset,
  width,
  bgColor,
  striped,
  children,
  onMove,
  onClick,
}) => {
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
        striped={striped}
        onClick={onClick}
        bgColor={bgColor}
      >
        {children}
      </EventBlock>
    </Draggable>
  )
}
