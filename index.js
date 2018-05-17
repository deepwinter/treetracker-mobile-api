const pg = require('pg');
const { Pool, Client } = require('pg');
const path = require('path');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const authModule = require('./lib/auth');
const eventsModule = require('./lib/events');

const config = require('./config');

// Setup of postgres pool
const pool = new Pool({
  connectionString: config.connectionString
});
pool.on('connect', (client) => {
  //console.log("connected", client);
})

// Setup of google cloud datastore
const Datastore = require('@google-cloud/datastore');
const datastore = new Datastore({
  projectId: config.projectId
});


process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// this needs to be stubbed
const smtpTransport = nodemailer.createTransport(config.smtpSettings);

const auth = authModule(pool, smtpTransport, config.jwtCertificate);
const events = eventsModule(datastore);

const Server = require('./lib/server'); 
const server = new Server(auth, events);
const port = process.env.NODE_PORT || 3000;

server.get('/favicon.ico', function(req, res) {
    res.status(204);
    res.end();
});

server.listen(port,()=>{
    console.log('listening on port ' + port);
});
