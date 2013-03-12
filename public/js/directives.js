'use strict';

/* Directives */


angular.module('CareKids.directives', []).
  directive('uploader', function() {
       return {
         restrict: 'A',
         link: function(scope, elem, attrs) {
             elem.fileupload({dataType: 'json'});
             elem.bind('fileuploaddone', function (e, data) {
                 $.each(data.files, function (index, file) {                  
                   scope.$emit('event:profilePictureUploaded', file.name );
                  });
              });
          }
      }
  }).
  directive('appVersion', ['version', function(version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
  }]);
