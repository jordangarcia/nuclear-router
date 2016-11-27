/**
 * @param {String} path
 * @return {String}
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
function extractQueryString(path) {
  var i = path.indexOf('?');
  var isFound = i > -1;

  return isFound ? decodeURLEncodedURIComponent(path.slice(i + 1)) : '';
}

/**
 * @param {String} path
 * @return {Object<String, String[]|String>}
 */
function extractQueryParams(path) {
  var i = path.indexOf('?');
  var params = {};
  if (i === -1) {
    return params;
  }

  path.slice(i + 1).split('&').forEach(function (queryString) {
    var query = queryString.split('=');
    params[query[0]] = query[1];
  });

  return params;
}

/**
 * @param {String} base
 * @param {String} canonicalPath
 * @return {String}
 */
function extractPath(base, canonicalPath) {
  var path = canonicalPath.replace(base, '') || '/';
  var qsIndex = path.indexOf('?');
  return qsIndex > -1 ? path.slice(0, qsIndex) : path;
}

/**
 * @param {Route[]} routes
 * @param {String} path
 * @return {{ route: Route, params: Object }}
 */
function matchRoute(routes, path) {
  var result = {
    params: {},
    route: null
  };

  var decodedPath = decodeURIComponent(path);
  for (var i = 0; i < routes.length; i++) {
    var route = routes[i];
    var matches = route.matchRegexp.exec(decodedPath);

    if (matches) {
      var params = {};

      for (var _i = 1; _i < matches.length; ++_i) {
        var key = route.keys[_i - 1];
        var val = decodeURLEncodedURIComponent(matches[_i]);
        if (val !== undefined || !hasOwnProperty.call(params, key.name)) {
          params[key.name] = val;
        }
      }

      result = { route: route, params: params };
    }
  }

  return result;
}

/**
 * Remove URL encoding from the given `str`.
 * Accommodates whitespace in both x-www-form-urlencoded
 * and regular percent-encoded form.
 *
 * @param {String} val
 * @return {String}
 */
function decodeURLEncodedURIComponent(val) {
  if (typeof val !== 'string') {
    return val;
  }
  return decodeURIComponent(val.replace(/\+/g, ' '));
}

function getNow() {
  if (window.performance && window.performance.now) {
    return window.performance.now();
  }
  return Date.now();
}

exports['default'] = {
  extractQueryString: extractQueryString,
  extractQueryParams: extractQueryParams,
  extractPath: extractPath,
  matchRoute: matchRoute,
  getNow: getNow
};
module.exports = exports['default'];