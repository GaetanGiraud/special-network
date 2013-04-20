var db = require('../config/database').connection
  , User = require('../models/User')(db)
  , _ = require('underscore')
  , mongoose = require('mongoose')
  , request = require('request')
  , jsdom = require('jsdom')
  , Tag = require('../models/Tag')(db);


exports.add = function (req, res) {
  
  var tag = req.body;
  tag.title = _.slugify(tag.name);
  
  Tag.create(req.body, function(err, tag) {
    if (err)  return res.send(400, err);
    return res.json(tag);
  });
};

exports.findById = function (req, res) {
  var opts;
  var id = req.params.id;
  
  // Check if params.id match a mongo ObjerctId
  if ( id.match(/^[0-9a-fA-F]{24}$/)) {
    var opts = {'_id': id};
    
  }  else {
    // otherwise use title as unique identifier.
     var opts = {'title': id};
  }
  
  Tag.findOne(opts, function(err, tag) {
    if (err)  return res.send(400, err);
    console.log(tag);
    return res.json(tag);
  });
};


exports.findAll = function (req, res) {
  var opts = {};
  
  if (!_.isUndefined(req.query.term)) {
    var cleanQuery = req.query.term.replace(/[\[\]{}|&;$%@"<>()+,]/g, "");
    if (cleanQuery.length > 0) { 
      var re = new RegExp(cleanQuery);
      opts =  {name: {$regex: cleanQuery, $options: 'i'} };
    }
  }
  
  if (!_.isUndefined(req.query.mytags)) {
    console.log('myTags')
   opts =  { 'followers':  mongoose.Types.ObjectId(req.session.user)  };
  }
    
  Tag.find(opts).exec(function (err, tags) {
      if (err)  return res.send(400, err);
      return res.json(tags);
   });  
};

exports.addLink = function(req,res) {
  console.log('adding link')
  id = req.params.id;
  link = req.body;

  Tag.findByIdAndUpdate(id, { $push: { links: link }}, 
     function(err, tag) {
     var tag = tag;
     if (err) return res.send(400, err);
    // console.log(tag);
     
     link = _.last(tag.links);
     if (_.isUndefined(link.title)) {
      request({uri: link.url, encoding: "binary"}, function(err, response, body){
         
        //Just a basic error check
         if(err || response.statusCode !== 200){ return res.send(400, err); }
        
        //Send the body param as the HTML code we will parse in jsdom
        //also tell jsdom to attach jQuery in the scripts and loaded from jQuery.com
        jsdom.env({
                          html: body,
                          scripts: ['http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js']
                  }, function(err, window){
           //Use jQuery just as in a regular HTML page
                          var $ = window.jQuery;
                          if (!_.isUndefined($('title').text())) { 
                            link.title = $('title').text()
                          } else {
                            link.title = "Please enter a title for this website."
                          }
                          
                          if ( typeof $('meta[name="description"]').attr("content") != "undefined") {
                            link.description = $('meta[name="description"]').attr("content");  
                          } else {
                            link.description = "Please enter a description for this website."
                          }

                       /*  if ( typeof  $('link[rel="shortcut icon"]')[0] != "undefined" ) {
                           
                            link.picture = $('link[rel="shortcut icon"]')[0].href;  
                            
                          } else if ( typeof $('link[rel="Shortcut Icon"]')[0] != "undefined" ) {
                            
                            link.picture =  $('link[rel="Shortcut Icon"]')[0].href;  
                            
                          } else if ( typeof  $('link[rel="icon"]')[0] != "undefined" ) {
                             link.picture =  $('link[rel="icon"]')[0].href;  
                
                          } else if ( typeof  $('link[rel="Icon"]')[0] != "undefined" ) {
                             link.picture =  $('link[rel="Icon"]')[0].href;  
                          } 
                          
                          else {
                            console.log(link.url);
                            link.picture = link.url + '/favicon.ico'; 
                          }*/
                          
          
                          Tag.update({
                                 _id: id, 
                                 'links._id': link._id 
                                 }, { 
                                 $set: { 
                                  'links.$.title': link.title,
                                  'links.$.description': link.description
                                //  'links.$.picture': link.picture
                                   }
                                  }, function(err) {
                                if (err)  { 
                                  console.log(err)
                                  
                                  return res.send(400, err);
                                }
                                res.json(link);
                           })
                          
                  });
          });
    
       } else {
         res.json(link);
       }
  
  });
 
}

exports.update = function (req, res) {
  var id = req.params.id;
  var data = req.body;
  
  if (data.action == 'follow') {
    var opts =  { $addToSet: { 'followers': mongoose.Types.ObjectId(req.session.user) } };
  } else if (data.action == 'unfollow') {
    var opts = { $pull: { 'followers': mongoose.Types.ObjectId(req.session.user) } };
  } else {
    // remove id from body
   if (data._id) delete data._id;
    var opts = data;  
  }
  
  Tag.findByIdAndUpdate(id, opts, function(err, tag) {
     if (err) return res.send(400, err);
     return res.json(tag);
  });
};




