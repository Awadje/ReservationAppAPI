const restify = require('restify')
const errors = require('restify-errors')
const corsMiddleware = require('restify-cors-middleware')
const jwtRestify = require('restify-jwt-community')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer')
const moment = require('moment')
const mongoose = require('mongoose')

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost/users'
const APP_NAME = 'UserService'
const APP_VERSION = '0.0.1'
const JWT_SECRET = process.env.JWT_SECRET || 'nosecretyet'

// DB connection
mongoose.connect(MONGO_URL)

const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
// end db connections

const User = require('./schema')(mongoose)

const transport = nodemailer.createTransport({
  host: '127.0.0.1',
  port: 25,
  tls: {
    rejectUnauthorized: false
  }
})

transport.verify((error, success) => {
  if (error) {
    let trace = JSON.stringify(error, false, 2)
    console.error(`[SMTP] CONNECTION ERROR:\n ${trace}`)
  } else {
    console.log('[SMTP] Server is ready to accept messages')
  }
})


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
server.pre(restify.plugins.fullResponse())
server.use(restify.plugins.bodyParser())
server.use(restify.plugins.queryParser())
server.use(jwtRestify({ secret: JWT_SECRET }).unless({ path: [
  '/user/login',
  '/user/reset',
  '/user/token/validate',
  '/user/token/update-password'
]}))

// if there are no users creat a seed user.
User.count({}, (error, count) => {
  if (count === 0) {
    console.info('creating seed user')

    bcrypt.hash('SpareRibs', 10).then(hash => {
      let reset_password_token = require('crypto').randomBytes(32).toString('hex')
      doc = {
        firstname: 'Argentina',
        lastname: 'Restaurant',
        email: 'michaelawad85@gmail.com',
        mobile: '1234567890',
        password: hash,
        role: 'admin',
      }

      User.create(doc, (error, doc) => {
        if (error) {
          console.error(`failed to create seed user: ${error}`)
        } else {
          console.info(`initial seed user created!`)
        }
      })

    }) 

  } else {
    console.info(`users database intact... continuing without creating seed user`)
  }
}) 

server.post('/user/create', (request, response, next) => {
  let newUser = request.body
  
    User.findOne({ $or: [ { email: newUser.email }, { mobile: newUser.mobile }] }, (error, result) => {
      if (error) {
        return next(new errors.InternalServerError(error))
      }
  
      if (!result) {
        bcrypt.hash( request.body.password, 10).then(hash => {
          doc = {
            firstname: request.body.firstname,
            lastname: request.body.lastname,
            email: request.body.email,
            mobile: request.body.mobile,
            password: hash,
            role: 'admin',
          }
        
      
        User.create(doc, (error, doc) => {
            if (!error) {
              response.send({ created: 'OK', userId: doc._id })
            } else {
              return next(new errors.InternalServerError(error))
            }
            })  
          })
      } else {
        return next(new errors.ConflictError(`Gebruiker met email: ${newUser.email} of mobile nr: ${newUser.mobile} bestaat al!`))
      }
    })  
})

server.get('/user/list', (request, response, next) => {
 User.find({ role: 'Employee' }, { password: 0 }, (error, docs) => {
   if (error) {
     return next(new errors.InternalServerError(error))
   }
   response.send(docs)
   return next()
 })
})

server.post('/user/login', (req, res, next) => {
  let email = req.body.email
  let password = req.body.password
  User.findOne({ email: email }, (error, doc) => {
    if (error) {
      return next(new errors.InternalServerError(error))
    }

    if (doc === null) {
      return next(new errors.NotFoundError(`Verkeerde gebruikersnaam en/of wachtwoord.`))
    }

    console.log(doc)
    bcrypt.compare(password, doc.password, (error, matched) => {
      if (matched) {
        console.log(doc)
        delete doc.password
        let token = jwt.sign(JSON.parse(JSON.stringify(doc)), JWT_SECRET)
        res.send({ auth: true, token: token, profile: doc })
        return next()
      } else {
        return next(new errors.NotFoundError(`Verkeerde gebruikersnaam en/of wachtwoord.`))
      }
    })
  })
})

server.get('/user/validate', (req, res, next) => {
  let user = req.user
  User.findOne({ _id: user._id}, (error, doc) => {
    if (error) {
      return next(new errors.InternalServerError(error))
    }

    if (doc === null) {
      return next(new errors.NotFoundError(`Gebruiker niet gevonden`))
    }

    if (user.firstname === doc.firstname) {
      res.send({ validated: true, user: req.user })
    }

  })

  return next()
})

server.get('/user/token/validate', (request, response, next) => {
  let token = request.query.pass_token
  let currDate = moment().unix()

  User.findOne({ passResetToken: token }, (error, result) => {
    if (error) {
      return next(new errors.InternalServerError(error))
    }

    console.log(result)
    if (result) {
      let resetRequestTime = moment(result.passResetDate).unix()
      let secondsAgo = currDate - resetRequestTime
      let minutesAgo = Math.floor(secondsAgo / 60)
      let hoursAgo = Math.floor(minutesAgo / 60)

      if (hoursAgo < 25) {
        response.send({ valid: true, expired: false })
      } else {
        response.send({ valid: true, expired: true })
      }
    } else {
      response.send({ valid: false })
    }
  })
})


server.on('restifyError', function (req, res, err, cb) {
 // this listener will fire after both events above!
 // `err` here is the same as the error that was passed to the above
 // error handlers.
 console.error({
   userAgent: req.userAgent(),
   contentType: req.contentType(),
   secure: req.isSecure(),
   url: req.href(),
   matchedRoute: req.getRoute(),
   error: err
 })
 return cb()
})


server.listen(3000, () => {
 console.info(`${server.name} is listening at ${server.url}`)
})