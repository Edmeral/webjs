const fs = require('fs')
const path = require('path')

module.exports = function(httpResponse, app) {
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

  res.sendFile = function(filePath) {
    fs.stat(filePath, (err, stats) => {
      if (err && err.code == 'ENOENT')
        this.status(404).send('File not found!')
      else if (err)
        this.status(500).send('An error occured reading the file!')
      else if(stats.isDirectory())
        this.status(404).send('File not found!')
      else {
        let fileStream = fs.createReadStream(filePath)
        this.setHeader('Content-Disposition', `attachment; filename="${path.basename(filePath)}"`)
        this.setHeader('Content-Type', 'application/octet-stream')
        fileStream.pipe(this)
      }
    })
  }

  res.render = function(viewPath, options) {
    let viewsRoot = app.locals['views'] || '/views'
    let viewEngine = app.locals['view engine']
    if (!viewEngine)
      throw Error('No view engine specified')
    viewEngine = require(viewEngine)

    let AbsoluteViewPath = path.join(app.locals.cwd, viewsRoot, viewPath)
    console.log(AbsoluteViewPath)

    fs.readFile(AbsoluteViewPath, 'utf8', (err, str) => {
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