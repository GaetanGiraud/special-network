/*
 * Serve JSON to our AngularJS client
 */


var db = require('../config/database').connection
  , User = require('../models/User')(db)
  , Discussion = require('../models/Discussion')(db)
  , extend = require('node.extend');
  
  
// Create a new discussion
exports.add = function (req, res) {
  Discussion.create(req.body, function(err, discussion) {
    if (err)  return res.send(400, err);
    console.log(('Discussion: ' + discussion._id + ' created.'));
 
    // populate the creator before sending back the response.
    discussion.populate({path: '_creator', select: '_id name picture'}).populate('children', function(err, discussion) {
      if (err) return res.send(400, err);
      return res.json(discussion);
    })
    
  });
};

// Create a comment on an already existing discussion
exports.addComment = function (req, res) {

// First identify the discussion
   Discussion.findById(req.params.id, function(err, discussion) {
    if (err)  return res.send(400, err);

    // add the comment to the discussion comments and save the index for further referencing of the comment.
    var index = discussion.comments.push(req.body);
    discussion.updatedAt = Date.now();
    
    discussion.save(function(err) {
      if (err) return res.send(400, err);
      
      var comment = discussion.comments[index-1] ;
      
      discussion.populate({path: 'comments._creator', select: '_id name picture'}, function(err, discussion) {
          if (err) return res.sen(400, err);
          return res.json(discussion.comments.id(comment._id));
      });
    });
  });
};

exports.findById = function (req, res) {
  Discussion.findById(req.params.id, function (err, discussion) {
    if (err)  return res.send(400, err);
    return res.json(discussion);
  });
};



exports.findAll = function (req, res) {
  // setting up the default query parameter 
  var params = {};
  
  if(req.query.type) {  
    var params = {'type': req.query.type}; 
  } 
  if(req.query.children) {
    var params = {'children': req.query.children}; 
  } 
  
  console.log(params);
    Discussion.find(params).populate('_creator', '_id name picture').populate('comments._creator', '_id name picture').populate('children')
    .sort({updatedAt: 'desc'}).exec(function (err, discussions) {
      if (err)  return res.send(400, err);
      return res.json(discussions);
    });  
 // }    
};

exports.update = function (req, res) {
  var id = req.params.id;
  var discussionData = req.body;
  if (discussionData._id) delete userData._id; // stripping the id for mongoDB if it is present in the request body.
  extend(discussionData, {'updatedAt': Date.now})
  
  Discussion.findByIdAndUpdate(id, discussionData, function(err, discussion) {
    if (err) return res.send(400, err);
    console.log('discussion: ' + discussion._id + ' updated'.green);
    return res.json(discussion);
  });
};

exports.delete = function (req, res) {
  Discussion.findByIdAndRemove(req.params.id, function(err) {
    if (err) return res.send(400, err);
    return res.send(200);
  });
}; 



