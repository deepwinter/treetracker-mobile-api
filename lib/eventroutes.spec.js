const EventRoutes = require('./eventroutes');
const sinon = require('sinon');
const request = require('supertest');
const expect = require('chai').expect
const Events = require('./events')

const events = sinon.createStubInstance(Events);

const express = require('express');
const bb = require('express-busboy');

const eventRoutes = new EventRoutes(events);
const server = express();

bb.extend(server, {
    upload: true,
    path: 'uploads',
    allowedPath: /./
});
server.use(eventRoutes);

describe('POST /events', function() {

  it('respond with json', function(done) {
    request(server)
      .post('/events')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .end(function(err, res) {
                  done();
      });
  });


  it('accepts fileupload', function(done) {
    request(server)
      .post('/events')
      .field('name', 'my awesome avatar')
      .attach('file', 'test/unit_test_event_data.csv')
      .end(function(err, res) {
        expect(res.status).to.equal(201);
        done();
      });
  });

  it('respond with error when no file', function(done) {
    request(server)
      .post('/events')
      .expect(406, done);
  });
});
