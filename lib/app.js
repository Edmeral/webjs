/**
 * Module dependencies.
 * @private
 */
const http = require('http')
const router = require('./router')

let locals = Object.create(null)

/**
 * Initialize the `app`
 * @return {Object}
 */
module.exports = function() {
  const httpServer = http.createServer(router.resolve)

  return {
    httpServer,
    use: router.use,
    get: router.get,
    post: router.post,
    set: (key, val) => locals[key] = val, 
    listen: (port, callback) => {
      httpServer.listen(port, callback)
    }
  }
}