import pathToRegexp from 'path-to-regexp'

export default class Route {
  constructor({ match, handle }) {
    this.match = (match === '*') ? '(.*)' : match;
    this.handlers = handle
    this.keys = []

    this.matchRegexp = pathToRegexp(this.match, this.keys)
  }
}
