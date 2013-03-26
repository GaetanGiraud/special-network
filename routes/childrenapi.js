
/*
 * Serve JSON to our AngularJS client
 */




var db = require('../config/database').connection
  , User = require('../models/User')(db)
  , Child = require('../models/Child')(db);
  
exports.add = function (req, res) {
  Child.create(req.body, function(err, child) {
    if (err)  return res.send(400, err);
    console.log(('Child: ' + child._id + ' created.'));
    return res.json(child);
    });
};

exports.findById = function (req, res) {
  Child.findById(req.params.id, function (err, child) {
    if (err)  return res.send(400, err);
    return res.json(child);
  });
};


exports.findAll = function (req, res) {
  if(req.query.following) {  
     Child.find({'permissions.userId': req.session.user}).populate('lastUpdate').exec(function (err, children) {
       if (err)  return res.send(400, err);
       console.log(children);
       return res.json(children);
     });
   } 
   if(req.query.post) {
     Child.find().or([{'creator._creatorId': req.session.user}, {'permissions.userId': req.session.user, 'permissions.rigth': 'post'}]).exec(function (err, children) {
       if (err)  return res.send(400, err);
       return res.json(children);
     }); 
   }

   Child.find({'creator._creatorId': req.session.user}).populate('lastUpdate').exec(function (err, children) {
      if (err)  return res.send(400, err);
      return res.json(children);
   });  
};

exports.update = function (req, res) {
  var id = req.params.id;
  var childData = req.body;
  if (childData._id) delete childData._id; // stripping the id for mongoDB if it is present in the request body.

  Child.findByIdAndUpdate(id, childData, function(err, child) {
    if (err) return res.send(400, err);
    console.log('child: ' + child._id + ' updated'.green);
    return res.json(child);
  });
};

exports.delete = function (req, res) {
  Child.findByIdAndRemove(req.params.id, function(err) {
    if (err) return res.send(400, err);
    return res.send(200);
  });
}; 


