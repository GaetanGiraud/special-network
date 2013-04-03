/*
 * Location APIs
 * 
 * 
 */


var db = require('../config/database').connection
  , User = require('../models/User')(db)
  , Location = require('../models/Location')(db);
  
exports.homeLocation = function (req, res) {
  // first retrive the current user. If no current user, then throw an erro 401 user not authorized
  User.findById(req.session.user, function(err, user) {
    if (err) { return res.send(401) ;}
    // fetch the user home location
    //Location.findById(user._location, function (err, location) {
    //  if (!err) {
        return res.json(user.location);
    //  } else {
       // console.log(err.red);
      //  return res.send(400, err);
   //   }
   // });
  });
};


    
exports.add = function (req, res) {
  console.log(('creating location: ' + req.body.stringify));
  var newLocation = new Location(req.body);
  
  newLocation.save(function(err, location) {  // saving the user in the database
    if (!err) {
      return res.json(location);
    } else {
      console.log(err.red);
      return res.send(400, err);
    }
  });
};

exports.findById = function (req, res) {
   
  Location.findById(req.params.id, function (err, location) {
    if (!err) {
      return res.json(location);
    } else {
      console.log(err.red);
      return res.send(400, err);
    }
  });
};


exports.findAll = function (req, res) {
  console.log(req.query);
  if (req.query.type == 'homeuser') {
    Location.aggregate(
      // { $project: { lat: "$lat", lng: "$lng" }},
       { $match : { locationType : "userhome" } },
       { $group : { _id: {lat: "$lat" , lng: "$lng"}, count : { $sum : 1 }}},
  //     { $match : { }},
       function (err, results) {
          if (err) return res.send(400, err);
          return res.json(results);
          //console.log(res); // [ { maxAge: 98 } ]
        }
    );
   // console.log(users);
  } else {
    Location.find({'locationType': {$ne: 'userhome'}}, function (err, locations) {
      if (!err) { 
        return res.json(locations);
      } else {
        console.log(err.red);
        return res.send(400, err);
      }
    });  
  }
};

exports.update = function (req, res) {
  var id = req.params.id;
  var locData = req.body;
  if(locData._id) delete locData._id;
  
  Location.findByIdAndUpdate(id, locData, function(err, location) {
    if (!err) { 
      console.log(('location' + location._id + ' updated').green);
      return res.json(location);
    } else {
      console.log((err).red);
      return res.send(400, err);
    }
  
  });
};

exports.delete = function (req, res) {
    Location.findByIdAndRemove(req.params.id, function(err) {
    if (!err) { 
      //console.log(('location ' + location._id + ' deleted').green);
      return res.send(200);
    } else {
      console.log(err.red);
      return res.send(400, err);
    }
  
  });
}; 
