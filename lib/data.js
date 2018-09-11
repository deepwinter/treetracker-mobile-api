function Data(pool) {
  if(! (this instanceof Data) ){
    return new Data(pool);
  }
	this.pool = pool;
}

Data.prototype.trees = function(callback) {
  let query = {      
    text: 'SELECT * FROM trees'
  }
  this.pool.query(query)
    .then(callback);
}

Data.prototype.treesForUser = function(userId, callback){
  let query = {      
    text: 'SELECT * FROM trees WHERE user_id = $1',
    values: [userId]
  }
  this.pool.query(query)
    .then(callback);
}

Data.prototype.findOrCreateUser = function(identifier, callback){
    let query = {
    text: 'SELECT * FROM users WHERE phone = $1 OR email = $1',
    values: [identifier]
    }
    this.pool.query(query)
    .then(data => {
        if(data.rows.length == 0){
            var reg = new RegExp('^\\d+$');
            var query = null; 
            if(reg.test(identifier)){
                query = {
                text: 'INSERT INTO users (first_name, last_name, phone) VALUES ($1, $2, $3 ) RETURNING *',
                values: ['Anonymous', 'Planter', identifier]
                }
            } else {
                query = {
                text: 'INSERT INTO users (first_name, last_name, email) VALUES ($1, $2, $3 ) RETURNING *',
                values: ['Anonymous', 'Planter', identifier]
                }
            }
            this.pool.query(query)
            .then(callback)
        } else {
            callback(data.rows[0]);
        }

    });
}

Data.prototype.createTree = function(userId, body, callback){
  let lat = body.lat;
  let lon = body.lon;
  let gpsAccuracy = body.gps_accuracy;
  let note = body.note; // first note
  let timestamp = body.timestamp;
  let imageUrl = body.image_url; // first image
  let planterPhotoUrl = body.planter_photo_url; 
  let planterIdentifier = body.planter_identifier;

  const geometry = 'POINT( ' + lon + ' ' + lat + ')';
  const query = {
    text: `INSERT INTO 
    trees(user_id,
        lat,
        lon, 
        gps_accuracy,
        time_created,
        time_updated,
        image_url,
        estimated_geometric_location,
        planter_photo_url,
        planter_identifier
        ) 
    VALUES($1, $2, $3, $4, to_timestamp($5), to_timestamp($5), $6, ST_PointFromText($7, 4326), $8, $9 ) RETURNING *`,
    values: [userId, lat, lon, gpsAccuracy, timestamp, imageUrl, geometry, planterPhotoUrl, planterIdentifier],
  }
  console.log(query);

  this.pool.query(query)
    .then(callback);
}

Data.prototype.updateDevice = function(id, body, callback){
  let app_version = body['app_version']
  let app_build = body['app_build']
  let manufacturer = body['manufacturer']
  let brand = body['brand']
  let model = body['model']
  let hardware = body['hardware']
  let device = body['device']
  let serial = body['serial']
  let android_release = body['androidRelease']
  let android_sdk = body['androidSdkVersion']

  const query = {
    text: `UPDATE devices
    SET app_version = ($1),
    app_build = ($2),
    manufacturer = ($3),
    brand = ($4),
    model = ($5),
    hardware = ($6),
    device = ($7),
    serial = ($8),
    android_release = ($9),
    android_sdk = ($10)
    WHERE id = ($11)`,
    values: [app_version, app_build, manufacturer, brand, model, hardware, device, serial, android_release, android_sdk, id]
  };

  console.log(query);

  this.pool.query(query)
    .then(callback);

}

module.exports = Data;