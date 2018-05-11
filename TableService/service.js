const feathers = require('@feathersjs/feathers');
const express = require('@feathersjs/express');
const socketio = require('@feathersjs/socketio')
const mongoose = require('mongoose');
const Slot = require('./SlotSchema')(mongoose);

const MongoClient = require('mongodb').MongoClient;
const service = require('feathers-mongodb');
const { BadRequest } = require('@feathersjs/errors');

// const Model = require('./TableSchema');
// const SlotModel = require('./SlotSchema');

// Create an Express compatible Feathers application instance.
const app = express(feathers());

// Turn on JSON parser for REST services
app.use(express.json());
// Turn on URL-encoded parser for REST services
app.use(express.urlencoded({ extended: true }));
// Enable REST services
app.configure(express.rest());

// Set up an error handler that gives us nicer errors
app.use(express.errorHandler());

// Enable Socket.io
app.configure(socketio());

// On any real-time connection, add it to the `everybody` channel
app.on('connection', connection => app.channel('everybody').join(connection));

// Publish all events to the `everybody` channel
app.publish(() => app.channel('everybody'));

// Connect to the db, create and register a Feathers service.
app.use('/tables', service({
  paginate: {
    default: 15,
    max: 25
  }
}));

app.use('/slots', service({
  paginate: {
    default: 15,
    max: 25
  }
}));

// Hooks
app.service('tables').hooks({
  before: {
    all: [
      // Use normal functions
      LogAll => {
        console.log('TABLES: before all hook ran');
      }
    ],
    find: [
      // Use ES6 arrow functions
      LogFindHook1 => console.log('TABLES: before find hook 1 ran'),
      LogFindHook2 => console.log('TABLES: before find hook 2 ran')
    ],
    get: [ /* other hook functions here */ ],
    create: [],
    update: [],
    patch: [
      LogBeforePatch => {
        console.log('TABLES: before patching')
      }
    ],
    remove: []
  },
  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [
      LogAfterPatch => {
        console.log('TABLES:after patching')
      }],
    remove: []
  },
  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
});

app.service('slots').hooks({
  before: {
    all: [
      // Use normal functions
      LogAll => {
        console.log('SLOTS: before all hook ran');
      }
    ],
    find: [
      // Use ES6 arrow functions
      LogFindHook1 => console.log('SLOTS: before find hook ran')
    ],
    get: [ /* other hook functions here */ ],
    create: [
      function(context) {

        console.log('SLOTS: before create')
        console.log(context.data)

         const slotDate = context.data.slot_date;

          return context.app.service('slots').find({slotDate}).then(slot => {
            context.data.slot = slot
                console.log(`Slot Result: ${context.data.slot}`)
            return context
        })
    }

    ],
    update: [],
    patch: [],
    remove: []
  },
  after: {
    all: [],
    find: [],
    get: [],
    create: [
      AfterCreateHook => console.log('SLOTS: after create hook ran')
    ],
    update: [],
    patch: [],
    remove: []
  },
  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
});

// Connect to your MongoDB instance(s)
MongoClient.connect('mongodb://localhost:27017/tables')
  .then(function (client) {
    // Set the model now that we are connected
    app.service('tables').Model = client.db('tables').collection('tables');

  }).catch(error => console.error(error));

MongoClient.connect('mongodb://localhost:27017/slots')
  .then(function (client) {
    // Set the model now that we are connected
    app.service('slots').Model = client.db('slots').collection('slots');

  }).catch(error => console.error(error));


  // A basic error handler, just like Express
  app.use(express.errorHandler());

// Start the server.
const port = 3030;

app.listen(port, () => {
  console.log(`Feathers server listening on port ${port}`);
});
