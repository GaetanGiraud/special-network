EventEmitter = require('events').EventEmitter,
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
   
   var UploadHandler = function (req, res, callback) {
        this.req = req;
        this.res = res;
        this.callback = callback;
        this.uploadDir = options.directory + '/public/uploads';
        // a counter counting the number of actions to be processed before calling the callback.
        this.counter = 1;
    };
    
    // post method, check if the client is logged in
    UploadHandler.prototype.post = function() {
    
      var 
        self = this,
        form = new formidable.IncomingForm(),    // instantiate formidable
        tmpFiles = [],
        files = [],
        finish = function() { 
                 // when called, decrement the action counter. 
                 // if equal to 0, not action left to process, process the callback.
                  if (!--self.counter) {
                    console.log('sending the response');
                    self.callback(files);
                  } else {
                   console.log('not sending') 
                  }
        };
      
      // set some values for the form
      form.uploadDir = process.env.TMPDIR;
      form.keepExtensions = true;
      
      // handling form events
      form
        .on('fileBegin', function(name, file) {
          // store the path of the temporary files. Needed to erase tmp files in case of use aborting upload.
          tmpFiles.push(file.path);
       })
       .on('error', function(err) {
          // emit error event.
          //self.emit('begin', fileInfo);
          console.log(err); 
        })
        .on('file', function(field, file) {
          
          // check if the file exists
          if (fs.existsSync(file.path)) {
           
          // make the name look nice
            file = _.extend(file, { 'title':  _(path.basename(file.name, path.extname(file.name))).titleize()});
            file.name = path.basename(file.path);
            console.log(file.type);
            // 2 use cases, one for images, one for videos
            if (/image/.test(file.type)) { 
              // create the images directory if not presnet
              if (!fs.existsSync(self.uploadDir + '/images')) mkdirp.sync(self.uploadDir + '/images');
              
              targetPath = self.uploadDir + '/images/' + path.basename(file.path);
   
              self.fileMove(file.path, targetPath, function(err) {
                file.path = targetPath;
                files.push( { 
                    'name': file.name,
                    'title': file.title
                    });
               
                if(!err) { 
                  self.generatePreviews(file, function() {
                    finish();
                  });
                } else {
                  finish();   
                }
                
                finish();
                  
              });
            }
            else if (/video/.test(file.type)) { 
               if (!fs.existsSync(self.uploadDir + '/videos')) mkdirp.sync(self.uploadDir + '/videos');
               
               self.processVideos(file, function(exitCode) {
                 //file.path = self.uploadDir + '/videos/' + path.basename(file.name, path.extname(file.name) ) + '.mp4' ;
                 file.name = path.basename(file.name, path.extname(file.name) ) + '.mp4' ;
                 files.push( { 
                    'name': file.name,
                    'title': file.title
                    });
                 finish();
               });
             }
             else {
               // Only images and videos are accepted. All other types will be destroyed.
               fs.unlinkSync(file.path);
               self.res.send(400, 'Only video and images are allowed');
               finsih();
             }
            
            
            
          }
    
          //console.log(files);
        })
       .on('aborted', function () {
          _.each(tmpFiles, function (file) {
              fs.unlink(file);
            });
        })
        .on('progress', function (bytesReceived, bytesExpected) {
            //    if (bytesReceived > options.maxPostSize)
            //        self.req.connection.destroy();
        })
       .on('end', function() {
          // file upload finished
          finish();
        })
 
    
        form.parse(this.req);
    }




  UploadHandler.prototype.fileMove = function(path, newPath, callback) {
     this.counter++;
     
    fs.rename(path, newPath, function (err) {
      if (!err) {
        // rename successfull, call the callback
        console.log('rename success');
        callback(null);
      } else {
        // can' t rename file. Try using streams.
        var is = fs.createReadStream(path);
        var os = fs.createWriteStream(newPath);
        is.on('end', function (err) {
          if (!err) {
            fs.unlinkSync(path);
            callback(null);
         } else 
         callback(err);
         });
        is.pipe(os);
      }
    });
  } 

// Generate thumbnails and icons versions of the files
  UploadHandler.prototype.generatePreviews = function (file, callback) {
    var self = this;
 //var imageTypes = /\.(gif|jpe?g|png)$/i,
     imageVersions = { thumbnail: {
                  width: 100,
                  height: 100
                  },
             icon: {
                  width: 24,
                  height: 24
                  }
                }
  
  
  //if (imageTypes.test(fileInfo.name)) {
    _.each(imageVersions, function (value, version) {
       // creating directory recursive
      if (!fs.existsSync(self.uploadDir + '/images/' + version + '/'))
        mkdirp.sync(self.uploadDir + '/images/' + version + '/');
        self.counter++;
        console.log(file.path);
        var opts = imageVersions[version];
           imageMagick.resize({
             width: opts.width,
             height: opts.height,
             srcPath: file.path,
             dstPath: self.uploadDir + '/images/' + version + '/' + file.name,
             customArgs: opts.imageArgs || ['-auto-orient']
             }, 
             callback);
          });
        }
 //  }
       
// process videos into mp4 if needed
                    
 UploadHandler.prototype.processVideos = function(file, callback) {
   // match video/mp4
   var self = this;
   this.counter ++;
   var source = file.path;
   var destinationDir = this.uploadDir + '/videos/';
   var newFileName = path.basename(file.name, path.extname(file.name) ) + '.mp4' ;
         
   //if (!fs.existsSync(destinationDir)) mkdir.sync(destinationDir);
   if (!fs.existsSync(source)) { console.log('source do not exist') }
          
   var params = [
     '-i', source,
     '-f', 'mp4',
     '-vcodec', 'libx264',
     '-acodec', 'libmp3lame',
     '-ar', '44100',
      destinationDir + newFileName
     ];

    var stream = avconv(params);
          
          
    stream.on('data', function(data) {
    console.log(data);
    });
         
     stream.on('end', function(exitCode) {
       fs.unlink(source);
       callback(exitCode); 
     })
   
 }  
  return UploadHandler;
}
 

  
