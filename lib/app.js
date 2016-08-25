const http = require('http')
const router = require('./router')

module.exports = function() {
  const httpServer = http.createServer(router.resolve)

  return {
    httpServer,
    use: router.use,
    get: router.get,
    post: router.post,
    listen: (port, callback) => {
      httpServer.listen(port, callback)
    }
  }
}