const Espresso = require('./lib')
const assert = require('assert')
const axios = require('axios')
const cors = require('cors')

const app = new Espresso()
app.use((req, res, next) => {
  res.end('Hello, world!')
  next()
})
server = app.listen(3000)

axios.get('http://localhost:3000').then(
  response => console.log({response})
)