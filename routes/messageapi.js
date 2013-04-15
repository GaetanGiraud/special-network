/*
 * Serve JSON to our AngularJS client
 */


var db = require('../config/database').connection
  , User = require('../models/User')(db)
  , Message = require('../models/Message')(db)
  , _ = require("underscore")
  , mongoose = require('mongoose')
  , extend = require('node.extend');
  
  
exports.add = function (message, callback) {
  //if (Array.isArray(message.receivers)) {
 //   for(var i =0; i < message.receivers.length; i++) { 
 //    message.receivers[i] = message.receivers[i]._id ; 
  //   }
 //  } 
  message._creator = message._creator._id;
  console.log(message.receivers);
  //if (!_.isUndefined(message.receivers)
  
  Message.create(message, function(err, message) {
    if (err)  return callback(err, null);
    console.log(('Message: ' + message._id + ' created.'));
 
    // if children have been referenced, 
    // link the lastUpdate value inside the child model to this message.
    
    
    message
    .populate({path: '_creator', select: '_id name picture'})
    .populate('receivers._user', function(err, message) {
      if (err) return callback(err, null);
      return callback(null, message);
    })
    
  });
};


exports.addReply = function (id, reply, callback) {
  
  reply._creator = reply._creator._id;
      
// First identify the message
   Message.findById(id, function(err, message) {
    if (err)  return callback(err, null);

    // add the comment to the message comments and save the index for further referencing of the comment.
    var index = message.replies.push(reply);
    message.updatedAt = Date.now();
    
    // setting the read flags to false.
    message.read = false;
    _.each(message.receivers, function(element, index, list) {
        message.receivers[index].read = false;
    });
    
    message.save(function(err) {
      if (err) return callback(err, null);
      
    //  var comment =  ;
      console.log(message.updatedAt);
      message.populate('_creator', '_id name picture')
        .populate('replies._creator', '_id name picture')
        .populate('receivers._user')
        .populate('action.target', function(err, message) {
          console.log(message);
          if (err) return callback(err, null);
          return callback(null, message) });
      });
    });
  //});
};

exports.findById = function (req, res) {
  Message.findById(req.params.id, function (err, message) {
    if (err)  return res.send(400, err);
    return res.json(message);
  });
};



exports.findAll = function (req, res) {
  // setting up the default query parameter 
  var skipIndex = req.query.page -1;
  var id = req.session.user;
  
  Message.find()
  .or([{'_creator': id}, {'receivers._user': id}])
  .sort({updatedAt: 'desc'})
    .skip(skipIndex*5)
    .limit(5)
    .populate('_creator', '_id name picture')
    .populate('replies._creator', '_id name picture')
    .populate('receivers._user')
    .populate('action.target')
    .exec(function (err, messages) {
      if (err)  return res.send(400, err);
      console.log(_.first(messages))
      return res.json(messages);
    });  
 // }    
};

exports.update = function (req, res) {
  var id = req.params.id;
  var messageData = req.body;

  Message.findOne({'_id': id}, function(err, message) {
    if (err) return res.send(400, err);
    
    // In case of an update of the read property, some logic has to be performed
    // to determine of the current user is the send or receiver of the message.
    if (!_.isUndefined(messageData.read)) { 
      // Check first if the current user is the creator
      if (req.session.user == message._creator ) {
         message.read = true; 
      } else {
        // if it is not, retreive the id of the receiver object inside the message.receivers array.
        var receiverId = _.find(message.receivers, function(receiver) { return receiver._user ==  req.session.user })._id;
        message.receivers.id(receiverId).read = true;
      }
    }
    
    if (!_.isUndefined(messageData.action)) { 
        console.log('ok');
      message.action.executed = true;
      message.updatedAt = Date.now();
    }
    
    
    message.save(function(err, message){
      if (err) return res.send(400, err);
      console.log(('message: ' + message._id + ' updated').green);
      message.populate('_creator', '_id name picture')
        .populate('replies._creator', '_id name picture')
        .populate('receivers._user')
        .populate('action.target', 
        function(err, message) { 
          return res.json(message);
        });
    });
    
    
    
  });
  
};  
  
exports.count = function (req, res) {
  // setting up the default query parameter 
  var id = req.session.user;
  
  Message.find()
  .or([{'_creator': id}, {'receivers._user': id}])
  .or([{'read': false}, {'receivers.read': false}])
  .count(function(err, count) {
    if(err) res.send(400, err);
    res.json({ messageCount:  count});
  });
 // }    
};
  //if (messageData._id) delete messageData._id; // stripping the id for mongoDB if it is present in the request body.
 // extend(messageData, {'updatedAt': Date.now()})
 // console.log(messageData);
  
//  Message.findByIdAndUpdate(id, messageData, function(err, message) {

 // });


/*
exports.delete = function (req, res) {
  Message.findByIdAndRemove(req.params.id, function(err) {
    if (err) return res.send(400, err);
    return res.send(200);
  });
}; 
*/
/*
exports.search = function (req, res) {
   var cleanQuery = req.query.q.replace(/[\[\]{}|&;$%@"<>()+,]/g, "");
   var type = req.query.type;
   
   if (cleanQuery.length > 0) { 
     var re = new RegExp(cleanQuery);
    
     // returning search for groups only
     if (type == 'groups') {
       Message.aggregate(
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
      //   Message.find({tags: re}).limit(5).exec(function(err, results) {
        Message.aggregate(
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
*/


