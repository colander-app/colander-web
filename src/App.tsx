import { ThemeProvider } from 'styled-components'
import { Outlet } from 'react-router-dom'

const borderColor = 'rgb(211, 211, 211)'
const primaryTheme = {
  borderColor,
  headerTextColor: 'rgb(120, 120, 120)',
  rowBorder: `solid 1px ${borderColor}`,
  weekendColor: 'rgb(246, 251, 251)',

  greenEventColor: 'rgba(54, 206, 106, 0.85)',
}

const App = () => {
  return (
    <ThemeProvider theme={primaryTheme}>
      <h1 className="is-size-1">Calendar</h1>
      <Outlet />
    </ThemeProvider>
  )
}

export default App
