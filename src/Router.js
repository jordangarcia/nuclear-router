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

    this.__currentCanonicalPath = null

    WindowEnv.addEventListener('popstate', (() => {
      var loaded = false
      if (DocumentEnv.getReadyState() === 'complete') {
        loaded = true
      } else {
        WindowEnv.addEventListener('load', () => {
          setTimeout(() => {
            loaded = true
          }, 0)
        })
      }
      return (e) => {
        if (!loaded) {
          return
        }
        if (e.state) {
          this.replace(e.state.canonicalPath)
        } else {
          this.go(this.getCanonicalPath())
        }
      }
    }))
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
      this.__routes.push(new Route(route))
    })
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

  /**
   * @param {String} canonicalPath
   * @param {Context} ctx
   */
  catchall(ctx) {
    WindowEnv.navigate(ctx.canonicalPath)
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

      this.__currentCanonicalPath = canonicalPath

      this.__runHandlers(route.handlers, ctx)
    } else {
      this.catchAllHandler(ctx)
    }
  }
}
