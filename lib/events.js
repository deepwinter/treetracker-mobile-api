function Events(pool) {
  if(! (this instanceof Events) ){
    return new Events(pool);
  }
	this.pool = pool;
}

Events.prototype.createEvent = function(userId, body, callback){

}

module.exports = Events;