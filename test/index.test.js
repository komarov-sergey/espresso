const Espresso = require('../lib')
const assert = require('assert')
const axios = require('axios')
const cors = require('cors')

describe('Espresso', () => {
  let server

  afterEach(() => {
    server && server.close()
  })

  it('works in the basic Hello, World case', async () => {
    const app = new Espresso()
    app.use((req, res, next) => {
      res.end('Hello, world!')
      next()
    })
    server = app.listen(3000)

    const res = await axios.get('http://localhost:3000')
    assert.strictEqual(res.data, 'Hello, world!')
  })

  it('works with real Express middleware (CORS)', async () => {
    const app = new Espresso()
    app.use(cors())
    app.use((req, res, next) => {
      res.end('Hello with CORS')
      next()
    })
    server = app.listen(3000)

    const res = await axios.get('http://localhost:3000')

    assert.strictEqual(res.headers['access-control-allow-origin'], '*')
    assert.strictEqual(res.data, 'Hello with CORS')
  })

  it('basic routing', async () => {
    const app = new Espresso()
    app.get('/hello/:id', (req, res) => res.end(`Hello, ${req.params.id}`))
    app.get('/bye/:id', (req, res) => res.end(`Bye, ${req.params.id}`))
    server = app.listen(3000)

    let res = await axios.get('http://localhost:3000/hello/world')
    assert.strictEqual(res.data, 'Hello, world')

    res = await axios.get('http://localhost:3000/bye/everyone')
    assert.strictEqual(res.data, 'Bye, everyone')
  })

  it('using router', async () => {
    const app = new Espresso()

    const nestedRouter = Espresso.Router()
    nestedRouter.get('/own', (req, res) => res.end('Wrote your own Express!'))

    const router = Espresso.Router()
    router.use('/your', nestedRouter)

    app.use('/write', router)

    server = app.listen(3000)

    let res = await axios.get('http://localhost:3000/write/your/own')

    assert.equal(res.data, 'Wrote your own Express!')
  })

  it('using async/await', async () => {
    const app = new Espresso()

    app.get('/', async (req, res) => {
      throw new Error('woops!')
    })

    server = app.listen(3000)

    let threw = false
    try {
      await axios.get('http://localhost:3000/')
    } catch (error) {
      assert.strictEqual(error.response.status, 500)
      assert.strictEqual(error.response.data, 'Internal Server Error')
      threw = true
    }
    assert.ok(threw)
  })

  it('using async/await badly', async function () {
    const app = new Espresso()
    app.use(async function (req, res, next) {
      next()
      // Wait for next middleware to finish sending the response
      await new Promise((resolve) => setTimeout(() => resolve(), 100))
      // Double `next()`, this error won't get reported!
      throw new Error('woops!')
    })
    app.use(function (req, res, next) {
      res.end('done')
      next()
    })
    server = app.listen(3000)
    const res = await axios.get('http://localhost:3000/')
    assert.equal(res.data, 'done')
  })
})
