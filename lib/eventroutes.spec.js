const EventRoutes = require('./eventroutes');
const sinon = require('sinon');
const request = require('supertest');
const Events = require('./events')

const events = sinon.mock(Events);

const express = require('express');
const eventRoutes = new EventRoutes(events);
const server = express();

server.use(eventRoutes);


describe('POST /events', function() {
  it('respond with json', function(done) {
    request(server)
      .post('/events')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(201, done);
  });
});
