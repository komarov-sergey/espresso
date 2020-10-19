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
    assert.equal(res.data, 'Hello, world!')
  })
})