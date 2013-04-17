/*
 * Serve JSON to our AngularJS client
 */


var db = require('../config/database').connection
  , User = require('../models/User')(db)
  , Discussion = require('../models/Discussion')(db)
  , Child = require('../models/Child')(db)
  , Tag = require('../models/Tag')(db)
  , _ = require('underscore')
  , mongoose = require('mongoose')
  , path = require('path')
  , extend = require('node.extend');
  
  
// Create a new discussion

exports.add = function (discussion, callback) {
  if (Array.isArray(discussion.children)) {
    for(var i =0; i < discussion.children.length; i++) { 
      discussion.children[i] = discussion.children[i]._id ; 
    }
  } 
  discussion._creator = discussion._creator._id;
  discussion.tags = _.map(discussion.tags, function(tag) { return mongoose.Types.ObjectId(tag._id) }); // storing only the _id of the tags
  
  Discussion.create(discussion, function(err, discussion) {
          if (err)  return callback(err, null);
      
      // if children have been referenced, 
      // link the lastUpdate value inside the child model to this discussion.
          
    discussion.children.forEach( function(childId) {
      Child.findByIdAndUpdate(childId, {'lastUpdate': discussion._id}, function(err, child) {
         if (err) return callback(err, null);
      });
    });
          
    discussion
      .populate({path: '_creator', select: '_id name picture'})
      .populate({
         path: 'tags'
      })
      .populate('children', function(err, discussion) {
       if (err) return callback(err, null);
      return callback(null, discussion);
    })
          
  });
  
  
};

exports.addComment = function (id, comment, callback) {

// First identify the discussion
   Discussion.findById(id, function(err, discussion) {
    if (err)  return callback(err, null, null);

    // add the comment to the discussion comments and save the index for further referencing of the comment.
    var index = discussion.comments.push(comment);
    discussion.updatedAt = Date.now();
    
    discussion.save(function(err) {
      if (err) return callback(err, null, null);
      
    //  var comment =  ;
      
      discussion.populate({path: 'comments._creator', select: '_id name picture'}, function(err, discussion) {
          if (err) return callback(err, null, null);
          return callback(null, discussion, discussion.comments[index-1]);
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
  if (req.query.page) {
     var skipIndex = req.query.page -1;
  } else { 
    var skipIndex = 0;
  }
  
  if(req.query.type) {  
    params = {'type': req.query.type}; 
  } else if(req.query.children) {
    params = {'children': req.query.children}; 
  } 
    
    // recover all the children that the user if following
    Child.find({ $or: [ {'permissions._user': req.session.user}, {'creator._user': req.session.user } ] })
      .select('_id')
      .exec(function(err, children) {
      if (err) res.sen(400, err);
      
      if(req.query.children) {
        params = {'children': req.query.children}; 
      } else {
        params = _.extend(params, { children: { $in: children }  })
      }
      
      Discussion.find(params)
      .sort({updatedAt: 'desc'})
      .skip(skipIndex*10)
      .limit(10)
      .populate('_creator', '_id name picture')
      .populate('comments._creator', '_id name picture')
      .populate('children')
      .populate({path: 'tags' })
      .exec(function (err, discussions) {
        if (err)  return res.send(400, err);
        return res.json(discussions);
      });  
   })    
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


exports.search = function (req, res) {
   var cleanQuery = req.query.term.replace(/[\[\]{}|&;$%@"<>()+,]/g, "");
   var type = req.query.type;
   
   if (cleanQuery.length > 0) { 
     var re = new RegExp(cleanQuery);
    
     // returning search for groups only
     if (type == 'groups') {
       Discussion.aggregate(
         { $project: { groups : "$groups"  }},
         {$unwind: "$groups"},
         { $match : { groups : re } },
         function (err, results) {
           if (err) return res.send(400, err);
             //parsing the results for groups
             results.forEach(function(element, index) {
               results[index] = element.groups;      
              });
           console.log(results);
           var uniqueResults = results.filter(function(elem, pos, self) {
              return self.indexOf(elem) == pos;
            });
             return res.json(uniqueResults);
           });
       } 
    
    // returning search for tags only
       if (type == 'tags') {
      //   Discussion.find({tags: re}).limit(5).exec(function(err, results) {
        Discussion.aggregate(
          { $project: { tags : "$tags"  }},
          {$unwind: "$tags"},
          { $match : { tags : {$regex: cleanQuery, $options: 'i'} } }, 
          function(err, results) {
            if (err) return res.send(400, err);
              results.forEach(function(element, index) {
                results[index] = element.tags;
            
              });
            console.log(results);
            var uniqueResults = results.filter(function(elem, pos, self) {
              return self.indexOf(elem) == pos;
            })
            
            return res.json(uniqueResults);
         });
        }
         
       } else {
  
     // empty array, nothing found    
     return res.json({}); 
    }
      
}





