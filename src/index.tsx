import ReactDOM from 'react-dom/client'
import './index.css'
import { MainLayout } from './layouts/MainLayout'
import reportWebVitals from './reportWebVitals'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { ResourceCalendarView } from './views/ResourceCalendarView'
import { RootStoreProvider } from './context/RootStoreContext'
import { EventDetailsView } from './views/EventDetailsView'

import 'react-datepicker/dist/react-datepicker.css'
import '@patternfly/patternfly/patternfly.css'

const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      {
        path: 'calendar',
        element: <ResourceCalendarView />,
        children: [{ path: 'event/:id', element: <EventDetailsView /> }],
      },
      {
        index: true,
        element: <Navigate to="/calendar" replace />,
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
