
/*
 * Serve JSON to our AngularJS client
 */


// User Model API

var db = require('../config/database').connection
  , User = require('../models/User')(db)
  , utils = require('./utils')
  , bcrypt = require('bcrypt');

/*
*  Easyauth support
*
*/

// login function, promise as input to handle asynchronous rendering
exports.login = function (email, password, done) {
  // var email = req.body.email, password = req.body.password;
  User.findOne({'email': email }, function(err, user) {
    if (err) { 
      console.log('Unknown user tried to log in'.red);
      return done(err);
    } 
    if (!user) { return done(null, false); }
    if (!bcrypt.compareSync(password, user.hash)) { return done(null, false); }
    return done(null, user);
  });
}


exports.findUserById = function (id, callback) {
  User.findOne({'_id': id}, callback);   
};


  
/*
* Restfull API
*
*/

exports.add = function (req, res) {
  console.log(('creating user: ' + req.body.stringify));
  var newUserAttrs = req.body;
  var password = newUserAttrs.password;
  
  delete newUserAttrs.password; // Don't store password
  var salt = bcrypt.genSaltSync(10);
  newUserAttrs.hash = bcrypt.hashSync(password, salt);
  
  var newUser = new User(newUserAttrs);
  
  newUser.save(function(err) {  // saving the user in the database
    if (!err) {
      delete newUser.hash; // don't send hash
      console.log(('User ' + newUser.email + ' created').green);
      return res.json(newUser);
    } else {
      console.log(err.red);
      return res.send({'error': err});
    }
  });
};

exports.findById = function (req, res) {
  user = User.findById(req.params.id, function (err, user) {
    if (!err) {
      delete user.hash; // don't send hash
      return res.json(user);
    } else {
      console.log(err.red);
      return res.send({'error':'An error has occurred'});
    }
  });
};

exports.findByEmail = function (req, res) {
  user = User.findOne({'email': res.body.email}, function(err, user) {
    if (!err) {
      delete user.hash; // don't send hash
      return res.json(user);
    } else {
      console.log(err.red);
      return res.send({'error':'An error has occurred'});
    }
  });
};

exports.findAll = function (req, res) {
  /*res.json(data.users);*/
  users = User.find(function (err, users) {
    if (!err) { 
      users.forEach(function(user){ delete user.hash }); // don't send hash
      return res.json(users);
    } else {
      console.log(err.red);
      return res.send({'error':'An error has occurred'});
    }
  });  
    
};

exports.update = function (req, res) {
  console.log('user updated'.green);
};

exports.delete = function (req, res) {
  console.log('user deleted'.green);
}; 
