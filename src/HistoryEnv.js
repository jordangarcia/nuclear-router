export function pushState() {
  return window.history.pushState.apply(window.history, arguments)
}

export function replaceState() {
  return window.history.replaceState.apply(window.history, arguments)
}
