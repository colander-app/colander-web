Data Flow Model

## Events

Notes

- view based subscriptions.

Live Data Steps

- Client will subscribe to a websocket backed endpoint passing a given set of resource id's and a date range to subscribe to.
- Upon initial request, websocket will return the full set of events within that range.
- Any events created/updated within the subscription range will be sent to the client.
- Any events deleted within the subscription range will be sent to the client with a property "deleted" marked true. (Future requests will not contain the event)
- Client will close subscription when date range changes or view is changed / disconnected.

Client Model

- **storage:** Root mst model will contain a map of models by id as the source of truth for data on the client. Actions on this model will be:

  - updateX(snapshot) - add or update an event, where x is the model name

- **mutating:** All changes should be written to the model.

- **retrieval:** A service that manages model subscriptions and updates the data model by an injected function that will update the mst root model.
