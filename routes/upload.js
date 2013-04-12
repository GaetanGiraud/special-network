var EventEmitter = require('events').EventEmitter,
    path = require('path'),
    fs = require('fs'),
    formidable = require('formidable'),
    imageMagick = require('imagemagick'),
    // mkdirp = require('mkdirp'),
    avconv = require('avconv'),
    util = require('util'),
    _ = require('underscore');


exports.uploadHandler = function (req, res) {
        
      //console.log(req)
      var uploadDir = options.directory + '/public/uploads/tmp';
      // create the temp directory if not existent
      if (!fs.existsSync(destinationDir)) mkdir.sync(destinationDir);
       
      var form = new formidable.IncomingForm(),
        files = [],
        fields = {};
    
    
      
      form.uploadDir = uploadDir;
      
      form
         .on('error', function(err) {
            console.log(err); 
          })
         .on('field', function(field, value) {
          console.log(value);
          fields[field] = value;
        })
         .on('file', function(field, file) {
          
          /*
           * 
           * handle fileInfo and  renaming of files
           * 
           */
          
        
          console.log(field, file);
          files.push([field, file]);
        })
       .on('end', function() {
         
        res.set({
          'Content-Type': (req.headers.accept || '').indexOf('application/json') !== -1
                          ? 'application/json'
                          : 'text/plain'
         });
         res.json(files);
         
        })
        
        form.parse(req);
      }
    }
  
  }
}


// Generate thumbnails and icons versions of the files
var generatePreviews = function () {
 
 var imageTypes = /\.(gif|jpe?g|png)$/i,
     imageVersions = { thumbnail: {
                  width: 100,
                  height: 100
                  },
             icon: {
                  width: 24,
                  height: 24
                  }
                }
  
  
  if (imageTypes.test(fileInfo.name)) {
    _.each(imageVersions, function (value, version) {
       // creating directory recursive
      if (!fs.existsSync(uploadDir() + '/' + version + '/'))
        mkdirp.sync(uploadDir() + '/' + version + '/');
        counter++;
        var opts = imageVersions[version];
           imageMagick.resize({
             width: opts.width,
             height: opts.height,
             srcPath: uploadDir() + '/' + fileInfo.name,
             dstPath: uploadDir() + '/' + version + '/' + fileInfo.name,
             customArgs: opts.imageArgs || ['-auto-orient']
             }, finish);
          });
        }
   }
       
// process videos into mp4 if needed
                    
var processVideos = function(fileInfo) {
   // match video/mp4
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
           
       callback(exitCode); 
           
     })
   
}  

