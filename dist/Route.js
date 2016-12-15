'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _pathToRegexp = require('path-to-regexp');

var _pathToRegexp2 = _interopRequireDefault(_pathToRegexp);

var Route = function Route(_ref) {
  var match = _ref.match;
  var handle = _ref.handle;

  _classCallCheck(this, Route);

  this.match = match === '*' ? '(.*)' : match;
  this.handlers = handle;
  this.keys = [];

  this.matchRegexp = (0, _pathToRegexp2['default'])(this.match, this.keys);
};

exports['default'] = Route;
module.exports = exports['default'];