function pushState() {
  return window.history.pushState.apply(window.history, arguments)
}

function replaceState() {
  return window.history.replaceState.apply(window.history, arguments)
}

export default {
  replaceState,
  pushState,
}
