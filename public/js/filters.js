'use strict';

/* Filters */

angular.module('CareKids.filters', []).
  filter('interpolate', ['version', function(version) {
    return function(text) {
      return String(text).replace(/\%VERSION\%/mg, version);
    }
  }]).
  filter('fromNow', function() {
    return function(date) {
      if (angular.isDefined(date) && date != null) {
        //var day = moment(date);
        return moment(date).fromNow();
      } else { return ''}
    }
  }).
  filter('thumbPicture', function() {
    return function(object) {
    if (angular.isDefined(object)) {
      if (angular.isUndefined(object.name)) { 
           return 'images/defaults/common-default-thumb.png';  
        } else {
          return 'uploads/images/thumbnail/' + object.name;
        }
      } else {
         return 'images/defaults/common-default-thumb.png';   
      }
    }
  }).
  filter('iconPicture', function() {
    return function(object) {
    if (angular.isDefined(object)) {
      if (angular.isUndefined(object.name)) { 
           return 'images/defaults/common-default-icon.png';  
        } else {
          return 'uploads/images/icon/' + object.name;
        }
      } else { 
        return 'images/defaults/common-default-icon.png';  
      }
    }
  }).
  filter('picture', function() {
    return function(object) {
      if (angular.isDefined(object)) {
        if (angular.isDefined(object.name)) {
          return 'uploads/images/' + object.name;
       }   else {
         return 'images/defaults/common-default.png';   
       }
      }
    }
  }).
  filter('userPic', function() {
    return function(user) {
      if (angular.isDefined(user) && user != null) { 
        if (angular.isUndefined(user.picture)) {
          return 'images/defaults/user-default.png'; 
        } else {
          return 'uploads/images/' + user.picture;
        }
      }
    }
  }).
  filter('userThumbPic', function() {
    return function(user) {
      if (angular.isDefined(user) && user != null) { 
        if (angular.isUndefined(user.picture)) {
          return 'images/defaults/user-default-thumb.png'; 
        } else {
          return 'uploads/images/thumbnail/' + user.picture;
        }
     } 
    }
  }).
  filter('userIconPic', function() {
    return function(user) {
      if (angular.isDefined(user) && user != null) { 
        if (angular.isUndefined(user.picture)) {
          return 'images/defaults/user-default-icon.png'; 
        } else {
          return 'uploads/images/icon/' + user.picture;
        }
     } 
     return 'images/defaults/user-default-icon.png';  
    }
  }).
  filter('thumbAlbumPicture', function() {
    return function(object) {
    if (angular.isDefined(object)) {
      if (angular.isUndefined(object.name)) { 
           return 'images/defaults/album-thumb-default.png';  
        } else {
          return 'uploads/images/thumbnail/' + object.name;
        }
      } else {
         return 'images/defaults/album-thumb-default.png';   
      }
    }
  }).
  filter('iconAlbumPicture', function() {
    return function(object) {
    if (angular.isDefined(object)) {
      if (angular.isUndefined(object.name)) { 
           return 'images/defaults/album-icon-default.png';  
        } else {
          return 'uploads/images/icon/' + object.name;
        }
      } else { 
        return 'images/defaults/album-icon-default.png';  
      }
    }
  }).
  filter('albumPicture', function() {
    return function(object) {
      if (angular.isDefined(object)) {
        if (angular.isDefined(object.name)) {
          return 'uploads/images/' + object.name;
       }   else {
         return 'images/defaults/album-default.png';   
       }
      }
    }
  }).
  filter('paginate', function() {
    return function(input, page) {
      var out = input.slice(page-1,3);
      console.log(out);
      return out;
    }
  }).
  filter('pronomize', function() {
    return function(relationship) {
      if (['Father', 'Mother'].indexOf(relationship) != -1) return 'the ' + relationship; 
      return 'a ' + relationship;  
    }
  });
