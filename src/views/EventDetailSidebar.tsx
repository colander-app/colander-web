import DatePicker from 'react-datepicker'
import { observer } from 'mobx-react-lite'
import { useParams } from 'react-router-dom'
import styled from 'styled-components'
import { useRootStore } from '../context/RootStoreContext'
import { forwardRef } from 'react'

const SidebarContainer = styled.div`
  border-left: solid 1px ${({ theme }) => theme.borderColor};
  background: #fff;
`

interface InputProps {
  value?: string
  onClick?: () => void
  onChange?: () => void
}

const DateInput = forwardRef<HTMLInputElement, InputProps>(
  ({ value, onClick, onChange }, ref) => {
    return (
      <div className="control">
        <input
          className="input"
          placeholder="Start"
          ref={ref}
          onClick={onClick}
          onChange={onChange}
          value={value}
        />
      </div>
    )
  }
)

export const EventDetailSidebar = observer(() => {
  const { store } = useRootStore()
  const { id } = useParams()

  if (!id) {
    return null
  }

  const [event] = store.getEvents([id])

  if (!event) {
    return null
  }

  const changeTentative = (checked: boolean) => {
    event.setTentative(checked)
  }

  const changeStart = (newStart: Date) => {
    event.changeDates(newStart.toISOString(), event.end_date)
  }

  const changeEnd = (newEnd: Date) => {
    event.changeDates(event.start_date, newEnd.toISOString())
  }

  const changeLabel = (text: string) => {
    event.updateLabel(text)
  }

  return (
    <SidebarContainer className="column is-one-quarter is-full-mobile px-3">
      <h2 className="is-size-3 mb-4">Event Details</h2>
      <div className="field">
        <label className="checkbox">
          <input
            type="checkbox"
            checked={event.tentative}
            onChange={(e) => changeTentative(e.target.checked)}
          />
          <span className="pl-2">
            <strong>Tentative</strong>
          </span>
        </label>
      </div>
      <div className="field">
        <div className="label">Label</div>
        <div className="control">
          <input
            className="input"
            type="text"
            placeholder="Label"
            defaultValue={event.label}
            onBlur={(e) => changeLabel(e.target.value)}
          />
        </div>
      </div>
      <div className="field">
        <div className="label">Start Date</div>
        <DatePicker
          selectsStart
          onChange={changeStart}
          selected={new Date(event.start_date)}
          startDate={new Date(event.start_date)}
          endDate={new Date(event.end_date)}
          customInput={<DateInput />}
        />
      </div>
      <div className="field">
        <div className="label">End Date</div>
        <DatePicker
          selectsEnd
          onChange={changeEnd}
          selected={new Date(event.end_date)}
          startDate={new Date(event.start_date)}
          endDate={new Date(event.end_date)}
          minDate={new Date(event.start_date)}
          customInput={<DateInput />}
        />
      </div>
    </SidebarContainer>
  )
})
