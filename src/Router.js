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
    this.opts = assign({
      pushstate: true,
      base: '',
    }, opts)

    this.__routes = []

    this.__fromPath = null

    this.__currentCanonicalPath = null

    this.onRouteComplete = opts.onRouteComplete

    WindowEnv.addEventListener('popstate', (e) => {
      if (e.state) {
        this.replace(e.state.canonicalPath)
      } else {
        this.go(this.__currentCanonicalPath)
      }
    })
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
        route.handlers.push((ctx, next) => {
          const duration = fns.getNow() - this.__startTime;
          this.onRouteComplete({
            fromPath: this.__fromPath,
            toPath: this.__currentCanonicalPath,
            duration,
          })
        });
      }
      this.__routes.push(route);
    })
  }

  /**
   * @param {String} path
   */
  registerCatchallRoute(path) {
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
    this.__routes = []
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
}
