const express = require('express');
const parse = require('csv-parse')
const parser = parse({delimiter: ','});
const fs = require('fs');

var fieldNames = null;
var eventsModel = null;

// Catch any error
parser.on('error', function(err){
  console.log('error' + err.message);
});

function EventRoutes(events){
  const eventsModel = events;
  const router = express.Router();

  router.post('/events', function(req, res){
      console.log("event route");
      console.log(req.files);
      if(req.files != null && req.files.file != null){
        var readStream = fs.createReadStream(req.files.file.file);

        // Use the writable stream api
        parser.on('readable', function(){
          while(record = parser.read()){
            if(record[0] == 'timestamp'){
              fieldNames = record;
            } else {
              if( fieldNames == null ){
                throw Error ('fieldnames cannot be null')
              }
              var newEvent = {};
              for(var i=0; i < fieldNames.length; i++){
                newEvent[fieldNames[i]] = record[i];
                eventsModel.insertEvent(req.userId, newEvent, null);
              }
            }

          }
        });

        parser.on('finish', function(){
          fs.unlink(req.files.file.file, (err) => { // just remove the file for now, but in the future we want to be streaming anyway
            if (err) throw err;
            res.status(201).json({});
          });
        });

        readStream.pipe(parser) 

      } else {
        res.status(406).json({});
      }
  });

  return router;
}

module.exports = EventRoutes
