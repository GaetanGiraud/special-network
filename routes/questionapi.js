/*
 * Serve JSON to our AngularJS client
 */


var db = require('../config/database').connection
  , request = require('request')
  , User = require('../models/User')(db)
  , Question = require('../models/Question')(db)
  , Child = require('../models/Child')(db)
  , Tag = require('../models/Tag')(db)
  , Discussion = require('../models/Discussion')(db)
  , SearchTerm = require('../models/SearchTerm')(db)
  , _ = require('underscore')
  , mongoose = require('mongoose')
  , path = require('path')
  , extend = require('node.extend');

   _.str = require('underscore.string');
  _.mixin(_.str.exports());
  _.str.include('Underscore.string', 'string')
  

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
    if (err) return res.send(400, err);
    
    console.log('Question :')
    console.log(question);
    question
    .populate({path: '_creator', select: '_id name picture'})
    .populate('tags', function(err, question) {
      if (err) res.send(400, err);
      return res.json(question);
    })
    
  });
};


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
   .populate({
     path: 'tags'
     })
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
  var ids;
  
  if (req.query.page) {
     var skipIndex = req.query.page -1;
  } else { 
    var skipIndex = 0;
  }
  
  if(req.query.tags) {  
    ids = _.map(req.query.tags, function(_id) { return  mongoose.Types.ObjectId(_id) });
    console.log('myTags requests')
    console.log(ids)
    params = { tags: { $in: ids }}; 
  } else {
    console.log('topics not defined')
    // finding the topics you are following
     
  }
  if(req.query.children) {
    params = _.extend(params, {'children': req.query.children}); 
  } 
  
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


exports.search = function(req,res) {
  var query;
 var questions;
 var children;
 
  if(typeof req.query.tags != "undefined") {
    tags = req.query.tags;
    console.log(tags)
    tags = _.map(tags, function(tag) { return mongoose.Types.ObjectId(tag) })
    
  } else {
    
    tags = [];  
  }

  
  if (req.query.page) {
     var skipIndex = req.query.page -1;
  } else { 
    var skipIndex = 0;
  }
  
 //Question.textSearch(cleanQuery, function (err, output) {

// First recover the list of all the children the use if following.
Child.find({ 'permissions._user': mongoose.Types.ObjectId(req.session.user)}).select('_id').exec(function(err, data) {
 
  if (err) return res.send(400, err);
  console.log('the children'.green)
  children = _.map(data, function(child) { return child._id })
  
  // if user is not following any children and any tags, don't execute the request and send back an empty response.
  
  if ( tags.length == 0 && children.length == 0) return  res.json([]);
    
  if(typeof req.query.term != "undefined") {
    var cleanQuery = req.query.term.replace(/[\[\]{}|&;$%@"<>()+,]/g, "");
    //var splitQuery = cleanQuery.split(' ').split(',');
   } else {
     
    var cleanQuery = '.'; 
     
    }
   
   console.log(tags)
      console.log(children)
   Question.find({content: {$regex: cleanQuery }, tags: {$in: tags }  })
      .sort('udpatedAt')
      .limit(50)
      .populate('_creator comments._creator tags')
      .exec(function(err, data) {
         if (err) return res.json(data);
        var questions = data;
        
        Discussion.find({'children': {$in: children}, 'content': { $regex: cleanQuery } })
            .sort('udpatedAt')
            .populate('_creator children comments._creator')
            .limit(50)
            .exec(function(err, data) {
              if (err) return res.json(data);
              var results = data.concat(questions);
              var sortedResults = _.sortBy(results, function(result) { return result.updatedAt}).reverse();
              sortedResults = _.first(sortedResults, 10);
              
              Child.populate(sortedResults,[
                                           {path: 'children.superpowers', model: "Tag"},
                                           {path: 'tags', model: "Tag"}, ], function(err, results) {
                return res.json(results);
              })
            })
        })
  })
}
  
  /*  query = { 
      "sort" : [
        { "updatedAt" : {"order" : "desc"} }
        ],
      query: {
         multi_match: {
           query: cleanQuery,
           fields: ['content']
        }
          
      },
      from: skipIndex*10,
      size: 10
    }
  } else {

    query = {
       "sort" : [
          { "updatedAt" : {"order" : "desc"} }
          ],
      "query": {
        "bool": {
         "should": [
                   {
                    "bool": {
                        "must": [
                           {
                            term: {'_type': 'question' }
                           },
                           { 
                            terms: { 
                              "tags": tags,
                              "minimum_match" : 1
                            }
                          }
                          ]
                      }
                    },
                    {
                      "bool": {
                         "must": [
                            { 
                              term: { '_type': 'discussion' }
                            },
                            {
                            terms: { "children" : children }
                            }
                            ]
                         }
                      }
                  ],
                  "minimum_number_should_match" : 1
              }
          },
         from: skipIndex*10,
         size: 10
       }
    }
  
    var options = { uri: 'http://localhost:9200/_search',
     method: 'POST',
     json: query
    }
   // }
 
    
    request(options, function(err, response, body) {
      //console.log(err);
      if (err) return res.send(400, err);
        console.log('the response'.green)
      console.log(body);
      if (body.hits.hits.length == 0) return res.json([]);
      
  
      //console.log(results.d);
     /* results.forEach(function(element, index, array) {
        results[index].document._creator = mongoose.Types.ObjectId(results[index].document._creator); 
        results[index].document.tags = _.map(results[index].document.tags, function(tag) {return mongoose.Types.ObjectId(tag) }) 
        
        User.findOne({'_id': results[index].document._creator}).exec(function(err, user) {
          results[index].document._creator = user;
          
          Tag.find({'_id': { $in: results[index].document.tags } }).populate('followers').exec(function(err, tags) {
            results[index].document.tags =tags;
            
            if (typeof results[index].document.children != "undefined") {
              Child.find({'_id': { $in: results[index].document.children } }).populate('superpowers creator').exec(function(err, children) {
                results[index].document.children = children;
                 counter--;
                 
                 //Discussion.populate(results
                 
                  if (counter == 0) {
                    console.log(results);
                    return res.json({ hits: body.hits.total , results: results} );
                  }
                 
                 
               })
              } else {
                counter--;
                
              
              if (counter == 0) {
                console.log(results);
                return res.json({ hits: body.hits.total , results: results} );
              }
          }
            
          })
        })
  
      }) */
      
     // console.log(results[0].document._creator instanceof 'ObjectId');
     
     
    // _id
    
  /*    var results = body.hits.hits;
    // function(hit) { 
   //     return { type: hit._type, documentId: mongoose.Types.ObjectId(hit._source._id) };
   //   });
    
    var questionIds = _.map(_.where(results, { _type: 'question' }), function(result) { 
            return mongoose.Types.ObjectId(result._source._id) ;
    });
    
    var discussionIds = _.map(_.where(results, { _type: 'discussion' }), function(result) { 
            return mongoose.Types.ObjectId(result._source._id) ;
    });
    console.log(questionIds)
     console.log(discussionIds)
    
  
    Question.find({'_id': { $in: questionIds} })
     .populate('_creator tags comments._creator')
     .exec(function(err, questions) {
       if (err) return res.send(400, err);
       
       questions = _.map(questions, function(question) { return {type: 'question', document: question}}) ;
       
       Discussion.find({ '_id': { $in: discussionIds } })
         .populate('_creator tags children comments._creator')
         .exec(function(err, discussions) {
          if (err) return res.send(400, err);
          discussions = _.map(discussions, function(discussion) { return {type: 'discussion', document: discussion}} ) ;
          console.log(discussions.green);
          console.log(questions.concat(discussions));
          var sortedResults = _.sortBy(questions.concat(discussions), function(result) { return result.document.updatedAt });
          //var sortedResults = _.sortBy(questions.concat(discussions), function(result) { return result.updatedAt });
        //  sortedResuls
          console.log(sortedResults);
          return res.json({ hits: body.hits.total , results: sortedResults.reverse()} );
         });
      
      
    });
     
     
/*      var populateOpts = [
        {path: 'document._creator', select: '_id name picture', model: 'User'},
      //  {path: 'document.comments._creator', select: '_id name picture', model: 'User'},
        {path: 'document.children', model: 'Child'},
         {path: 'document.tags', model: 'Tag'}
        ]
     // console.log(results);
     Question.populate(results, populateOpts, function(err, results) {
      if(err) return res.send(400, err);
      //
      //  console.log('this is the output: ')
      ///console.log(err);
        //   console.log(results);
        return res.json({ hits: body.hits.total , results: results} );
        
  /   }); */
     
//    });
//  });
//}






