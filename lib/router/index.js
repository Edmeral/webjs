const url = require('url')
const utils = require('../utils')

let handlers = []

module.exports = {
  resolve: function(req, res) {
    let route = match(req, res, handlers)

    let handler

    next()

    function next() {
      if (route.handlers.length) {
        handler = route.handlers.shift()
      handler(req, res, next)
      }
    }

    // should probably add this as a default middleware
    res.end(`Can't ${route.method} ${route.path}`)
  },
  use: (path, handler) => {
    if (typeof path == 'function') {
      handler = path
      path = '*'
    }
    handlers.push({ type: 'middleware', path, handler })
  },
  get: (path, handler) => addRoute(path, 'GET', handler),
  post: (path, handler) => addRoute(path, 'POST', handler)
}

// returns matchings handlers
// and populates the request object with matching parameters
function match(req, res, handlers) {
  let parsedUrl = url.parse(req.url, true)
  let path = parsedUrl.pathname
  let method = req.method
  
  req.query = parsedUrl.query

  let handlersQueue = handlers.filter(handler => {
      // (handler.type == 'middleware' && (handler.path == '*' || handler.path == path)) ||
      // (handler.type == 'route' && handler.method == method && handler.path == path)
      if (handler.path == '*') return true
      return handler.regex.test(path) && (handler.method == method || !handler.method)
    }).map(handler => {
      return function(req, res, next) {
        req.params = params(path, handler.path)
        handler.handler(req, res, next)
      }
    })

  return { handlers: handlersQueue, method, path }
}

function addRoute(path, method, handler) {
  handlers.push({
    type: 'route',
    path,
    regex: routeToRegExp(path),
    method,
    handler
  })
}

// for path = /foo/bar and route = '/:param1/:param2'
// return { param1: 'foo', param2: 'bar'}
// but how should we do the matching??? so that /:param1/:param2 matches /foo/bar
function params(path, route) {
  // let reg = /:(\w+)\/?/g
  // let match = reg.exec(route)

  // while (match != null) {
  //   console.log(match)
  //   // let param = match[1]
  //   // let val = path.slice(match.index, param.length)
  //   // params[param] = val
  //   match = reg.exec(route)
  // }

  let params = Object.create(null)
  let pathElements = path.split('/').filter(utils.isNotEmpty)
  let routeParams = route.split('/').filter(utils.isNotEmpty)

  routeParams.forEach((param, pos) => {
    if (param.charAt(0) == ':')
      params[param.slice(1)] = pathElements[pos]
  })

  return params
}

// todo: add option to have optional slash at the end of the route
function routeToRegExp(route) {
  let regExpStr =  '^' + route.split('/').map(part => {
    if (part[0] === ':') return '([^\\/]+)'
    return part
  }).join('\\/') + "$"
  return new RegExp(regExpStr)
}

console.log(routeToRegExp('/foo/bar').test('/foo/bar'))