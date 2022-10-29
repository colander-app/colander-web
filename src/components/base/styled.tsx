import styled from 'styled-components'

interface DateBlockProps {
  isWeekend?: boolean
}
export const DateBlock = styled.div<DateBlockProps>`
  position: relative;
  min-width: 40px;
  min-height: 70px;
  border-right: ${(props) => props.theme.rowBorder};
  text-align: center;
  ${({ isWeekend, theme }) =>
    isWeekend ? `background-color: ${theme.weekendColor};` : null}
`
export const HeaderLabelBlock = styled.div<DateBlockProps>`
  min-width: 40px;
  min-height: 20px;
  text-align: center;
  border-right: ${(props) => props.theme.rowBorder};
  color: ${(props) => props.theme.dateColor};
  font-weight: bolder;
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
  min-width: 80px;
  max-width: 80px;
  padding-right: 10px;
  border-right: ${(props) => props.theme.rowBorder};
`

interface CalendarRowProps {
  isHeader?: boolean
  rows?: number
}
export const CalendarRow = styled.div<CalendarRowProps>`
  display: flex;
  min-height: ${(props) => (props.rows ?? 0) * 50}px;
  ${(props) =>
    props.isHeader ? `border-top: ${props.theme.rowBorder};` : null}
`

export const RowSeparator = styled.div`
  flex: 100%;
  border-top: ${(props) => props.theme.rowBorder};
`