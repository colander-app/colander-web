import { ThemeProvider } from 'styled-components'
import { Link, Outlet } from 'react-router-dom'

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
      <nav className="navbar" role="navigation" aria-label="main navigation">
        <div className="navbar-brand">
          <span className="navbar-item has-text-weight-bold">
            Surveillance One, Inc
          </span>
          <a
            role="button"
            className="navbar-burger"
            aria-label="menu"
            aria-expanded="false"
          >
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
          </a>
        </div>
        <div className="navbar-menu is-active">
          <div className="navbar-start">
            <Link to="/calendar" className="navbar-item">
              Calendar
            </Link>
            {/* <a className="navbar-item active">Projects</a> */}
            <a className="navbar-item">Resources</a>
          </div>
          <div className="navbar-end">
            <div className="navbar-item has-dropdown is-hoverable">
              <a className="navbar-link">Account</a>

              <div className="navbar-dropdown">
                <a className="navbar-item">Preferences</a>
                <a className="navbar-item">Integrations</a>
                <hr className="navbar-divider" />
                <a className="navbar-item">Sign Out</a>
              </div>
            </div>
          </div>
        </div>
      </nav>
      <Outlet />
      <footer className="footer">
        <div className="content has-text-centered is-size-7">
          <p>
            Powered By <b>COLANDERAPP.IO</b>
          </p>
        </div>
      </footer>
    </ThemeProvider>
  )
}

export default App
