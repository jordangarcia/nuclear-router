export default class Context {
  /**
   * @param {Object} opts
   * @param {String} opts.path
   * @param {String} opts.canonicalPath
   * @param {String} opts.title
   * @param {Object} opts.params
   * @param {Boolean?} opts.useHashbang
   */
  constructor({ path, canonicalPath, title, params, useHashbang }) {
    // hashbang currently isnt supported
    this.useHashbang = !!useHashbang
    this.path = path
    this.canonicalPath = canonicalPath
    this.title = title
    this.params = params

    // computeds
    this.queryString = fns.extractQueryString(path)
    this.queryParams = fns.extractQueryParams(path)
  }

  /**
   * Gets arguments that can be applied to history.pushState / history.replaceState
   * @return {String[]}
   */
  getHistoryArgs() {
    let state = {
      canonicalPath: this.canonicalPath,
    }
    let url = (hashbang && this.path !== '/')
      ? '#!' + this.path
      : this.canonicalPath

    return [
      state
      this.title,
      url,
    ]
  }
}
