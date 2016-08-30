const fs = require('fs')
const join = require('path').join

module.exports = function(httpResponse) {
  // Is this the right way to extend the httpResponse object??
  let res = httpResponse

  /**
   * Send a response
   * @param  {string|Buffer|Array|Object} body
   * @return {ServerResponse}
   */
  res.send = function(body) {
    // @todo sends etag for cache validation
    // @todo what if the string is too big to send at one shot? use streams?

    if (typeof body == 'object')
      return res.json(body)
    
    if (!this.getHeader('Content-Type'))
      this.setHeader('Content-Type', 'text/html; charset=utf-8')

    res.end(body)

    return this
  }

  res.json = function(obj) {
    if (!this.getHeader('Content-Type'))
      this.setHeader('Content-Type', 'application/json; charset=utf-8')
    let body = JSON.stringify(obj)
    return this.send(body)
  }

  res.sendFile = function(path) {
    fs.readFile(path, 'utf-8', (err, data) => {
      if (err) {
        this.status(500)
        return this.send('An error occured reading the file')
      }
      res.send(data)
    })

  }

  res.render = function(viewPath, options) {
    let viewsRoot = this.app.locals['views'] || '/views'
    let viewEngine = this.app.locals['view engine']
    if (!viewEngine)
      throw Error('No view engine specified')
    viewEngine = require(viewEngine)

    fs.readFile(join(this.app.cwd, viewsRoot, viewPath), (err, str) => {
      if (err) {
        this.status(500)
        return this.send('An error occured while reading the view file')
      }
      res.send(viewEngine.render(str, options))
    })

  }

  res.status = function(status) {
    this.statusCode = status
    return this
  }

  return res
}