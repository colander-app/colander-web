import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import reportWebVitals from './reportWebVitals'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ResourceCalendarView } from './views/ResourceCalendarView'
import { RootStoreProvider } from './context/RootStoreContext'
import { EventDetailSidebar } from './views/EventDetailSidebar'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: 'calendar',
        element: <ResourceCalendarView />,
        children: [{ path: 'event/:id', element: <EventDetailSidebar /> }],
      },
    ],
  },
])

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <RootStoreProvider>
    <RouterProvider router={router} />
  </RootStoreProvider>
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
