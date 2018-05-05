const feathers = require('@feathersjs/feathers');
const express = require('@feathersjs/express');
const socketio = require('@feathersjs/socketio');

const mongoose = require('mongoose');
const service = require('feathers-mongoose');

const Model = require('./TableSchema');

mongoose.Promise = global.Promise;

// Connect to your MongoDB instance(s)
mongoose.connect('mongodb://localhost:27017/feathers');

// Create an Express compatible Feathers application instance.
const app = express(feathers());

// Turn on JSON parser for REST services
app.use(express.json());
// Turn on URL-encoded parser for REST services
app.use(express.urlencoded({extended: true}));
// Enable REST services
app.configure(express.rest());
// Enable Socket.io services
app.configure(socketio());
// Connect to the db, create and register a Feathers service.
app.use('/tables', service({
  Model,
  lean: true, // set to false if you want Mongoose documents returned
  paginate: {
    default: 2,
    max: 4
  }
}));
app.use(express.errorHandler());

// Create a dummy Message
app.service('tables').create({
  text: 'Table created on server'
}).then(function(table) {
  console.log('Created message', table);
});

// Start the server.
const port = 3030;
app.listen(port, () => {
    console.log(`Feathers server listening on port ${port}`);
});