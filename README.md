# Colander Web

This repository contains the web UI for Colander App. The project is built with github actions and hosted on AWS via the serverless framework. The web app is built upon React/Typescript (UI framework), Mobx-state-tree (state management), Tailwind (css framework) and websockets for real-time collaboration.

## Architecture

The application is split into several main components under the src directory:

- **views** - Contains top level views, which are just components that combine all the View logic contained in react hooks with the display components defined in the components directory. Views do not define new logic but are just glue components to create a given view.

- **components** - Contains simple UI building blocks. These do not contain business logic and are the only components allowed to render actual HTML code. Views build there interface using these components. They can capture user input or display passed in information.

- **services** - Contains the brains of the application. Services are typically instantiated at the root level of the application and are shared via React Context. They define the logic to load and persist data for the app, and provide authentication for the user. The data layer is built upon web sockets and a model layer which persists changes to any data records as changes are observed in the interface, so components never have to figure out how to persist data to the backend. This also provides real-time updates as they occur in the backend, subscribed front-ends will receive the new data models and render them in place on the UI.

- **hooks** - Entrypoints into the services, or other composable UI logic.

- **layouts** - Overall UI structure containers, these are components which do not serve a specific user experience nor a generic interface component.

- **containers** - These components lie between views and components. They define isolated re-usable user experiences that can be composed into larger views. Often, they do not render an interface but simply provide logic, the consumer must define the interface typically in the view itself where there is additional context.
