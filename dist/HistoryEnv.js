"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
function pushState() {
  return window.history.pushState.apply(window.history, arguments);
}

function replaceState() {
  return window.history.replaceState.apply(window.history, arguments);
}

exports["default"] = {
  replaceState: replaceState,
  pushState: pushState
};
module.exports = exports["default"];