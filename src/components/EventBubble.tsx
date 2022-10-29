import moment from 'moment'
import React from 'react'
import styled from 'styled-components'

interface EventBlockProps {
  numOfDays: number
  cellWidth: number
  offset: number
}
const EventBlock = styled.div<EventBlockProps>`
  z-index: 10;
  position: absolute;
  box-sizing: border-box;
  border: solid 1px #333;
  margin-bottom: 1px;
  border-radius: 4px;
  min-height: 50px;
  background-color: rgb(250, 250, 250);
  width: ${({ cellWidth, numOfDays }) =>
    cellWidth * numOfDays + numOfDays - 1}px;
  margin-top: ${(props) => props.offset}px;
`

interface EventBubbleProps {
  start: Date
  end: Date
  offset: number
  width: number
}
export const EventBubble: React.FC<
  React.PropsWithChildren & EventBubbleProps
> = ({ start, end, offset, width, children }) => {
  const numOfDays = Math.max(moment(end).diff(start, 'days'), 1)
  return (
    <EventBlock numOfDays={numOfDays} cellWidth={width} offset={offset}>
      {children}
    </EventBlock>
  )
}
