
function Events(datastore) {
  if(! (this instanceof Events) ){
    return new Events(datastore);
  }
	this.datastore = datastore;
}

Events.prototype.insertEvent = function(userId, body, callback){
  // The kind for the new entity
  const kind = 'LocationEvent';
  // The name/ID for the new entity
  const name = userId + '-' + body['timestamp'];
  // The Cloud Datastore key for the new entity
  const taskKey = this.datastore.key([kind, name]);

  body['userId'] = userId;
  body['timestamp'] = parseFloat(body['timestamp']);

  // Prepares the new entity
  const task = {
    key: taskKey,
    data: body
  };
  console.log(task);

  // Saves the entity
  console.log("saving it");
  this.datastore
    .save(task)
    .then(() => {
      console.log(`Saved ${task.key.name}: ${task.data}`);
      if(callback != null) {
        callback();
      }
    })
  
}

module.exports = Events;
