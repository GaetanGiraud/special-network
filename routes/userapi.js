
/*
 * Serve JSON to our AngularJS client
 */


// User Model API

var db = require('../database').connection
  , User = require('../models/User')(db)
  , utils = require('./utils')
  , bcrypt = require('bcrypt');

/*
*  Easyauth support
*
*/

// login function, promise as input to handle asynchronous rendering
exports.login = function (login, password, promise) {
  // var email = req.body.email, password = req.body.password;
   var user = User.findOne({'email': login }, function(err, user) {
   if (err || user == undefined) { 
     console.log('Unknown user tried to log in'.red);
     return promise.fulfill(['Login Failed']);
   } else {
     //bcrypt.compare(password, user.hash, function(err, response) {
     //  if (err) { 
     //   console.log('Wrong password entered'.red);
     //   return promise.fulfill(['Login Failed']);
     //  } else {
        return promise.fulfill(user);
     //  }
   //  });
   }     
  });
}


exports.findUserById = function (id, callback) {
  User.findOne({'_id': id}, callback);   
};

exports.add = function (newUserAttrs) {
  console.log(('creating user: ' + req.body.stringify));
  
  var password = newUserAttrs.password;
  
  delete newUserAttrs.password; // Don't store password
  var salt = bcrypt.genSaltSync(10);
  newUserAttrs.hash = bcrypt.hashSync(password, salt);
  
  var newUser = new User(newUserAttrs);
  
  newUser.save(function(err) {  // saving the user in the database
    if (!err) {
      console.log(('User ' + newUser.email + ' created').green);
      return newUser;
    } else {
      console.log(err.red);
      return ['An error has occurred'];
    }
  });
};
  
/*
* Restfull API
*
*/


exports.findById = function (req, res) {
  user = User.findById(req.params.id, function (err, user) {
    if (!err) {
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
