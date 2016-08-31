/**
 * Module dependencies.
 * @private
 */
const http = require('http')
const router = require('./router')

let locals = Object.create(null)

// Storing the current working directory for later use
locals['cwd'] = process.cwd()

/**
 * Initialize the `app`
 * @return {Object}
 */
module.exports = function() {
  const httpServer = http.createServer(router.resolve)

  let app = {
    httpServer,
    locals,
    use: router.use,
    get: router.get,
    post: router.post,
    set: (key, val) => locals[key] = val, 
    listen: (port, callback) => {
      httpServer.listen(port, callback)
    }
  }

  router.app = app

  return app
}