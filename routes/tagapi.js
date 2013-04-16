var db = require('../config/database').connection
  , User = require('../models/User')(db)
  , _ = require('underscore')
  , mongoose = require('mongoose')
  , Tag = require('../models/Tag')(db);


exports.add = function (req, res) {
  Tag.create(req.body, function(err, tag) {
    if (err)  return res.send(400, err);
    return res.json(tag);
  });
};

exports.findAll = function (req, res) {
  var opts = {};
  var cleanQuery = req.query.term.replace(/[\[\]{}|&;$%@"<>()+,]/g, "");
  
  
  if (cleanQuery.length > 0) { 
    var re = new RegExp(cleanQuery);
    opts =  {name: {$regex: cleanQuery, $options: 'i'} };
  }
    
  Tag.find(opts).populate('followers', '_id name picture' ).exec(function (err, tags) {
      if (err)  return res.send(400, err);
      return res.json(tags);
   });  
};

exports.update = function (req, res) {
  var id = req.params.id;
  
  if (req.body.action == 'follow') {
    var opts =  { $addToSet: { 'followers': mongoose.Types.ObjectId(req.session.user) } };
  } else if (req.body.action == 'unfollow') {
    var opts = { $pull: { 'followers': mongoose.Types.ObjectId(req.session.user) } };
  }
  
  Tag.findByIdAndUpdate(id, opts, function(err, tag) {
     if (err) return res.send(400, err);
     return res.json(tag);
  });
};




