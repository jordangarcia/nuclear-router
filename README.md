NuclearJS Router
===

## API

### Router

### new Router( opts : Object )

Instatiates a new Router

#### Router#go( location : String ) : void

#### Router#registerRoutes( routes : Route[] ) : void

#### Router#registerCatchallRoute( routes : Route[] ) : void

#### Router#getLocation() : String

#### Router#redirect( location : String )

#### Router#windowNavigate( location : String )

### Type: Route

#### match : String|RegExp

#### handle : Function[]


## TODO

- Add `opts.onRouteStart` and `opts.onRouteComplete` to do things like performance benchmarking
- Deprecate the `hashbang` use cases - we dont need this and it adds complexity
- Deprecate the `basepath` option and just assume the basepath is `/`
- Add no-op functionality to `next()` calls that happen async after `Router.go` is called again


Causes a real page navigation by using `window.location`
