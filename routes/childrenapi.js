
/*
 * Serve JSON to our AngularJS client
 */




var db = require('../config/database').connection
  , User = require('../models/User')(db)
  , Tag = require('../models/Tag')(db)
  , _ = require('underscore')
  , mongoose = require('mongoose')
  , Child = require('../models/Child')(db);
  
exports.add = function (req, res) {
  
  
  
  Child.create(req.body, function(err, child) {
    if (err)  return res.send(400, err);
    console.log(('Child: ' + child._id + ' created.'));
    
    // create a default page title based on the name and _id
    child.pageTitle = child.name + '_' + child._id;
    
    // add the creator to the permissions list with 'write' rights.
    child.permissions.push({'_user': child.creator._user, 'rights': 'write', 'validated': true, 'relationship': child.creator.relationship});
    
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
  
  Child.findOne(opts)
    .populate({path: 'superpowers'  })
    .exec(function (err, child) {
    if (err)  return res.send(400, err);
    return res.json(child);
  });
};


exports.findAll = function (req, res) {
  var opts;

  if(req.query.following == "familly") {  
    opts = { 
        'permissions._user': req.session.user, 
        'creator._user': {$ne: req.session.user }, 
        'permissions.relationship': { $ne: 'Friend' },
        'permissions.validated': { $ne: false }
        };
  } else if (req.query.following == "others") {
    opts = {
         'permissions._user': req.session.user, 
         'creator._user': {$ne: req.session.user }, 
         'permissions.relationship': 'Friend',
         'permissions.validated': { $ne: false } };
  } else if(req.query.post) {
     opts = {'permissions._user': req.session.user, 
             'permissions.rights': 'write',
             'permissions.validated': { $ne: false }};
  } else {
    opts = {'creator._user': req.session.user,
            'permissions.validated': { $ne: false } };
  }
  
  Child.find(opts)
       .populate('lastUpdate')
       .populate({
         path: 'superpowers'
        // match: { followers: req.session.user  }
         })
       .exec(function (err, children) {
      if (err)  return res.send(400, err);
      return res.json(children);
   });  
};

exports.update = function (req, res) {
  var id = req.params.id;
  
  var childData = req.body;
  if (childData._id) delete childData._id; // stripping the id for mongoDB if it is present in the request body.
  
  //console.log( childData);
  
  childData.superpowers = _.map(childData.superpowers, function(tag) { 
    //console.log(tag._id)
    return mongoose.Types.ObjectId(tag._id);
     }); // storing only the _id of the tags
  
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
  
  Child.find(opts, function(err, data) {
    if (err) return callback(err, null);
    console.log(data);
    if (data.length > 0) return callback(null, true);
    return callback(null, false);
  })
};

exports.follow = function(req, res) {
  var id = req.params.id;
  var data = req.body;
  
  if (data.action == 'validate') {
    if (data.permission.rights == true) data.permission.rights = 'write';
    if (data.permission.rights == false) data.permission.rights = 'read';
      
    id = {'_id': req.params.id, 'permissions._user': data.permission._user };
    var opts =  { 
      'permissions.$.validated': true,
      'permissions.$.relationship': data.permission.relationship,
      'permissions.$.rights': data.permission.rights
       } ;
  } else if (data.action == 'follow') {
    id = {'_id': req.params.id };
    opts =  { $addToSet: { 'permissions': { _user: mongoose.Types.ObjectId(req.session.user) } }  };
  } else if (data.action == 'unfollow') {
    id = {'_id': req.params.id };
    var opts = { $pull: { permissions: { _user: mongoose.Types.ObjectId(req.session.user) } } };
  }
  
  Child.findOneAndUpdate(id, opts)
    .populate('lastUpdate')
    .populate({
       path: 'superpowers'
        // match: { followers: req.session.user  }
     })
  .exec(function(err, child) {
     if (err) return res.send(400, err);
     console.log(child);
     return res.json(child);
  });
  
  
}
/*
 * 
 * Managing albums
 * 
 * 
 */



exports.addAlbum = function (req, res) {
  var childId = req.params.childId;
  console.log(req.params);
  var albumData = req.body;
  //if (albumData._id) delete albumData._id; // stripping the id for mongoDB if it is present in the request body.
  
  Child.findOne({_id: childId}, function(err, child) {
    //var album = child.albums.id(id).content.concat(albumData);
    if (err) return res.send(400, err);
    var index = child.albums.push(albumData);
    
    child.save(function(err, child) {
      res.json(child.albums[index-1]);
    })
    
  });
  
    
};

exports.updateAlbum = function (req, res) {
  var id = req.params.id;
  var childId = req.params.childId;
  
  var albumData = req.body;
  console.log()

  // if (albumData._id) delete albumData._id; // stripping the id for mongoDB if it is present in the request body.
  
 // Child.findOne({'_id': childId, 'albums._id': id}, function(err, child) { console.log(child.albums)})
  
  Child.update({'_id': childId, 'albums._id': id}
                , { $push: { 'albums.$.content': { $each: albumData } } }
                , function(err, child) {
                  if (err) res.send(400, err);
                  console.log('child updated ' + child)
                  res.json(child);
                  });
  
 /* Child.findOne({_id: childId}, function(err, child) {
    if (err) return res.send(400, err);
    child.albums.id(id).content.pushAll(albumData);
    
    child.save(function(err, child) {
       console.log(child);
      res.json(child.albums.id(id));
    })
    
  });*/
  
    
};

