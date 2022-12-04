import styled from 'styled-components'

interface DateBlockProps {
  width: number
  isWeekend?: boolean
}
export const DateBlock = styled.div<DateBlockProps>`
  position: relative;
  min-width: ${(p) => p.width}px;
  min-height: 50px;
  border-right: ${(props) => props.theme.rowBorder};
  text-align: center;
  ${({ isWeekend, theme }) =>
    isWeekend ? `background-color: ${theme.weekendColor};` : null}
`
export const HeaderLabelBlock = styled.div<DateBlockProps>`
  min-width: ${(p) => p.width}px;
  height: 3rem;
  text-align: center;
  border-right: ${(props) => props.theme.rowBorder};
  color: ${(props) => props.theme.headerTextColor};
  font-size: 12px;
  padding-top: 5px;
  ${({ isWeekend, theme }) =>
    isWeekend ? `background-color: ${theme.weekendColor};` : null}
`

export const ResourceLabelBlock = styled.div`
  display: flex;
  align-items: center;
  justify-content: right;
  box-sizing: border-box;
  min-width: 100px;
  max-width: 100px;
  padding-right: 10px;
  border-right: ${(props) => props.theme.rowBorder};
`

interface CalendarRowProps {
  topBorder?: boolean
  bottomBorder?: boolean
  height?: number
}
export const CalendarRow = styled.div<CalendarRowProps>`
  display: inline-flex;
  overflow-x: hidden;
  margin-top: 0;
  margin-bottom: 0;
  min-height: ${(props) => props.height ?? 0}px;
  ${(props) =>
    props.topBorder ? `border-top: ${props.theme.rowBorder};` : null}
  ${(props) =>
    props.bottomBorder ? `border-bottom: ${props.theme.rowBorder};` : null}
`

export const ResourceCalendarBlock = styled.div`
  overflow-x: scroll;
  margin-bottom: 100px;
`
