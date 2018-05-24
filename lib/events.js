
function Events(datastore) {
  if(! (this instanceof Events) ){
    return new Events(datastore);
  }
	this.datastore = datastore;
}

Events.prototype.insertEvent = function(userId, body, callback){
  // The kind for the new entity
  const kind = 'Event';
  // The name/ID for the new entity
  const name = 'sampletask1';
  // The Cloud Datastore key for the new entity
  const taskKey = this.datastore.key([kind, name]);

  // Prepares the new entity
  const task = {
    key: taskKey,
    data: body
  };

  // Saves the entity
  console.log("saving it");
  this.datastore
    .save(task)
    .then(() => {
      console.log(`Saved ${task.key.name}: ${task.data}`);
      callback();
    })
  
}

module.exports = Events;
