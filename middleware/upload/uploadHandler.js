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
    };
    
    UploadHandler.prototype.test = function() {
      this.counter = 3;
    }
        
      // post method, check if the client is logged in
    UploadHandler.prototype.post = function() {
        
      var uploadDir = options.directory + '/public/uploads';

     console.log(process.env.TMPDIR);
      //console.log(req)
      
      // create the temp directory if id does not exist
      //if (!fs.existsSync(uploadDir + '/tmp')) mkdirp.sync(uploadDir + '/tmp');
      
      // instantiate the form
      var form = new formidable.IncomingForm(),
      //  tmpFiles = [],
        files = [],
        fields = [],
        counter = 1,
        finish = function() { 
                 // sending the response back once everything has been processed.
                  if (!--counter) {
                    console.log('sending the response');
                    res.json(200, files);
                  } else {
                   console.log('not sending') 
                  }
        };
      
      // set some values
      form.uploadDir = process.env.TMPDIR;
      form.keepExtensions = true;
      
      // handling events
      form
       .on('fileBegin', function(field, file) {
          
       })
       .on('error', function(err) {
            console.log(err); 
          })
         .on('field', function(field, value) {
          //console.log(value);
          //fields[field] = value;
        })
         .on('file', function(field, file) {
          
          /*
           * 
           * handle fileInfo and  renaming of files
           * 
           */
          // check if file exists
          
          
         // titleize()
          
          // check if the file exists
          if (fs.existsSync(file.path)) {
           
          // make the name look nice
            file.title = _(path.basename(file.name, path.extname(file.name))).titleize();
            file.name = path.basename(file.path);
            
            // 2 use cases, one for images, one for videos
            if (/image/.test(file.type)) { 
              // create the images directory if not presnet
              if (!fs.existsSync(uploadDir + '/images')) mkdirp.sync(uploadDir + '/images');
              
              targetPath = uploadDir + '/images/' + path.basename(file.path);
                
              counter++;
              console.log(counter);
              fileMove(file.path, targetPath, function(err) {
                file.path = targetPath;
                files.push( file );
                console.log(counter);
               
                if(!err) { 
                  generatePreviews(file, uploadDir, counter, function(counter) {
                     console.log('previews generated');
                     counter = counter;
                     finish();
                  });
                 
                finish();   
                  
                
                }
                  
              });
            }
            else if (/video/.test(file.type)) { 
               if (!fs.existsSync(uploadDir + '/videos')) mkdirp.sync(uploadDir + '/videos');
             
             }
             else {
               // Only images and videos are accepted. All other types will be destroyed.
               fs.unlinkSync(file.path);
               res.send(400, 'Only video and images are allowed');
             }
            
            
            //finish();
          }
    
          //console.log(files);
        })
       .on('end', function() {
         
        res.set({
          'Content-Type': (req.headers.accept || '').indexOf('application/json') !== -1
                          ? 'application/json'
                          : 'text/plain'
         });
         //finish();
        })
    
        form.parse(req);
    }




  UploadHandler.prototype.fileMove = function() {
    fs.rename(path, newPath, function (err) {
      if (!err) {
        // rename successfull, call the callback
        console.log('rename success');
        callback(null);
        //finish();
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
  UploadHandler.prototype.generatePreviews = function () {
 
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
      if (!fs.existsSync(uploadDir + '/images/' + version + '/'))
        mkdirp.sync(uploadDir + '/images/' + version + '/');
        counter++;
        var opts = imageVersions[version];
           imageMagick.resize({
             width: opts.width,
             height: opts.height,
             srcPath: file.path,
             dstPath: uploadDir + '/images/' + version + '/' + file.name,
             customArgs: opts.imageArgs || ['-auto-orient']
             }, 
             callback(counter));
          });
        }
 //  }
       
// process videos into mp4 if needed
                    
 UploadHandler.prototype.processVideos = function(fileInfo) {
   // match video/mp4
   counter ++;
   var source = uploadDir + '/' + fileInfo.name;
   var destinationDir = uploadDir + '/videos';
   var newFileName = path.basename(fileInfo.name, path.extname(fileInfo.name) ) + '.mp4' ;
         
   if (!fs.existsSync(destinationDir)) mkdir.sync(destinationDir);
   if (!fs.existsSync(source)) { console.log('source do not exist') }
          
   var params = [
     '-i', source,
     '-f', 'mp4',
     '-vcodec', 'libx264',
     '-acodec', 'libmp3lame',
     '-ar', '44100',
      destinationDir + '/' + newFileName
     ];

    var stream = avconv(params);
          
          
    stream.on('data', function(data) {

    });
         
     stream.on('end', function(exitCode) {
       finish();
       //callback(exitCode); 
           
     })
   
 }  
  return UploadHandler;
}
 

  
