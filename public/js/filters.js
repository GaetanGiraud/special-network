'use strict';

/* Filters */

angular.module('CareKids.filters', []).
  filter('interpolate', ['version', function(version) {
    return function(text) {
      return String(text).replace(/\%VERSION\%/mg, version);
    }
  }]).
  filter('iconPicture', function() {
    return function(object) {
      if (angular.isUndefined(object.picture)) { 
           return 'images/defaults/user-default.png';  
        } else {
          return 'uploads/' + object._id + '/icon/' + object.picture;
        }
    }
  }).
  filter('picture', function() {
    return function(object) {
      if (angular.isUndefined(object.picture)) { 
           return 'images/defaults/user-default.png';  
        } else {
          return 'uploads/' + object._creator + '/' + object.picture;
        }
    }
  }).
  filter('userPic', function() {
    return function(user) {
      if (angular.isDefined(user)) { 
        if (angular.isUndefined(user.picture)) {
          return 'images/defaults/user-default.png'; 
        } else {
          var userId = user._id;
          return 'uploads/' + userId + '/' + user.picture;
        }
      }
    }
  }).
  filter('userThumbPic', function() {
    return function(user) {
      if (angular.isDefined(user)) { 
        if (angular.isUndefined(user.picture)) {
          return 'images/defaults/user-thumbnail-default.png'; 
        } else {
          var userId = user._id;
          return 'uploads/' + userId + '/thumbnail/' + user.picture;
        }
     } 
    }
  }).
  filter('userIconPic', function() {
    return function(user) {
      if (angular.isDefined(user)) { 
        if (angular.isUndefined(user.picture)) {
          return 'images/defaults/user-icon-default.png'; 
        } else {
          var userId = user._id;
          return 'uploads/' + userId + '/icon/' + user.picture;
        }
     } 
    }
  }).
  filter('pronomize', function() {
    return function(relationship) {
      if (['father', 'mother'].indexOf(relationship) != -1) return 'the ' + relationship; 
      return 'a ' + relationship;  
    }
  });
