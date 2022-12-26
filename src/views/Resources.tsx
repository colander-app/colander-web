import { observer } from 'mobx-react-lite'
import { TableView } from '../containers/TableView'
import { useRootStore } from '../context/RootStoreContext'

export const ResourcesView = observer(() => {
  const { resources } = useRootStore()
  const onClickAdd = () => {
    // show a modal with a new resource
    alert('TODO :)')
  }
  return (
    <TableView
      columns={{
        name: 'Name',
      }}
      keyProp="id"
      searchPlaceholder="Search Resources"
      searchKeys={['name']}
      rows={Array.from(resources.store.items.values())}
      zeroStateNode="No Resources"
      addBtnText="Add a Resource"
      onAddBtnClick={onClickAdd}
    />
  )
})
