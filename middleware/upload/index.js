var EventEmitter = require('events').EventEmitter,
    path = require('path'),
    fs = require('fs'),
    formidable = require('formidable'),
    imageMagick = require('imagemagick'),
     mkdirp = require('mkdirp'),
    avconv = require('avconv'),
    util = require('util'),
    _ = require('underscore');

   _.str = require('underscore.string');
  _.mixin(_.str.exports());
  _.str.include('Underscore.string', 'string')


module.exports = function(options) { 
  
  return function(req, res, next) {
    var UploadHandler= require('./uploadHandler')(options);
    
    var handler = new UploadHandler(req, res, function(results, err) {
        res.set({
           'Content-Type': (req.headers.accept || '').indexOf('application/json') !== -1
                          ? 'application/json'
                          : 'text/plain'
        });
       
       if (err) res.send(400, err);
       res.json(200, results);
      });    
    
    if (req.method == 'POST' && req.session.user) { 
      result = { 'name': 'couou' };
      handler.post();

    } else {
      next();
  }
  }
}
  
  // initiate object;
 // new UploadHandler(req, res, options);
  
  /*
   * 
   * Object defined here under
   * 
   * 
   */

  
 /*
 * 
 * For later
 * 

FileInfo.prototype.validate = function () {
        if (options.minFileSize && options.minFileSize > this.size) {
            this.error = 'File is too small';
        } else if (options.maxFileSize && options.maxFileSize < this.size) {
            this.error = 'File is too big';
        } else if (!options.acceptFileTypes.test(this.name)) {
            this.error = 'Filetype not allowed';
        }
        return !this.error;
    };
*/
