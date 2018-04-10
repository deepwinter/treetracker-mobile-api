const bcrypt = require('bcrypt');
const fs = require('fs');

// token is signed with RSA SHA256
// var cert = fs.readFileSync('private.key');  // get private key
const cert = "12piaspdfinpq293h[aosidfj[0q92u3[mpoaisdfja;oi3c;anjsdfn;lak sdf ;aslkdfsa";

function Auth(pool, smtpTransport) {
  if(! (this instanceof Auth) ){
    return new Auth(pool, smtpTransport);
  }
	this.pool = pool;
  this.smtpTransport = smtpTransport;
}

function createToken(client_id) {
  return jwt.sign({ client_id: clientId }, cert);
}

Auth.prototype.token = function(clientId, clientSecret, success, failure) {

  const query = {
    text: `SELECT salt 
    FROM users
    WHERE email = $1`,
    values: [clientId]
  }

  .then(data => {
    const salt = data.rows[0].salt;
    const clientSecretSaltyHash = bcrypt.hashSync(clientSecret, salt);
    const query = {
      text: `SELECT email
      FROM users
      WHERE email = $1
      AND password = $2`,
      values: [clientId, clientSecretSaltyHash]
    }
    pool.query(query)
      .then(data => {
        if (data.rows.length === 1) {
          console.log(data);
          const token = createToken(clientId);
          success(token);
        } else {
          failure('Authentication Failed');
        }
      });
  });

}

Auth.prototype.register = function(clientId, clientSecret, body, callback) {

  const salt = bcrypt.genSaltSync(10);
  const clientSecretSaltyHash = bcrypt.hashSync(clientSecret, salt);
  const query = {
    text: `INSERT INTO users
          (first_name, last_name, organization, phone, email, password, salt)
           VALUES
          ($1, $2, $3, $4, $5, $6, $7)`,
    values: [body['first_name'], body['last_name'],
       body['organization'], body['phone'], 
       clientId, clientSecretSaltyHash, salt ]
  }
  pool.query(query)
  .then(callback);
}

Auth.prototype.forgot = function(clientId, callback) {

  var newpassword = randomstring.generate({
      length: 12,
      charset: 'alphabetic'
  });
  const salt = bcrypt.genSaltSync(10);
  const clientnewSecretSaltyHash = bcrypt.hashSync(newpassword, salt);
  console.log(clientnewSecretSaltyHash);
  
  const query = {
    text: `SELECT * 
    FROM users
    WHERE email = $1`,
    values: [clientId]
  }

  this.pool.query(query)
  .then(data => { 
    console.log(data);
    resultid = data.rows[0].id;
    resultemail = data.rows[0].email;

    const query = {
       text: `UPDATE  
               users SET password = $2
                WHERE id = $1`,
        values: [resultid, clientnewSecretSaltyHash]
    }
     pool.query(query)
      .then(data => {

        var mailOptions = {

          to: resultemail,
          subject: 'Password Reset - GreenStand', 
          html: 'Hello,<br>Try to login in again.<br>Your new password is: '+newpassword

        };
        console.log("sending");
        smtpTransport.sendMail(mailOptions, function(error, info){
          if(error){

            return console.log(error);
          }
          console.log('Message sent: ' + info.response);
          res.status(200).json({
            message: 'Password Reset.'
          });


          callback(data);
        });

      });
 });
}

module.exports = Auth;