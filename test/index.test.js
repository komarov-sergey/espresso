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
})
