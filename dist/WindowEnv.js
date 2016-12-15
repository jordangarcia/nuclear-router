"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
function addEventListener() {
  window.addEventListener.apply(window, arguments);
}

function removeEventListener() {
  window.removeEventListener.apply(window, arguments);
}

/**
 * @param {String} location
 */
function navigate(location) {
  window.location = location;
}

exports["default"] = {
  navigate: navigate,
  addEventListener: addEventListener,
  removeEventListener: removeEventListener
};
module.exports = exports["default"];