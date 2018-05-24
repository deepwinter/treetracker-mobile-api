const express = require('express');
const bearerToken = require('express-bearer-token');
const bodyParser = require('body-parser');
const http = require('http');
const EventRoutes = require('./eventroutes.js');
const jwt = require('jsonwebtoken');
const bb = require('express-busboy');

function Server(auth, events, config) {

  const app = express();
  app.use(bodyParser.urlencoded({ extended: false })); // parse application/x-www-form-urlencoded
  app.use(bodyParser.json()); // parse application/json

  app.post('/auth/token', function(req, res){
    console.log('/auth/token');
    if (!req.body || (!req.body['client_id'] || !req.body['client_secret'])) {
      res.status(500).send('Server Error: No credential submitted');
      res.end();
      return;
    }
    
    auth.token(req.body['client_id'], req.body['client_secret'], 
      function(token) {
        res.status(200).json({"token": token});
      }, 
      function(error) {
        res.status(401).send('Authentication Failed');
      }
    )

  });

  app.post('/auth/register', function(req, res){
    if (!req.body || (!req.body['client_id'] || !req.body['client_secret'])) {
      return res.status(500, 'Server Error: No credential submitted');
    }

    console.log('register');
    auth.register(req.body['client_id'], 
      req.body['client_secret'], 
      req.body,
      function(data){
        auth.token(
          req.body['client_id'], 
          req.body['client_secret'],
          function(token){
            res.status(201).json({"token": token } );
            res.end();
          },
          function(error){
            res.status(400);
            res.end();
          });
      }
    );
          
  });

  app.post('/auth/forgot', function(req, res){
    console.log("reset");
    if (!req.body || (!req.body['client_id'] )) {
      return res.status(500, 'Server Error: No credential submitted');
    }

    auth.forgot(
      req.body['client_id'],
      function(data){
      res.status(200).json({
          message: 'Password Reset.'
      });
    });
   
  });

  // middleware layer that checks jwt authentication

  app.use(bearerToken());
  app.use((req, res, next)=>{
    console.log("Middleware");
    // check header or url parameters or post parameters for token
    console.log(req.token);

    auth.verifyToken(req, next, function(err){
      res.status(401).json({
        message:err
      });
    });
  });

  bb.extend(app, {
      upload: true,
      path: 'uploads',
      allowedPath: /./
  });

	app.use(new EventRoutes(events));

  return app;

}

module.exports = Server;

