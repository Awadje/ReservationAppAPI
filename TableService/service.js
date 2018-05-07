const feathers = require('@feathersjs/feathers');
const express = require('@feathersjs/express');
const socketio = require('@feathersjs/socketio');

const MongoClient = require('mongodb').MongoClient;
const service = require('feathers-mongodb');
const { BadRequest } = require('@feathersjs/errors');

const Model = require('./TableSchema');

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

// Connect to your MongoDB instance(s)
MongoClient.connect('mongodb://localhost:27017/tables')
  .then(function (client) {
    // Set the model now that we are connected
    app.service('tables').Model = client.db('tables').collection('tables');

  }).catch(error => console.error(error));

  // A basic error handler, just like Express
  app.use(express.errorHandler());

// Start the server.
const port = 3030;

app.listen(port, () => {
  console.log(`Feathers server listening on port ${port}`);
});
