/*
 * Serve JSON to our AngularJS client
 */


var db = require('../config/database').connection
  , User = require('../models/User')(db)
  , Question = require('../models/Question')(db)
  , Child = require('../models/Child')(db)
  , _ = require('underscore')
  , mongoose = require('mongoose')
  , path = require('path')
  , extend = require('node.extend');

   _.str = require('underscore.string');
  _.mixin(_.str.exports());
  _.str.include('Underscore.string', 'string')
  
// Create a new question
/*exports.add = function (req, res) {
  Question.create(req.body, function(err, question) {
    if (err)  return res.send(400, err);
    console.log(('Question: ' + question._id + ' created.'));
 
    // populate the creator before sending back the response.
    
    if (question.type == 'update') {
      question.children.forEach( function(childId) {
      
       Child.findByIdAndUpdate(childId, {'lastUpdate': question._id}, function(err, child) {
         
    //     console.log(child);
       });
      });
    }
    
    question.populate({path: '_creator', select: '_id name picture'}).populate('children', function(err, question) {
      if (err) return res.send(400, err);
      return res.json(question);
    })
    
  });
};*/

exports.add = function (req, res) {
  question = req.body;
  
  question._creator = question._creator._id;
  console.log(question);
  question.tags = _.map(question.tags, function(tag) { 
    //console.log(tag._id)
    return mongoose.Types.ObjectId(tag._id);
  });
  question.title = _.slugify(question.content);

  Question.create(question, function(err, question) {
    question.populate({path: '_creator', select: '_id name picture'}, function(err, question) {
      if (err) res.send(400, err);
      return res.json(question);
    })
    
  });
};



// Create a comment on an already existing question
/*exports.addComment = function (req, res) {

// First identify the question
   Question.findById(req.params.id, function(err, question) {
    if (err)  return res.send(400, err);

    // add the comment to the question comments and save the index for further referencing of the comment.
    var index = question.comments.push(req.body);
    question.updatedAt = Date.now();
    
    question.save(function(err) {
      if (err) return res.send(400, err);
      
      var comment = question.comments[index-1] ;
      
      question.populate({path: 'comments._creator', select: '_id name picture'}, function(err, question) {
          if (err) return res.sen(400, err);
          return res.json(question.comments.id(comment._id));
      });
    });
  });
};*/

exports.addAnswer = function (req, res) {
  var id = req.params.id;
  var answer = req.body;
  
  console.log(id);
// First identify the question
   Question.findById(id, function(err, question) {
    if (err)  return send(400, err);

    var index = question.answers.push(answer);
    question.updatedAt = Date.now();
    
    question.save(function(err) {
      if (err) return send(400, err);
      
      question.populate({path: 'answers._creator', select: '_id name picture'}, function(err, question) {
          if (err) return send(400, err);
          return res.json(question.answers[index-1]);
      });
    });
  });
};

exports.addComment = function (req, res) {
   var id = req.params.id;
   var comment = req.body;
  
// First identify the question
   Question.findById(id, function(err, question) {
    if (err)  return send(400, err);

    // add the comment to the question comments and save the index for further referencing of the comment.
    var index = question.comments.push(comment);
    question.updatedAt = Date.now();
    
    question.save(function(err) {
      if (err)  return send(400, err);
      
      question.populate({path: 'comments._creator', select: '_id name picture'}, function(err, question) {
          if (err)  return send(400, err);
          return res.json(question.comments[index-1]);
      });
    });
  });
};

exports.addCommentToAnswer = function (req, res) {
    var questionId = req.params.questionId;
    var id = req.params.id;
    var comment = req.body;
    
// First identify the question
   Question.findById(questionId, function(err, question) {
    if (err)  return send(400, err);

    // add the comment to the question comments and save the index for further referencing of the comment.
    var index = question.answers.id(id).comments.push(comment);
    question.updatedAt = Date.now();
    
    question.save(function(err) {
      if (err)  return res.send(400, err);
      
      question.populate({path: 'answers._creator', select: '_id name picture'})
      .populate({path: 'answers.comments._creator', select: '_id name picture'}, function(err, question) {
          if (err)  return res.send(400, err);
          return res.json({answerId: id, comment: question.answers.id(id).comments[index-1]});
      });
    });
  });
};




exports.findById = function (req, res) {
  console.log('finding by id');
  var opts;
  var id = req.params.id;
  
  // Check if params.id match a mongo ObjerctId
  if ( id.match(/^[0-9a-fA-F]{24}$/)) {
    var opts = {'_id': id};
    
  }  else {
    // otherwise use page title as unique identifier.
     var opts = {'title': id};
  }
  Question.findOne(opts)
   .populate({path: '_creator', select: '_id name picture'})
   .populate({path: 'tags', select: '_id name'})
   .populate('comments._creator', '_id name picture')
   .populate('answers._creator', '_id name picture')
   .populate('answers.comments._creator', '_id name picture')
   .exec(function (err, question) {
    if (err)  return res.send(400, err);
    return res.json(question);
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
    var params = {'type': req.query.type}; 
  } 
  if(req.query.children) {
    var params = {'children': req.query.children}; 
  } 
  
  console.log(params);
    Question.find(params)
    .sort({updatedAt: 'desc'})
    .skip(skipIndex*10)
    .limit(10)
    .populate('_creator', '_id name picture')
    .populate('comments._creator', '_id name picture')
    .populate('tags')
    .exec(function (err, questions) {
      if (err)  return res.send(400, err);
      return res.json(questions);
    });  
 // }    
};

exports.vote = function (req, res) {
  var questionId = req.params.questionId;
  var id = req.params.id;

  var vote = req.body;
  //if (questionData._id) delete userData._id; // stripping the id for mongoDB if it is present in the request body.
  
  Question.findById(questionId, function(err, question) {
    if (err) return res.send(400, err);
    
   // register votes. User can only vote once on every answer
    var index = question.answers.id(id).votes.push(vote);
    //increment total votes
    question.answers.id(id).totalVotes = question.answers.id(id).totalVotes + vote.vote  ;
    
    question.save(function(err) {
      console.log(err);
      if (err) return res.send(400, err);
      return res.json({totalVotes: question.answers.id(id).totalVotes, votes: question.answers.id(id).votes[index-1]});
    });
  });
};


exports.update = function (req, res) {
  var id = req.params.id;
  var questionData = req.body;
  if (questionData._id) delete userData._id; // stripping the id for mongoDB if it is present in the request body.
  extend(questionData, {'updatedAt': Date.now})
  
  Question.findByIdAndUpdate(id, questionData, function(err, question) {
    if (err) return res.send(400, err);
    console.log('question: ' + question._id + ' updated'.green);
    return res.json(question);
  });
};

exports.delete = function (req, res) {
  Question.findByIdAndRemove(req.params.id, function(err) {
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
       Question.aggregate(
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
      //   Question.find({tags: re}).limit(5).exec(function(err, results) {
        Question.aggregate(
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





