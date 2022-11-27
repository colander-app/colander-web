import DatePicker from 'react-datepicker'
import { observer } from 'mobx-react-lite'
import { useRootStore } from '../context/RootStoreContext'
import {
  DrawerActions,
  DrawerCloseButton,
  DrawerHead,
  DrawerPanelBody,
  DrawerPanelContent,
} from '@patternfly/react-core'
import { DateInput } from '../components/DateInput'
import { useNavigate, useNavigation, useParams } from 'react-router-dom'

export const EventDetailsView = observer(() => {
  const { store } = useRootStore()
  const { id } = useParams()
  const navigate = useNavigate()

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

  const onClickClose = () => {
    navigate('/', { replace: true })
  }

  return (
    <DrawerPanelContent>
      <DrawerHead>
        <h3 className="pf-c-title pf-m-2xl">Event Details</h3>
        <DrawerActions>
          <DrawerCloseButton onClick={onClickClose} />
        </DrawerActions>
      </DrawerHead>
      <DrawerPanelBody>
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
      </DrawerPanelBody>
    </DrawerPanelContent>
  )
})
