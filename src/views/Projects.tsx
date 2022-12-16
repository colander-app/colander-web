import { observer } from 'mobx-react-lite'
import { TableView } from '../containers/TableView'
import { useRootStore } from '../context/RootStoreContext'

export const ProjectsView = observer(() => {
  const { store } = useRootStore()
  return (
    <TableView
      columns={{
        name: 'Name',
        created_on: 'Created On',
        created_by: 'Created By',
      }}
      rows={Array.from(store.projects.values())}
      zeroStateNode="No Projects"
    />
  )
})
