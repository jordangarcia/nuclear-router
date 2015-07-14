import expect from 'expect'
import Router from '../src/Router'
import WindowEnv from '../src/WindowEnv'

describe('Router', () => {

  describe('construction', () => {
    beforeEach(() => {
      sinon.stub(WindowEnv, 'addEventListener')
    })

    afterEach(() => {
      WindowEnv.addEventListener.restore()
    })

    it('should create a Router instance', () => {
      let router = new Router
      expect(router instanceof Router).toBe(true)
    })
  })
})
