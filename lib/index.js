const http = require('http')

class Espresso {
  constructor() {
    this._stack = []
  }

  use(middleware) {
    if (typeof middleware !== 'function') {
      throw new Error('Middleware must be a function!')
    }
    this._stack.push(middleware)
  }

  route(method, url, handler) {

  }

  listen(port, callback) {
    const handler = (req, res) => {
      this.handle(req, res, err => {
        if(err) {
          res.writeHead(500)
          res.end('Internal Server Error')
        }
      })
    }
    return http.createServer(handler).listen({port}, callback)
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

      const layer = this._stack[idx++]
      setImmediate(() => {
        try {
          layer(req, res, next)
        } catch(error) {
          next(error)
        }
      })
    }

    next()
  }
}

module.exports = Espresso