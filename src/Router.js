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

    this.setInitialState();

    this.onRouteStart = this.opts.onRouteStart

    this.onRouteComplete = this.opts.onRouteComplete

    WindowEnv.addEventListener('popstate', this.__onpopstate.bind(this))
  }

  setInitialState() {
    this.__fromPath = null;
    this.__routes = [];
    this.__currentCanonicalPath = null;
    this.__catchallPath = null;
    this.__dispatchId = 0;
    this.__startTime = null;
    this.onRouteStart = null;
    this.onRouteComplete = null;
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
    routes.forEach(route => {
      route = new Route(route);
      if (this.onRouteComplete) {
        const routingEnd = (ctx, next) => {
          const duration = fns.getNow() - this.__startTime;
          const fromPath = this.__fromPath || 'PAGE LOAD';
          this.onRouteComplete({
            fromPath,
            toPath: this.__currentCanonicalPath,
            duration,
          })
        };
        route.handlers.push(routingEnd);
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
    this.setInitialState();
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
      if (this.__dispatchId !== ctx.dispatchId || i > len) {
        return;
      }
      let fn = handlers[i] || () => {}
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
    this.__dispatchId++;
    this.__startTime = fns.getNow();

    let title = DocumentEnv.getTitle()
    let path = fns.extractPath(this.opts.base, canonicalPath)
    let { params, route } = fns.matchRoute(this.__routes, path)

    let ctx = new Context({ canonicalPath, path, title, params, dispatchId: this.__dispatchId })

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
      this.replace(e.state.path)
    }
  }
}
