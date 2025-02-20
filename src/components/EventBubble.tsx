// @ts-nocheck
import React, { useRef, useState } from 'react'
import { DraggableCore, DraggableEventHandler } from 'react-draggable'
import styled from 'styled-components'
import moment from 'moment'
import Color from 'color'

interface EventBlockProps {
  numOfDays: number
  cellWidth: number
  offsetX: number
  offsetY: number
  bgColor: string
  striped?: boolean
  isPlaceholder?: boolean
  isDraggingPlaceholder?: boolean
  isHoveringPlaceholder?: boolean
}

export const EventBlock = styled.div<EventBlockProps>`
  z-index: 10;
  position: absolute;
  text-align: left;
  padding-left: 0.8em;
  overflow-y: hidden;
  box-sizing: border-box;
  border-radius: 3px;
  min-height: 50px;
  border: solid 1px rgb(230, 230, 230);
  width: ${({ cellWidth, numOfDays }) => cellWidth * numOfDays}px;
  margin-top: ${(p) => p.offsetY}px;
  left: ${(p) => p.offsetX}px;

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

const calculateDragView = ({
  grid,
  offset,
  start,
  end,
  viewStart,
}: {
  grid: number
  offset: number
  start: Date
  end: Date
  viewStart: Date
}) => {
  const pendingDaysOffset = offset / grid
  const numOfDays = moment(end).diff(start, 'days') + 1
  const pendingStart = moment(start).add(pendingDaysOffset, 'days')
  const hiddenDays = Math.max(0, moment(viewStart).diff(pendingStart, 'days'))
  const visibleNumOfDays = numOfDays - hiddenDays

  let visibleOffset = offset

  if (moment(start).isBefore(viewStart, 'days')) {
    visibleOffset =
      Math.max(
        0,
        moment(start).add(pendingDaysOffset, 'days').diff(viewStart, 'days')
      ) * grid
  } else if (pendingStart.isBefore(viewStart)) {
    visibleOffset =
      Math.max(pendingDaysOffset, moment(viewStart).diff(start, 'days')) * grid
  }

  return {
    visibleOffset,
    visibleNumOfDays,
  }
}

interface EventBubbleProps {
  viewStart: Date
  viewEnd: Date
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
  React.PropsWithChildren<EventBubbleProps>
> = ({
  viewStart,
  viewEnd,
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
  // Current drag offset position
  const [xOffset, setXOffset] = useState(0)
  // pixel offset from left side of event to touch down event
  const touchDownXRef = useRef<number>(0)
  // client position when of intiial touch down event
  const posRef = useRef<{ x: number; y: number }>()
  // Actual node being repositioned on drag
  const nodeRef = useRef<HTMLDivElement>(null)

  /**
   * Rules of movement:
   * move event based on drag position / cell size
   * Except when:
   *  start date is less than view window start date
   *    - don't shift block until pending start is greater than view start
   *    - remove pending hidden days from numOfDays
   *  pending start date is less than view window start date, but start date is gte view start
   *    - cap left movement to the amount of days between event start and view start
   *    - remove pending hidden days from numOfDays
   */
  const gridX = width

  const dragView = calculateDragView({
    grid: gridX,
    offset: xOffset,
    start,
    end,
    viewStart,
  })

  const onStart: DraggableEventHandler = (event, data) => {
    touchDownXRef.current = data.lastX
    // @ts-expect-error - draggable event doesn't include client positions
    posRef.current = { x: event.clientX, y: event.clientY }
  }

  const onDrag: DraggableEventHandler = (_, data) => {
    setXOffset(data.x - touchDownXRef.current)
  }

  const onStop: DraggableEventHandler = (event) => {
    const daysDelta = xOffset / gridX
    if (daysDelta !== 0) {
      const newStart = moment(start).add(daysDelta, 'days').toDate()
      const newEnd = moment(end).add(daysDelta, 'days').toDate()
      onMove(newStart, newEnd)
    }
    setXOffset(0)
    // @ts-expect-error - draggable event doesn't include client positions
    const { clientX, clientY } = event
    if (posRef.current?.x === clientX && posRef.current?.y === clientY) {
      onClick()
    }
  }

  return (
    <DraggableCore
      nodeRef={nodeRef}
      grid={[gridX, 0]}
      onStart={onStart}
      onDrag={onDrag}
      onStop={onStop}
    >
      <EventBlock
        ref={nodeRef}
        numOfDays={dragView.visibleNumOfDays}
        offsetX={dragView.visibleOffset}
        offsetY={offset}
        cellWidth={width}
        striped={striped}
        bgColor={bgColor}
      >
        {children}
      </EventBlock>
    </DraggableCore>
  )
}
