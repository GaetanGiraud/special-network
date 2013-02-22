
/*
 * Serve JSON to our AngularJS client
 */


// User Model API

var db = require('../database').connection
  , User = require('../models/User')(db);


exports.login = function (req, res) {
   var user = User.findOne({'email': req.body.email, 'password': req.body.password }, function(err, user) {
    if (!err) {
      return res.json(user);
    } else {
      console.log(err.red);
      return res.send({'error':'An error has occurred'});
    }
  });
  
};

exports.findUserById = function (req, res) {
  user = User.findById(req.params.id, function (err, user) {
    if (!err) {
      return res.json(user);
    } else {
      console.log(err.red);
      return res.send({'error':'An error has occurred'});
    }
  });
};

exports.findUserByEmail = function (req, res) {
  user = User.findOne({'email': res.body.email}, function(err, user) {
    if (!err) {
      return res.json(user);
    } else {
      console.log(err.red);
      return res.send({'error':'An error has occurred'});
    }
  });
};

exports.findAllUsers = function (req, res) {
  /*res.json(data.users);*/
  users = User.find(function (err, users) {
    if (!err) { 
      return res.json(users);
    } else {
      console.log(err.red);
      return res.send({'error':'An error has occurred'});
    }
  });  
    
};

exports.addUser = function (req, res) {
  console.log(('creating user: ' + req.body.stringify));
  var user = new User(req.body);
  user.save(function(err) {  // saving the user in the database
    if (!err) {
      console.log(('User ' + user.email + ' created').green);
      return res.json(user);
    } else {
      console.log(err.red);
      return res.send({'error':'An error has occurred'});
    }
  });
};

exports.updateUser = function (req, res) {
  console.log('user updated'.green);
};

exports.deleteUser = function (req, res) {
  console.log('user deleted'.green);
}; 
