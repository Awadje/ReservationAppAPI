const restify = require('restify')
const errors = require('restify-errors')
const corsMiddleware = require('restify-cors-middleware')
const jwtRestify = require('restify-jwt-community')
const mongoose = require('mongoose')

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost/reservations'
const APP_NAME = 'ReservationService'
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


const Slot = require('./SlotSchema')(mongoose)

server.post('/slot/create', (request, response, next) => {
  let settings = request.body
  console.log(request.body)
 
  Slot.find({ slot_date: request.body.slot_date }, (error, results) => {
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
      Slot.create(settings, (error, doc) => {
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


server.get('/reservation/slots', (req, res, next) => {
 Slot.find({ }, (error, docs) => {
   if (error) {
     return next(new errors.InternalServerError(error))
   }
   res.send(docs)
   return next()
 })
})

const Reservation = require('./ReservationSchema')(mongoose)

server.get('/reservation/list', (req, res, next) => {
  Reservation.find({ }, (error, docs) => {
    if (error) {
      return next(new errors.InternalServerError(error))
    }
    res.send(docs)
    return next()
  })
})

server.post('/reservation/create', (request, response, next) => {
 let settings = request.body
 if (!request.body.phone || request.body.phone.length < 1) {
   return next(new errors.BadRequestError('Veld mobiel is niet ingevuld'))
 }

 Reservation.find({ 
   phone: request.body.phone, 
   reservation: request.body.reservation, 
   slot_date: request.body.slot_date,
  }, (error, result) => {
  if (error) {
    console.log(error)
     return next(new errors.InternalServerError(error))
   }
   if (result.length == 0) {
     Reservation.create(settings, (error, doc) => {
       if (error) {
         return next(new errors.BadRequestError(error))
         console.log(error)
       }
       console.log(`Saved Reservation: ${doc}`)
       response.send(doc)
       return next()
     })
  
   } else {
     return next(new errors.ConflictError(`Reservering met op nummer ${request.body.phone} is al gemaakt vandaag`))
   }
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

 
server.listen(3001, () => {
  console.info(`${server.name} is listening at ${server.url}`)
})