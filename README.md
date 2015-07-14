NuclearJS Router
===

## API

### Router

### new Router( reactor : Nuclear.Reactor )

Instatiates a new Router bound to a Nuclear Reactor

#### Router#go( location : String ) : void

#### Router#registerRoutes( routes : Route[] ) : void

#### Router#registerCatchallRoute( routes : Route[] ) : void

#### Router#getLocation() : String

#### Router#redirect( location : String )

#### Router#windowNavigate( location : String )

#### Router#onBeforeGo( handler : Function )

### Type: Route

#### match : String|RegExp

#### handle : Function[]



Causes a real page navigation by using `window.location`
