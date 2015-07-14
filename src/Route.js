import pathToRegexp from 'path-to-regexp'

export default class Route {
  constructor({ match, handlers }) {
    this.match = (match === '*') ? '(.*)' : match;
    this.handlers = handlers
    this.keys = []

    this.matchRegexp = pathToRegexp(this.match, this.keys)
  }
}
