/**
 * Module dependencies.
 * @private
 */
const url = require('url')
const utils = require('../utils')

/**
 * Contains all handlers registered by the router instance
 * @type {Array}
 * @private
 */
let handlers = []

module.exports = {

  /**
   * Passes the request through a series of corresponding middlewares
   * 
   * @param  {Request} req
   * @param  {Response} res
   */
  resolve: function(req, res) {
    let route = match(req, res, handlers)

    let handler

    next()

    /**
     * Apply the handlers to the request and pass 
     * it along to the next handler (if the current handler permits it)
     */
    function next() {
      if (route.handlers.length) {
        handler = route.handlers.shift()
      handler(req, res, next)
      }
    }

    // @todo should probably add this as a default middleware 
    // to the end of the handlers array, and specify the status to be 404
    res.end(`Can't ${route.method} ${route.path}`)
  },

  /**
   * Register the given handler for the corresponding path,
   * if path not provided, register handler for all paths
   * 
   * @param  {String} path
   * @param  {function} handler
   */
  use: (path, handler) => {
    if (typeof path == 'function') {
      handler = path
      path = '*'
    }
    handlers.push({ type: 'middleware', path, handler })
  },

  /**
   * Add handler for a given route with GET method
   * 
   * @param  {String} path
   * @param  {function} handler
   */
  get: (path, handler) => addRoute(path, 'GET', handler),

  /**
   * Add handler for a given route with POST method
   * 
   * @param  {String} path
   * @param  {function} handler
   */
  
  post: (path, handler) => addRoute(path, 'POST', handler)
}

/**
 * Match a path against a set of handlers 
 * and populates the query and params objects
 * 
 * @param  {Request} req
 * @param  {Response} res
 * @param  {function[]} handlers
 * @return {function[]} - handlers corresponding to this route
 */
function match(req, res, handlers) {
  let parsedUrl = url.parse(req.url, true)
  let path = parsedUrl.pathname
  let method = req.method
  
  req.query = parsedUrl.query

  let handlersQueue = handlers.filter(handler => {
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

/**
 * Register a handler with given properties
 * 
 * @param {String} path
 * @param {String} method
 * @param {function} handler
 */
function addRoute(path, method, handler) {
  handlers.push({
    type: 'route',
    path,
    regex: routeToRegExp(path),
    method,
    handler
  })
}

/**
 * Parse parameters for dynamic routes
 * @example
 * // returns { param1: 'foo', param2: 'bar'}
 * params('/foo/bar', '/:param1/:param2')
 * 
 * @param  {String} path
 * @param  {String} route 
 * @return {Object}
 */
function params(path, route) {
  let params = Object.create(null)
  let pathElements = path.split('/').filter(utils.isNotEmpty)
  let routeParams = route.split('/').filter(utils.isNotEmpty)

  routeParams.forEach((param, pos) => {
    if (param.charAt(0) == ':')
      params[param.slice(1)] = pathElements[pos]
  })

  return params
}

/**
 * returns corresponding regular expression for a given route,
 * the regexp is used for matching this route against a given path
 * 
 * @param  {String} route
 * @return {RegExp}
 *
 * @todo add option to have optional slash at the end of the route
 */
function routeToRegExp(route) {
  let regExpStr =  '^' + route.split('/').map(part => {
    if (part[0] === ':') return '([^\\/]+)'
    return part
  }).join('\\/') + "$"
  return new RegExp(regExpStr)
}

// console.log(routeToRegExp('/foo/bar').test('/foo/bar'))