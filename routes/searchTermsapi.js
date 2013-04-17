var db = require('../config/database').connection
  , _ = require('underscore')
  , mongoose = require('mongoose')
  , SearchTerm = require('../models/SearchTerm')(db);


exports.increment = function(req, res) {
  console.log(req.body.term)
  SearchTerm.update(
                { term: req.body.term }, 
                { $inc: { popularity: 1} },
                { upsert: true })
  .exec(function(err, searchTerm) {
      if (err) return res.send(400, err);  
      console.log(searchTerm);
      return res.json(searchTerm);
  });
}




exports.search = function (req, res) {
   var cleanQuery = '^' + req.query.term.replace(/[\[\]{}|&;$%@"<>()+,]/g, "");
   
   //if (cleanQuery.length > 0) { 
   //  var re = new RegExp('^' + cleanQuery);
  // }
   
   SearchTerm.find({ term: {$regex: cleanQuery, $options: 'i'} })
      .sort({popularity: 'desc'})
      .select('term popularity -_id')
      .limit(10)
      .exec(function(err, data) {
        if (err) return res.send(400, err);
        console.log(data);
        return res.json(data); 
      });
    
      
}
