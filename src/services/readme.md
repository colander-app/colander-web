# Colander Services

## Front-End System Design

### Root Service

Initializes the core services for the app. These services are exposed to react components through a react context. This design allows the services to follow the react app lifecycle, allowing services to be destroyed without full-reload of the app.

### Overview

Model Store - Stores validated model instances in-memory.

```tsx
interface ModelStore<T extends { id: string }> {
  update: (input: unknown) => void
  get: (id: string) => void
	subscribe: (ids:string[]) => (() => void)
}
function useEvent(id:string) {
	const eventModel = useModel('event')
	useEffect(() => {
		const unsubscribe = eventModel.subscribe([id])
		return () => {
			unsubscribe()
		}
	}, [id])
}
function CalendarView({ id }) {
	const event = useEvent(id)
	return (
		<Detail event={event}>
	)
}
```
