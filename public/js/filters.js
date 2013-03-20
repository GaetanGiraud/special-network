'use strict';

/* Filters */

angular.module('CareKids.filters', []).
  filter('interpolate', ['version', function(version) {
    return function(text) {
      return String(text).replace(/\%VERSION\%/mg, version);
    }
  }]).
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
  });;
