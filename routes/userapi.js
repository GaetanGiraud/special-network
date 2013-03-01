
/*
 * Serve JSON to our AngularJS client
 */


// User Model API

var db = require('../config/database').connection
  , User = require('../models/User')(db)
  , utils = require('./utils')
  , bcrypt = require('bcrypt');

// Authenticate user
exports.authenticate = function (email, password, fn) {
  console.log('authenticating %s:%s', email, password);
  User.findOne({'email': email }, function(err, user) {
    if (err) throw err;
    if (!user) { return fn(new Error('cannot find user')); }
    if (!bcrypt.compareSync(password, user.hash)) { return fn(null, new Error('invalid password')); }
    return fn(null, user);;
  });
}

 
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
  
  newUser.save(function(err, user) {  // saving the user in the database
    if (!err) {
      delete user.hash; // don't send hash
      console.log(('User ' + newUser.email + ' created').green);
      return res.json(user);
    } else {
      console.log(err.red);
      return res.send(400, err);
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
      return res.send(400, err);
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
      return res.send(400, err);
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
      return res.send(400, err);
    }
  });  
    
};

exports.update = function (req, res) {
  var id = req.params.id;
  delete req.params.id; // ensure that id is not updated.
  User.Model.findByIdAndUpdate(id, req.params, function(err, user) {
    if (!err) { 
      delete user.hash // don't send hash
      console.log('user updated'.green);
      return res.json(user);
    } else {
      console.log(err.red);
      return res.send(400, err);
    }
  
  });
};

exports.delete = function (req, res) {
    User.findByIdAndRemove(req.params.id, function(err, user) {
    if (!err) { 
      delete user.hash // don't send hash
      console.log('user deleted'.green);
      return res.json(user);
    } else {
      console.log(err.red);
      return res.send(400, err);
    }
  
  });
}; 
