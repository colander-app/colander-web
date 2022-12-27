import ReactDOM from 'react-dom/client'
import './index.css'
import { RouterProvider } from 'react-router-dom'
import { RootStoreProvider } from './context/RootStoreContext'
import { router } from './router'
import { OrgContainer } from './containers/OrgContainer'

import 'react-datepicker/dist/react-datepicker.css'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <RootStoreProvider>
    <OrgContainer>
      <RouterProvider router={router} />
    </OrgContainer>
  </RootStoreProvider>
)
