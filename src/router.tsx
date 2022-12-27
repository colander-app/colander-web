import { MainLayout } from './layouts/MainLayout'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { ResourceCalendarView } from './views/ResourceCalendar'
import { EventDetailsView } from './views/EventDetails'
import { ResourcesView } from './views/Resources'
import { ProjectsView } from './views/Projects'
import { ResourceDetailsView } from './views/ResourceDetails'
import { ProjectDetailsView } from './views/ProjectDetails'

export const router = createBrowserRouter([
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
        children: [{ path: ':id', element: <ResourceDetailsView /> }],
      },
      {
        path: 'projects',
        element: <ProjectsView />,
        children: [{ path: ':id', element: <ProjectDetailsView /> }],
      },
      {
        index: true,
        element: <Navigate to="/calendar" replace />,
      },
    ],
  },
])
