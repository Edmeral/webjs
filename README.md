<p>
  <a href='http://www.recurse.com' title='Made with love at the Recurse Center'><img src='https://cloud.githubusercontent.com/assets/2883345/11325206/336ea5f4-9150-11e5-9e90-d86ad31993d8.png' height='20px'/></a>
</p>

This is my attempt at making a web framework in Node.js from scratch, the goal is to be API-compatible with [express.js](expressjs.com).

```js
var app = require('lib/app.js')()

app.get('/', function (req, res) {
  res.send('Hello World')
})

app.listen(3000)
```
Other examples are available in the examples folder.


# What is implemented
* `app.get(path, callback)`: path could have named parameters also, which will be available in the req object passed to the callback.

  ```js
  app.get('/user/:name', (req, res) => {
    console.log(req.params)
    // GET /user/aissam => params = { name: 'aissam' }
  })
  ```
  The query string is also accessible though the request object
  ```js
  app.get('/user/:name', (req, res) => {
    console.log(req.query)
    // GET /user/aissam?age=130 => params = { age: '130' }
  })
  ```
* `app.post(path, callback)` works in the same way as app.get, except it's handling POST requests.
* `app.use([path,] callback)` Mounts the specified middleware function or functions at the specified path: the middleware function is executed when the base of the requested path matches path, useful for logging every request for example.



* Response methods:
  * `res.send([body])` sends either a string as **text/html**, or if passed an object sends it as **application/json**.
  * `sendFile([path])` transfers the file at the given path.
  * `res.status(code)` sets the HTTP status for the response.
  * `res.render(view [, options])` render a view, a rendering engine must specified before, views are considered to be in the views directory unless specified otherwise, options contain the elements to be injected when rendering the view.

    ```js
    // app.set('views', 'views-directory') // setting another views directory
    app.set('view engine', 'ejs')
    app.get('/template', (req, res) => {
      res.render('template.ejs', { foo: 'bar' })
    })
    ```
