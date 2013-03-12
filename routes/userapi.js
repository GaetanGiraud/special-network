
/*
 * Serve JSON to our AngularJS client
 */


// Loading model API

var db = require('../config/database').connection
  , User = require('../models/User')(db)
  , Location = require('../models/Location')(db)
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

// Send currentUser information

exports.currentUser = function (req, res) {
  if (req.session.user) {
    User.findById(req.session.user, function (err, user) {
      if (!err) {
        return res.json({"email": user.email, "name": user.name, "_id": user._id, 'picture': user.picture, '_location': user._location}); // User logged in.
      } else {
        console.log(err.red);
        return res.send(400, err);
      }
    });
  } else {
    res.send(401);  // User not logged in. Client logic (Showing login page) handled by Angularjs.
  }
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
  
      
  newUser.save(function(err, user) {  // saving the user in the database
    if (!err) {
      delete user.hash; // don't send hash
      console.log(('User ' + newUser.email + ' created').green);
      
      // create an empty location object to host the user's home location
      var homeLocation = new Location({
      _creator: user._id    // assign an ObjectId
      });
      
      homeLocation.save(function(err, location) {
        if (err) throw err;  
        User.findByIdAndUpdate(user._id, {'_location': location._id }, function(err, user) {
         if (err) throw err;
         return res.json(user);
        });
      });
          
    } else {
      console.log(err.red);
      return res.send(400, err);
    }
  });
};

exports.findById = function (req, res) {
   
  User.findById(req.params.id, function (err, user) {
    if (!err) {
      return res.json({
        "_id": user._id,
        "name": user.name,
        "email": user.email,
        "picture": user.picture,
        "children" : user.children,
        '_location': user._location
        });
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
  //delete req.params.id; // ensure that id is not updated.
  User.findByIdAndUpdate(id, req.body, function(err, user) {
    if (!err) { 
      console.log('user updated'.green);
      return res.json({"_id": user._id,
                       "name": user.name,
                       "email": user.email,
                       "picture": user.picture,
                       "_location": user._location,
                       "children" : user.children});
    } else {
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

// Requesting a particular child.

exports.findChildById = function(req, res){
  User.findById(req.session.user, function (err, user) {
      if (!err) {
       var child = user.children.id(req.params.id);
        return res.json(child); // requested child
      } else {
        console.log(err.red);
        return res.send(400, err);
      }
    });
};
