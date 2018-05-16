const express = require('express');


function EventRoutes(events){
  const router = express.Router();

  router.post('/events', function(req, res){
      res.status(201).json({});
      /*events.createEvent( req.userId, req.body, function(data){
        res.status(201).json({
          data
        });
      });
      */
  });

  return router;
}

module.exports = EventRoutes
