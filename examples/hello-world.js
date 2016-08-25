let app = require('../lib/app')()
let morgan = require('morgan')

app.use(logger)

app.get('/', (req, res) => {
  res.end('hello')
})

// app.get('/foo', (req, res) => {
//   console.log(req.params)
//   res.end('bar')
// })

app.get('/:param', (req, res) => {
  console.log(req.query, req.params)
  res.end('200')
})

app.get('/:user/books', (req, res) => {
  console.log(req.query, req.params)
  res.end('200')
})

app.listen(8080, function() {
  console.log('Server listening on port 8080')
})

function logger(req, res, next) {
  console.log(`Logging request for ${require('url').parse(req.url).pathname}`)
  next()
}