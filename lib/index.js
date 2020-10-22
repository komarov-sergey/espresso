const http = require('http')
const {pathToRegexp} = require('path-to-regexp')

class MiddlewarePipeline {
  constructor() {
    this._stack = []
  }

  use(url, middleware) {
    if (arguments.length === 1) {
      middleware = url
      url = null
    }
    if (typeof middleware !== 'function') {
      throw new Error('Middleware must be a function!')
    }
    this._stack.push(new Layer(null, url, middleware, {end: false}))
  }

  route(method, url, handler) {
    this._stack.push(new Layer(method, url, handler))
    return this
  }

  get(url, handler) {
    return this.route('GET', url, handler)
  }

  handle(req, res, callback) {
    let idx = 0

    const next = (err) => {
      if (err != null) {
        return setImmediate(() => callback(err))
      }

      if (idx >= this._stack.length) {
        return setImmediate(() => callback())
      }

      let layer = this._stack[idx++]

      while (idx <= this._stack.length && !layer.match(req.method, req.url)) {
        layer = this._stack[idx++]
      }

      if (layer == null) {
        return setImmediate(() => callback())
      }

      req.params = Object.assign({}, layer.params)

      const originalUrl = req.url
      req.path = layer.path
      req.url = req.url.substr(req.path.length)

      try {
        layer.middleware(req, res, (err) => setImmediate(() => next(err)))
        req.url = originalUrl
      } catch (error) {
        req.url = originalUrl
        next(error)
      }
    }

    next()
  }
}

function Router() {
  const router = (req, res, next) => {
    router.handle.call(router, req, res, next)
  }

  Object.setPrototypeOf(router, new MiddlewarePipeline())

  return router
}

class Layer {
  constructor(method, url, middleware, opts) {
    this.method = method
    this.path = ''
    if (url != null) {
      this.keys = []
      this.url = pathToRegexp(url, this.keys, opts)
    }
    this.middleware = middleware
  }

  match(method, url) {
    if (this.method != null && this.method !== method) {
      return false
    }

    if (this.url != null) {
      const match = this.url.exec(url)
      if (match == null) return false

      this.path = match[0]
      this.params = {}

      for (let i = 1; i < match.length; ++i) {
        this.params[this.keys[i - 1].name] = decodeURIComponent(match[i])
      }
    }

    return true
  }
}

class Espresso extends MiddlewarePipeline {
  listen(port, callback) {
    const handler = (req, res) => {
      this.handle(req, res, (err) => {
        if (err) {
          res.writeHead(500)
          res.end('Internal Server Error')
        }
      })
    }
    return http.createServer(handler).listen({port}, callback)
  }
}

Espresso.Router = Router

module.exports = Espresso
