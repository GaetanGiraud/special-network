var db = require('../config/database').connection
  , User = require('../models/User')(db)
  , _ = require('underscore')
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
  var opts = {};
  
  if (_.isUndefined(req.body.followers) == false) {
    var opts =  { $addToSet: { 'followers': data  } };
  }
  
  Tag.findByIdAndUpdate(id, opts, function(err, tag) {
     if (err) return res.send(400, err);
     return res.json(tag);
  });
};




