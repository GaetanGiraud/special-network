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
           return 'images/defaults/user-thumbnail-default.png';  
        } else {
          return 'uploads/images/thumbnail/' + object.picture;
        }
      } else {
         return 'images/defaults/user-thumbnail-default.png';   
      }
    }
  }).
  filter('iconPicture', function() {
    return function(object) {
    if (angular.isDefined(object)) {
      if (angular.isUndefined(object.picture)) { 
           return 'images/defaults/user-default-icon.png';  
        } else {
          return 'uploads/images/icon/' + object.picture;
        }
      } else { 
        return 'images/defaults/user-default-icon.png';  
      }
    }
  }).
  filter('picture', function() {
    return function(object) {
      if (angular.isDefined(object)) {
        if (angular.isDefined(object.picture)) {
          return 'uploads/images/' + object.picture;
       }   else {
         return 'images/defaults/user-default.png';   
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
          return 'images/defaults/user-thumbnail-default.png'; 
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
          return 'images/defaults/user-icon-default.png'; 
        } else {
          return 'uploads/images/icon/' + user.picture;
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
