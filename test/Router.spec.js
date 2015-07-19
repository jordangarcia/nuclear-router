import expect from 'expect'
import Router from '../src/Router'
import WindowEnv from '../src/WindowEnv'
import HistoryEnv from '../src/HistoryEnv'
import DocumentEnv from '../src/DocumentEnv'

describe('Router', () => {
  const pageTitle = 'PAGE TITLE'

  beforeEach(() => {
    sinon.stub(HistoryEnv, 'pushState')
    sinon.stub(HistoryEnv, 'replaceState')
    sinon.stub(DocumentEnv, 'getTitle').returns(pageTitle)
  })

  afterEach(() => {
    HistoryEnv.pushState.restore()
    HistoryEnv.replaceState.restore()
    DocumentEnv.getTitle.restore()
  })

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

  describe('navigation', () => {
    let router
    let spy1, spy2, spy3, asyncSpy1, asyncSpy2
    let deferred

    beforeEach(() => {
      router = new Router()

      spy1 = sinon.spy()
      spy2 = sinon.spy()
      spy3 = sinon.spy()

      asyncSpy1 = sinon.spy()
      asyncSpy2 = sinon.spy()

      let asyncPromise = new Promise((resolve, reject) => {
        deferred = { resolve, reject }
      })

      router.registerRoutes([
        {
          match: '/foo',
          handlers: [
            (ctx, next) => {
              spy1(ctx)
              next()
            },
            (ctx, next) => {
              spy2(ctx)
              next()
            },
          ],
        },
        {
          match: '/bar/:id/baz/:baz_id?',
          handlers: [
            (ctx, next) => {
              spy3(ctx)
              next()
            },
          ],
        },
        {
          match: '/async',
          handlers: [
            (ctx, next) => {
              asyncPromise.then(() => {
                asyncSpy1()
                next()
              })
            },

            (ctx, next) => {
              asyncSpy2()
              done()
            },
          ],
        },
      ])

      sinon.stub(WindowEnv, 'navigate')
    })

    afterEach(() => {
      router.reset()
      WindowEnv.navigate.restore()
    })

    it('should register routes and respond to Router#go', () => {
      router.go('/foo')

      sinon.assert.calledOnce(spy1)
      sinon.assert.calledOnce(spy2)
      sinon.assert.notCalled(spy3)

      var ctx = spy1.firstCall.args[0]

      expect(ctx.title).toBe(pageTitle)
      expect(ctx.params).toEqual({})
      expect(ctx.canonicalPath).toBe('/foo')
      expect(ctx.path).toBe('/foo')
    })

    it('should properly parse params', () => {
      router.go('/bar/123/baz')

      sinon.assert.calledOnce(spy3)

      var ctx = spy3.firstCall.args[0]

      expect(ctx.title).toBe(pageTitle)
      expect(ctx.params).toEqual({
        id: '123',
        baz_id: undefined
      })
      expect(ctx.canonicalPath).toBe('/bar/123/baz')
      expect(ctx.path).toBe('/bar/123/baz')
    })

    it('should be to block on async handlers', (done) => {
      router.go('/async')

      sinon.assert.notCalled(asyncSpy1)
      sinon.assert.notCalled(asyncSpy2)

      deferred.resolve()

      setTimeout(function() {
        sinon.assert.calledOnce(asyncSpy1)
        sinon.assert.calledOnce(asyncSpy2)
        done()
      }, 0);
    })
  })
})
