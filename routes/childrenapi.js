
/*
 * Serve JSON to our AngularJS client
 */




var db = require('../config/database').connection
  , User = require('../models/User')(db)
  , _ = require('underscore')
  , Child = require('../models/Child')(db);
  
exports.add = function (req, res) {
  
  
  
  Child.create(req.body, function(err, child) {
    if (err)  return res.send(400, err);
    console.log(('Child: ' + child._id + ' created.'));
    
    // create a default page title based on the name and _id
    child.pageTitle = child.name + '_' + child._id;
    
    // add the creator to the permissions list with 'write' rights.
    child.permissions.push({'_user': child.creator._user, 'rights': 'write', 'relationship': child.creator.relationship});
    
    child.save(function(err, child) {
      if (err)  return res.send(400, err); 
      return res.json(child);
    });
    
    
  });
};

exports.findById = function (req, res) {
  var opts;
  var id = req.params.id;
  
  // Check if params.id match a mongo ObjerctId
  if ( id.match(/^[0-9a-fA-F]{24}$/)) {
    var opts = {'_id': id};
    
  }  else {
    // otherwise use page title as unique identifier.
     var opts = {'pageTitle': id};
  }
  
  Child.findOne(opts, function (err, child) {
    if (err)  return res.send(400, err);
    return res.json(child);
  });
};


exports.findAll = function (req, res) {
  var opts;

  if(req.query.following == "familly") {  
    opts = {'permissions._user': req.session.user, 'creator._user': {$ne: req.session.user }, 'permissions.relationship': { $ne: 'Friend' }};
  } else if (req.query.following == "others") {
    opts = {'permissions._user': req.session.user, 'creator._user': {$ne: req.session.user }, 'permissions.relationship': 'Friend' };
  } else if(req.query.post) {
     opts = {'permissions._user': req.session.user, 'permissions.rights': 'write'};
  } else {
    opts = {'creator._user': req.session.user};
  }
  
  Child.find(opts).populate('lastUpdate').exec(function (err, children) {
      if (err)  return res.send(400, err);
      return res.json(children);
   });  
};

exports.update = function (req, res) {
  var id = req.params.id;
  
  var childData = req.body;
  if (childData._id) delete childData._id; // stripping the id for mongoDB if it is present in the request body.
  console.log(childData)
  
  if (_.isUndefined(childData.permission) == false) {
    var data = childData.permission;
    childData =  { $addToSet: { 'permissions': data  } };
    console.log(childData)
  }
  Child.findByIdAndUpdate(id, childData, function(err, child) {
     if (err) return res.send(400, err);
     console.log('child: ' + child._id + ' updated'.green);
     return res.json(child);
  //return res.send(200);
  });
};

exports.delete = function (req, res) {
  Child.findByIdAndRemove(req.params.id, function(err) {
    if (err) return res.send(400, err);
    return res.send(200);
  });
}; 

exports.isAuthorized = function(id, userId, callback) {
  if ( id.match(/^[0-9a-fA-F]{24}$/)) {
    var opts = {'_id': id, 'permissions._user': userId };
    
  }  else {
    // otherwise use page title as unique identifier.
     var opts = {'pageTitle': id,  'permissions._user': userId};
  }
  console.log(userId);
  Child.find(opts, function(err, data) {
    if (err) return callback(err, null);
    console.log(data);
    if (data.length > 0) return callback(null, true);
    return callback(null, false);
  })
};

