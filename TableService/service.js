const restify = require('restify')
const errors = require('restify-errors')
const corsMiddleware = require('restify-cors-middleware')
const jwtRestify = require('restify-jwt-community')
const mongoose = require('mongoose')

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost/tables'
const APP_NAME = 'TableService'
const APP_VERSION = '0.0.1'
const JWT_SECRET = process.env.JWT_SECRET || 'nosecretyet'

// DB connection
mongoose.connect(MONGO_URL)

const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
// end db connections


const server = restify.createServer({
  name: APP_NAME,
  version: APP_VERSION
})

const cors = corsMiddleware({
  preflightMaxAge: 5, //Optional
  origins: ['http://localhost:*'],
  allowHeaders: ['API-Token', 'Authorization'],
  exposeHeaders: ['API-Token-Expiry']
})

server.pre(cors.preflight)
server.use(cors.actual)

server.use(restify.plugins.bodyParser())
server.use(jwtRestify({ secret: JWT_SECRET }))


const Table = require('./TableSchema')(mongoose)

server.post('/table/create', (request, response, next) => {
  let settings = request.body
  console.log(request.body)
 
  Table.find({ name: request.body.name}, (error, result) => {
    if (error) {
      return next(new errors.InternalServerError(error))
    }
    console.log(result)
    if (result.length == 0) {
      Table.create(settings, (error, doc) => {
        if (error) {
          return next(new errors.BadRequestError(error))
          console.log(errror)
        }
        response.send(doc)
        console.log(doc)
        return next()
      })
    } else {
      return next(new errors.ConflictError(`Deze tafel is al aangemaakt ${request.body.name}`))
    }
  })
 })

 server.put('/table/edit/', (req, res, next) => {
  let table = req.body
    Table.update({ _id: table._id }, { $set: table }, 
    (error, doc) => {
      if (error) {
        return next(new errors.InternalServerError(error))
    }
    res.send('Table Updated')
  })
})

server.get('/table/list', (req, res, next) => {
 Table.find({ }, (error, docs) => {
   if (error) {
     return next(new errors.InternalServerError(error))
   }
   res.send(docs)
   return next()
 })
})

server.get('/table/edit/:id', (request, response, next) => {
  let id = request.params.id
  console.log(request.params)
  Table.find({ _id: id }, (error, docs) => {
    if (error) {
      return next(new errors.InternalServerError(error))
    }
    console.log(docs)
    response.send(docs)
    return next()
  })
})

server.put('/table/deactivate/:table', (req, res, next) => {
  let table = req.params.table
  Table.update({ _id: table }, { active: false }, (error, doc) => {
    if (error) {
      return next(new errors.InternalServerError(error))
    }
    res.send({ active: false, user: req.user })
  })
})

server.put('/table/activate/:table', (req, res, next) => {
  let table = req.params.table
  Table.update({ _id: table }, { active: true }, (error, doc) => {
    if (error) {
      return next(new errors.InternalServerError(error))
    }
    res.send({ active: false, user: req.user })
  })
})

server.del('/table/:table', (req, response, next) => {
  let table = req.params.table
  Table.remove({ _id: table}, (error, result) => {
    if (error) {
      return next(new errors.InternalServerError(error))
    }

    response.send({ deleted_target_count: String(result) })
    next()
  })
})

server.post('/slot/create', (request, response, next) => {
  let settings = request.body
  console.log(request.body)
 
  Table.find({ slot_date: request.body.slot_date }, (error, results) => {
    if (error) {
      return next(new errors.InternalServerError(error))
    }
    console.log(`Slot Result: ${results}`)
 
    let available
    results.forEach(function(result) {
      if (result.slot_end >= request.body.slot_start  && result.slot_start <= request.body.slot_end) {
        console.log(`Request start: ${request.body.slot_start}`)
        console.log(`Slot end: ${result.slot_end}`)
        console.log(`Slot start: ${result.slot_start}`)
        console.log(`Request end: ${request.body.slot_end}`)     
        available = false
      } 
    })

    if (available != false)  {
      Table.create(settings, (error, doc) => {
        if (error) {
          return next(new errors.BadRequestError(error))
          console.log(error)
        }
        response.send(doc)
        console.log(`Saved Slot: ${doc}`)
        return next()
      })
    } else {
      return next(new errors.ConflictError(`Dit slot is bezet ${request.body.slot_start}`))
    }
  })
 })


server.get('/table/slots', (req, res, next) => {
 Table.find({ }, (error, docs) => {
   if (error) {
     return next(new errors.InternalServerError(error))
   }
   res.send(docs)
   return next()
 })
})

server.on('restifyError', function (req, res, err, cb) {
  // this listener will fire after both events above!
  // `err` here is the same as the error that was passed to the above
  // error handlers.
  console.error({
    requestHeaders: req.headers,
    userAgent: req.userAgent(),
    contentType: req.contentType(),
    secure: req.isSecure(),
    url: req.href(),
    matchedRoute: req.getRoute(),
    error: err
  })
  return cb()
})

 
server.listen(3002, () => {
  console.info(`${server.name} is listening at ${server.url}`)
})