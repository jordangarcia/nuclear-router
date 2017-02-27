import pathToRegexp from 'path-to-regexp'

export default class Route {
  constructor({ match, handle, metadata }) {
    this.match = (match === '*') ? '(.*)' : match;
    this.handlers = handle
    this.keys = []
    this.metadata = metadata;

    this.matchRegexp = pathToRegexp(this.match, this.keys)
  }
}
