function addEventListener() {
  window.addEventListener.apply(window, arguments)
}

function removeEventListener() {
  window.removeEventListener.apply(window, arguments)
}

export default {
  addEventListener,
  removeEventListener,
}
