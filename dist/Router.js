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

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _objectAssign = require('object-assign');

var _objectAssign2 = _interopRequireDefault(_objectAssign);

var _Context = require('./Context');

var _Context2 = _interopRequireDefault(_Context);

var _fns = require('./fns');

var _fns2 = _interopRequireDefault(_fns);

var _Route = require('./Route');

var _Route2 = _interopRequireDefault(_Route);

var _WindowEnv = require('./WindowEnv');

var _WindowEnv2 = _interopRequireDefault(_WindowEnv);

var _HistoryEnv = require('./HistoryEnv');

var _HistoryEnv2 = _interopRequireDefault(_HistoryEnv);

var _DocumentEnv = require('./DocumentEnv');

var _DocumentEnv2 = _interopRequireDefault(_DocumentEnv);

var Router = (function () {
  function Router(opts) {
    _classCallCheck(this, Router);

    this.opts = opts || {};

    this.opts = (0, _objectAssign2['default'])({
      pushstate: true,
      base: ''
    }, opts);

    this.setInitialState();

    this.onRouteStart = this.opts.onRouteStart;

    this.onRouteComplete = this.opts.onRouteComplete;

    _WindowEnv2['default'].addEventListener('popstate', this.__onpopstate.bind(this));
  }

  _createClass(Router, [{
    key: 'setInitialState',
    value: function setInitialState() {
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
  }, {
    key: 'registerRoutes',
    value: function registerRoutes(routes) {
      var _this = this;

      if (!Array.isArray(routes)) {
        throw new Error('Router#registerRoutes must be passed an array of Routes');
      }
      routes.forEach(function (route) {
        route = new _Route2['default'](route);
        if (_this.onRouteComplete) {
          var routingEnd = function routingEnd(ctx, next) {
            var duration = _fns2['default'].getNow() - _this.__startTime;
            var fromPath = _this.__fromPath || 'PAGE LOAD';
            _this.onRouteComplete({
              fromPath: fromPath,
              toPath: _this.__currentCanonicalPath,
              duration: duration
            });
          };
          route.handlers.push(routingEnd);
        }
        if (_this.onRouteStart) {
          route.handlers.unshift(_this.onRouteStart);
        }
        _this.__routes.push(route);
      });
    }

    /**
     * @param {String} path
     */
  }, {
    key: 'registerCatchallPath',
    value: function registerCatchallPath(path) {
      this.__catchallPath = path;
    }

    /**
     * @param {String} canonicalPath
     */
  }, {
    key: 'go',
    value: function go(canonicalPath) {
      this.__dispatch(canonicalPath, false);
    }

    /**
     * @param {String} canonicalPath
     */
  }, {
    key: 'replace',
    value: function replace(canonicalPath) {
      this.__dispatch(canonicalPath, true);
    }
  }, {
    key: 'reset',
    value: function reset() {
      this.setInitialState();
      _WindowEnv2['default'].removeEventListener('popstate', this.__onpopstate);
    }
  }, {
    key: 'catchall',
    value: function catchall() {
      _WindowEnv2['default'].navigate(this.__catchallPath);
    }

    /**
     * @param {RouterHandler[]} handlers
     * @param {Context} ctx
     */
  }, {
    key: '__runHandlers',
    value: function __runHandlers(handlers, ctx, callback) {
      var _this2 = this;

      var len = handlers.length;
      var i = 0;

      var next = function next() {
        if (_this2.__dispatchId !== ctx.dispatchId || i > len) {
          return;
        }
        var fn = handlers[i] || function () {};
        i++;
        fn(ctx, next);
      };

      next();
    }

    /**
     * @param {String} canonicalPath
     * @param {Boolean} replace use replaceState instead of pushState
     */
  }, {
    key: '__dispatch',
    value: function __dispatch(canonicalPath, replace) {
      this.__dispatchId++;
      this.__startTime = _fns2['default'].getNow();

      var title = _DocumentEnv2['default'].getTitle();
      var path = _fns2['default'].extractPath(this.opts.base, canonicalPath);

      var _fns$matchRoute = _fns2['default'].matchRoute(this.__routes, path);

      var params = _fns$matchRoute.params;
      var route = _fns$matchRoute.route;

      var ctx = new _Context2['default']({ canonicalPath: canonicalPath, path: path, title: title, params: params, dispatchId: this.__dispatchId });

      if (route) {
        replace ? _HistoryEnv2['default'].replaceState.apply(null, ctx.getHistoryArgs()) : _HistoryEnv2['default'].pushState.apply(null, ctx.getHistoryArgs());
        this.__fromPath = this.__currentCanonicalPath;
        this.__currentCanonicalPath = canonicalPath;

        this.__runHandlers(route.handlers, ctx);
      } else {
        this.catchall();
      }
    }
  }, {
    key: '__onpopstate',
    value: function __onpopstate(e) {
      if (e.state) {
        this.replace(e.state.canonicalPath);
      } else {
        this.go(this.__currentCanonicalPath);
      }
    }
  }]);

  return Router;
})();

exports['default'] = Router;
module.exports = exports['default'];