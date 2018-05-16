const express = require('express');
const bearerToken = require('express-bearer-token');
const bodyParser = require('body-parser');
const http = require('http');


function Server(auth, eventsApi) {

  const app = express();
  app.use(bodyParser.urlencoded({ extended: false })); // parse application/x-www-form-urlencoded
  app.use(bodyParser.json()); // parse application/json
  app.set('view engine','html');

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
    var token = req.token;
    console.log(token);
    if(token){
      //Decode the token
      console.log(config);
      console.log(config.jwtCertificate);
      jwt.verify(token, config.jwtCertificate, (err,decod)=>{
        if(err){
          console.log(err);
          res.status(403).json({
            message:"Wrong Token"
          });
        }
        else{
          //If decoded then call next() so that respective route is called.
          req.decoded=decod;
          console.log(decod);

          const query = {
            text: `SELECT id
            FROM users
            WHERE email = $1`,
            values: [decod['client_id']]
          }
          pool.query(query)
          .then(data => {
              if (data.rows.length === 1) {
                req.userId = data.rows[0].id;
                next();
              } else {
                res.status(401).send('Authentication Failed');
              }
          })
          .catch(e => console.error(e.stack));


        }
      });
    }
    else{
      res.status(403).json({
        message:"No Token"
      });
    }
  });

  app.post('/events', function(req, res){
      events.createEvent( req.userId, req.body, function(data){
        res.status(201).json({
          data
        });
      });
  });

  app.get('*',function(req, res){    
      res.sendFile(path.join(__dirname,'index.html'));
  });

  return app;

}

module.exports = Server;

