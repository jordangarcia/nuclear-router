function addEventListener() {
  window.addEventListener.apply(window, arguments)
}

function removeEventListener() {
  window.removeEventListener.apply(window, arguments)
}

/**
 * @param {String} location
 */
function navigate(location) {
  window.location = location
}

export default {
  navigate,
  addEventListener,
  removeEventListener,
}
