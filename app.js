const Espresso = require('./lib')
const assert = require('assert')
const axios = require('axios')
const cors = require('cors')

const app = new Espresso()

app.get('/hello/:id', async (req, res) => {
  throw new Error('123')
  res.end(`Hello, ${req.params.id}`)
})

server = app.listen(3000)

axios
  .get('http://localhost:3000/hello/world')
  .then((response) => console.log(response.data))

// const app = new Espresso()

// const nestedRouter = Espresso.Router()
// nestedRouter.get('/own', (req, res) => res.end('Wrote your own Express!'))

// const router = Espresso.Router()
// router.use('/your', nestedRouter)

// app.use('/write', router)

// server = app.listen(3000)

// axios
//   .get('http://localhost:3000/write/your/own')
//   .then((response) => console.log(response.data))
//   .catch((error) => console.log({error}))
