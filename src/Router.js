/**
 * @module
 */

/**
 * Input to Client Decision Engine
 *
 * @typedef Route
 * @property {String|RegExp} match
 * @property {RouterHandler[]} handlers
 */

/**
 * @callback RouteHandler
 * @param {Context} ctx
 * @param {Function} nextFn
 */

import assign from 'object-assign'
import Context from './Context'
import fns from './fns'
import Route from './Route'
import WindowEnv from './WindowEnv'
import HistoryEnv from './HistoryEnv'
import DocumentEnv from './DocumentEnv'

export default class Router {
  constructor(opts) {
    this.opts = opts || {};

    this.opts = assign({
      pushstate: true,
      base: '',
    }, opts)

    this.__routes = []

    this.__fromPath = null

    this.__currentCanonicalPath = null

    this.onRouteStart = this.opts.onRouteStart

    this.onRouteComplete = this.opts.onRouteComplete

    WindowEnv.addEventListener('popstate', this.__onpopstate)
  }

  /**
   * Registers Routes for the application
   *
   * ```
   * var router = new Router(reactor)
   * router.registerRoutes([
   *   {
   *     match: '/foo',
   *     handlers: [
   *       (ctx, next) => {
   *         fetchDataForFoo()
   *         next()
   *       }
   *     ]
   *   }
   * ```
   *
   * @param {Route[]} routes
   */
  registerRoutes(routes) {
    if (!Array.isArray(routes)) {
      throw new Error('Router#registerRoutes must be passed an array of Routes')
    }
    routes.map(route => {
      route = new Route(route);
      if (this.onRouteComplete) {
        const handlerLength = route.handlers.length-1;
        const lastHandler = route.handlers[handlerLength];
        const routingEnd = (ctx, next) => {
          lastHandler(ctx);
          const duration = fns.getNow() - this.__startTime;
          const fromPath = this.__fromPath || 'PAGE LOAD';
          this.onRouteComplete({
            fromPath,
            toPath: this.__currentCanonicalPath,
            duration,
          })
        };
        route.handlers = route.handlers.slice(0, handlerLength).concat(routingEnd);
      }
      if (this.onRouteStart) {
        route.handlers.unshift(this.onRouteStart);
      }
      this.__routes.push(route);
    })
  }

  /**
   * @param {String} path
   */
  registerCatchallPath(path) {
    this.__catchallPath = path;
  }

  /**
   * @param {String} canonicalPath
   */
  go(canonicalPath) {
    this.__dispatch(canonicalPath, false)
  }

  /**
   * @param {String} canonicalPath
   */
  replace(canonicalPath) {
    this.__dispatch(canonicalPath, true)
  }

  reset() {
    this.__catchallPath = null;
    this.__routes = [];
    WindowEnv.removeEventListener('popstate', this.__onpopstate)
  }

  catchall() {
    WindowEnv.navigate(this.__catchallPath)
  }


  /**
   * @param {RouterHandler[]} handlers
   * @param {Context} ctx
   */
  __runHandlers(handlers, ctx, callback) {
    let len = handlers.length
    let i = 0;

    let next = () => {
      if (this.__currentCanonicalPath !== ctx.canonicalPath) {
        return;
      }
      let fn = handlers[i]
      i++
      if (i > len) {
        return;
      }
      fn(ctx, next)
    }

    next()
  }

  /**
   * @param {String} canonicalPath
   * @param {Boolean} replace use replaceState instead of pushState
   */
  __dispatch(canonicalPath, replace) {
    this.__startTime = fns.getNow();
    if (canonicalPath === this.__currentCanonicalPath) {
      return
    }

    let title = DocumentEnv.getTitle()
    let path = fns.extractPath(this.opts.base, canonicalPath)
    let { params, route } = fns.matchRoute(this.__routes, path)

    let ctx = new Context({ canonicalPath, path, title, params })

    if (route) {
      (replace)
        ? HistoryEnv.replaceState.apply(null, ctx.getHistoryArgs())
        : HistoryEnv.pushState.apply(null, ctx.getHistoryArgs())

      this.__fromPath = this.__currentCanonicalPath
      this.__currentCanonicalPath = canonicalPath

      this.__runHandlers(route.handlers, ctx)
    } else {
      this.catchall()
    }
  }

  __onpopstate(e) {
    if (e.state) {
      this.replace(e.state.canonicalPath)
    } else {
      this.go(this.__currentCanonicalPath)
    }
  }
}
