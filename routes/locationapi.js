/*
 * Location APIs
 * 
 * 
 */


var db = require('../config/database').connection
  , User = require('../models/User')(db)
  , Location = require('../models/Location')(db);
  
  
    
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

  locations = Location.find(function (err, locations) {
    if (!err) { 
      return res.json(locations);
    } else {
      console.log(err.red);
      return res.send(400, err);
    }
  });  
    
};

exports.update = function (req, res) {
  var id = req.params.id;

  Location.findByIdAndUpdate(id, req.body, function(err, location) {
    if (!err) { 
      console.log('user updated'.green);
      return res.json(location);
    } else {
      return res.send(400, err);
    }
  
  });
};

exports.delete = function (req, res) {
    User.findByIdAndRemove(req.params.id, function(err, location) {
    if (!err) { 
      console.log('location deleted'.green);
      return res.json(location);
    } else {
      console.log(err.red);
      return res.send(400, err);
    }
  
  });
}; 
