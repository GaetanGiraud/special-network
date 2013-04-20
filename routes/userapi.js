
/*
 * Serve JSON to our AngularJS client
 */


// Loading model API

var db = require('../config/database').connection
  , User = require('../models/User')(db)
  , Location = require('../models/Location')(db)
  , Child = require('../models/Child')(db)
    , Tag = require('../models/Tag')(db)
  , _ = require("underscore")
  , mongoose = require('mongoose')
  , bcrypt = require('bcrypt');
  
  
var calculateDistance = function(lat1, lon1, lat2, lon2) {
  var R = 6371;
  var x = (lon2-lon1) * Math.cos((lat1+lat2)/2);
  var y = (lat2-lat1);
  var d = Math.sqrt(x*x + y*y) * R;
  
  return d;
  }

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
      //  '_location': user._location, 
        'settings': user.settings,
        'location': user.location
        }); // User logged in.
        
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
       console.log(('User ' + newUser.email + ' created').green);
      
      // create an empty location object to host the user's home location
     // var homeLocation = new Location({
     // _creator: user._id,   // assign an ObjectId
    //  locationType: 'userhome'
    //  });
      
    //  homeLocation.save(function(err, location) {
        if (err) return (400, err);  
      //  User.findByIdAndUpdate(user._id, {'_location': location._id }, function(err, user) {
        // if (err) throw err;
        return res.json({
        "_id": user._id,
        "name": user.name,
        "email": user.email,
        "picture": user.picture,
        "children" : user.children,
        '_location': user._location,
        'settings': user.settings
        });
       // });
          
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
  
  if (req.query.count) {
    User.aggregate(
      // { $project: { lat: "location.loc[1]", lng: "location.loc[]" }},
     //  { $match : { locationType : "userhome" } },
       { $group : { _id: {loc: "$location.loc"}, count : { $sum : 1 }}},
  //     { $match : { }},
       function (err, results) {
          if (err) return res.send(400, err);
          // console.log(results);
          return res.json(results);
          //console.log(res); // [ { maxAge: 98 } ]
    });
  } else {
  
/*  if (req.query.contacts) {
    Child.aggregate(
      // { $project: { lat: "location.loc[1]", lng: "location.loc[]" }},
     //  { $match : { locationType : "userhome" } },
       { $project: { users : { permissions: 1 }  }},
       { $match: { permissions: req.session.user }},
       { $unwind: "$permissions"},
  //     { $match : { }},
       function (err, results) {
          if (err) return res.send(400, err);
         
          return res.json(results);
          ; // [ { maxAge: 98 } ]
    });*/
  
  
  User.find(function (err, users) {
    if (err) return res.send(400, err);
    users.forEach(function(user){ delete user.hash }); // don't send hash
    return res.json(users);
  });  

}

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
                    "location": user.location,
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

exports.findContacts = function(req, res) {
  if (typeof req.query.term == "undefined" || req.query.term == "") {
     var cleanedTerm = ".";
   } else {
      var cleanedTerm = req.query.term.replace(/[\[\]{}|&;$%@"<>()+,]/g, "");
  }
  
  var id = mongoose.Types.ObjectId(req.session.user);
  
  Child.aggregate( 
            { $project : 
              { permissions: 1 }
            }, 
            { $match: {'permissions._user': id }},
           
            { $unwind: "$permissions"},
            { $group: 
              { _id: "$permissions._user"} 
             },
          
          function (err, results) {
            console.log(results);
            if (err) return res.send(400, err);
            
            User.populate(results, { 
                path: '_id', 
                match: { 'name': {$regex: cleanedTerm, $options: 'i'}, '_id': { $ne: req.session.user }},
                select: '_id name picture',
                options: { limit: 5 }
                },  function(err, results) {
                 // console.log(results);
                  var filteredResult = _.filter(results, function(result) { 
                    return result._id != null;
                     });
                 console.log( filteredResult);
                 if (err) return res.send(400, err);
                 res.json(filteredResult);
            });
    });
  
};

exports.search = function (req, res) {
   var distance = req.query.distance;
   var querySuperpowers = req.query.superpowers;
   var centerlocation = [req.query.lng, req.query.lat] ;
   
  // console.log(req.query.superpowers);
   
   if (typeof req.query.term == "undefined" || req.query.term == "") {
         var cleanedTerm = ".";
         
   } else {
      var cleanedTerm = req.query.term.replace(/[\[\]{}|&;$%@"<>()+,]/g, "");

    }
   //console.log( querySuperpowers )
    
    if (typeof querySuperpowers != 'undefined') {
      //querySuperpowers = req.query.superpowers.replace(/[\[\]{}|&;$%@"<>()+]/g, "").split(',');
      var opts = {'superpowers': {$in: querySuperpowers }};
      
      //console.log(querySuperpowers)
      } else { 
         var opts = {};
      };
    
   //console.log(querySuperpowers.length);
    //re = new RegExp(cleanQuery)
   /* if ( querySuperpowers == null) {
      console.log('not super po wnter');
     ;
    } else { 
      
    }*/
    
    User.find({'name': {$regex: cleanedTerm, $options: 'i'}, // search term
             'location.loc': {$nearSphere: centerlocation, $maxDistance: distance/6371}}, // distance criteria
             {'_id': { $ne: req.session.user }}) // exlude the current user from the search results
     .limit(50) // limit to a reasonable number of requests for performance purposes.
     .select('_id')
     .exec(function(err, users) { 
        if (err) return res.send(400, err);
        // Extract the user ids into an array
        var userIds =  _.map(users, function(user) { return user._id } );
      
        Child.aggregate( 
          { $match: {'permissions._user': { $in: userIds }}},
          { $match: opts },
          { $project : 
            { name: 1, picture: 1, pageTitle: 1, creator: 1, permissions: 1, superpowers: 1 }
            }, 
          { $unwind: "$permissions"}, 
          { $group: 
            { _id: "$permissions._user", childrenCount: { $sum : 1 }, children: { $addToSet: {_id: "$_id"}} 
            }
          },
         // { $match: { 'children.creator._user': req.session.user }},
          
          function (err, results) {
              if (err) return res.send(400, err);

              User.populate(results, { 
                path: '_id', 
               // match: {'name': {$regex: cleanedTerm, $options: 'i'}},
                match: { 'name': {$regex: cleanedTerm, $options: 'i'}, 'location.loc': {$nearSphere: centerlocation, $maxDistance: distance/6371},
                '_id': { $ne: req.session.user }},
              //  match: {'_id': { $ne: req.session.user }},
                select: '_id name picture location'
                },
                function(err, results) {
                 // console.log(results);
                 
                  var filteredResult = _.filter(results, function(result) { 
                    return result._id != null;
                     });
                  Child.populate(filteredResult , {path: 'children._id'}, function(err, results) {
                 //console.log('results after search')
                 //console.log(filteredResult);
                   Tag.populate(results,{path: 'children._id.superpowers'}, function(err, data) {
                      if (err) return res.send(400, err);
                      res.json(filteredResult);
                    });
                  });
              });
          });
    });
    
    
    
    
    
   

    
    
 /*     Child.find(opts).populate({ 
        path: 'creator._user',
        match: {'location.loc': {$nearSphere: centerlocation, $maxDistance: distance/6371} , 'name': {$regex: cleanedTerm, $options: 'i'} },
        select: '_id name picture location'
        })
      .populate({
        path: 'permissions._user',
        select: '_id name picture'
        //match: {'location.loc': {$nearSphere: centerlocation, $maxDistance: distance/6371},  'name': { $regex: cleanedTerm, $options: 'i'} } 
        })
       .populate({
        path: 'lastUpdate' ,
        select: 'updatedAt'
      })
      .exec(function (err, children) {
      // result array
      // var results = [];
     //  console.log(err);
      if (err) return res.send(400, err);
     
     // eliminating results where no users have been matched either as creator of follower
     var results = [];
     for(var i = 0; i < children.length; i++) {
        
       
        var permissionsCount =  children[i].permissions.filter(function(value) { return value._user !== null }).length;
         console.log(permissionsCount);
         console.log(children[i].creator._user );
         
         if (children[i].creator._user != null || permissionsCount  > 0) {
           console.log('result detected');
           results.push(children[i]);
        }
      //  children[i].adults = [ children[i].creator ] + children[i].permissions;
      
      }
       
       res.json(results);
      
      
     })*/
   
   
   //Child.populate

};
   
   /*
   Location.findById(req.query.homeLocation, function(err,location) {
     var searchLocation = location;
     //console.log(location)
     //console.log(calculateDistance(searchLocation.lat, searchLocation.lng, this._location.lat, this._location.lng) &lt; distance
     //   if (cleanQuery.length > 0) { 
     var re = new RegExp(cleanQuery);
     console.log(searchLocation);
     
     Location.find({loc: {$nearSphere: searchLocation.loc, $maxDistance: distance/6371}
                    })
     .where('locationType').equals('userhome')
     /*.populate('_location')
       
       .limit(5)
       .$where(function() { 
         //console.log(this);
         return true;
            
       //  Location.findById(this.
       //  var d = calculateDistance(searchLocation.lat, searchLocation.lng, element._location.lat, this._location.lng) 
       //  if (d > distance) return true;
          
          
          
          
         // return false;
        
          
      })*/
      /*
      .populate('_creator')
      //.or([{'_creator.name': re}, {'_creator.email': re}])
      .exec(function(err, locations) {
        console.log(err);
        console.log(locations);
        if (err) return res.send(400, err);
        
        var users = [];
        var limit = 5;
        
        for(var i = 0; i < locations.length; i++) {
           if ( re.exec(locations[i]._creator.name)  != null || re.exec(locations[i]._creator.email)  != null)
           { 
             users.push(locations[i]._creator); 
             limit--;
             if (limit == 0) break;
           }
        }
      */
       
  //     return res.json(users);
   //  });
 //  } else {
 //    res.json({}); 
 // }
   
   
   
 //  });   

   
   
   



 //    consol.log(users);
 
//}; 

