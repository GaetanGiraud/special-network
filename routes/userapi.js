
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
    if (!user) { return fn(new Error('cannot find user'), null); }
    if (!bcrypt.compareSync(password, user.hash)) { return fn(new Error('invalid password'), null); }
    return fn(null, user);;
  });
}

// Send currentUser information

exports.currentUser = function (req, res) {
  
  if (req.session.user) {
    User.findById(req.session.user, function (err, user) {
      if (!err) {
        return res.json({"email": user.email, 
        "name": user.name, 
        "_id": user._id, 
        'picture': user.picture, 
        '_location': user._location, 
        'settings': user.settings}); // User logged in.
        
      } else {
        console.log(err.red);
        return res.send(400, err);
      }
    });
  } else {
    req.session.destroy();
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
      _creator: user._id,   // assign an ObjectId
      locationType: 'userhome'
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
        '_location': user._location,
        'settings': user.settings
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
  User.find(function (err, users) {
    if (err) return res.send(400, err);
    users.forEach(function(user){ delete user.hash }); // don't send hash
    return res.json(users);
  });  
};

exports.update = function (req, res) {
  var id = req.params.id;
  var userData = req.body;
  if (userData._id) delete userData._id; // stripping the id for mongoDB

  User.findByIdAndUpdate(id, userData, function(err, user) {
    if (err) return res.send(400, err);
    console.log('user '+ user._id + ' updated'.green);
    return res.json({"_id": user._id,
                    "name": user.name,
                    "email": user.email,
                    "picture": user.picture,
                    "_location": user._location,
                    "settings": user.settings,
                    "children" : user.children});
  });
};

exports.delete = function (req, res) {
    User.findByIdAndRemove(req.params.id, function(err) {
      if (err) return res.send(400, err);
      console.log('user deleted'.green);
      return res.send(200);
  });
}; 

exports.search = function (req, res) {
   var cleanQuery = req.query.q.replace(/[\[\]{}|&;$%@"<>()+,]/g, "");

   if (cleanQuery.length > 0) { 
     var re = new RegExp(cleanQuery);
     console.log(re);
     User.find({$or: [{name: re}, {email: re}]}, '_id name picture').limit(5).exec(function(err, users) {
       if (err) return res.send(400, err);
       return res.json(users);
     });
   } else {
     res.json({}); 
  }
 //    consol.log(users);
 
}; 

