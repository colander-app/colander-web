import ReactDOM from 'react-dom/client'
import './index.css'
import { MainLayout } from './layouts/MainLayout'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { ResourceCalendarView } from './views/ResourceCalendar'
import { RootStoreProvider } from './context/RootStoreContext'
import { EventDetailsView } from './views/EventDetailsView'
import { ResourcesView } from './views/Resources'
import { ProjectsView } from './views/Projects'

import 'react-datepicker/dist/react-datepicker.css'

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
        path: 'resources',
        element: <ResourcesView />,
      },
      {
        path: 'projects',
        element: <ProjectsView />,
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
