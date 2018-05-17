const eventsModule = require('./events');
const config = require('./../config');

// Setup of google cloud datastore
const Datastore = require('@google-cloud/datastore');
const datastore = new Datastore({
  apiEndpoint: 'localhost:8081', 
  projectId: config.projectId
});


const events = eventsModule(datastore);

describe('The events module', function() {
  it('inserts a record', function(done){
    var body = {
      one : "one",
      two : "two"
    }
    events.insertEvent(1, body, function(){
      done();
    });
  });
});
